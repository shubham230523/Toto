import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import '../../services/api_service.dart';
import '../../services/video_playback_service.dart';
import '../../services/video_cache_service.dart';
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

  // Recently played tracking
  final List<String> _recentlyPlayed = [];
  static const int _maxRecentlyPlayed = 10;

  // Prefetch state
  Episode? _prefetchedEpisode;
  File? _prefetchedVideoFile;
  bool _isPrefetching = false;

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
      Episode? episode;
      File? videoFile;

      // 1. Check if we have a prefetched episode ready
      if (_prefetchedEpisode != null && _prefetchedVideoFile != null) {
        episode = _prefetchedEpisode;
        videoFile = _prefetchedVideoFile;
        
        // Clear prefetch buffers
        _prefetchedEpisode = null;
        _prefetchedVideoFile = null;
        debugPrint('Using prefetched episode: ${episode?.title}');
      } else {
        // 2. Try to fetch fresh metadata from API
        try {
          episode = await _apiService.getRandomEpisode(excludeIds: _recentlyPlayed).timeout(const Duration(seconds: 10));
          if (episode != null) {
            videoFile = await videoCacheService.getCachedVideo(episode.videoUrl)
                .timeout(const Duration(minutes: 2));
          }
        } catch (e) {
          debugPrint('Network request failed or timed out: $e');
        }

        // 3. Offline Fallback: If network failed or returned nothing, pick a random cached video
        if (videoFile == null) {
          videoFile = await videoCacheService.getRandomCachedVideo();
          if (videoFile != null) {
            debugPrint('Offline mode: Playing random video from local cache.');
          }
        }
      }

      if (videoFile == null) {
        throw Exception('No stories available (offline and cache empty)');
      }

      // 4. Initialize video from local file
      await _playbackService.initializeFile(videoFile)
          .timeout(const Duration(seconds: 15));
      
      _playbackService.addCompletionListener(_onEpisodeCompleted);
      
      if (mounted) {
        setState(() {
          _isLoading = false;
          // Track recently played
          if (episode != null) {
            _recentlyPlayed.add(episode.id);
            if (_recentlyPlayed.length > _maxRecentlyPlayed) {
              _recentlyPlayed.removeAt(0);
            }
          }
        });
        _playbackService.play();
        
        // 5. Start prefetching the NEXT episode immediately after playback starts
        _prefetchNextEpisode();
      }
    } catch (e) {
      debugPrint('Error loading episode (retry $retryCount): $e');
      
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

  /// Background task to fetch and cache the next episode while the current one plays.
  Future<void> _prefetchNextEpisode() async {
    if (_isPrefetching || _prefetchedEpisode != null) return;

    _isPrefetching = true;
    debugPrint('Started prefetching next episode...');

    try {
      final nextEpisode = await _apiService.getRandomEpisode(excludeIds: _recentlyPlayed);
      if (nextEpisode != null) {
        final nextFile = await videoCacheService.getCachedVideo(nextEpisode.videoUrl)
            .timeout(const Duration(minutes: 3));
        
        if (nextFile != null && mounted) {
          setState(() {
            _prefetchedEpisode = nextEpisode;
            _prefetchedVideoFile = nextFile;
          });
          debugPrint('Prefetch complete: ${nextEpisode.title}');
        }
      }
    } catch (e) {
      debugPrint('Prefetch failed: $e');
      // Prefetch failure is silent; we'll just fetch normally when the current one ends.
    } finally {
      _isPrefetching = false;
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
