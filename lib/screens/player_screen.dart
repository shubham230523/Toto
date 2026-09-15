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

  @override
  void initState() {
    super.initState();
    _playScene(0);
  }

  Future<void> _playScene(int index) async {
    if (index >= widget.script.scenes.length) {
      debugPrint('[PlayerScreen] Story finished.');
      return;
    }

    setState(() => _currentSceneIndex = index);

    // Play Audio
    await _audioPlayer.play(DeviceFileSource(widget.audioPaths[index]));

    // Wait for audio to finish before next scene
    _audioPlayer.onPlayerComplete.first.then((_) {
      if (mounted) {
        _playScene(index + 1);
      }
    });
  }

  Future<void> _exportVideo() async {
    setState(() => _isExporting = true);
    try {
      final path = await _exportService.exportVideo(
        widget.backgroundPaths,
        widget.audioPaths,
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

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scene = widget.script.scenes[_currentSceneIndex];
    final bgPath = widget.backgroundPaths[_currentSceneIndex];

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Background Layer
          Positioned.fill(
            child: Image.file(
              File(bgPath),
              fit: BoxFit.cover,
            ).animate(key: ValueKey('bg_$_currentSceneIndex'))
             .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.1, 1.1), duration: scene.duration.seconds),
          ),

          // Subtitles Layer
          Positioned(
            bottom: 60,
            left: 32,
            right: 32,
            child: Container(
              padding: const EdgeInsets.all(16),
              color: Colors.black54,
              child: Text(
                scene.speechText,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
              ).animate(key: ValueKey('text_$_currentSceneIndex')).fadeIn().slideY(begin: 0.1, end: 0),
            ),
          ),

          // Export HUD
          Positioned(
            top: 40,
            right: 20,
            child: IconButton(
              icon: _isExporting 
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.download, color: Colors.white, size: 32),
              onPressed: _isExporting ? null : _exportVideo,
            ),
          ),
          
          Positioned(
            top: 40,
            left: 20,
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white, size: 32),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ],
      ),
    );
  }
}
