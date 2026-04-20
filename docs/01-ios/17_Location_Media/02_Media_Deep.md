# 02 - iOS 多媒体处理全栈

## 目录

1. [多媒体框架概览](#1-多媒体框架概览)
2. [AVFoundation 核心](#2-avfoundation-核心)
3. [音频播放与录制](#3-音频播放与录制)
4. [视频处理](#4-视频处理)
5. [Photos 框架](#5-photos-框架)
6. [Core Image](#6-core-image)
7. [MultipeerConnectivity](#7-multipeerconnectivity)
8. [多媒体与 Android 对比](#8-多媒体与-android-对比)
9. [面试考点汇总](#9-面试考点汇总)

---

## 1. 多媒体框架概览

```
iOS 多媒体框架：

┌──────────────────────────────────────────────┐
│              AVFoundation                      │  ← 音视频核心
├──────────────────────────────────────────────┤
│              Photos framework                  │  ← 相册
├──────────────────────────────────────────────┤
│              Core Image                         │  ← 图像处理
├──────────────────────────────────────────────┤
│              Core Audio                        │  ← 底层音频
├──────────────────────────────────────────────┤
│              Core Media                        │  ← 底层媒体
├──────────────────────────────────────────────┤
│              AVKit                               │  ← 高级 UI
├──────────────────────────────────────────────┤
│              Core Audio APIs                    │  ← 音频处理
│              AudioToolbox / AudioUnit           │
└──────────────────────────────────────────────┘
```

---

## 2. AVFoundation 核心

### 2.1 AVFoundation 架构

```
AVFoundation 框架层次：

┌───────────────────────────────────────────────┐
│              AVFoundation                        │
├───────────────────────────────────────────────┤
│  AVAsset (资源) → AVPlayer (播放器) → AVPlayerLayer (视图) │
├───────────────────────────────────────────────┤
│  AVCaptureSession (捕获) → AVCaptureOutput (输出)   │
├───────────────────────────────────────────────┤
│  AVMetadataItem (元数据) / AVURLAsset (URL 资源)   │
└───────────────────────────────────────────────┘
```

### 2.2 AVPlayer 视频播放

```swift
import AVFoundation

class VideoPlayer {
    private var player: AVPlayer?
    private var playerLayer: AVPlayerLayer?
    
    func play(url: URL) {
        let asset = AVAsset(url: url)
        player = AVPlayer(url: url)
        
        // 添加观察
        player?.addObserver(self, forKeyPath: "currentItem.status")
        
        // 创建 AVPlayerLayer
        playerLayer = AVPlayerLayer(player: player)
        playerLayer?.frame = view.bounds
        view.layer.addSublayer(playerLayer!)
        
        player?.play()
    }
    
    // 通知处理
    override func observeValue(forKeyPath keyPath: String?,
                              of object: Any?,
                              change: [NSKeyValueChangeKey : Any]?,
                              context: UnsafeMutableRawPointer?) {
        if keyPath == "currentItem.status" {
            if player?.currentItem?.status == .readyToPlay {
                player?.play()
            }
        }
    }
    
    func pause() { player?.pause() }
    func resume() { player?.play() }
    func seek(to time: CMTime) { player?.seek(to: time) }
}
```

### 2.3 AVAudioSession

```swift
let session = AVAudioSession.sharedInstance()

// 配置音频会话
try session.setCategory(.playback, mode: .default)  // .playback/.record/.playAndRecord
try session.setActive(true)

// 音频会话事件
NotificationCenter.default.addObserver(
    forName: .AVAudioSessionInterruptionNotification,
    object: session,
    queue: .main
) { notification in
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue) else { return }
    
    if type == .began {
        // 中断开始（来电等）
        player?.pause()
    } else if type == .ended {
        // 中断结束
        try? session.setActive(true)
        player?.play()
    }
}
```

---

## 3. 音频播放与录制

### 3.1 AVAudioPlayer 音频播放

```swift
var audioPlayer: AVAudioPlayer?

func playAudio(url: URL) {
    audioPlayer = try? AVAudioPlayer(contentsOf: url)
    audioPlayer?.prepareToPlay()
    audioPlayer?.volume = 0.8
    audioPlayer?.delegate = self
    audioPlayer?.play()
}

extension ViewController: AVAudioPlayerDelegate {
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer,
                                     successfully flag: Bool) {
        print("播放完成")
    }
}
```

### 3.2 AVAudioRecorder 录音

```swift
var recorder: AVAudioRecorder?

func startRecording() {
    let url = URL(fileURLWithPath: NSTemporaryDirectory() + "/recording.m4a")
    let settings = [
        AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
        AVSampleRateKey: 44100,
        AVNumberOfChannelsKey: 1,
        AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
    ]
    
    recorder = try? AVAudioRecorder(url: url, settings: settings)
    recorder?.isMeteringEnabled = true
    recorder?.record()
}

func stopRecording() -> URL? {
    recorder?.stop()
    return recorder?.url
}
```

### 3.3 AVAudioEngine（高级音频处理）

```swift
let engine = AVAudioEngine()

// 输入节点（麦克风）
let inputNode = engine.inputNode

// 创建效果节点
let reverb = AVAudioUnitReverb()
reverb.loadFactoryPreset(.largeChamber)

// 连接节点
engine.connect(inputNode, to: reverb, format: inputNode.outputFormat(forBus: 0))
engine.connect(reverb, to: engine.mainMixerNode, format: inputNode.outputFormat(forBus: 0))

// 启动引擎
try engine.start()
```

---

## 4. 视频处理

### 4.1 AVCaptureSession 相机

```swift
class CameraController {
    private let session = AVCaptureSession()
    private var videoDataOutput: AVCaptureVideoDataOutput?
    
    func setupCamera() {
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera,
                                                     for: .video, position: .back) else { return }
        
        let input = try? AVCaptureDeviceInput(device: camera)
        guard session.canAddInput(input!) else { return }
        session.addInput(input!)
        
        let output = AVCaptureVideoDataOutput()
        output.setSampleBufferDelegate(self, queue: DispatchQueue(label: "videoQueue"))
        guard session.canAddOutput(output) else { return }
        session.addOutput(output)
        
        session.sessionPreset = .high  // .high/.medium/.low
        session.startRunning()
    }
}

extension CameraController: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput,
                       didOutput sampleBuffer: CMSampleBuffer,
                       from connection: AVCaptureConnection) {
        // 处理视频帧
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        // 转换为图像/进行处理
    }
}
```

### 4.2 照片选择

```swift
import PhotosUI

class PhotoPicker: UIViewController, PHPickerViewControllerDelegate {
    func openPicker() {
        var config = PHPickerConfiguration()
        config.selectionLimit = 5
        config.filter = .images  // .images/.videos
        config.preferredAssetRepresentationMode = .current
        
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = self
        present(picker, animated: true)
    }
    
    func picker(_ picker: PHPickerViewController,
                didFinishResult results: [PHPickerResult]) {
        for result in results {
            result.itemProvider.loadImage { image, info in
                DispatchQueue.main.async {
                    self.imageView.image = image
                }
            }
        }
    }
}
```

---

## 5. Photos 框架

### 5.1 相册权限

```swift
import Photos

PHPhotoLibrary.requestAuthorization { status in
    switch status {
    case .authorized, .limited:
        // 有权限
    case .denied, .restricted:
        // 无权限
    case .notDetermined:
        // 未请求
    @unknown default:
        break
    }
}
```

### 5.2 保存照片到相册

```swift
func savePhoto(image: UIImage) {
    PHPhotoLibrary.shared().performChanges {
        PHAssetChangeRequest.creationRequestForAsset(from: image)
    } completionHandler: { success, error in
        if success {
            print("保存成功")
        }
    }
}

func saveVideo(url: URL) {
    PHPhotoLibrary.shared().performChanges {
        PHAssetChangeRequest.creationRequestForAsset(from: url)
    } completionHandler: { success, error in
        if success { print("视频保存成功") }
    }
}
```

---

## 6. Core Image

### 6.1 滤镜应用

```swift
import CoreImage.CIFilterBuiltins

let context = CIContext()
let image = CIImage(image: originalImage)

let filter = CIFilter.sepiaTone()
filter.inputImage = image
filter.intensity = 0.8

if let output = filter.outputImage,
   let cgImage = context.createCGImage(output, from: output.extent) {
    let result = UIImage(cgImage: cgImage)
    imageView.image = result
}

// 常用滤镜：
// CIFilter.sepiaTone() - 怀旧色调
// CIFilter.monochrome() - 黑白
// CIFilter.exposureAdjust() - 曝光
// CIFilter.hueAdjust() - 色相
// CIFilter.gaussianBlur() - 高斯模糊
// CIFilter.unsharpMask() - 锐化
// CIFilter.addCompositing() - 叠加
```

---

## 7. MultipeerConnectivity

```swift
import MultipeerConnectivity

class MCPeerManager: NSObject, MCNearbyServiceBrowserDelegate, MCNearbyServiceAdvertiserDelegate {
    private let peerID = MCPeerID(displayName: UIDevice.current.name)
    private let session: MCSession
    private let advertiser: MCNearbyServiceAdvertiser
    private let browser: MCNearbyServiceBrowser
    
    init() {
        session = MCSession(peer: peerID)
        advertiser = MCNearbyServiceAdvertiser(peer: peerID,
                                                  discoveryInfo: nil,
                                                  serviceType: "my-service")
        browser = MCNearbyServiceBrowser(peer: peerID, serviceType: "my-service")
        super.init()
        advertiser.delegate = self
        browser.delegate = self
    }
    
    func startAdvertising() {
        advertiser.startAdvertisingPeer()
    }
    
    func startBrowsing() {
        browser.startBrowsingForPeers()
    }
    
    // MARK: - MCNearbyServiceBrowserDelegate
    func browser(_ browser: MCNearbyServiceBrowser,
                foundPeer peerID: MCPeerID,
                withDiscoveryInfo info: [String: String]?) {
        browser.invitePeer(peerID, to: session, withContext: nil, timeout: 10)
    }
    
    // MARK: - MCSessionDelegate
    func session(_ session: MCSession,
                received data: Data,
                from peer: MCPeerID) {
        // 处理接收数据
    }
}
```

---

## 8. 多媒体与 Android 对比

| 概念 | iOS | Android/Kotlin |
|---|---|---|
| 视频播放 | AVPlayer + AVPlayerLayer | ExoPlayer / MediaController |
| 音频播放 | AVAudioPlayer | MediaPlayer / ExoPlayer |
| 录音 | AVAudioRecorder | MediaRecorder |
| 高级音频 | AVAudioEngine | AudioTrack / AudioRecord |
| 相机 | AVCaptureSession | Camera2 API / CameraX |
| 相册 | Photos framework | MediaStore / ContentResolver |
| 图像处理 | Core Image | AndroidGraphics (Skia) |
| 近距离通信 | MultipeerConnectivity | Nearby Messages API |

---

## 9. 面试考点汇总

### 高频面试题

1. **AVPlayer 和 AVAudioPlayer 的区别？**
   - AVPlayer：音视频播放，支持网络流
   - AVAudioPlayer：仅音频，本地文件

2. **AVCaptureSession 的相机流程？**
   - 选择设备 → 创建 Input → 创建 Output → 添加到 Session → startRunning
   - 帧处理在 AVCaptureVideoDataOutputSampleBufferDelegate

3. **Photos 框架权限类型？**
   - .authorized / .limited（只能访问选中的照片）/ .denied / .restricted

4. **Core Image 的性能特点？**
   - GPU 加速的滤镜框架
   - 延迟执行（按需渲染）
   - 适合批量图像处理

### 面试回答模板

> "iOS 多媒体用 AVFoundation 框架处理音视频，Photos framework 管理相册。相机用 AVCaptureSession 捕获，相机预览用 AVCaptureVideoDataOutput。多媒体框架都是 GPU 加速，性能好。"

---

*本文档对标 Android `29_Media/` 的深度*
