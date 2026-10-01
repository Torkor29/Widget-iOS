import Foundation
import WidgetKit

/// Keeps the widget snapshot fresh. Three paths feed it:
/// 1. the Notification Service Extension, the instant a partner's selfie push arrives;
/// 2. the app, whenever it loads the home state;
/// 3. the widget timeline itself, via the `widget-feed` function (fallback when
///    notifications are off).
enum WidgetSync {
    @discardableResult
    static func refreshFromNetwork() async -> WidgetSnapshot? {
        guard AppConfig.isConfigured, let key = SharedStore.existingWidgetKey else {
            return SharedStore.loadSnapshot()
        }
        var request = URLRequest(url: AppConfig.supabaseURL.appendingPathComponent("functions/v1/widget-feed"))
        request.httpMethod = "POST"
        request.timeoutInterval = 12
        request.setValue(key, forHTTPHeaderField: "x-widget-key")
        request.setValue(AppConfig.supabaseKey, forHTTPHeaderField: "apikey")
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else { return SharedStore.loadSnapshot() }
            let feed = try JSONDecoder().decode(WidgetFeed.self, from: data)
            return await apply(state: feed.state, myThumbURL: feed.myThumbURL, partnerThumbURL: feed.partnerThumbURL)
        } catch {
            return SharedStore.loadSnapshot()
        }
    }

    /// Saves a fresh state, downloading thumbnails the widget doesn't have yet.
    @discardableResult
    static func apply(state: HomeState?, myThumbURL: URL?, partnerThumbURL: URL?) async -> WidgetSnapshot {
        guard let state else {
            SharedStore.saveSnapshot(.empty)
            return .empty
        }
        let previous = SharedStore.loadSnapshot()
        async let mine = resolve(state.myDrop, prefix: "me", url: myThumbURL, previous: previous?.myDrop)
        async let theirs = resolve(state.partnerDrop, prefix: "partner", url: partnerThumbURL, previous: previous?.partnerDrop)
        let myDrop = await mine
        let partnerDrop = await theirs
        let snapshot = WidgetSnapshot(
            paired: state.isPaired,
            premium: state.premium,
            myName: state.me?.firstName,
            partnerName: state.partner?.firstName,
            partnerDrop: partnerDrop,
            myDrop: myDrop,
            streak: state.couple?.streak ?? 0,
            streakLastDay: state.couple?.streakLastDay,
            startedOn: state.couple?.startedOn,
            reunionOn: state.couple?.reunionOn,
            updatedAt: Date()
        )
        SharedStore.saveSnapshot(snapshot)
        return snapshot
    }

    /// Stores a partner selfie delivered by push (used by the Notification Service Extension).
    static func applyIncomingPartnerDrop(_ drop: SnapshotDrop, imageData: Data, partnerName: String?) throws {
        try SharedStore.saveImage(imageData, name: drop.imageFile)
        var snapshot = SharedStore.loadSnapshot() ?? .empty
        snapshot.paired = true
        snapshot.partnerDrop = drop
        if let partnerName, !partnerName.isEmpty { snapshot.partnerName = partnerName }
        snapshot.updatedAt = Date()
        SharedStore.saveSnapshot(snapshot)
    }

    static func reloadWidgets() {
        WidgetCenter.shared.reloadAllTimelines()
    }

    static func imageFile(prefix: String, dropID: UUID) -> String {
        "\(prefix)-\(dropID.uuidString.lowercased()).jpg"
    }

    private static func resolve(_ drop: Drop?, prefix: String, url: URL?, previous: SnapshotDrop?) async -> SnapshotDrop? {
        guard let drop else { return nil }
        let file = imageFile(prefix: prefix, dropID: drop.id)
        if !SharedStore.hasImage(file) {
            guard let url, let download = try? await URLSession.shared.data(from: url) else {
                // Keep showing the previous picture rather than an empty widget.
                return previous
            }
            try? SharedStore.saveImage(download.0, name: file)
        }
        return SnapshotDrop(id: drop.id, mood: drop.mood, caption: drop.caption, createdAt: drop.date, imageFile: file)
    }
}
