import 'dart:io';
import 'package:video_player/video_player.dart';

/// A service to handle video playback logic using the video_player package.
class VideoPlaybackService {
  VideoPlayerController? _controller;

  VideoPlayerController? get controller => _controller;

  /// Initializes playback from a network URL.
  Future<void> initializeNetwork(String url) async {
    await _disposeController();
    _controller = VideoPlayerController.networkUrl(Uri.parse(url));
    await _controller!.initialize();
  }

  /// Initializes playback from an asset.
  Future<void> initializeAsset(String assetPath) async {
    await _disposeController();
    _controller = VideoPlayerController.asset(assetPath);
    await _controller!.initialize();
  }

  /// Initializes playback from a local file.
  Future<void> initializeFile(File file) async {
    await _disposeController();
    _controller = VideoPlayerController.file(file);
    await _controller!.initialize();
  }

  /// Starts or resumes playback.
  Future<void> play() async {
    await _controller?.play();
  }

  /// Pauses playback.
  Future<void> pause() async {
    await _controller?.pause();
  }

  /// Seeks to a specific position.
  Future<void> seekTo(Duration position) async {
    await _controller?.seekTo(position);
  }

  /// Adds a listener to detect when playback completes.
  void addCompletionListener(void Function() onComplete) {
    _controller?.addListener(() {
      if (_controller != null &&
          _controller!.value.isInitialized &&
          _controller!.value.position >= _controller!.value.duration) {
        onComplete();
      }
    });
  }

  /// Disposes the current controller.
  Future<void> dispose() async {
    await _disposeController();
  }

  Future<void> _disposeController() async {
    await _controller?.dispose();
    _controller = null;
  }
}
