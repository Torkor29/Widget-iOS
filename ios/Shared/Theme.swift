import SwiftUI

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: opacity
        )
    }
}

/// "Morning Glow" — the Morni palette and type scale.
enum Theme {
    static let cream = Color(hex: 0xFFF6EF)
    static let peach = Color(hex: 0xFFB38A)
    static let coral = Color(hex: 0xFF6B81)
    static let lilac = Color(hex: 0xB9A6FF)
    static let plum = Color(hex: 0x2B1033)
    static let gold = Color(hex: 0xFFC24B)
    static let night = Color(hex: 0x170B1D)

    /// Signature sunrise gradient (peach → coral → lilac).
    static let sunrise = LinearGradient(
        colors: [peach, coral, lilac],
        startPoint: .bottomLeading,
        endPoint: .topTrailing
    )

    /// Soft background used behind most screens.
    static let dawn = LinearGradient(
        colors: [cream, Color(hex: 0xFFE3D6), Color(hex: 0xEDE6FF)],
        startPoint: .top,
        endPoint: .bottom
    )

    static let cardRadius: CGFloat = 28
}

extension Font {
    /// Editorial serif (New York) for headlines — echoes Fraunces on the website.
    static func display(_ size: CGFloat, italic: Bool = false) -> Font {
        let font = Font.system(size: size, weight: .semibold, design: .serif)
        return italic ? font.italic() : font
    }

    static func rounded(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
}
