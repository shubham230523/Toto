import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import '../../services/api_service.dart';
import '../../services/video_playback_service.dart';
import '../../models/episode.dart';

class TotoPlayerScreen extends StatefulWidget {
  const TotoPlayerScreen({super.key});

  @override
  State<TotoPlayerScreen> createState() => _TotoPlayerScreenState();
}

class _TotoPlayerScreenState extends State<TotoPlayerScreen> {
  final ApiService _apiService = ApiService();
  final VideoPlaybackService _playbackService = VideoPlaybackService();
  
  bool _isLoading = true;
  bool _isFinished = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    _loadAndPlayRandomEpisode();
  }

  Future<void> _loadAndPlayRandomEpisode({int retryCount = 0}) async {
    if (mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
        _isFinished = false;
      });
    }

    try {
      // 1. Fetch metadata with timeout
      final episode = await _apiService.getRandomEpisode();
      
      if (episode == null) {
        throw Exception('No episodes available');
      }

      // 2. Initialize video with timeout
      await _playbackService.initializeNetwork(episode.videoUrl)
          .timeout(const Duration(seconds: 15));
      
      _playbackService.addCompletionListener(_onEpisodeCompleted);
      
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _playbackService.play();
      }
    } catch (e) {
      debugPrint('Error loading episode (retry $retryCount): $e');
      
      // 3. Silent auto-retry for transient errors
      if (retryCount < 2) {
        await Future.delayed(const Duration(seconds: 2));
        _loadAndPlayRandomEpisode(retryCount: retryCount + 1);
        return;
      }

      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Tap to try again';
        });
      }
    }
  }

  void _onEpisodeCompleted() {
    if (mounted && !_isFinished) {
      setState(() {
        _isFinished = true;
      });
      debugPrint('Episode completed. Loading next story...');
      _loadAndPlayRandomEpisode();
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
      body: GestureDetector(
        onTap: _errorMessage != null ? () => _loadAndPlayRandomEpisode() : null,
        child: LayoutBuilder(
          builder: (context, constraints) {
            if (_isLoading) {
              return const SizedBox.expand(); // Immersive black screen
            }

            if (_errorMessage != null) {
              return Center(
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.white12, fontSize: 14),
                ),
              );
            }

            if (controller == null || !controller.value.isInitialized || _isFinished) {
              return const SizedBox.expand();
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
      ),
    );
  }
}
