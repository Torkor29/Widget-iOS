import SwiftUI
import WidgetKit

private let appURL = URL(string: "morni://home")

// MARK: - Their selfie (small / large)

struct PartnerWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: MorniEntry

    private var snapshot: WidgetSnapshot { entry.snapshot }
    private var isLarge: Bool { family == .systemLarge }
    private var locked: Bool { isLarge && !snapshot.premium }
    private var photo: UIImage? { locked || !snapshot.paired ? nil : entry.partnerImage }

    var body: some View {
        content
            .containerBackground(for: .widget) {
                if let photo {
                    ZStack {
                        Image(uiImage: photo).resizable().scaledToFill()
                        LinearGradient(colors: [.clear, .black.opacity(0.5)], startPoint: .center, endPoint: .bottom)
                    }
                } else {
                    Theme.sunrise
                }
            }
            .widgetURL(appURL)
    }

    @ViewBuilder private var content: some View {
        if locked {
            WidgetMessage(mood: .proud, text: String(localized: "Unlock with Morni+"))
        } else if !snapshot.paired {
            WidgetMessage(mood: .missyou, text: String(localized: "Open Morni to connect with your person"))
        } else if let drop = snapshot.partnerDrop, photo != nil {
            PhotoCaption(
                name: snapshot.partnerName ?? "",
                drop: drop,
                streak: snapshot.currentStreak,
                large: isLarge,
                footer: isLarge
                    ? CoupleCounter.text(startedOn: snapshot.startedOn, reunionOn: snapshot.reunionOn, premium: snapshot.premium)
                    : nil
            )
        } else {
            WidgetMessage(mood: .sleepy, text: waitingText)
        }
    }

    private var waitingText: String {
        if let name = snapshot.partnerName, !name.isEmpty {
            return String(localized: "Waiting for \(name)'s selfie")
        }
        return String(localized: "Waiting for their selfie")
    }
}

private struct PhotoCaption: View {
    let name: String
    let drop: SnapshotDrop
    let streak: Int
    let large: Bool
    let footer: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Spacer()
                if streak > 0 { StreakBadge(streak: streak) }
            }
            Spacer(minLength: 0)
            HStack(alignment: .bottom, spacing: 6) {
                if let mood = drop.moodValue {
                    MoodSticker(mood: mood, size: large ? 64 : 38)
                        .rotationEffect(.degrees(-8))
                }
                VStack(alignment: .leading, spacing: 1) {
                    if large, let caption = drop.caption, !caption.isEmpty {
                        Text(caption).font(.rounded(16, weight: .semibold)).lineLimit(2)
                    }
                    Text(name).font(.rounded(large ? 18 : 13, weight: .bold)).lineLimit(1)
                    TimeLabel(date: drop.createdAt).font(.rounded(large ? 13 : 11, weight: .medium)).opacity(0.85)
                    if let footer {
                        Text(footer).font(.rounded(12, weight: .semibold)).opacity(0.9).padding(.top, 2)
                    }
                }
                .foregroundStyle(.white)
                .shadow(color: .black.opacity(0.35), radius: 4, y: 1)
                Spacer(minLength: 0)
            }
        }
        .padding(large ? 16 : 11)
    }
}

// MARK: - You two (medium)

struct DuoWidgetView: View {
    let entry: MorniEntry
    private var snapshot: WidgetSnapshot { entry.snapshot }

    var body: some View {
        Group {
            if snapshot.paired {
                HStack(spacing: 6) {
                    DuoTile(image: entry.partnerImage, name: snapshot.partnerName ?? "", drop: snapshot.partnerDrop)
                    DuoTile(image: entry.myImage, name: String(localized: "You"), drop: snapshot.myDrop)
                }
                .padding(6)
                .overlay(alignment: .top) {
                    if snapshot.currentStreak > 0 {
                        StreakBadge(streak: snapshot.currentStreak).padding(.top, 10)
                    }
                }
            } else {
                WidgetMessage(mood: .missyou, text: String(localized: "Open Morni to connect with your person"))
            }
        }
        .containerBackground(for: .widget) { Theme.sunrise }
        .widgetURL(appURL)
    }
}

private struct DuoTile: View {
    let image: UIImage?
    let name: String
    let drop: SnapshotDrop?

    var body: some View {
        Color.white.opacity(0.35)
            .overlay {
                if let image {
                    Image(uiImage: image).resizable().scaledToFill()
                } else {
                    VStack(spacing: 4) {
                        MoodSticker(mood: .sleepy, size: 40)
                        Text("Not yet today").font(.rounded(11, weight: .semibold)).foregroundStyle(Theme.plum)
                    }
                }
            }
            .overlay(alignment: .bottomLeading) {
                HStack(spacing: 4) {
                    Text(name).font(.rounded(12, weight: .bold)).lineLimit(1)
                    if let drop { TimeLabel(date: drop.createdAt).font(.rounded(10, weight: .medium)).opacity(0.85) }
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(.black.opacity(0.28), in: Capsule())
                .padding(8)
            }
            .overlay(alignment: .topTrailing) {
                if let mood = drop?.moodValue {
                    MoodSticker(mood: mood, size: 30).rotationEffect(.degrees(8)).padding(6)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

// MARK: - Lock Screen

struct LockScreenWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: MorniEntry
    private var snapshot: WidgetSnapshot { entry.snapshot }

    var body: some View {
        content
            .containerBackground(for: .widget) { Color.clear }
            .widgetURL(appURL)
    }

    @ViewBuilder private var content: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 0) {
                    Image(systemName: "flame.fill").font(.system(size: 14, weight: .bold))
                    Text("\(snapshot.currentStreak)").font(.rounded(18, weight: .bold))
                }
            }
        case .accessoryInline:
            if snapshot.premium, let drop = snapshot.partnerDrop {
                Text("\(snapshot.partnerName ?? "") · \(drop.moodValue?.label ?? "") \(drop.createdAt, style: .time)")
            } else {
                Text("Morni")
            }
        default:
            if !snapshot.premium {
                Label("Unlock with Morni+", systemImage: "lock.fill").font(.rounded(13, weight: .semibold))
            } else if let drop = snapshot.partnerDrop {
                VStack(alignment: .leading, spacing: 1) {
                    Text(snapshot.partnerName ?? "").font(.rounded(15, weight: .bold)).lineLimit(1)
                    if let mood = drop.moodValue { Text(mood.label).font(.rounded(13, weight: .medium)).lineLimit(1) }
                    HStack(spacing: 6) {
                        TimeLabel(date: drop.createdAt)
                        if snapshot.currentStreak > 0 {
                            Label("\(snapshot.currentStreak)", systemImage: "flame.fill")
                        }
                    }
                    .font(.rounded(12, weight: .medium))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                Text("Waiting for their selfie").font(.rounded(13, weight: .semibold))
            }
        }
    }
}

// MARK: - Shared pieces

private struct WidgetMessage: View {
    let mood: Mood
    let text: String

    var body: some View {
        VStack(spacing: 6) {
            MoodSticker(mood: mood, size: 48)
            Text(text)
                .font(.rounded(12, weight: .semibold))
                .multilineTextAlignment(.center)
                .foregroundStyle(.white)
                .shadow(color: Theme.plum.opacity(0.25), radius: 3, y: 1)
                .minimumScaleFactor(0.8)
        }
        .padding(12)
    }
}

struct StreakBadge: View {
    let streak: Int

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: "flame.fill").foregroundStyle(Theme.gold)
            Text("\(streak)").foregroundStyle(.white)
        }
        .font(.rounded(12, weight: .bold))
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(.black.opacity(0.3), in: Capsule())
    }
}

/// "8:42 AM" today, weekday otherwise.
struct TimeLabel: View {
    let date: Date

    var body: some View {
        if Calendar.current.isDateInToday(date) {
            Text(date, style: .time)
        } else {
            Text(date, format: .dateTime.weekday(.abbreviated))
        }
    }
}
