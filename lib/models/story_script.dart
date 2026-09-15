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
  final String visualPrompt;
  final String speechText;

  Scene({
    required this.index,
    required this.duration,
    required this.visualPrompt,
    required this.speechText,
  });

  factory Scene.fromJson(Map<String, dynamic> json) {
    return Scene(
      index: json['index'] as int,
      duration: (json['duration'] as num).toDouble(),
      visualPrompt: (json['visualPrompt'] ?? json['backgroundPrompt'] ?? '') as String,
      speechText: json['speechText'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'index': index,
        'duration': duration,
        'visualPrompt': visualPrompt,
        'speechText': speechText,
      };
}
