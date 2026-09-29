import SwiftUI

/// Shared memories. Free couples see the last 7 days; Morni+ unlocks everything.
struct HistoryView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss
    @State private var drops: [Drop] = []
    @State private var urls: [String: URL] = [:]
    @State private var loading = true
    @State private var showPaywall = false
    @State private var selected: Drop?

    static let freeDays = 7

    var body: some View {
        NavigationStack {
            ScrollView {
                if drops.isEmpty && !loading {
                    VStack(spacing: 12) {
                        MoodSticker(mood: .sleepy, size: 100)
                        Text("No selfies yet").font(.display(24))
                        Text("Your shared memories will live here.").font(.rounded(15)).opacity(0.65)
                    }
                    .foregroundStyle(Theme.plum)
                    .padding(.top, 80)
                }
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 104), spacing: 6)], spacing: 6) {
                    ForEach(drops) { drop in
                        let locked = isLocked(drop)
                        HistoryCell(
                            drop: drop,
                            url: urls[drop.thumbPath],
                            isMine: drop.authorId == model.userID,
                            locked: locked
                        )
                        .onTapGesture {
                            if locked { showPaywall = true } else { selected = drop }
                        }
                    }
                }
                .padding(12)
            }
            .overlay { if loading { ProgressView() } }
            .background(DawnBackground())
            .navigationTitle("Memories")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
            }
            .task { await load() }
            .sheet(isPresented: $showPaywall) { PaywallView(context: .sheet) }
            .sheet(item: $selected) { drop in
                DropDetail(drop: drop, isMine: drop.authorId == model.userID, partnerName: model.partnerName)
                    .presentationDetents([.large])
            }
        }
    }

    private func isLocked(_ drop: Drop) -> Bool {
        !model.isPremium && (DayKey.daysSince(drop.dayKey) ?? 0) >= Self.freeDays
    }

    private func load() async {
        do {
            drops = try await Backend.listDrops(limit: 180)
            urls = try await Backend.signedURLs(drops.map(\.thumbPath))
        } catch {
            model.show(error)
        }
        loading = false
    }
}

private struct HistoryCell: View {
    let drop: Drop
    let url: URL?
    let isMine: Bool
    let locked: Bool

    var body: some View {
        Theme.sunrise
            .aspectRatio(3 / 4, contentMode: .fit)
            .overlay {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Color.white.opacity(0.3)
                }
                .blur(radius: locked ? 14 : 0)
            }
            .overlay(alignment: .topTrailing) {
                if let mood = drop.moodValue, !locked { MoodSticker(mood: mood, size: 30).padding(4) }
            }
            .overlay(alignment: .bottomLeading) {
                Text(drop.date, format: .dateTime.day().month(.abbreviated))
                    .font(.rounded(11, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(isMine ? Theme.lilac : Theme.coral, in: Capsule())
                    .padding(6)
            }
            .overlay {
                if locked {
                    Image(systemName: "lock.fill")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(10)
                        .background(.black.opacity(0.25), in: Circle())
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

private struct DropDetail: View {
    let drop: Drop
    let isMine: Bool
    let partnerName: String
    @State private var url: URL?

    var body: some View {
        VStack(spacing: 16) {
            DropCard(url: url, drop: drop, name: isMine ? String(localized: "You") : partnerName)
                .padding(20)
            Spacer()
        }
        .background(DawnBackground())
        .task { url = try? await Backend.signedURLs([drop.imagePath])[drop.imagePath] }
    }
}
