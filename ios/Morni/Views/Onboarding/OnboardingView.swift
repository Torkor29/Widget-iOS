import SwiftUI
import UIKit

struct OnboardingView: View {
    let step: AppModel.OnboardingStep

    var body: some View {
        switch step {
        case .name: NameStepView()
        case .pair: PairStepView()
        case .notifications: NotificationsStepView()
        case .widget: WidgetTutorialView()
        case .paywall: PaywallView(context: .onboarding)
        }
    }
}

struct OnboardingScaffold<Content: View, Footer: View>: View {
    let sticker: Mood
    let title: LocalizedStringKey
    var subtitle: LocalizedStringKey?
    @ViewBuilder var content: Content
    @ViewBuilder var footer: Footer

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                MoodSticker(mood: sticker, size: 110)
                    .rotationEffect(.degrees(-6))
                    .padding(.top, 24)
                VStack(spacing: 10) {
                    Text(title)
                        .font(.display(32))
                        .multilineTextAlignment(.center)
                    if let subtitle {
                        Text(subtitle)
                            .font(.rounded(17))
                            .multilineTextAlignment(.center)
                            .opacity(0.7)
                    }
                }
                content
            }
            .padding(24)
        }
        .scrollDismissesKeyboard(.interactively)
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 4) { footer }
                .padding(.horizontal, 24)
                .padding(.bottom, 8)
        }
        .foregroundStyle(Theme.plum)
        .background(DawnBackground())
    }
}

// MARK: - Name

struct NameStepView: View {
    @Environment(AppModel.self) private var model
    @State private var name = ""
    @State private var saving = false
    @FocusState private var focused: Bool

    var body: some View {
        OnboardingScaffold(
            sticker: .sunny,
            title: "What should we call you?",
            subtitle: "Your person will see this name on their widget."
        ) {
            TextField("Your first name", text: $name)
                .font(.rounded(22, weight: .semibold))
                .textContentType(.givenName)
                .submitLabel(.continue)
                .focused($focused)
                .padding(18)
                .background(.white.opacity(0.8), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .onChange(of: name) { _, value in
                    if value.count > 30 { name = String(value.prefix(30)) }
                }
                .onSubmit(save)
        } footer: {
            PrimaryButton(title: "Continue", isLoading: saving, action: save)
                .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                .opacity(name.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1)
        }
        .onAppear {
            name = model.home?.me?.firstName ?? ""
            focused = true
        }
    }

    private func save() {
        guard !saving else { return }
        Task {
            saving = true
            await model.saveName(name)
            saving = false
        }
    }
}

// MARK: - Pair

struct PairStepView: View {
    @Environment(AppModel.self) private var model
    @State private var code = ""
    @State private var joining = false

    var body: some View {
        OnboardingScaffold(
            sticker: .inlove,
            title: "Connect with your person",
            subtitle: "Send them your invite. As soon as they join, your selfies land on each other's home screen."
        ) {
            VStack(spacing: 16) {
                Card {
                    VStack(spacing: 10) {
                        Text("Your code")
                            .font(.rounded(13, weight: .semibold))
                            .opacity(0.6)
                        Text(model.inviteCode ?? "······")
                            .font(.system(size: 40, weight: .bold, design: .monospaced))
                            .kerning(6)
                            .textSelection(.enabled)
                        if let invite = model.inviteCode {
                            ShareLink(
                                item: AppConfig.inviteURL(code: invite),
                                message: Text("Join me on Morni so we wake up to each other's face ☀️ My code: \(invite)")
                            ) {
                                Label("Send my invite", systemImage: "paperplane.fill")
                                    .font(.rounded(17, weight: .bold))
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 15)
                                    .background(Theme.coral, in: Capsule())
                            }
                        } else {
                            ProgressView()
                        }
                    }
                }

                Text("or").font(.rounded(14, weight: .semibold)).opacity(0.5)

                HStack(spacing: 10) {
                    TextField("Their code", text: $code)
                        .font(.system(size: 20, weight: .semibold, design: .monospaced))
                        .textInputAutocapitalization(.characters)
                        .autocorrectionDisabled()
                        .padding(16)
                        .background(.white.opacity(0.8), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        .onChange(of: code) { _, value in
                            let cleaned = String(value.uppercased().filter { $0.isLetter || $0.isNumber }.prefix(6))
                            if cleaned != value { code = cleaned }
                        }
                    Button {
                        Task {
                            joining = true
                            await model.join(code: code)
                            joining = false
                        }
                    } label: {
                        Group {
                            if joining { ProgressView().tint(.white) } else { Text("Join") }
                        }
                        .font(.rounded(17, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 84, height: 56)
                        .background(Theme.plum, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                    }
                    .buttonStyle(.plain)
                    .disabled(code.count != 6 || joining)
                    .opacity(code.count == 6 ? 1 : 0.4)
                }
            }
        } footer: {
            QuietButton(title: "I'll do it later") { model.complete(.pair) }
        }
        .task {
            if let pending = model.pendingInviteCode { code = pending }
            await model.loadInviteCode()
        }
        .task {
            // Pairing should feel instant for the inviter: poll while this screen is up.
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(4))
                await model.checkForPartner()
            }
        }
    }
}

// MARK: - Notifications

struct NotificationsStepView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        OnboardingScaffold(
            sticker: .missyou,
            title: "Know the second they post",
            subtitle: "We'll let you know when your person drops a selfie, and when it's your turn."
        ) {
            HStack(spacing: 12) {
                MoodSticker(mood: .sunny, size: 44)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Léa · Radiant").font(.rounded(15, weight: .bold))
                    Text("dropped today's selfie. Your turn ☀️").font(.rounded(14)).opacity(0.75)
                }
                Spacer(minLength: 0)
            }
            .padding(14)
            .background(.white.opacity(0.85), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .shadow(color: Theme.plum.opacity(0.08), radius: 12, y: 6)
        } footer: {
            PrimaryButton(title: "Turn on notifications", systemImage: "bell.fill") {
                Task { await model.requestNotifications() }
            }
            QuietButton(title: "Not now") { model.complete(.notifications) }
        }
    }
}

// MARK: - Widget tutorial

struct WidgetTutorialView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        OnboardingScaffold(
            sticker: .proud,
            title: "Put them on your home screen",
            subtitle: "It takes 10 seconds. This is where the magic happens."
        ) {
            VStack(alignment: .leading, spacing: 14) {
                TutorialStep(number: 1, icon: "hand.tap.fill", text: "Touch and hold an empty spot on your home screen")
                TutorialStep(number: 2, icon: "plus.circle.fill", text: "Tap Edit, then Add Widget")
                TutorialStep(number: 3, icon: "magnifyingglass", text: "Search for Morni and pick a size")
            }
            WidgetPreview()
                .padding(.top, 8)
        } footer: {
            PrimaryButton(title: "Done, it's on my home screen") { model.complete(.widget) }
            QuietButton(title: "I'll do it later") { model.complete(.widget) }
        }
    }
}

private struct TutorialStep: View {
    let number: Int
    let icon: String
    let text: LocalizedStringKey

    var body: some View {
        HStack(spacing: 14) {
            Text("\(number)")
                .font(.rounded(17, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 34, height: 34)
                .background(Theme.coral, in: Circle())
            Text(text).font(.rounded(16, weight: .medium))
            Spacer(minLength: 0)
            Image(systemName: icon).foregroundStyle(Theme.lilac)
        }
    }
}

private struct WidgetPreview: View {
    var body: some View {
        HStack(spacing: 6) {
            ForEach([Mood.sunny, Mood.sleepy], id: \.self) { mood in
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(.white.opacity(0.4))
                    .overlay { MoodSticker(mood: mood, size: 64) }
            }
        }
        .padding(6)
        .frame(height: 150)
        .background(Theme.sunrise, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(color: Theme.coral.opacity(0.3), radius: 16, y: 8)
    }
}
