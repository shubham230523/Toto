import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:toto/services/api_service.dart';

class MockHttpClient extends Mock implements http.Client {}

void main() {
  late ApiService apiService;
  late MockHttpClient mockClient;

  setUp(() {
    mockClient = MockHttpClient();
    apiService = ApiService(client: mockClient);
    registerFallbackValue(Uri());
  });

  group('ApiService', () {
    const mockEpisodeJson = {
      'id': 'ep_001',
      'title': 'Test Episode',
      'videoUrl': 'https://example.com/video.mp4',
      'duration': 60,
      'characters': ['toto'],
      'status': 'ready',
      'createdAt': '2026-09-05T12:00:00Z',
    };

    test('getRandomEpisode returns an Episode on success', () async {
      when(() => mockClient.get(any())).thenAnswer(
        (_) async => http.Response(
          jsonEncode({
            'status': 'success',
            'data': {'episode': mockEpisodeJson}
          }),
          200,
        ),
      );

      final result = await apiService.getRandomEpisode();

      expect(result, isNotNull);
      expect(result!.id, 'ep_001');
      expect(result.title, 'Test Episode');
    });

    test('getRandomEpisode returns null on 404', () async {
      when(() => mockClient.get(any())).thenAnswer(
        (_) async => http.Response('Not Found', 404),
      );

      final result = await apiService.getRandomEpisode();

      expect(result, isNull);
    });

    test('getRandomEpisode returns null on network error', () async {
      when(() => mockClient.get(any())).thenThrow(Exception('Network Error'));

      final result = await apiService.getRandomEpisode();

      expect(result, isNull);
    });

    test('getRandomEpisode includes exclude query parameter', () async {
      when(() => mockClient.get(any())).thenAnswer(
        (_) async => http.Response(
          jsonEncode({
            'status': 'success',
            'data': {'episode': mockEpisodeJson}
          }),
          200,
        ),
      );

      await apiService.getRandomEpisode(excludeIds: ['ep_old1', 'ep_old2']);

      verify(() => mockClient.get(
        any(that: predicate<Uri>((uri) => uri.queryParameters['exclude'] == 'ep_old1,ep_old2')),
      )).called(1);
    });
  });
}
