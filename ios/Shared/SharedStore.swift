import CryptoKit
import Foundation
import UIKit

/// What the widgets render. Written by the app, the widget feed and the
/// Notification Service Extension into the shared App Group container.
struct WidgetSnapshot: Codable, Equatable {
    var paired: Bool
    var premium: Bool
    var myName: String?
    var partnerName: String?
    var partnerDrop: SnapshotDrop?
    var myDrop: SnapshotDrop?
    var streak: Int
    var streakLastDay: String?
    var startedOn: String?
    var reunionOn: String?
    var updatedAt: Date

    static let empty = WidgetSnapshot(
        paired: false, premium: false, myName: nil, partnerName: nil,
        partnerDrop: nil, myDrop: nil, streak: 0, streakLastDay: nil,
        startedOn: nil, reunionOn: nil, updatedAt: .distantPast
    )

    var currentStreak: Int {
        guard let last = streakLastDay, last >= DayKey.yesterday else { return 0 }
        return streak
    }
}

struct SnapshotDrop: Codable, Equatable {
    var id: UUID
    var mood: String?
    var caption: String?
    var createdAt: Date
    var imageFile: String

    var moodValue: Mood? { mood.flatMap(Mood.init(rawValue:)) }
}

enum SharedStore {
    private static let snapshotKey = "widgetSnapshot"
    private static let widgetKeyKey = "widgetKey"

    static var defaults: UserDefaults { UserDefaults(suiteName: AppConfig.appGroup) ?? .standard }

    private static var imagesDirectory: URL? {
        FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: AppConfig.appGroup)?
            .appendingPathComponent("Images", isDirectory: true)
    }

    // MARK: Snapshot

    static func loadSnapshot() -> WidgetSnapshot? {
        guard let data = defaults.data(forKey: snapshotKey) else { return nil }
        return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    }

    static func saveSnapshot(_ snapshot: WidgetSnapshot) {
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        defaults.set(data, forKey: snapshotKey)
        pruneImages(keeping: [snapshot.myDrop?.imageFile, snapshot.partnerDrop?.imageFile])
    }

    /// Called on sign-out / account deletion.
    static func reset() {
        defaults.removeObject(forKey: snapshotKey)
        defaults.removeObject(forKey: widgetKeyKey)
        pruneImages(keeping: [])
    }

    // MARK: Images

    static func imageURL(_ name: String) -> URL? { imagesDirectory?.appendingPathComponent(name) }

    static func hasImage(_ name: String) -> Bool {
        guard let url = imageURL(name) else { return false }
        return FileManager.default.fileExists(atPath: url.path)
    }

    static func saveImage(_ data: Data, name: String) throws {
        guard let url = imageURL(name) else { throw CocoaError(.fileNoSuchFile) }
        try FileManager.default.createDirectory(
            at: url.deletingLastPathComponent(), withIntermediateDirectories: true
        )
        let small = ImageTools.downsampledJPEG(data, maxPixel: 720) ?? data
        try small.write(to: url, options: .atomic)
    }

    static func image(named name: String?) -> UIImage? {
        guard let name, let url = imageURL(name) else { return nil }
        return UIImage(contentsOfFile: url.path)
    }

    private static func pruneImages(keeping names: [String?]) {
        guard let dir = imagesDirectory,
              let files = try? FileManager.default.contentsOfDirectory(atPath: dir.path) else { return }
        let keep = Set(names.compactMap { $0 })
        for file in files where !keep.contains(file) {
            try? FileManager.default.removeItem(at: dir.appendingPathComponent(file))
        }
    }

    // MARK: Widget key

    /// Random per-install secret the widget uses to call the widget feed.
    static var existingWidgetKey: String? { defaults.string(forKey: widgetKeyKey) }

    static func widgetKey() -> String {
        if let key = existingWidgetKey { return key }
        let bytes = SymmetricKey(size: .bits256).withUnsafeBytes { Data($0) }
        let key = bytes.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
        defaults.set(key, forKey: widgetKeyKey)
        return key
    }

    static func sha256Hex(_ value: String) -> String {
        SHA256.hash(data: Data(value.utf8)).map { String(format: "%02x", $0) }.joined()
    }
}
