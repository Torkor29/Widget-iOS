import SwiftUI

struct RootView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        ZStack {
            switch model.phase {
            case .launching:
                SplashView()
            case .signedOut:
                WelcomeView()
            case .onboarding(let step):
                OnboardingView(step: step)
            case .home:
                HomeView()
            }
        }
        .animation(.spring(duration: 0.45), value: model.phase)
        .alert(
            "Oops",
            isPresented: Binding(get: { model.errorMessage != nil }, set: { if !$0 { model.errorMessage = nil } })
        ) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(model.errorMessage ?? "")
        }
    }
}

struct SplashView: View {
    var body: some View {
        ZStack {
            DawnBackground()
            MoodSticker(mood: .sunny, size: 120)
        }
    }
}
