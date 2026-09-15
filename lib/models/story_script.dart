class StoryScript {
  final String title;
  final List<Scene> scenes;

  StoryScript({
    required this.title,
    required this.scenes,
  });

  factory StoryScript.fromJson(Map<String, dynamic> json) {
    return StoryScript(
      title: json['title'] as String,
      scenes: (json['scenes'] as List)
          .map((s) => Scene.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'scenes': scenes.map((s) => s.toJson()).toList(),
      };
}

class Scene {
  final int index;
  final double duration;
  final String backgroundPrompt;
  final String speechText;
  final List<OverlayElement> overlays;

  Scene({
    required this.index,
    required this.duration,
    required this.backgroundPrompt,
    required this.speechText,
    required this.overlays,
  });

  factory Scene.fromJson(Map<String, dynamic> json) {
    return Scene(
      index: json['index'] as int,
      duration: (json['duration'] as num).toDouble(),
      backgroundPrompt: json['backgroundPrompt'] as String,
      speechText: json['speechText'] as String,
      overlays: (json['overlays'] as List)
          .map((o) => OverlayElement.fromJson(o as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'index': index,
        'duration': duration,
        'backgroundPrompt': backgroundPrompt,
        'speechText': speechText,
        'overlays': overlays.map((o) => o.toJson()).toList(),
      };
}

class OverlayElement {
  final String type; // e.g., 'character', 'object'
  final String prompt;
  final String animationPreset; // e.g., 'bounce_in', 'float_idle'
  final String position; // e.g., 'bottom_left', 'center'

  OverlayElement({
    required this.type,
    required this.prompt,
    required this.animationPreset,
    required this.position,
  });

  factory OverlayElement.fromJson(Map<String, dynamic> json) {
    return OverlayElement(
      type: json['type'] as String,
      prompt: json['prompt'] as String,
      animationPreset: json['animationPreset'] as String,
      position: json['position'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'type': type,
        'prompt': prompt,
        'animationPreset': animationPreset,
        'position': position,
      };
}
