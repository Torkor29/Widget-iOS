import Foundation
import Supabase
import UIKit

let supabase = SupabaseClient(
    supabaseURL: AppConfig.supabaseURL,
    supabaseKey: AppConfig.isConfigured ? AppConfig.supabaseKey : "not-configured"
)

enum BackendError: LocalizedError, Equatable {
    case server(code: String)

    var code: String {
        switch self { case .server(let code): code }
    }

    var errorDescription: String? {
        switch code {
        case "DAILY_LIMIT": String(localized: "You already posted today. Morni+ lets you send as many as you like.")
        case "INVITE_NOT_FOUND": String(localized: "This code doesn't exist or has expired.")
        case "INVITE_SELF": String(localized: "That's your own code! Send it to your person.")
        case "ALREADY_PAIRED": String(localized: "One of you is already connected to someone.")
        case "NOT_PAIRED": String(localized: "Connect with your person first.")
        case "TOO_MANY_NUDGES": String(localized: "That's a lot of love for one day. Try again tomorrow 💌")
        default: String(localized: "Something went wrong. Please try again.")
        }
    }
}

/// Thin wrapper over the Supabase API (tables, RPCs, storage, Edge Functions).
enum Backend {
    private static let decoder = JSONDecoder()

    // MARK: Reads

    static func homeState() async throws -> HomeState? {
        let data = try await supabase.rpc("home_state").execute().data
        let text = String(decoding: data, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
        if text.isEmpty || text == "null" { return nil }
        return try decoder.decode(HomeState.self, from: data)
    }

    static func listDrops(before: Double? = nil, limit: Int = 60) async throws -> [Drop] {
        struct Params: Encodable {
            let p_before: Double?
            let p_limit: Int
        }
        let data = try await supabase
            .rpc("list_drops", params: Params(p_before: before, p_limit: limit))
            .execute().data
        return try decoder.decode([Drop].self, from: data)
    }

    static func signedURLs(_ paths: [String], expiresIn: Int = 3600) async throws -> [String: URL] {
        let unique = Array(Set(paths))
        guard !unique.isEmpty else { return [:] }
        let results = try await supabase.storage.from("drops").createSignedURLs(paths: unique, expiresIn: expiresIn)
        var urls: [String: URL] = [:]
        for result in results {
            if let url = result.signedURL { urls[result.path] = url }
        }
        return urls
    }

    // MARK: Profile & couple

    struct ProfileUpdate: Encodable {
        var first_name: String?
        var locale: String?
        var timezone: String?
        var reminder_hour: Int?
        var reminders_enabled: Bool?
    }

    static func updateProfile(_ update: ProfileUpdate, userID: UUID) async throws {
        try await supabase.from("profiles").update(update).eq("id", value: userID.uuidString.lowercased()).execute()
    }

    static func updateCouple(id: UUID, startedOn: String?, reunionOn: String?) async throws {
        struct Update: Encodable {
            let startedOn: String?
            let reunionOn: String?

            enum CodingKeys: String, CodingKey {
                case startedOn = "started_on"
                case reunionOn = "reunion_on"
            }

            // Encode nils as explicit nulls so a date can be cleared.
            func encode(to encoder: Encoder) throws {
                var container = encoder.container(keyedBy: CodingKeys.self)
                try container.encode(startedOn, forKey: .startedOn)
                try container.encode(reunionOn, forKey: .reunionOn)
            }
        }
        try await supabase.from("couples")
            .update(Update(startedOn: startedOn, reunionOn: reunionOn))
            .eq("id", value: id.uuidString.lowercased())
            .execute()
    }

    // MARK: Pairing

    static func createInvite() async throws -> String {
        let code: String = try await supabase.rpc("create_invite").execute().value
        return code
    }

    static func acceptInvite(code: String) async throws {
        struct Body: Encodable { let code: String }
        struct Response: Decodable { let couple_id: UUID? }
        let _: Response = try await invoke("accept-invite", body: Body(code: code))
    }

    // MARK: Drops

    /// Uploads the photo (full + widget thumbnail) and records it; returns the new drop id.
    static func postDrop(image: UIImage, mood: Mood?, caption: String, coupleID: UUID) async throws -> UUID {
        guard let full = ImageTools.jpeg(from: image, maxPixel: 1440, quality: 0.8),
              let thumb = ImageTools.jpeg(from: image, maxPixel: 720, quality: 0.8)
        else { throw BackendError.server(code: "IMAGE") }

        let base = "\(coupleID.uuidString.lowercased())/\(UUID().uuidString.lowercased())"
        let imagePath = "\(base).jpg"
        let thumbPath = "\(base)_thumb.jpg"
        let bucket = supabase.storage.from("drops")
        let options = FileOptions(contentType: "image/jpeg")
        _ = try await bucket.upload(imagePath, data: full, options: options)
        _ = try await bucket.upload(thumbPath, data: thumb, options: options)

        struct Body: Encodable {
            let image_path: String
            let thumb_path: String
            let mood: String?
            let caption: String?
            let day_key: String
        }
        struct Response: Decodable { let id: UUID }
        let trimmed = caption.trimmingCharacters(in: .whitespacesAndNewlines)
        let response: Response = try await invoke("post-drop", body: Body(
            image_path: imagePath,
            thumb_path: thumbPath,
            mood: mood?.rawValue,
            caption: trimmed.isEmpty ? nil : String(trimmed.prefix(40)),
            day_key: DayKey.today
        ))
        // Put our own selfie in the widget right away (no download needed).
        try? SharedStore.saveImage(thumb, name: WidgetSync.imageFile(prefix: "me", dropID: response.id))
        return response.id
    }

    static func react(dropID: UUID, emoji: String) async throws {
        struct Body: Encodable {
            let type = "reaction"
            let drop_id: String
            let emoji: String
        }
        let _: OK = try await invoke("react", body: Body(drop_id: dropID.uuidString.lowercased(), emoji: emoji))
    }

    static func nudge() async throws {
        let _: OK = try await invoke("react", body: ["type": "nudge"])
    }

    // MARK: Account

    static func unpair() async throws {
        let _: OK = try await invoke("unpair", body: [String: String]())
    }

    static func deleteAccount() async throws {
        let _: OK = try await invoke("delete-account", body: [String: String]())
    }

    static func registerDevice(token: String) async throws {
        #if DEBUG
        let environment = "sandbox"
        #else
        let environment = "production"
        #endif
        try await supabase.rpc("register_device", params: ["p_token": token, "p_environment": environment]).execute()
    }

    static func unregisterDevice(token: String) async throws {
        try await supabase.rpc("unregister_device", params: ["p_token": token]).execute()
    }

    static func registerWidgetKey(hash: String) async throws {
        try await supabase.rpc("register_widget_key", params: ["p_key_hash": hash]).execute()
    }

    // MARK: Edge Functions

    private struct OK: Decodable {}

    private static func invoke<Response: Decodable>(_ name: String, body: some Encodable) async throws -> Response {
        do {
            return try await supabase.functions.invoke(name, options: FunctionInvokeOptions(body: body))
        } catch let error as FunctionsError {
            if case let .httpError(_, data) = error {
                let code = (try? JSONDecoder().decode([String: String].self, from: data))?["error"] ?? "INTERNAL"
                throw BackendError.server(code: code)
            }
            throw error
        }
    }
}
