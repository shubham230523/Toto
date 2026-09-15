import 'dart:async';
import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:audioplayers/audioplayers.dart';
import '../models/story_script.dart';
import '../models/history_item.dart';
import '../services/export_service.dart';
import '../services/history_service.dart';
import 'package:uuid/uuid.dart';

class PlayerScreen extends StatefulWidget {
  final StoryScript script;
  final List<String> backgroundPaths;
  final List<String> audioPaths;

  const PlayerScreen({
    super.key,
    required this.script,
    required this.backgroundPaths,
    required this.audioPaths,
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
        'story_${DateTime.now().millisecondsSinceEpoch}',
      );

      // Add to local history
      final historyItem = HistoryItem(
        id: const Uuid().v4(),
        title: widget.script.title,
        filePath: path,
        createdAt: DateTime.now(),
      );
      await historyService.addToHistory(historyItem);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Story saved to Gallery and History!')),
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

    double progress = 0.0;
    if (_duration.inMilliseconds > 0) {
      progress = _position.inMilliseconds / _duration.inMilliseconds;
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1a. Blurred Background Layer (to fill vertical space)
          Positioned.fill(
            child: Image.file(
              File(bgPath),
              fit: BoxFit.cover,
            ).animate(key: ValueKey('bg_blur_$_currentSceneIndex'))
             .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.05, 1.05), duration: scene.duration.seconds),
          ),
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: Container(color: Colors.black.withAlpha(50)),
            ),
          ),

          // 1b. Main Focused Content Layer (Cohesive scene including characters)
          Positioned.fill(
            child: Center(
              child: AspectRatio(
                aspectRatio: 1.0, // Pollinations is 1:1
                child: Image.file(
                  File(bgPath),
                  fit: BoxFit.contain,
                ).animate(key: ValueKey('bg_$_currentSceneIndex'))
                 .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.05, 1.05), duration: scene.duration.seconds),
              ),
            ),
          ),

          // 2. UI Layer
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10.0),
              child: Column(
                children: [
                  // Top Controls Row
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
                  
                  const SizedBox(height: 10),

                  // Subtitles - Compact and more transparent
                  Center(
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 280),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(120), // Increased readability on blurred bg
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        scene.speechText,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                      ).animate(key: ValueKey('text_$_currentSceneIndex')).fadeIn().slideY(begin: -0.1, end: 0),
                    ),
                  ),

                  const Spacer(),

                  // Progress Bar & Timer & Play/Pause at the bottom
                  Column(
                    children: [
                      // Timer Display
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _formatDuration(_position),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          Text(
                            _formatDuration(_duration),
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // Interactive Slider
                      SliderTheme(
                        data: SliderTheme.of(context).copyWith(
                          trackHeight: 4,
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                          overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
                          activeTrackColor: Colors.orange,
                          inactiveTrackColor: Colors.white24,
                          thumbColor: Colors.orange,
                        ),
                        child: Slider(
                          value: progress.clamp(0.0, 1.0),
                          onChanged: (val) {
                            final newPos = Duration(milliseconds: (_duration.inMilliseconds * val).toInt());
                            _audioPlayer.seek(newPos);
                          },
                        ),
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

  String _formatDuration(Duration d) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(d.inMinutes.remainder(60));
    final seconds = twoDigits(d.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }
}
