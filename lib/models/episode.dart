enum EpisodeStatus {
  generating,
  rendering,
  processing,
  ready,
  failed;

  static EpisodeStatus fromString(String status) {
    return EpisodeStatus.values.firstWhere(
      (e) => e.name == status.toLowerCase(),
      orElse: () => EpisodeStatus.failed,
    );
  }
}

class Episode {
  final String id;
  final String title;
  final String videoUrl;
  final int duration; // Duration in seconds
  final List<String> characters;
  final EpisodeStatus status;
  final DateTime createdAt;

  Episode({
    required this.id,
    required this.title,
    required this.videoUrl,
    required this.duration,
    required this.characters,
    required this.status,
    required this.createdAt,
  });

  /// Creates an Episode from a JSON map.
  factory Episode.fromJson(Map<String, dynamic> json) {
    return Episode(
      id: json['id'] as String,
      title: json['title'] as String,
      videoUrl: (json['video_url'] ?? json['videoUrl']) as String,
      duration: json['duration'] as int,
      characters: (json['characters'] as List<dynamic>).map((e) => e as String).toList(),
      status: EpisodeStatus.fromString(json['status'] as String),
      createdAt: DateTime.parse((json['created_at'] ?? json['createdAt']) as String),
    );
  }

  /// Converts an Episode to a JSON map.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'videoUrl': videoUrl,
      'duration': duration,
      'characters': characters,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
