import SwiftUI

/// The original Morni mood stickers (artwork in Shared.xcassets, source in design/).
/// Generated order: free moods first, then Morni+ ones — keep in sync with design/moods/moods.json.
enum Mood: String, CaseIterable, Codable, Identifiable {
    // Free
    case sunny, sleepy, grumpy, inlove, missyou, coffee, cuddle, sick, hungry, proud
    // Morni+
    case kiss, spicy, fire, party, sad, jealous, cool, angel, devil, shy, melting, pizza, plane, goodnight, freezing

    var id: String { rawValue }

    var isPremium: Bool {
        switch self {
        case .sunny, .sleepy, .grumpy, .inlove, .missyou, .coffee, .cuddle, .sick, .hungry, .proud: false
        default: true
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
        case .proud: String(localized: "So proud")
        case .kiss: String(localized: "Kiss")
        case .spicy: String(localized: "Spicy")
        case .fire: String(localized: "On fire")
        case .party: String(localized: "Party mode")
        case .sad: String(localized: "A bit sad")
        case .jealous: String(localized: "Jealous")
        case .cool: String(localized: "Feeling cool")
        case .angel: String(localized: "Angel")
        case .devil: String(localized: "Little devil")
        case .shy: String(localized: "Shy")
        case .melting: String(localized: "Melting")
        case .pizza: String(localized: "Pizza night")
        case .plane: String(localized: "On my way")
        case .goodnight: String(localized: "Good night")
        case .freezing: String(localized: "Freezing")
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
