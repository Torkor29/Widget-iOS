import AuthenticationServices
import SwiftUI

struct WelcomeView: View {
    @Environment(AppModel.self) private var model
    @State private var nonce = ""

    var body: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 20)
            StickerCloud()
                .frame(height: 280)
            VStack(spacing: 12) {
                Text("Wake up to *their* face.")
                    .font(.display(40))
                    .multilineTextAlignment(.center)
                Text("One selfie a day, straight to your person's home screen.")
                    .font(.rounded(17))
                    .multilineTextAlignment(.center)
                    .opacity(0.7)
            }
            .foregroundStyle(Theme.plum)
            .padding(.top, 8)
            Spacer()

            VStack(spacing: 12) {
                if AppConfig.isConfigured {
                    SignInWithAppleButton(.continue) { request in
                        let raw = AuthService.randomNonce()
                        nonce = raw
                        request.requestedScopes = [.fullName]
                        request.nonce = AuthService.sha256(raw)
                    } onCompletion: { result in
                        Task { await model.handleApple(result, nonce: nonce) }
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 56)
                    .clipShape(Capsule())

                    if AuthService.isGoogleAvailable {
                        Button {
                            Task { await model.signInWithGoogle() }
                        } label: {
                            HStack(spacing: 10) {
                                Text("G").font(.system(size: 20, weight: .bold, design: .rounded))
                                Text("Continue with Google").font(.system(size: 19, weight: .medium))
                            }
                            .foregroundStyle(Theme.plum)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(.white, in: Capsule())
                            .overlay(Capsule().stroke(Theme.plum.opacity(0.12)))
                        }
                        .buttonStyle(.plain)
                    }
                } else {
                    Text("Backend not configured yet — see docs/SETUP.md.")
                        .font(.rounded(14, weight: .semibold))
                        .foregroundStyle(Theme.coral)
                }

                HStack(spacing: 6) {
                    Text("By continuing you accept our")
                    Link("Terms", destination: AppConfig.termsURL).underline()
                    Text("&")
                    Link("Privacy", destination: AppConfig.privacyURL).underline()
                }
                .font(.rounded(12))
                .foregroundStyle(Theme.plum.opacity(0.55))
                .padding(.top, 4)
            }
        }
        .padding(24)
        .background(DawnBackground())
    }
}
