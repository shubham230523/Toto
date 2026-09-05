import 'package:flutter_test/flutter_test.dart';
import 'package:toto/models/episode.dart';

void main() {
  group('Episode Model', () {
    final validJson = {
      'id': 'ep_001',
      'title': 'Toto Finds Three Apples',
      'videoUrl': 'https://example.com/video.mp4',
      'duration': 60,
      'characters': ['toto'],
      'status': 'ready',
      'createdAt': '2026-09-05T12:00:00Z',
    };

    test('should create an Episode from valid JSON', () {
      final episode = Episode.fromJson(validJson);

      expect(episode.id, 'ep_001');
      expect(episode.title, 'Toto Finds Three Apples');
      expect(episode.status, EpisodeStatus.ready);
      expect(episode.createdAt, DateTime.parse('2026-09-05T12:00:00Z'));
    });

    test('should convert Episode to valid JSON', () {
      final episode = Episode(
        id: 'ep_001',
        title: 'Toto Finds Three Apples',
        videoUrl: 'https://example.com/video.mp4',
        duration: 60,
        characters: ['toto'],
        status: EpisodeStatus.ready,
        createdAt: DateTime.parse('2026-09-05T12:00:00Z'),
      );

      final json = episode.toJson();

      expect(json['id'], 'ep_001');
      expect(json['status'], 'ready');
      expect(json['createdAt'], '2026-09-05T12:00:00.000Z');
    });

    test('should fallback to EpisodeStatus.failed for unknown status strings', () {
      final jsonWithUnknownStatus = Map<String, dynamic>.from(validJson)
        ..['status'] = 'unknown_status';

      final episode = Episode.fromJson(jsonWithUnknownStatus);

      expect(episode.status, EpisodeStatus.failed);
    });

    test('should handle case-insensitive status strings', () {
      final jsonWithCapsStatus = Map<String, dynamic>.from(validJson)
        ..['status'] = 'READY';

      final episode = Episode.fromJson(jsonWithCapsStatus);

      expect(episode.status, EpisodeStatus.ready);
    });
  });
}
