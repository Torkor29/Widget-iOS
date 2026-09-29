import SwiftUI

/// Full-screen capture → compose (mood + caption) → send.
struct CameraFlow: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var camera = CameraController()
    @State private var captured: UIImage?
    @State private var flash = false

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            if let captured {
                ComposeView(
                    image: captured,
                    onRetake: {
                        self.captured = nil
                        Task { await camera.start() }
                    },
                    onSent: { dismiss() }
                )
            } else {
                capture
            }
        }
        .task { await camera.start() }
        .onDisappear { camera.stop() }
    }

    private var capture: some View {
        VStack(spacing: 20) {
            HStack {
                Button { dismiss() } label: {
                    Image(systemName: "xmark").font(.system(size: 18, weight: .bold))
                }
                .accessibilityLabel(Text("Close"))
                Spacer()
                Text("Morni").font(.display(22, italic: true))
                Spacer()
                Button { camera.flip() } label: {
                    Image(systemName: "arrow.triangle.2.circlepath.camera.fill").font(.system(size: 20))
                }
                .accessibilityLabel(Text("Flip camera"))
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 24)

            Color.black
                .aspectRatio(3 / 4, contentMode: .fit)
                .overlay {
                    if camera.access == .granted {
                        CameraPreview(session: camera.session)
                    } else if camera.access == .denied {
                        VStack(spacing: 14) {
                            MoodSticker(mood: .grumpy, size: 90)
                            Text("Morni needs your camera to send selfies.")
                                .font(.rounded(16, weight: .semibold))
                                .multilineTextAlignment(.center)
                            Button("Open Settings") {
                                if let url = URL(string: UIApplication.openSettingsURLString) {
                                    UIApplication.shared.open(url)
                                }
                            }
                            .font(.rounded(16, weight: .bold))
                        }
                        .foregroundStyle(.white)
                        .padding(24)
                    }
                }
                .overlay { if flash { Color.white } }
                .clipShape(RoundedRectangle(cornerRadius: 36, style: .continuous))
                .padding(.horizontal, 12)

            Spacer()

            Button {
                Task { await shoot() }
            } label: {
                ZStack {
                    Circle().stroke(.white, lineWidth: 5).frame(width: 84, height: 84)
                    Circle().fill(Theme.sunrise).frame(width: 68, height: 68)
                }
            }
            .buttonStyle(.plain)
            .disabled(camera.access != .granted)
            .accessibilityLabel(Text("Take photo"))
            .padding(.bottom, 24)
        }
    }

    private func shoot() async {
        withAnimation(.easeOut(duration: 0.08)) { flash = true }
        let image = await camera.capture()
        withAnimation(.easeIn(duration: 0.25)) { flash = false }
        if let image {
            captured = image
            camera.stop()
        }
    }
}

struct ComposeView: View {
    let image: UIImage
    let onRetake: () -> Void
    let onSent: () -> Void

    @Environment(AppModel.self) private var model
    @State private var mood: Mood?
    @State private var caption = ""
    @State private var sending = false
    @State private var showPaywall = false
    @FocusState private var captionFocused: Bool

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Button(action: onRetake) {
                    Label("Retake", systemImage: "arrow.uturn.backward")
                        .font(.rounded(16, weight: .semibold))
                }
                Spacer()
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 24)

            Color.black
                .aspectRatio(3 / 4, contentMode: .fit)
                .overlay { Image(uiImage: image).resizable().scaledToFill() }
                .overlay(alignment: .bottomLeading) {
                    if !caption.isEmpty {
                        Text(caption)
                            .font(.rounded(20, weight: .bold))
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.4), radius: 6)
                            .padding(20)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 36, style: .continuous))
                .overlay(alignment: .topTrailing) {
                    if let mood {
                        MoodSticker(mood: mood, size: 104)
                            .rotationEffect(.degrees(8))
                            .offset(x: 6, y: -10)
                            .transition(.scale.combined(with: .opacity))
                    }
                }
                .padding(.horizontal, 12)

            moodPicker

            HStack(spacing: 10) {
                TextField("", text: $caption, prompt: Text("Add a caption…").foregroundStyle(.white.opacity(0.5)))
                    .font(.rounded(17, weight: .medium))
                    .foregroundStyle(.white)
                    .focused($captionFocused)
                    .submitLabel(.done)
                    .onChange(of: caption) { _, value in
                        if value.count > 40 { caption = String(value.prefix(40)) }
                    }
                Text("\(40 - caption.count)").font(.rounded(13)).foregroundStyle(.white.opacity(0.4)).monospacedDigit()
            }
            .padding(14)
            .background(.white.opacity(0.12), in: Capsule())
            .padding(.horizontal, 20)

            Spacer(minLength: 0)

            PrimaryButton(title: "Send to \(model.partnerName)", systemImage: "paperplane.fill", isLoading: sending) {
                Task { await send() }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
        }
        .sheet(isPresented: $showPaywall) { PaywallView(context: .sheet) }
    }

    private var moodPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(Mood.allCases) { option in
                    Button {
                        if option.isPremium && !model.isPremium {
                            showPaywall = true
                        } else {
                            withAnimation(.spring(duration: 0.35)) { mood = mood == option ? nil : option }
                        }
                    } label: {
                        MoodSticker(mood: option, size: 58)
                            .padding(4)
                            .background(mood == option ? Color.white.opacity(0.22) : .clear, in: Circle())
                            .overlay(alignment: .bottomTrailing) {
                                if option.isPremium && !model.isPremium {
                                    Image(systemName: "lock.fill")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundStyle(.white)
                                        .padding(5)
                                        .background(Theme.coral, in: Circle())
                                }
                            }
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(Text(option.label))
                }
            }
            .padding(.horizontal, 20)
        }
    }

    private func send() async {
        sending = true
        defer { sending = false }
        switch await model.post(image: image, mood: mood, caption: caption) {
        case .sent:
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            onSent()
        case .needsPremium:
            showPaywall = true
        case .failed:
            break
        }
    }
}
