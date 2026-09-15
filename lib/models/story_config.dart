class StoryConfig {
  final String storyType;
  final List<String> characters;

  StoryConfig({
    required this.storyType,
    required this.characters,
  });

  Map<String, dynamic> toJson() => {
        'storyType': storyType,
        'characters': characters,
      };

  factory StoryConfig.fromJson(Map<String, dynamic> json) => StoryConfig(
        storyType: json['storyType'] as String,
        characters: List<String>.from(json['characters'] as List),
      );
}
