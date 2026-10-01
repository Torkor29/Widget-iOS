import SwiftUI

struct HomeView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.scenePhase) private var scenePhase
    @State private var showCamera = false
    @State private var showHistory = false
    @State private var showSettings = false

    private var home: HomeState? { model.home }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 18) {
                    header
                    if home?.isPaired == true {
                        partnerSection
                        mySection
                    } else {
                        InviteCard()
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 120)
            }
            .refreshable { await model.refresh() }
            .background(DawnBackground())
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button { showSettings = true } label: { Image(systemName: "gearshape.fill") }
                        .accessibilityLabel(Text("Settings"))
                }
                ToolbarItem(placement: .principal) {
                    Text("Morni").font(.display(24, italic: true)).foregroundStyle(Theme.plum)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showHistory = true } label: { Image(systemName: "square.grid.2x2.fill") }
                        .accessibilityLabel(Text("Memories"))
                }
            }
            .tint(Theme.plum)
            .safeAreaInset(edge: .bottom) {
                if home?.isPaired == true { shutter }
            }
        }
        .fullScreenCover(isPresented: $showCamera) { CameraFlow() }
        .sheet(isPresented: $showHistory) { HistoryView() }
        .sheet(isPresented: $showSettings) { SettingsView() }
        .sheet(isPresented: Binding(get: { model.showPaywall }, set: { model.showPaywall = $0 })) {
            PaywallView(context: .sheet)
        }
        .sensoryFeedback(.success, trigger: model.sentTick)
        .task { await model.refresh() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { Task { await model.refresh() } }
        }
    }

    // MARK: Sections

    private var header: some View {
        HStack {
            StreakChip(streak: home?.couple?.currentStreak ?? 0)
            Spacer()
            if let text = CoupleCounter.text(
                startedOn: home?.couple?.startedOn,
                reunionOn: home?.couple?.reunionOn,
                premium: model.isPremium
            ) {
                Text(text)
                    .font(.rounded(14, weight: .semibold))
                    .foregroundStyle(Theme.plum.opacity(0.7))
            }
        }
        .padding(.top, 4)
    }

    @ViewBuilder private var partnerSection: some View {
        let name = model.partnerName
        if let drop = home?.partnerDrop {
            DropCard(url: model.partnerImageURL, drop: drop, name: name)
            ReactionBar()
        } else {
            Card {
                VStack(spacing: 10) {
                    MoodSticker(mood: .sleepy, size: 90)
                    Text("Waiting for \(name)'s first selfie").font(.rounded(18, weight: .bold))
                    Text("It will appear here and on your widget.").font(.rounded(15)).opacity(0.65)
                }
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.plum)
            }
            .padding(.top, 20)
        }
    }

    @ViewBuilder private var mySection: some View {
        if home?.postedToday == true, let drop = home?.myDrop {
            HStack(spacing: 14) {
                AsyncImage(url: model.myImageURL) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Theme.sunrise
                }
                .frame(width: 64, height: 84)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                VStack(alignment: .leading, spacing: 4) {
                    Text("Your selfie is on \(model.partnerName)'s screen").font(.rounded(15, weight: .bold))
                    DropTime(date: drop.date).font(.rounded(13)).opacity(0.6)
                }
                Spacer(minLength: 0)
                if let mood = drop.moodValue { MoodSticker(mood: mood, size: 44) }
            }
            .foregroundStyle(Theme.plum)
            .padding(14)
            .background(.white.opacity(0.75), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        } else {
            Card {
                VStack(spacing: 6) {
                    Text("Your turn ☀️").font(.display(24))
                    Text("\(model.partnerName) will see your selfie the second you send it.")
                        .font(.rounded(15)).opacity(0.7).multilineTextAlignment(.center)
                }
                .foregroundStyle(Theme.plum)
            }
        }
    }

    private var shutter: some View {
        Button {
            if home?.postedToday == true && !model.isPremium {
                model.showPaywall = true
            } else {
                showCamera = true
            }
        } label: {
            ZStack {
                Circle().fill(.white).frame(width: 78, height: 78)
                    .shadow(color: Theme.coral.opacity(0.4), radius: 18, y: 8)
                Circle().stroke(Theme.sunrise, lineWidth: 5).frame(width: 66, height: 66)
                Image(systemName: "camera.fill").font(.system(size: 24, weight: .bold)).foregroundStyle(Theme.coral)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text("Take a selfie"))
        .padding(.bottom, 8)
    }
}

// MARK: - Pieces

struct DropCard: View {
    let url: URL?
    let drop: Drop
    let name: String

    var body: some View {
        RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous)
            .fill(Theme.sunrise)
            .aspectRatio(3 / 4, contentMode: .fit)
            .overlay {
                AsyncImage(url: url) { phase in
                    if let image = phase.image {
                        image.resizable().scaledToFill()
                    } else {
                        ProgressView().tint(.white)
                    }
                }
            }
            .overlay(alignment: .bottom) {
                LinearGradient(colors: [.clear, .black.opacity(0.55)], startPoint: .top, endPoint: .bottom)
                    .frame(height: 160)
            }
            .overlay(alignment: .bottomLeading) {
                VStack(alignment: .leading, spacing: 4) {
                    if let caption = drop.caption, !caption.isEmpty {
                        Text(caption).font(.rounded(20, weight: .bold))
                    }
                    HStack(spacing: 6) {
                        Text(name).font(.rounded(16, weight: .bold))
                        DropTime(date: drop.date).font(.rounded(14)).opacity(0.85)
                    }
                }
                .foregroundStyle(.white)
                .padding(20)
            }
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardRadius, style: .continuous))
            .overlay(alignment: .topTrailing) {
                if let mood = drop.moodValue {
                    VStack(spacing: -4) {
                        MoodSticker(mood: mood, size: 96)
                        Text(mood.label)
                            .font(.rounded(12, weight: .bold))
                            .foregroundStyle(Theme.plum)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(.white, in: Capsule())
                    }
                    .rotationEffect(.degrees(8))
                    .offset(x: 10, y: -16)
                }
            }
            .shadow(color: Theme.plum.opacity(0.12), radius: 20, y: 10)
    }
}

private struct ReactionBar: View {
    @Environment(AppModel.self) private var model
    private let emojis = ["❤️", "😍", "😂", "🥺", "🔥"]

    var body: some View {
        HStack(spacing: 8) {
            ForEach(emojis, id: \.self) { emoji in
                Button { Task { await model.react(emoji) } } label: {
                    Text(emoji)
                        .font(.system(size: 24))
                        .frame(width: 46, height: 46)
                        .background(.white.opacity(0.8), in: Circle())
                }
                .buttonStyle(.plain)
            }
            Spacer(minLength: 0)
            Button { Task { await model.nudge() } } label: {
                MoodSticker(mood: .missyou, size: 50)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(Text("Send a miss you"))
        }
    }
}

private struct InviteCard: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        Card {
            VStack(spacing: 12) {
                MoodSticker(mood: .missyou, size: 100)
                Text("Invite your person").font(.display(26))
                Text("Morni works in pairs. Once they join, your selfies land on each other's home screen.")
                    .font(.rounded(15)).opacity(0.7).multilineTextAlignment(.center)
                PrimaryButton(title: "Connect now", systemImage: "heart.fill") {
                    model.phase = .onboarding(.pair)
                }
            }
            .foregroundStyle(Theme.plum)
        }
        .padding(.top, 30)
    }
}
