import AuthenticationServices
import CryptoKit
import GoogleSignIn
import Supabase
import UIKit

enum AuthService {
    static var isGoogleAvailable: Bool { !AppConfig.googleClientID.isEmpty }

    static func randomNonce(length: Int = 32) -> String {
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var generator = SystemRandomNumberGenerator()
        return String((0..<length).map { _ in charset.randomElement(using: &generator)! })
    }

    static func sha256(_ value: String) -> String {
        SHA256.hash(data: Data(value.utf8)).map { String(format: "%02x", $0) }.joined()
    }

    /// Apple receives sha256(nonce); Supabase verifies the raw nonce against the ID token.
    static func signInWithApple(credential: ASAuthorizationAppleIDCredential, nonce: String) async throws {
        guard let tokenData = credential.identityToken,
              let idToken = String(data: tokenData, encoding: .utf8)
        else { throw BackendError.server(code: "APPLE_TOKEN") }
        try await supabase.auth.signInWithIdToken(
            credentials: OpenIDConnectCredentials(provider: .apple, idToken: idToken, nonce: nonce)
        )
    }

    @MainActor
    static func signInWithGoogle() async throws {
        guard let presenter = UIApplication.shared.topViewController else { return }
        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: presenter)
        guard let idToken = result.user.idToken?.tokenString else { throw BackendError.server(code: "GOOGLE_TOKEN") }
        try await supabase.auth.signInWithIdToken(
            credentials: OpenIDConnectCredentials(
                provider: .google,
                idToken: idToken,
                accessToken: result.user.accessToken.tokenString
            )
        )
    }

    static func signOut() async {
        try? await supabase.auth.signOut()
        GIDSignIn.sharedInstance.signOut()
    }
}

extension UIApplication {
    var topViewController: UIViewController? {
        var top = connectedScenes
            .compactMap { ($0 as? UIWindowScene)?.keyWindow }
            .first?.rootViewController
        while let presented = top?.presentedViewController { top = presented }
        return top
    }
}
