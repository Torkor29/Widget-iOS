import RevenueCat
import SwiftUI

struct PaywallView: View {
    enum Context { case onboarding, sheet }

    let context: Context
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var offering: Offering?
    @State private var selected: Package?
    @State private var exitPackage: Package?
    @State private var showExitOffer = false
    @State private var purchasing = false
    @State private var loaded = false

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                HStack {
                    Spacer()
                    Button(action: close) {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(Theme.plum.opacity(0.5))
                            .padding(10)
                            .background(.white.opacity(0.6), in: Circle())
                    }
                    .accessibilityLabel(Text("Close"))
                }

                HStack(spacing: -14) {
                    MoodSticker(mood: .cuddle, size: 76).rotationEffect(.degrees(-10))
                    MoodSticker(mood: .spicy, size: 84).offset(y: -12)
                    MoodSticker(mood: .fire, size: 76).rotationEffect(.degrees(10))
                }

                VStack(spacing: 6) {
                    Text("Morni+").font(.display(46, italic: true))
                    Text("One plan. Both of you.").font(.rounded(19, weight: .semibold))
                }

                VStack(alignment: .leading, spacing: 12) {
                    Benefit(icon: "heart.fill", text: "Your person gets Morni+ too")
                    Benefit(icon: "photo.stack.fill", text: "Every selfie, forever: your shared memories")
                    Benefit(icon: "face.smiling.inverse", text: "All 25 moods, including Spicy 🌶️")
                    Benefit(icon: "rectangle.3.group.fill", text: "Large and Lock Screen widgets")
                    Benefit(icon: "camera.fill", text: "Bonus selfies, as many as you want")
                    Benefit(icon: "airplane", text: "Countdown to your next reunion")
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                if let offering {
                    VStack(spacing: 10) {
                        ForEach(offering.availablePackages, id: \.identifier) { package in
                            PackageRow(package: package, isSelected: package.identifier == selected?.identifier)
                                .onTapGesture { selected = package }
                        }
                    }
                } else if loaded {
                    Text("Plans are unavailable right now. Please try again later.")
                        .font(.rounded(14)).opacity(0.6).multilineTextAlignment(.center)
                } else {
                    ProgressView().frame(height: 120)
                }

                PrimaryButton(title: ctaTitle, isLoading: purchasing) {
                    if let selected { Task { await buy(selected) } }
                }
                .disabled(selected == nil)

                HStack(spacing: 18) {
                    Button("Restore") { Task { await restore() } }
                    Link("Terms", destination: AppConfig.termsURL)
                    Link("Privacy", destination: AppConfig.privacyURL)
                }
                .font(.rounded(13, weight: .semibold))
                .foregroundStyle(Theme.plum.opacity(0.6))

                Text("Payment is charged to your Apple ID. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel anytime in your App Store settings.")
                    .font(.rounded(11))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Theme.plum.opacity(0.45))
            }
            .foregroundStyle(Theme.plum)
            .padding(24)
        }
        .background(DawnBackground())
        .task { await load() }
        .sheet(isPresented: $showExitOffer, onDismiss: finish) {
            if let exitPackage {
                ExitOfferView(package: exitPackage) { Task { await buy(exitPackage) } }
                    .presentationDetents([.medium])
            }
        }
    }

    private var ctaTitle: LocalizedStringKey {
        selected?.storeProduct.introductoryDiscount?.paymentMode == .freeTrial ? "Start my free trial" : "Continue"
    }

    private func load() async {
        offering = await Store.offering()
        selected = offering?.annual ?? offering?.availablePackages.first
        if context == .onboarding {
            exitPackage = await Store.offering(Store.exitOfferingID)?.availablePackages.first
        }
        loaded = true
    }

    private func buy(_ package: Package) async {
        purchasing = true
        defer { purchasing = false }
        do {
            if try await Store.purchase(package) {
                model.purchased()
                showExitOffer = false
                finish()
            }
        } catch {
            model.show(error)
        }
    }

    private func restore() async {
        do {
            if try await Store.restore() {
                model.purchased()
                finish()
            } else {
                model.errorMessage = String(localized: "No Morni+ purchase was found for this Apple ID.")
            }
        } catch {
            model.show(error)
        }
    }

    /// Onboarding: offer the one-time discount once before moving on.
    private func close() {
        if context == .onboarding, exitPackage != nil, !showExitOffer {
            showExitOffer = true
        } else {
            finish()
        }
    }

    private func finish() {
        switch context {
        case .onboarding: model.complete(.paywall)
        case .sheet: dismiss()
        }
    }
}

private struct Benefit: View {
    let icon: String
    let text: LocalizedStringKey

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 30, height: 30)
                .background(Theme.coral, in: Circle())
            Text(text).font(.rounded(16, weight: .medium))
        }
    }
}

private struct PackageRow: View {
    let package: Package
    let isSelected: Bool

    private var product: StoreProduct { package.storeProduct }
    private var hasTrial: Bool { product.introductoryDiscount?.paymentMode == .freeTrial }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 22))
                .foregroundStyle(isSelected ? Theme.coral : Theme.plum.opacity(0.25))
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(title).font(.rounded(17, weight: .bold))
                    if hasTrial {
                        Text("Free trial")
                            .font(.rounded(11, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 3)
                            .background(Theme.gold, in: Capsule())
                    }
                }
                if package.packageType == .annual, let monthly = product.localizedPricePerMonth {
                    Text("\(monthly) / month").font(.rounded(13)).opacity(0.6)
                }
            }
            Spacer()
            Text(product.localizedPriceString).font(.rounded(17, weight: .bold))
        }
        .padding(16)
        .background(.white.opacity(isSelected ? 0.95 : 0.6), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(isSelected ? Theme.coral : .clear, lineWidth: 2)
        )
        .contentShape(Rectangle())
    }

    private var title: LocalizedStringKey {
        switch package.packageType {
        case .annual: "Yearly"
        case .monthly: "Monthly"
        case .weekly: "Weekly"
        case .lifetime: "Lifetime"
        default: "Morni+"
        }
    }
}

private struct ExitOfferView: View {
    let package: Package
    let buy: () -> Void

    private var firstYearPrice: String {
        package.storeProduct.introductoryDiscount?.localizedPriceString ?? package.storeProduct.localizedPriceString
    }

    var body: some View {
        VStack(spacing: 16) {
            MoodSticker(mood: .missyou, size: 90)
            Text("Wait, a little gift").font(.display(30))
            // The exit product carries a "pay up front" introductory offer for its first year.
            Text("Your first year of Morni+ for \(firstYearPrice). This offer won't come back.")
                .font(.rounded(16))
                .multilineTextAlignment(.center)
                .opacity(0.75)
            PrimaryButton(title: "Claim my offer", action: buy)
        }
        .foregroundStyle(Theme.plum)
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(DawnBackground())
    }
}
