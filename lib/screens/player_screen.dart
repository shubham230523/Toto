import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/story_script.dart';
import '../services/export_service.dart';

class PlayerScreen extends StatefulWidget {
  final StoryScript script;
  final List<String> backgroundPaths;
  final List<String> audioPaths;
  final List<List<String>> overlayPaths;

  const PlayerScreen({
    super.key,
    required this.script,
    required this.backgroundPaths,
    required this.audioPaths,
    required this.overlayPaths,
  });

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  final ExportService _exportService = ExportService();
  
  int _currentSceneIndex = 0;
  bool _isExporting = false;
  bool _isFinished = false;
  bool _isPlaying = true;

  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;

  StreamSubscription? _posSub;
  StreamSubscription? _durSub;
  StreamSubscription? _compSub;

  @override
  void initState() {
    super.initState();
    _setupAudioListeners();
    _playScene(0);
  }

  void _setupAudioListeners() {
    _posSub = _audioPlayer.onPositionChanged.listen((p) {
      if (mounted) setState(() => _position = p);
    });
    _durSub = _audioPlayer.onDurationChanged.listen((d) {
      if (mounted) setState(() => _duration = d);
    });
    _compSub = _audioPlayer.onPlayerComplete.listen((_) {
      if (mounted) {
        if (_currentSceneIndex < widget.script.scenes.length - 1) {
          _playScene(_currentSceneIndex + 1);
        } else {
          setState(() {
            _isFinished = true;
            _isPlaying = false;
          });
          debugPrint('[PlayerScreen] Story finished.');
        }
      }
    });
  }

  Future<void> _playScene(int index) async {
    setState(() {
      _currentSceneIndex = index;
      _isFinished = false;
      _isPlaying = true;
      _position = Duration.zero;
      _duration = Duration.zero;
    });

    await _audioPlayer.play(DeviceFileSource(widget.audioPaths[index]));
  }

  void _togglePlayPause() {
    if (_isFinished) {
      _playScene(0);
      return;
    }

    if (_isPlaying) {
      _audioPlayer.pause();
    } else {
      _audioPlayer.resume();
    }
    setState(() => _isPlaying = !_isPlaying);
  }

  Future<void> _exportVideo() async {
    setState(() => _isExporting = true);
    try {
      final path = await _exportService.exportVideo(
        widget.script,
        widget.backgroundPaths,
        widget.audioPaths,
        widget.overlayPaths,
        'story_${DateTime.now().millisecondsSinceEpoch}',
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Video exported to: $path')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isExporting = false);
    }
  }

  Alignment _parseAlignment(String pos) {
    switch (pos) {
      case 'bottom_left': return Alignment.bottomLeft;
      case 'bottom_right': return Alignment.bottomRight;
      case 'top_left': return Alignment.topLeft;
      case 'top_right': return Alignment.topRight;
      case 'center': return Alignment.center;
      default: return Alignment.bottomCenter;
    }
  }

  Animate _applyAnimation(Widget child, String preset, Duration duration) {
    var anim = child.animate();
    switch (preset) {
      case 'bounce_in':
        return anim.fadeIn().scale(begin: const Offset(0.5, 0.5), end: const Offset(1.0, 1.0), curve: Curves.bounceOut);
      case 'slide_in':
        return anim.fadeIn().slideX(begin: -0.5, end: 0);
      case 'float_idle':
        return anim.fadeIn().then().shake(duration: duration, hz: 2);
      case 'fade_in':
      default:
        return anim.fadeIn();
    }
  }

  @override
  void dispose() {
    _posSub?.cancel();
    _durSub?.cancel();
    _compSub?.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scene = widget.script.scenes[_currentSceneIndex];
    final bgPath = widget.backgroundPaths[_currentSceneIndex];
    final currentOverlayPaths = widget.overlayPaths[_currentSceneIndex];

    double progress = 0.0;
    if (_duration.inMilliseconds > 0) {
      progress = _position.inMilliseconds / _duration.inMilliseconds;
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Background Layer
          Positioned.fill(
            child: Image.file(
              File(bgPath),
              fit: BoxFit.cover,
            ).animate(key: ValueKey('bg_$_currentSceneIndex'))
             .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.1, 1.1), duration: scene.duration.seconds),
          ),

          // 2. Character/Overlay Layer
          ...Iterable.generate(scene.overlays.length).map((i) {
            final overlay = scene.overlays[i];
            final path = currentOverlayPaths[i];
            return Align(
              alignment: _parseAlignment(overlay.position),
              child: Padding(
                padding: const EdgeInsets.all(40.0),
                child: _applyAnimation(
                  Image.file(File(path), width: 300),
                  overlay.animationPreset,
                  scene.duration.seconds,
                ),
              ),
            );
          }),

          // 3. UI Layer
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white, size: 32),
                        onPressed: () => Navigator.pop(context),
                      ),
                      IconButton(
                        icon: _isExporting 
                          ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.download, color: Colors.white, size: 32),
                        onPressed: _isExporting ? null : _exportVideo,
                      ),
                    ],
                  ),
                  
                  const Spacer(),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      scene.speechText,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ).animate(key: ValueKey('text_$_currentSceneIndex')).fadeIn().slideY(begin: 0.1, end: 0),
                  ),

                  const SizedBox(height: 24),

                  Column(
                    children: [
                      LinearProgressIndicator(
                        value: progress,
                        backgroundColor: Colors.white24,
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.orange),
                        minHeight: 4,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      const SizedBox(height: 8),
                      IconButton(
                        icon: Icon(
                          _isFinished ? Icons.replay : (_isPlaying ? Icons.pause : Icons.play_arrow),
                          color: Colors.white,
                          size: 48,
                        ),
                        onPressed: _togglePlayPause,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
