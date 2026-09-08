import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../core/constants.dart';

class VideoCacheService {
  static const String _cacheFolderName = 'episode_cache';
  final http.Client _client;

  VideoCacheService({http.Client? client}) : _client = client ?? http.Client();

  /// Gets a cached video file or downloads it if it doesn't exist.
  Future<File?> getCachedVideo(String url) async {
    try {
      final directory = await _getCacheDirectory();
      final fileName = _generateFileName(url);
      final filePath = p.join(directory.path, fileName);
      final file = File(filePath);

      if (await file.exists()) {
        // Update access time for LRU cleanup (simulated by updating modification time)
        await file.setLastModified(DateTime.now());
        return file;
      }

      // Download to a temporary file first to avoid corrupted cache on interruption
      final tempFile = File(p.join(directory.path, '$fileName.tmp'));
      final response = await _client.get(Uri.parse(url)).timeout(const Duration(minutes: 5));
      
      if (response.statusCode == 200) {
        await tempFile.writeAsBytes(response.bodyBytes);
        await tempFile.rename(filePath);
        
        // After saving, check and clean up cache if needed
        _cleanupCache(directory);
        
        return File(filePath);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Generates a unique filename based on the URL hash.
  String _generateFileName(String url) {
    final bytes = utf8.encode(url);
    final digest = sha256.convert(bytes);
    return '${digest.toString()}.mp4';
  }

  /// Returns the local directory used for video caching.
  Future<Directory> _getCacheDirectory() async {
    final baseDir = await getApplicationDocumentsDirectory();
    final cacheDir = Directory(p.join(baseDir.path, _cacheFolderName));
    if (!await cacheDir.exists()) {
      await cacheDir.create(recursive: true);
    }
    return cacheDir;
  }

  /// Returns a random video file from the cache, if any exist.
  Future<File?> getRandomCachedVideo() async {
    try {
      final directory = await _getCacheDirectory();
      final entities = await directory.list().toList();
      final files = entities.whereType<File>().where((f) => f.path.endsWith('.mp4')).toList();
      
      if (files.isEmpty) return null;
      
      files.shuffle();
      return files.first;
    } catch (e) {
      return null;
    }
  }

  /// Removes old files if the cache size exceeds the limit.
  Future<void> _cleanupCache(Directory directory) async {
    try {
      final entities = await directory.list().toList();
      final files = entities.whereType<File>().toList();
      
      // Get stats for all files to avoid multiple sync calls
      final fileStats = await Future.wait(files.map((f) async {
        final stat = await f.stat();
        return {'file': f, 'size': stat.size, 'modified': stat.modified};
      }));

      // Sort by last modified (oldest first)
      fileStats.sort((a, b) => (a['modified'] as DateTime).compareTo(b['modified'] as DateTime));

      int totalSize = fileStats.fold(0, (sum, item) => sum + (item['size'] as int));
      final limitBytes = AppConstants.maxVideoCacheSizeMB * 1024 * 1024;
      
      if (totalSize > limitBytes) {
        int bytesToRemove = totalSize - limitBytes;
        for (final item in fileStats) {
          if (bytesToRemove <= 0) break;
          
          final file = item['file'] as File;
          final fileSize = item['size'] as int;
          await file.delete();
          bytesToRemove -= fileSize;
        }
      }
    } catch (e) {
      // Cleanup is secondary, don't fail the main process
    }
  }
}

final videoCacheService = VideoCacheService();
