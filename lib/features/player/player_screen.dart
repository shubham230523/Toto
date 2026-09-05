import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import '../../services/video_playback_service.dart';

class TotoPlayerScreen extends StatefulWidget {
  const TotoPlayerScreen({super.key});

  @override
  State<TotoPlayerScreen> createState() => _TotoPlayerScreenState();
}

class _TotoPlayerScreenState extends State<TotoPlayerScreen> {
  final VideoPlaybackService _playbackService = VideoPlaybackService();
  bool _isFinished = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    _initializePlayback();
  }

  Future<void> _initializePlayback() async {
    try {
      await _playbackService.initializeAsset('assets/videos/test_video.mp4');
      _playbackService.addCompletionListener(_onEpisodeCompleted);
      if (mounted) {
        setState(() {});
        _playbackService.play();
      }
    } catch (e) {
      debugPrint('Error initializing video: $e');
    }
  }

  void _onEpisodeCompleted() {
    if (mounted && !_isFinished) {
      setState(() {
        _isFinished = true;
      });
      debugPrint('Episode completed');
    }
  }

  @override
  void dispose() {
    _playbackService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _playbackService.controller;

    return Scaffold(
      backgroundColor: Colors.black,
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (controller == null || !controller.value.isInitialized || _isFinished) {
            return const SizedBox.shrink();
          }

          return SizedBox.expand(
            child: FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: controller.value.size.width,
                height: controller.value.size.height,
                child: VideoPlayer(controller),
              ),
            ),
          );
        },
      ),
    );
  }
}
