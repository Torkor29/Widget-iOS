import UserNotifications
import WidgetKit

/// Runs when a selfie push arrives: downloads the photo into the App Group,
/// refreshes the partner widget right away, and attaches the photo to the banner.
final class NotificationService: UNNotificationServiceExtension {
    private var contentHandler: ((UNNotificationContent) -> Void)?
    private var bestAttempt: UNMutableNotificationContent?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        self.contentHandler = contentHandler
        let content = (request.content.mutableCopy() as? UNMutableNotificationContent) ?? UNMutableNotificationContent()
        bestAttempt = content

        let info = request.content.userInfo
        guard info["type"] as? String == "drop",
              let urlString = info["thumb_url"] as? String,
              let url = URL(string: urlString),
              let drop = info["drop"] as? [String: Any],
              let idString = drop["id"] as? String,
              let id = UUID(uuidString: idString)
        else {
            contentHandler(content)
            return
        }

        let createdAt = (drop["created_at"] as? Double) ?? Date().timeIntervalSince1970
        let snapshotDrop = SnapshotDrop(
            id: id,
            mood: drop["mood"] as? String,
            caption: drop["caption"] as? String,
            createdAt: Date(timeIntervalSince1970: createdAt),
            imageFile: WidgetSync.imageFile(prefix: "partner", dropID: id)
        )
        let partnerName = drop["author_name"] as? String

        Task {
            if let data = try? await URLSession.shared.data(from: url).0 {
                try? WidgetSync.applyIncomingPartnerDrop(snapshotDrop, imageData: data, partnerName: partnerName)
                WidgetCenter.shared.reloadAllTimelines()
                if let attachment = Self.attachment(data: data) {
                    content.attachments = [attachment]
                }
            }
            self.finish()
        }
    }

    override func serviceExtensionTimeWillExpire() {
        finish()
    }

    private let lock = NSLock()

    /// Delivers the notification exactly once (download finished or time ran out).
    private func finish() {
        lock.lock()
        let handler = contentHandler
        contentHandler = nil
        lock.unlock()
        if let handler, let content = bestAttempt {
            handler(content)
        }
    }

    private static func attachment(data: Data) -> UNNotificationAttachment? {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("\(UUID().uuidString).jpg")
        do {
            try data.write(to: url)
            return try UNNotificationAttachment(identifier: "selfie", url: url)
        } catch {
            return nil
        }
    }
}
