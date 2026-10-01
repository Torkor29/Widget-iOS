import SwiftUI
import WidgetKit

@main
struct MorniWidgetBundle: WidgetBundle {
    var body: some Widget {
        PartnerWidget()
        DuoWidget()
        LockScreenWidget()
    }
}

struct PartnerWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "PartnerWidget", provider: MorniProvider()) { entry in
            PartnerWidgetView(entry: entry)
        }
        .configurationDisplayName("Their selfie")
        .description("Your person's latest selfie, right on your home screen.")
        .supportedFamilies([.systemSmall, .systemLarge])
        .contentMarginsDisabled()
    }
}

struct DuoWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "DuoWidget", provider: MorniProvider()) { entry in
            DuoWidgetView(entry: entry)
        }
        .configurationDisplayName("You two")
        .description("Both of today's selfies, side by side.")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct LockScreenWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "LockScreenWidget", provider: MorniProvider()) { entry in
            LockScreenWidgetView(entry: entry)
        }
        .configurationDisplayName("Morni")
        .description("Their mood and your streak on your Lock Screen.")
        .supportedFamilies([.accessoryRectangular, .accessoryCircular, .accessoryInline])
    }
}

// MARK: - Timeline

struct MorniEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
    let partnerImage: UIImage?
    let myImage: UIImage?

    static func load() -> MorniEntry {
        let snapshot = SharedStore.loadSnapshot() ?? .empty
        return MorniEntry(
            date: Date(),
            snapshot: snapshot,
            partnerImage: SharedStore.image(named: snapshot.partnerDrop?.imageFile),
            myImage: SharedStore.image(named: snapshot.myDrop?.imageFile)
        )
    }

    static var placeholder: MorniEntry {
        MorniEntry(
            date: Date(),
            snapshot: WidgetSnapshot(
                paired: true, premium: true, myName: "Tom", partnerName: "Léa",
                partnerDrop: nil, myDrop: nil, streak: 12, streakLastDay: DayKey.today,
                startedOn: nil, reunionOn: nil, updatedAt: Date()
            ),
            partnerImage: nil,
            myImage: nil
        )
    }
}

struct MorniProvider: TimelineProvider {
    func placeholder(in context: Context) -> MorniEntry { .placeholder }

    func getSnapshot(in context: Context, completion: @escaping (MorniEntry) -> Void) {
        let entry = MorniEntry.load()
        completion(context.isPreview && !entry.snapshot.paired ? .placeholder : entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MorniEntry>) -> Void) {
        Task {
            // Pushes update the widget instantly; this is the safety net.
            await WidgetSync.refreshFromNetwork()
            let next = Date().addingTimeInterval(30 * 60)
            completion(Timeline(entries: [MorniEntry.load()], policy: .after(next)))
        }
    }
}
