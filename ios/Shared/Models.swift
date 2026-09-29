import Foundation

/// Mirrors `public.widget_state()` / `public.home_state()` in the database.
struct HomeState: Codable, Equatable {
    struct Person: Codable, Equatable {
        let id: UUID
        let firstName: String
        /// Only present for the signed-in user.
        let reminderHour: Int?
        let remindersEnabled: Bool?

        enum CodingKeys: String, CodingKey {
            case id
            case firstName = "first_name"
            case reminderHour = "reminder_hour"
            case remindersEnabled = "reminders_enabled"
        }
    }

    struct Couple: Codable, Equatable {
        let id: UUID
        let streak: Int
        let bestStreak: Int
        let streakLastDay: String?
        let startedOn: String?
        let reunionOn: String?

        enum CodingKeys: String, CodingKey {
            case id, streak
            case bestStreak = "best_streak"
            case streakLastDay = "streak_last_day"
            case startedOn = "started_on"
            case reunionOn = "reunion_on"
        }

        /// The stored streak is only alive if the last full day was today or yesterday.
        var currentStreak: Int {
            guard let last = streakLastDay, last >= DayKey.yesterday else { return 0 }
            return streak
        }
    }

    let me: Person?
    let partner: Person?
    let couple: Couple?
    let premium: Bool
    let myDrop: Drop?
    let partnerDrop: Drop?

    enum CodingKeys: String, CodingKey {
        case me, partner, couple, premium
        case myDrop = "my_drop"
        case partnerDrop = "partner_drop"
    }

    var isPaired: Bool { couple != nil && partner != nil }
    var postedToday: Bool { myDrop?.dayKey == DayKey.today }
}

struct Drop: Codable, Equatable, Identifiable, Hashable {
    let id: UUID
    let authorId: UUID
    let imagePath: String
    let thumbPath: String
    let mood: String?
    let caption: String?
    let dayKey: String
    /// Seconds since 1970 (the database returns epochs to keep decoding trivial).
    let createdAt: Double

    enum CodingKeys: String, CodingKey {
        case id
        case authorId = "author_id"
        case imagePath = "image_path"
        case thumbPath = "thumb_path"
        case mood, caption
        case dayKey = "day_key"
        case createdAt = "created_at"
    }

    var date: Date { Date(timeIntervalSince1970: createdAt) }
    var moodValue: Mood? { mood.flatMap(Mood.init(rawValue:)) }
}

/// Response of the `widget-feed` Edge Function.
struct WidgetFeed: Decodable {
    let state: HomeState?
    let myThumbURL: URL?
    let partnerThumbURL: URL?

    enum CodingKeys: String, CodingKey {
        case state
        case myThumbURL = "my_thumb_url"
        case partnerThumbURL = "partner_thumb_url"
    }
}

/// Local calendar days as "yyyy-MM-dd", matching `drops.day_key`.
enum DayKey {
    private static func formatter() -> DateFormatter {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd"
        return f
    }

    static func string(from date: Date) -> String { formatter().string(from: date) }
    static func date(from key: String) -> Date? { formatter().date(from: key) }

    static var today: String { string(from: Date()) }
    static var yesterday: String {
        string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date())
    }

    /// Whole days from `key` to today (positive when `key` is in the past).
    static func daysSince(_ key: String) -> Int? {
        guard let date = date(from: key) else { return nil }
        let cal = Calendar.current
        return cal.dateComponents([.day], from: cal.startOfDay(for: date), to: cal.startOfDay(for: Date())).day
    }
}
