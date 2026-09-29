import Foundation

enum CoupleCounter {
    /// "12 days to go" when a reunion date is set (Morni+), otherwise "412 days together".
    static func text(startedOn: String?, reunionOn: String?, premium: Bool) -> String? {
        if premium, let reunion = reunionOn, let days = DayKey.daysSince(reunion), days <= 0 {
            return days == 0 ? String(localized: "See you today!") : String(localized: "\(-days) days to go")
        }
        if let start = startedOn, let days = DayKey.daysSince(start), days >= 0 {
            return String(localized: "\(days) days together")
        }
        return nil
    }
}
