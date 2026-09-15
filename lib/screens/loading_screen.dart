import 'package:flutter/material.dart';
import '../models/story_config.dart';
import '../services/ai_service.dart';
import '../services/cache_service.dart';
import '../services/tts_service.dart';
import 'player_screen.dart';

class LoadingScreen extends StatefulWidget {
  final StoryConfig config;

  const LoadingScreen({super.key, required this.config});

  @override
  State<LoadingScreen> createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> {
  final AIService _aiService = AIService();
  final CacheService _cacheService = CacheService();
  final TTSService _ttsService = TTSService();

  String _status = 'Initiating magic...';
  double _progress = 0.1;

  @override
  void initState() {
    super.initState();
    _startGeneration();
  }

  Future<void> _startGeneration() async {
    try {
      // 1. Generate Script
      setState(() {
        _status = 'Gemini is writing your story...';
        _progress = 0.2;
      });
      final script = await _aiService.generateStory(widget.config);

      // 2. Fetch Assets (Parallel)
      setState(() {
        _status = 'Bringing characters and worlds to life...';
        _progress = 0.4;
      });

      final List<String> bgPaths = [];
      final List<String> audioPaths = [];

      for (int i = 0; i < script.scenes.length; i++) {
        final scene = script.scenes[i];
        setState(() {
          _status = 'Rendering scene ${i + 1} of ${script.scenes.length}...';
          _progress = 0.4 + (0.5 * (i / script.scenes.length));
        });

        // 1. Download Cohesive Scene Image (Characters + Background)
        final bgPath = await _cacheService.getImageUrl(scene.visualPrompt);
        bgPaths.add(bgPath);

        // 2. Generate Speech
        final bool isChild = widget.config.storyType == 'Child Story';
        final audioPath = await _ttsService.generateSpeech(
          scene.speechText, 
          'audio_${scene.speechText.hashCode}',
          isChild: isChild,
        );
        audioPaths.add(audioPath);
      }

      if (mounted) {
        setState(() {
          _status = 'Ready!';
          _progress = 1.0;
        });

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => PlayerScreen(
              script: script,
              backgroundPaths: bgPaths,
              audioPaths: audioPaths,
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _status = 'Error: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isError = _status.startsWith('Error');

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!isError)
                  const CircularProgressIndicator()
                else
                  const Icon(Icons.error_outline, color: Colors.red, size: 64),
                const SizedBox(height: 32),
                Text(
                  _status,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 18,
                    color: isError ? Colors.redAccent : Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                if (!isError)
                  LinearProgressIndicator(value: _progress)
                else
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _status = 'Restarting...';
                        _progress = 0.1;
                      });
                      _startGeneration();
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Try Again'),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
