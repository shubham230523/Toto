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
    debugPrint('[AIService] 🛫 Sending production-spec generation request to Gemini...');

    final messages = [
      {'role': 'system', 'content': 'Generate a short story for a video.'},
      {'role': 'user', 'content': 'Story Type: ${config.storyType}. Characters: ${config.characters.join(', ')}'}
    ];

    // Replicate production prompt construction: messages mapped to [ROLE] headers joined by double newlines
    final prompt = messages.map((m) => '[${m['role']!.toUpperCase()}]: ${m['content']}').join('\n\n');
    
    const jsonSchema = {
      "title": "string",
      "scenes": [
        {
          "index": "number",
          "duration": "number",
          "backgroundPrompt": "string",
          "speechText": "string",
          "overlays": [
            {
              "type": "string",
              "prompt": "string",
              "animationPreset": "string",
              "position": "string"
            }
          ]
        }
      ]
    };

    // Replicate production CRITICAL instruction for JSON schema enforcement
    final finalPrompt = '''
$prompt

CRITICAL: Return ONLY valid JSON matching this schema: ${json.encode(jsonSchema)}. No markdown.
''';

    try {
      final content = [Content.text(finalPrompt)];
      final response = await _model.generateContent(content);

      if (response.text == null) {
        throw Exception('Gemini returned an empty response.');
      }

      final text = response.text!.trim();
      
      // Replicate production JSON extraction logic using regex
      final jsonMatch = RegExp(r'(\{[\s\S]*\}|\[[\s\S]*\])').firstMatch(text);
      final rawJson = jsonMatch != null ? jsonMatch.group(0)! : text;

      final parsedJson = jsonDecode(rawJson) as Map<String, dynamic>;
      debugPrint('[AIService] 🛬 Successfully received and parsed structured script.');
      return StoryScript.fromJson(parsedJson);
    } catch (e) {
      debugPrint('[AIService] ❌ Error during Gemini generation: $e');
      rethrow;
    }
  }
}
