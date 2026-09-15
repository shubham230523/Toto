import 'package:flutter_test/flutter_test.dart';
import 'package:toto/models/story_config.dart';
import 'package:toto/models/story_script.dart';

void main() {
  group('StoryConfig Tests', () {
    test('Should create StoryConfig from JSON and back', () {
      final json = {
        'storyType': 'Child Story',
        'characters': ['Toto', 'Mimi']
      };
      final config = StoryConfig.fromJson(json);
      expect(config.storyType, 'Child Story');
      expect(config.characters.length, 2);
      expect(config.toJson(), json);
    });
  });

  group('StoryScript Tests', () {
    test('Should create StoryScript from complex JSON and back', () {
      final json = {
        'title': 'Test Story',
        'scenes': [
          {
            'index': 1,
            'duration': 5.0,
            'visualPrompt': 'A sunny forest with a turtle',
            'speechText': 'Hello Toto!',
          }
        ]
      };
      final script = StoryScript.fromJson(json);
      expect(script.title, 'Test Story');
      expect(script.scenes.length, 1);
      expect(script.scenes[0].visualPrompt, 'A sunny forest with a turtle');
      expect(script.toJson(), json);
    });
  });
}
