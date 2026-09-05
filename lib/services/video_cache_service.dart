import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../core/constants.dart';

class VideoCacheService {
  static const String _cacheFolderName = 'episode_cache';

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

      // Download and save
      final response = await http.get(Uri.parse(url)).timeout(const Duration(minutes: 2));
      if (response.statusCode == 200) {
        await file.writeAsBytes(response.bodyBytes);
        
        // After saving, check and clean up cache if needed
        _cleanupCache(directory);
        
        return file;
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
      final files = directory.listSync().whereType<File>().where((f) => f.path.endsWith('.mp4')).toList();
      
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
      final files = directory.listSync().whereType<File>().toList();
      
      // Sort by last modified (oldest first)
      files.sort((a, b) => a.lastModifiedSync().compareTo(b.lastModifiedSync()));

      int totalSize = 0;
      for (final file in files) {
        totalSize += file.lengthSync();
      }

      final limitBytes = AppConstants.maxVideoCacheSizeMB * 1024 * 1024;
      
      if (totalSize > limitBytes) {
        int bytesToRemove = totalSize - limitBytes;
        for (final file in files) {
          if (bytesToRemove <= 0) break;
          
          final fileSize = file.lengthSync();
          await file.delete();
          bytesToRemove -= fileSize;
        }
      }
    } catch (e) {
      // Cleanup is secondary, don't fail the main process
    }
  }
}

export const videoCacheService = VideoCacheService();
