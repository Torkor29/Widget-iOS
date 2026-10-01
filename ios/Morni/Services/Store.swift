import Foundation
import RevenueCat

/// In-app purchases through RevenueCat. The app user id is the Supabase user id,
/// so the RevenueCat webhook can unlock Morni+ for both partners server-side.
enum Store {
    static let entitlement = "premium"
    /// Discounted offering shown once when the onboarding paywall is dismissed.
    static let exitOfferingID = "exit"

    static var isAvailable: Bool { !AppConfig.revenueCatKey.isEmpty }

    static func configure() {
        guard isAvailable, !Purchases.isConfigured else { return }
        Purchases.logLevel = .warn
        Purchases.configure(withAPIKey: AppConfig.revenueCatKey)
    }

    /// Returns whether this user already has Morni+ on their own account.
    static func logIn(userID: UUID) async -> Bool {
        guard isAvailable else { return false }
        let result = try? await Purchases.shared.logIn(userID.uuidString.lowercased())
        return result?.customerInfo.entitlements[entitlement]?.isActive == true
    }

    static func logOut() async {
        guard isAvailable else { return }
        _ = try? await Purchases.shared.logOut()
    }

    static func offering(_ identifier: String? = nil) async -> Offering? {
        guard isAvailable, let offerings = try? await Purchases.shared.offerings() else { return nil }
        if let identifier { return offerings.offering(identifier: identifier) }
        return offerings.current
    }

    /// Returns true when the purchase went through and Morni+ is active.
    static func purchase(_ package: Package) async throws -> Bool {
        let result = try await Purchases.shared.purchase(package: package)
        return !result.userCancelled && result.customerInfo.entitlements[entitlement]?.isActive == true
    }

    static func restore() async throws -> Bool {
        let info = try await Purchases.shared.restorePurchases()
        return info.entitlements[entitlement]?.isActive == true
    }
}
