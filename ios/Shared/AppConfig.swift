import Foundation

/// Build-time configuration, read from each target's Info.plist (filled from xcconfig).
enum AppConfig {
    private static func value(_ key: String) -> String {
        (Bundle.main.object(forInfoDictionaryKey: key) as? String)?
            .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    }

    static var appGroup: String { value("MorniAppGroup") }
    static var supabaseHost: String { value("MorniSupabaseHost") }
    static var supabaseURL: URL { URL(string: "https://\(supabaseHost)")! }
    static var supabaseKey: String { value("MorniSupabaseKey") }
    static var revenueCatKey: String { value("MorniRevenueCatKey") }
    static var googleClientID: String { value("GIDClientID") }
    static var webDomain: String { value("MorniWebDomain") }

    static var isConfigured: Bool {
        !supabaseKey.isEmpty && !supabaseHost.isEmpty && !supabaseHost.hasPrefix("your-project")
    }

    static func inviteURL(code: String) -> URL {
        URL(string: "https://\(webDomain)/i/\(code)")!
    }

    static var privacyURL: URL { URL(string: "https://\(webDomain)/privacy")! }
    static var termsURL: URL { URL(string: "https://\(webDomain)/terms")! }
    static var supportURL: URL { URL(string: "https://\(webDomain)/support")! }
}
