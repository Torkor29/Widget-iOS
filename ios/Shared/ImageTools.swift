import ImageIO
import UIKit

enum ImageTools {
    /// Decodes straight to a small bitmap (widgets have a ~30 MB memory budget).
    static func downsampledJPEG(_ data: Data, maxPixel: CGFloat, quality: CGFloat = 0.82) -> Data? {
        let sourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
        guard let source = CGImageSourceCreateWithData(data as CFData, sourceOptions) else { return nil }
        let options = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceShouldCacheImmediately: true,
            kCGImageSourceThumbnailMaxPixelSize: maxPixel,
        ] as CFDictionary
        guard let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options) else { return nil }
        return UIImage(cgImage: cgImage).jpegData(compressionQuality: quality)
    }

    /// Renders `image` (orientation applied) with its long side at most `maxPixel` pixels.
    static func jpeg(from image: UIImage, maxPixel: CGFloat, quality: CGFloat = 0.8) -> Data? {
        let pixelSize = CGSize(width: image.size.width * image.scale, height: image.size.height * image.scale)
        let ratio = min(1, maxPixel / max(pixelSize.width, pixelSize.height))
        let target = CGSize(width: floor(pixelSize.width * ratio), height: floor(pixelSize.height * ratio))
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let rendered = UIGraphicsImageRenderer(size: target, format: format).image { _ in
            image.draw(in: CGRect(origin: .zero, size: target))
        }
        return rendered.jpegData(compressionQuality: quality)
    }
}
