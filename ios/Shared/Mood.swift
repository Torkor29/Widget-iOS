import SwiftUI

/// The original Morni mood stickers (artwork in Shared.xcassets, source in design/).
enum Mood: String, CaseIterable, Codable, Identifiable {
    case sunny, sleepy, grumpy, inlove, missyou, coffee
    case cuddle, sick, hungry, fire, spicy, proud

    var id: String { rawValue }

    var isPremium: Bool {
        switch self {
        case .sunny, .sleepy, .grumpy, .inlove, .missyou, .coffee: false
        case .cuddle, .sick, .hungry, .fire, .spicy, .proud: true
        }
    }

    var imageName: String { "mood-\(rawValue)" }

    var label: String {
        switch self {
        case .sunny: String(localized: "Radiant")
        case .sleepy: String(localized: "Still in bed")
        case .grumpy: String(localized: "Grumpy")
        case .inlove: String(localized: "In love")
        case .missyou: String(localized: "Miss you")
        case .coffee: String(localized: "Need coffee")
        case .cuddle: String(localized: "Need a hug")
        case .sick: String(localized: "Under the weather")
        case .hungry: String(localized: "Hangry")
        case .fire: String(localized: "On fire")
        case .spicy: String(localized: "Spicy")
        case .proud: String(localized: "So proud")
        }
    }
}

struct MoodSticker: View {
    let mood: Mood
    var size: CGFloat = 56

    var body: some View {
        Image(mood.imageName)
            .resizable()
            .interpolation(.high)
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityLabel(mood.label)
    }
}
