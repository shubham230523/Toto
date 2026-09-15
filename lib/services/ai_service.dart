import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../core/constants.dart';
import '../models/story_config.dart';
import '../models/story_script.dart';

class AIService {
  late final GenerativeModel _model;

  AIService({String? apiKey}) {
    final key = apiKey ?? AppConstants.geminiApiKey;
    _model = GenerativeModel(
      model: AppConstants.geminiModel,
      apiKey: key,
      generationConfig: GenerationConfig(
        responseMimeType: 'application/json',
      ),
    );
  }

  Future<StoryScript> generateStory(StoryConfig config) async {
    final prompt = _buildPrompt(config);
    debugPrint('[AIService] 🛫 Sending generation request to Gemini...');

    final content = [Content.text(prompt)];
    final response = await _model.generateContent(content);

    if (response.text == null) {
      throw Exception('Gemini returned an empty response.');
    }

    try {
      final json = jsonDecode(response.text!) as Map<String, dynamic>;
      debugPrint('[AIService] 🛬 Successfully received structured script.');
      return StoryScript.fromJson(json);
    } catch (e) {
      debugPrint('[AIService] ❌ Failed to parse Gemini response: $e');
      debugPrint('[AIService] Raw response: ${response.text}');
      throw Exception('Failed to parse story script: $e');
    }
  }

  String _buildPrompt(StoryConfig config) {
    return '''
    Generate a short story for a video.
    Story Type: ${config.storyType}
    Characters: ${config.characters.join(', ')}

    Return a JSON object with the following structure:
    {
      "title": "Title of the story",
      "scenes": [
        {
          "index": 1,
          "duration": 6.0,
          "backgroundPrompt": "Description for image generation (Pollinations AI)",
          "speechText": "The text to be spoken by narrator",
          "overlays": [
            {
              "type": "character",
              "prompt": "Specific description of the character for this scene",
              "animationPreset": "bounce_in",
              "position": "bottom_left"
            }
          ]
        }
      ]
    }

    Rules:
    - Keep it simple and engaging.
    - Provide at least 5 scenes.
    - backgroundPrompt should be descriptive and style-consistent.
    - animationPreset options: bounce_in, slide_in, float_idle, fade_in.
    - position options: bottom_left, bottom_right, center, top_left, top_right.
    ''';
  }
}
