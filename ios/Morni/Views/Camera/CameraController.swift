import AVFoundation
import SwiftUI
import UIKit

/// Front-camera photo capture. Session work happens on a private serial queue.
final class CameraController: NSObject, ObservableObject, AVCapturePhotoCaptureDelegate {
    enum Access { case unknown, granted, denied }

    let session = AVCaptureSession()
    @Published private(set) var access: Access = .unknown
    @Published private(set) var position: AVCaptureDevice.Position = .front

    private let output = AVCapturePhotoOutput()
    private let queue = DispatchQueue(label: "app.morni.camera")
    private var continuation: CheckedContinuation<UIImage?, Never>?

    func start() async {
        var granted = AVCaptureDevice.authorizationStatus(for: .video) == .authorized
        if AVCaptureDevice.authorizationStatus(for: .video) == .notDetermined {
            granted = await AVCaptureDevice.requestAccess(for: .video)
        }
        await MainActor.run { access = granted ? .granted : .denied }
        guard granted else { return }
        let position = await MainActor.run { self.position }
        queue.async {
            self.configure(position: position)
            if !self.session.isRunning { self.session.startRunning() }
        }
    }

    func stop() {
        queue.async {
            if self.session.isRunning { self.session.stopRunning() }
        }
    }

    @MainActor
    func flip() {
        position = position == .front ? .back : .front
        let position = position
        queue.async { self.configure(position: position) }
    }

    func capture() async -> UIImage? {
        await withCheckedContinuation { continuation in
            queue.async {
                guard self.continuation == nil, self.session.isRunning else {
                    continuation.resume(returning: nil)
                    return
                }
                self.continuation = continuation
                self.output.capturePhoto(with: AVCapturePhotoSettings(), delegate: self)
            }
        }
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        let image = photo.fileDataRepresentation().flatMap(UIImage.init(data:))
        queue.async {
            self.continuation?.resume(returning: image)
            self.continuation = nil
        }
    }

    private func configure(position: AVCaptureDevice.Position) {
        session.beginConfiguration()
        defer { session.commitConfiguration() }
        session.sessionPreset = .photo
        for input in session.inputs { session.removeInput(input) }
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input)
        else { return }
        session.addInput(input)
        if !session.outputs.contains(output), session.canAddOutput(output) {
            session.addOutput(output)
        }
        // Selfies are saved the way people see themselves in the preview.
        if let connection = output.connection(with: .video), connection.isVideoMirroringSupported {
            connection.automaticallyAdjustsVideoMirroring = false
            connection.isVideoMirrored = position == .front
        }
    }
}

struct CameraPreview: UIViewRepresentable {
    let session: AVCaptureSession

    final class PreviewView: UIView {
        override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }
        var previewLayer: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer }
    }

    func makeUIView(context: Context) -> PreviewView {
        let view = PreviewView()
        view.backgroundColor = .black
        view.previewLayer.session = session
        view.previewLayer.videoGravity = .resizeAspectFill
        return view
    }

    func updateUIView(_ uiView: PreviewView, context: Context) {}
}
