import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:mocktail/mocktail.dart';
import 'package:path/path.dart' as p;
import 'package:toto/services/video_cache_service.dart';

class MockHttpClient extends Mock implements http.Client {}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late VideoCacheService cacheService;
  late MockHttpClient mockClient;
  late Directory tempDir;

  setUp(() async {
    mockClient = MockHttpClient();
    cacheService = VideoCacheService(client: mockClient);
    registerFallbackValue(Uri());

    tempDir = await Directory.systemTemp.createTemp('toto_cache_test');
    
    const channel = MethodChannel('plugins.flutter.io/path_provider');
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
      return tempDir.path;
    });
  });

  tearDown(() async {
    if (await tempDir.exists()) {
      await tempDir.delete(recursive: true);
    }
  });

  group('VideoCacheService', () {
    const testUrl = 'https://example.com/video.mp4';

    test('getCachedVideo downloads and stores video if not in cache', () async {
      when(() => mockClient.get(any())).thenAnswer(
        (_) async => http.Response.bytes(Uint8List.fromList([1, 2, 3]), 200),
      );

      final file = await cacheService.getCachedVideo(testUrl);

      expect(file, isNotNull);
      expect(await file!.exists(), isTrue);
      expect(await file.readAsBytes(), Uint8List.fromList([1, 2, 3]));
      
      // Verify file is in the correct folder
      expect(p.dirname(file.path), p.join(tempDir.path, 'episode_cache'));
    });

    test('getCachedVideo returns existing file without downloading', () async {
      final cacheDir = Directory(p.join(tempDir.path, 'episode_cache'));
      await cacheDir.create(recursive: true);
      
      // Manually create the file in cache
      // We need to know the filename generation logic to mock it correctly
      // But we can just call it once to get the file, then clear the mock, and call again.
      
      when(() => mockClient.get(any())).thenAnswer(
        (_) async => http.Response.bytes(Uint8List.fromList([1, 2, 3]), 200),
      );
      
      final firstFile = await cacheService.getCachedVideo(testUrl);
      expect(firstFile, isNotNull);
      
      clearInteractions(mockClient);
      
      final secondFile = await cacheService.getCachedVideo(testUrl);
      
      expect(secondFile, isNotNull);
      expect(secondFile!.path, firstFile!.path);
      verifyNever(() => mockClient.get(any()));
    });

    test('getRandomCachedVideo returns a file if cache is not empty', () async {
      final cacheDir = Directory(p.join(tempDir.path, 'episode_cache'));
      await cacheDir.create(recursive: true);
      await File(p.join(cacheDir.path, 'video1.mp4')).create();
      
      final result = await cacheService.getRandomCachedVideo();
      
      expect(result, isNotNull);
      expect(result!.path.endsWith('video1.mp4'), isTrue);
    });

    test('getRandomCachedVideo returns null if cache is empty', () async {
      final result = await cacheService.getRandomCachedVideo();
      expect(result, isNull);
    });
  });
}
