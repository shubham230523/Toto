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
    debugPrint('[AIService] 🛫 Sending generation request for a cohesive visual story...');

    final messages = [
      {
        'role': 'system', 
        'content': 'You are a director for a high-quality educational video. Generate a story where each scene is a single, beautiful illustration including the characters.'
      },
      {
        'role': 'user', 
        'content': 'Story Type: ${config.storyType}. Characters to include: ${config.characters.join(', ')}'
      }
    ];

    final prompt = messages.map((m) => '[${m['role']!.toUpperCase()}]: ${m['content']}').join('\n\n');
    
    const jsonSchema = {
      "title": "string",
      "scenes": [
        {
          "index": "number",
          "duration": "number",
          "visualPrompt": "string",
          "speechText": "string"
        }
      ]
    };

    final finalPrompt = '''
$prompt

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON matching this schema: ${json.encode(jsonSchema)}. No markdown.
2. Each "visualPrompt" MUST be a detailed description of a single illustration that includes both the background and the characters.
3. ART STYLE RULE: Use "Vibrant 2D vector cartoon, children's storybook style, thick clean outlines, bright cheerful colors, soft lighting, toddler-friendly, cute and adorable characters, no realistic features, no scary elements, high resolution".
4. Ensure characters like "Toto the Turtle" look friendly and identifiable in every scene.
5. Characters MUST be interacting with the environment to look merged.
''';

    try {
      final content = [Content.text(finalPrompt)];
      final response = await _model.generateContent(content);

      if (response.text == null) {
        throw Exception('Gemini returned an empty response.');
      }

      final text = response.text!.trim();
      final jsonMatch = RegExp(r'(\{[\s\S]*\}|\[[\s\S]*\])').firstMatch(text);
      final rawJson = jsonMatch != null ? jsonMatch.group(0)! : text;

      final parsedJson = jsonDecode(rawJson) as Map<String, dynamic>;
      debugPrint('[AIService] 🛬 Successfully received production-spec cohesive script.');
      return StoryScript.fromJson(parsedJson);
    } catch (e) {
      debugPrint('[AIService] ❌ Error during Gemini generation: $e');
      rethrow;
    }
  }
}
