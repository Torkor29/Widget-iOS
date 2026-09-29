import AuthenticationServices
import GoogleSignIn
import Observation
import Supabase
import SwiftUI
import UserNotifications

enum PrefKey {
    static let apnsToken = "apnsToken"
    static let pendingFirstName = "pendingFirstName"
    static let pairingSkipped = "pairingSkipped"
    static let notificationsAsked = "notificationsAsked"
    static let widgetTutorialSeen = "widgetTutorialSeen"
    static let paywallSeen = "paywallSeen"
}

@MainActor
@Observable
final class AppModel {
    enum Phase: Equatable {
        case launching
        case signedOut
        case onboarding(OnboardingStep)
        case home
    }

    enum OnboardingStep: Equatable {
        case name, pair, notifications, widget, paywall
    }

    enum PostResult {
        case sent, needsPremium, failed
    }

    var phase: Phase = .launching
    private(set) var userID: UUID?
    private(set) var home: HomeState?
    private(set) var myImageURL: URL?
    private(set) var partnerImageURL: URL?
    private(set) var inviteCode: String?
    var pendingInviteCode: String?
    var storePremium = false
    var errorMessage: String?
    var showPaywall = false
    /// Bumped after a reaction/nudge is sent, to drive haptics and toasts.
    private(set) var sentTick = 0

    var isPremium: Bool { storePremium || (home?.premium ?? false) }
    var partnerName: String { home?.partner?.firstName ?? "" }

    private let prefs = UserDefaults.standard
    private var signedURLCache: [String: (url: URL, issued: Date)] = [:]

    // MARK: Session

    func start() async {
        Store.configure()
        guard AppConfig.isConfigured else {
            phase = .signedOut
            return
        }
        for await (event, session) in supabase.auth.authStateChanges {
            switch event {
            case .initialSession, .signedIn:
                if let session {
                    if userID != session.user.id { await didSignIn(session.user.id) }
                } else {
                    phase = .signedOut
                }
            case .signedOut:
                didSignOut()
            default:
                break
            }
        }
    }

    private func didSignIn(_ id: UUID) async {
        userID = id
        storePremium = await Store.logIn(userID: id)
        await syncProfileBasics(userID: id)
        await registerKeys()
        await refresh()
        route()
    }

    private func didSignOut() {
        userID = nil
        home = nil
        inviteCode = nil
        myImageURL = nil
        partnerImageURL = nil
        storePremium = false
        signedURLCache = [:]
        SharedStore.reset()
        WidgetSync.reloadWidgets()
        phase = .signedOut
        Task { await Store.logOut() }
    }

    func handleApple(_ result: Result<ASAuthorization, Error>, nonce: String) async {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else { return }
            // Apple only shares the name on the very first sign-in.
            if let given = credential.fullName?.givenName, !given.isEmpty {
                prefs.set(given, forKey: PrefKey.pendingFirstName)
            }
            do {
                try await AuthService.signInWithApple(credential: credential, nonce: nonce)
            } catch {
                show(error)
            }
        case .failure(let error):
            if (error as? ASAuthorizationError)?.code != .canceled { show(error) }
        }
    }

    func signInWithGoogle() async {
        do {
            try await AuthService.signInWithGoogle()
        } catch {
            if (error as NSError).code != -5 { show(error) } // -5: user cancelled Google sign-in
        }
    }

    func signOut() async {
        if let token = prefs.string(forKey: PrefKey.apnsToken) {
            try? await Backend.unregisterDevice(token: token)
        }
        await AuthService.signOut()
        didSignOut()
    }

    func deleteAccount() async {
        do {
            try await Backend.deleteAccount()
            try? await supabase.auth.signOut(scope: .local)
            didSignOut()
        } catch {
            show(error)
        }
    }

    private func syncProfileBasics(userID: UUID) async {
        var basics = Backend.ProfileUpdate()
        basics.timezone = TimeZone.current.identifier
        basics.locale = Self.appLocale
        try? await Backend.updateProfile(basics, userID: userID)
        if let name = prefs.string(forKey: PrefKey.pendingFirstName) {
            try? await Backend.updateProfile(Backend.ProfileUpdate(first_name: name), userID: userID)
            prefs.removeObject(forKey: PrefKey.pendingFirstName)
        }
    }

    private func registerKeys() async {
        try? await Backend.registerWidgetKey(hash: SharedStore.sha256Hex(SharedStore.widgetKey()))
        if let token = prefs.string(forKey: PrefKey.apnsToken) {
            try? await Backend.registerDevice(token: token)
        }
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        if settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }

    static var appLocale: String {
        let language = Bundle.main.preferredLocalizations.first ?? "en"
        return ["fr", "es"].contains(language) ? language : "en"
    }

    // MARK: Data

    func refresh() async {
        guard userID != nil else { return }
        do {
            let state = try await Backend.homeState()
            let drops = [state?.myDrop, state?.partnerDrop].compactMap { $0 }
            let urls = await signedURLs(for: drops.flatMap { [$0.imagePath, $0.thumbPath] })
            home = state
            myImageURL = state?.myDrop.flatMap { urls[$0.imagePath] }
            partnerImageURL = state?.partnerDrop.flatMap { urls[$0.imagePath] }
            await WidgetSync.apply(
                state: state,
                myThumbURL: state?.myDrop.flatMap { urls[$0.thumbPath] },
                partnerThumbURL: state?.partnerDrop.flatMap { urls[$0.thumbPath] }
            )
            WidgetSync.reloadWidgets()
        } catch {
            // Offline or transient: keep showing the last state.
        }
    }

    /// Reuses signed URLs for ~50 minutes so images don't reload on every refresh.
    private func signedURLs(for paths: [String]) async -> [String: URL] {
        let now = Date()
        let missing = paths.filter { path in
            guard let cached = signedURLCache[path] else { return true }
            return now.timeIntervalSince(cached.issued) > 50 * 60
        }
        if !missing.isEmpty, let fresh = try? await Backend.signedURLs(missing) {
            for (path, url) in fresh { signedURLCache[path] = (url, now) }
        }
        return signedURLCache.mapValues { $0.url }
    }

    // MARK: Onboarding

    func route() {
        guard userID != nil else {
            phase = .signedOut
            return
        }
        if let step = nextOnboardingStep() {
            phase = .onboarding(step)
        } else {
            phase = .home
        }
    }

    private func nextOnboardingStep() -> OnboardingStep? {
        guard let home else { return nil }
        if (home.me?.firstName ?? "").isEmpty { return .name }
        if !home.isPaired && !prefs.bool(forKey: PrefKey.pairingSkipped) { return .pair }
        if !prefs.bool(forKey: PrefKey.notificationsAsked) { return .notifications }
        if !prefs.bool(forKey: PrefKey.widgetTutorialSeen) { return .widget }
        if !prefs.bool(forKey: PrefKey.paywallSeen) && !isPremium && Store.isAvailable { return .paywall }
        return nil
    }

    func complete(_ step: OnboardingStep) {
        switch step {
        case .name: break
        case .pair: prefs.set(true, forKey: PrefKey.pairingSkipped)
        case .notifications: prefs.set(true, forKey: PrefKey.notificationsAsked)
        case .widget: prefs.set(true, forKey: PrefKey.widgetTutorialSeen)
        case .paywall: prefs.set(true, forKey: PrefKey.paywallSeen)
        }
        route()
    }

    func saveName(_ name: String) async {
        guard let userID else { return }
        let trimmed = String(name.trimmingCharacters(in: .whitespacesAndNewlines).prefix(30))
        guard !trimmed.isEmpty else { return }
        do {
            try await Backend.updateProfile(Backend.ProfileUpdate(first_name: trimmed), userID: userID)
            await refresh()
            route()
        } catch {
            show(error)
        }
    }

    func loadInviteCode() async {
        guard inviteCode == nil, home?.isPaired != true else { return }
        do {
            inviteCode = try await Backend.createInvite()
        } catch {
            show(error)
        }
    }

    @discardableResult
    func join(code: String) async -> Bool {
        do {
            try await Backend.acceptInvite(code: code)
            pendingInviteCode = nil
            await refresh()
            route()
            return true
        } catch {
            show(error)
            return false
        }
    }

    /// Polled while the invite screen is visible, so pairing feels instant.
    func checkForPartner() async {
        guard home?.isPaired != true else { return }
        await refresh()
        if home?.isPaired == true {
            inviteCode = nil
            route()
        }
    }

    func requestNotifications() async {
        let granted = (try? await UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .sound, .badge])) ?? false
        if granted { UIApplication.shared.registerForRemoteNotifications() }
        complete(.notifications)
    }

    func setAPNsToken(_ token: String) {
        prefs.set(token, forKey: PrefKey.apnsToken)
        guard userID != nil else { return }
        Task { try? await Backend.registerDevice(token: token) }
    }

    func purchased() {
        storePremium = true
        prefs.set(true, forKey: PrefKey.paywallSeen)
        Task { await refresh() }
    }

    // MARK: Actions

    func post(image: UIImage, mood: Mood?, caption: String) async -> PostResult {
        guard let coupleID = home?.couple?.id else {
            show(BackendError.server(code: "NOT_PAIRED"))
            return .failed
        }
        if home?.postedToday == true && !isPremium { return .needsPremium }
        do {
            _ = try await Backend.postDrop(image: image, mood: mood, caption: caption, coupleID: coupleID)
            await refresh()
            return .sent
        } catch BackendError.server(code: "DAILY_LIMIT") {
            return .needsPremium
        } catch {
            show(error)
            return .failed
        }
    }

    func react(_ emoji: String) async {
        guard let drop = home?.partnerDrop else { return }
        do {
            try await Backend.react(dropID: drop.id, emoji: emoji)
            sentTick += 1
        } catch {
            show(error)
        }
    }

    func nudge() async {
        do {
            try await Backend.nudge()
            sentTick += 1
        } catch {
            show(error)
        }
    }

    func saveSettings(name: String, reminderHour: Int, remindersEnabled: Bool, startedOn: Date?, reunionOn: Date?) async {
        guard let userID else { return }
        do {
            let trimmed = String(name.trimmingCharacters(in: .whitespacesAndNewlines).prefix(30))
            try await Backend.updateProfile(
                Backend.ProfileUpdate(
                    first_name: trimmed.isEmpty ? nil : trimmed,
                    reminder_hour: reminderHour,
                    reminders_enabled: remindersEnabled
                ),
                userID: userID
            )
            if let coupleID = home?.couple?.id {
                try await Backend.updateCouple(
                    id: coupleID,
                    startedOn: startedOn.map(DayKey.string(from:)),
                    reunionOn: reunionOn.map(DayKey.string(from:))
                )
            }
            await refresh()
        } catch {
            show(error)
        }
    }

    func unpair() async {
        do {
            try await Backend.unpair()
            prefs.set(false, forKey: PrefKey.pairingSkipped)
            await refresh()
            route()
        } catch {
            show(error)
        }
    }

    // MARK: Links

    /// Handles https://<domain>/i/CODE universal links and morni://i/CODE.
    func handle(url: URL) {
        if GIDSignIn.sharedInstance.handle(url) { return }
        let parts = url.pathComponents.filter { $0 != "/" }
        let code: String?
        if url.scheme == "morni", url.host == "i" {
            code = parts.first
        } else if parts.count >= 2, parts[0] == "i" {
            code = parts[1]
        } else {
            code = nil
        }
        guard let code, code.count == 6 else { return }
        pendingInviteCode = code.uppercased()
        if userID != nil, home?.isPaired != true {
            phase = .onboarding(.pair)
        }
    }

    // MARK: Errors

    func show(_ error: Error) {
        errorMessage = (error as? LocalizedError)?.errorDescription
            ?? String(localized: "Something went wrong. Please try again.")
    }
}
