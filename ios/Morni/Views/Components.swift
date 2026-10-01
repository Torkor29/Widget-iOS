import SwiftUI

struct DawnBackground: View {
    var body: some View {
        Theme.dawn.ignoresSafeArea()
    }
}

struct PrimaryButton: View {
    let title: LocalizedStringKey
    var systemImage: String?
    var isLoading = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView().tint(.white)
                } else if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(title)
            }
            .font(.rounded(18, weight: .bold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(Theme.coral, in: Capsule())
            .shadow(color: Theme.coral.opacity(0.35), radius: 14, y: 6)
        }
        .buttonStyle(.plain)
        .disabled(isLoading)
    }
}

struct QuietButton: View {
    let title: LocalizedStringKey
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.rounded(15, weight: .semibold))
                .foregroundStyle(Theme.plum.opacity(0.6))
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}

struct Card<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        content
            .padding(20)
            .frame(maxWidth: .infinity)
            .background(.white.opacity(0.75), in: RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous))
    }
}

struct StreakChip: View {
    let streak: Int

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "flame.fill").foregroundStyle(streak > 0 ? Theme.gold : Theme.plum.opacity(0.3))
            Text("\(streak)").monospacedDigit()
        }
        .font(.rounded(16, weight: .bold))
        .foregroundStyle(Theme.plum)
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(.white.opacity(0.75), in: Capsule())
        .accessibilityLabel(Text("\(streak) day streak"))
    }
}

/// Decorative arrangement of mood stickers for hero screens.
struct StickerCloud: View {
    var body: some View {
        ZStack {
            MoodSticker(mood: .sunny, size: 130).offset(x: -70, y: -40).rotationEffect(.degrees(-8))
            MoodSticker(mood: .inlove, size: 110).offset(x: 80, y: -60).rotationEffect(.degrees(10))
            MoodSticker(mood: .sleepy, size: 96).offset(x: -90, y: 90).rotationEffect(.degrees(6))
            MoodSticker(mood: .coffee, size: 90).offset(x: 20, y: 70).rotationEffect(.degrees(-4))
            MoodSticker(mood: .spicy, size: 84).offset(x: 110, y: 70).rotationEffect(.degrees(14))
        }
    }
}

/// Wraps SwiftUI's relative formatting: "8:42 AM" today, weekday otherwise.
struct DropTime: View {
    let date: Date

    var body: some View {
        if Calendar.current.isDateInToday(date) {
            Text(date, style: .time)
        } else {
            Text(date, format: .dateTime.weekday(.wide).hour().minute())
        }
    }
}
