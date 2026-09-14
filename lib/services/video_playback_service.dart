import 'dart:io';
import 'package:flutter/foundation.dart';
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
    if (!await file.exists()) {
      throw Exception('Video file does not exist: ${file.path}');
    }
    final size = await file.length();
    if (size == 0) {
      throw Exception('Video file is empty: ${file.path}');
    }
    debugPrint('[VideoPlaybackService] 🎞️ Allocating native VideoPlayerController mapping for: ${file.path} (Size: $size bytes)');
    _controller = VideoPlayerController.file(file);
    await _controller!.initialize();
    debugPrint('[VideoPlaybackService] ✨ Native player pipeline initialized successfully for target layout frame.');
  }

  /// Starts or resumes playback.
  Future<void> play() async {
    debugPrint('[VideoPlaybackService] ▶️ Play command sent to video layer.');
    await _controller?.play();
  }

  /// Pauses playback.
  Future<void> pause() async {
    debugPrint('[VideoPlaybackService] ⏸️ Pause command sent to video layer.');
    await _controller?.pause();
  }

  /// Seeks to a specific position.
  Future<void> seekTo(Duration position) async {
    debugPrint('[VideoPlaybackService] ⏩ Seeking stream position to: $position');
    await _controller?.seekTo(position);
  }

  /// Adds a listener to detect when playback completes.
  void addCompletionListener(void Function() onComplete) {
    debugPrint('[VideoPlaybackService] 🔗 Registering episode completion stream observer.');
    _controller?.addListener(() {
      if (_controller != null &&
          _controller!.value.isInitialized &&
          _controller!.value.position >= _controller!.value.duration &&
          !_controller!.value.isPlaying) {
        debugPrint('[VideoPlaybackService] 🏁 Playback stream finished boundary reached.');
        onComplete();
      }
    });
  }

  /// Disposes the current controller.
  Future<void> dispose() async {
    await _disposeController();
  }

  Future<void> _disposeController() async {
    if (_controller != null) {
      debugPrint('[VideoPlaybackService] ♻️ Unbinding and destroying active VideoPlayerController memory footprint.');
      await _controller?.dispose();
      _controller = null;
    }
  }
}
