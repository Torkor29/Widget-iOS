import SwiftUI

struct SettingsView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var remindersOn = true
    @State private var reminderHour = 8
    @State private var hasStartDate = false
    @State private var startDate = Date()
    @State private var hasReunion = false
    @State private var reunionDate = Date().addingTimeInterval(7 * 86_400)
    @State private var saving = false
    @State private var confirmUnpair = false
    @State private var confirmDelete = false
    @State private var showPaywall = false
    @State private var loaded = false

    private var isPaired: Bool { model.home?.isPaired == true }

    var body: some View {
        NavigationStack {
            Form {
                Section("You") {
                    TextField("First name", text: $name)
                    Toggle("Daily reminder", isOn: $remindersOn)
                    if remindersOn {
                        Picker("Remind me at", selection: $reminderHour) {
                            ForEach(0..<24, id: \.self) { hour in
                                Text(hourLabel(hour)).tag(hour)
                            }
                        }
                    }
                }

                if isPaired {
                    Section("Us") {
                        Toggle("Count our days together", isOn: $hasStartDate)
                        if hasStartDate {
                            DatePicker("Together since", selection: $startDate, in: ...Date(), displayedComponents: .date)
                        }
                        Toggle(isOn: $hasReunion) {
                            HStack {
                                Text("Countdown to our next reunion")
                                if !model.isPremium { Image(systemName: "lock.fill").foregroundStyle(Theme.coral) }
                            }
                        }
                        if hasReunion {
                            DatePicker("Next reunion", selection: $reunionDate, in: Date()..., displayedComponents: .date)
                        }
                    }
                }

                Section("Morni+") {
                    if model.isPremium {
                        Label("Morni+ is active for both of you", systemImage: "checkmark.seal.fill")
                            .foregroundStyle(Theme.coral)
                        Link("Manage subscription", destination: URL(string: "https://apps.apple.com/account/subscriptions")!)
                    } else {
                        Button("Get Morni+") { showPaywall = true }
                    }
                    Button("Restore purchases") {
                        Task {
                            if (try? await Store.restore()) == true { model.purchased() }
                        }
                    }
                }

                Section {
                    Link("Help & support", destination: AppConfig.supportURL)
                    Link("Privacy policy", destination: AppConfig.privacyURL)
                    Link("Terms of use", destination: AppConfig.termsURL)
                }

                Section {
                    if isPaired {
                        Button("Disconnect from \(model.partnerName)", role: .destructive) { confirmUnpair = true }
                    }
                    Button("Sign out") {
                        Task {
                            await model.signOut()
                            dismiss()
                        }
                    }
                    Button("Delete my account", role: .destructive) { confirmDelete = true }
                } footer: {
                    Text("Morni \(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")")
                }
            }
            .scrollContentBackground(.hidden)
            .background(DawnBackground())
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }
                        .disabled(saving)
                }
            }
            .onAppear(perform: loadValues)
            .onChange(of: hasReunion) { _, isOn in
                if isOn && !model.isPremium {
                    hasReunion = false
                    showPaywall = true
                }
            }
            .sheet(isPresented: $showPaywall) { PaywallView(context: .sheet) }
            .confirmationDialog(
                "Disconnect from \(model.partnerName)?",
                isPresented: $confirmUnpair,
                titleVisibility: .visible
            ) {
                Button("Disconnect and delete our selfies", role: .destructive) {
                    Task {
                        await model.unpair()
                        dismiss()
                    }
                }
            } message: {
                Text("This deletes every selfie you shared, for both of you. It can't be undone.")
            }
            .confirmationDialog("Delete your account?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete my account", role: .destructive) {
                    Task {
                        await model.deleteAccount()
                        dismiss()
                    }
                }
            } message: {
                Text("Your account and all shared selfies will be permanently deleted. An active subscription must be cancelled separately in your App Store settings.")
            }
        }
    }

    private func loadValues() {
        guard !loaded else { return }
        loaded = true
        name = model.home?.me?.firstName ?? ""
        if let started = model.home?.couple?.startedOn.flatMap(DayKey.date(from:)) {
            hasStartDate = true
            startDate = started
        }
        if let reunion = model.home?.couple?.reunionOn.flatMap(DayKey.date(from:)), reunion >= Calendar.current.startOfDay(for: Date()) {
            hasReunion = true
            reunionDate = reunion
        }
        remindersOn = model.home?.me?.remindersEnabled ?? true
        reminderHour = model.home?.me?.reminderHour ?? 8
    }

    private func save() async {
        saving = true
        await model.saveSettings(
            name: name,
            reminderHour: reminderHour,
            remindersEnabled: remindersOn,
            startedOn: hasStartDate ? startDate : nil,
            reunionOn: hasReunion ? reunionDate : nil
        )
        saving = false
        dismiss()
    }

    private func hourLabel(_ hour: Int) -> String {
        let date = Calendar.current.date(bySettingHour: hour, minute: 0, second: 0, of: Date()) ?? Date()
        return date.formatted(date: .omitted, time: .shortened)
    }
}
