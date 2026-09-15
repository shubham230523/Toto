import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';
import '../core/constants.dart';

class CacheService {
  final http.Client _client;

  CacheService({http.Client? client}) : _client = client ?? http.Client();

  /// Gets a cached image for the given prompt or downloads it.
  Future<String> getImageUrl(String prompt) async {
    final fileName = _generateFileName(prompt);
    final directory = await getApplicationDocumentsDirectory();
    final cacheDir = Directory(p.join(directory.path, 'assets_cache'));
    
    if (!await cacheDir.exists()) {
      await cacheDir.create(recursive: true);
    }

    final filePath = p.join(cacheDir.path, '$fileName.jpg');
    final file = File(filePath);

    if (await file.exists()) {
      debugPrint('[CacheService] 📦 Cache HIT: $fileName');
      return filePath;
    }

    debugPrint('[CacheService] 🔍 Cache MISS: Downloading image for prompt: $prompt');
    final encodedPrompt = Uri.encodeComponent(prompt);
    // Add default style modifiers from constants if needed, but for now just the prompt
    final url = Uri.parse('${AppConstants.pollinationsBaseUrl}$encodedPrompt?width=1024&height=1024&nologo=true&model=flux');

    try {
      final response = await _client.get(url).timeout(const Duration(minutes: 2));
      if (response.statusCode == 200) {
        await file.writeAsBytes(response.bodyBytes);
        debugPrint('[CacheService] ✅ Successfully cached: $fileName');
        return filePath;
      } else {
        throw Exception('Failed to download image: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('[CacheService] 🚨 Error fetching image: $e');
      rethrow;
    }
  }

  String _generateFileName(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  Future<void> clearCache() async {
    final directory = await getApplicationDocumentsDirectory();
    final cacheDir = Directory(p.join(directory.path, 'assets_cache'));
    if (await cacheDir.exists()) {
      await cacheDir.delete(recursive: true);
      debugPrint('[CacheService] 🧹 Cache cleared.');
    }
  }
}
