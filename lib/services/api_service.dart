import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import '../models/episode.dart';

class ApiService {
  final http.Client _client;
  final String _baseUrl = AppConstants.apiBaseUrl;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  /// Fetches a random ready episode from the backend with a timeout.
  /// [excludeIds] Optional list of episode IDs to avoid.
  Future<Episode?> getRandomEpisode({List<String> excludeIds = const []}) async {
    try {
      final queryParams = excludeIds.isNotEmpty ? '?exclude=${excludeIds.join(',')}' : '';
      final targetUrl = '$_baseUrl/episodes/random$queryParams';
      
      debugPrint('[ApiService] 🛫 Requesting random episode from: $targetUrl');
      if (excludeIds.isNotEmpty) {
        debugPrint('[ApiService] 🚫 Excluding recently viewed IDs: ${excludeIds.join(', ')}');
      }

      final response = await _client.get(
        Uri.parse(targetUrl),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(response.body);
        if (body['status'] == 'success' && body['data'] != null) {
          final episode = Episode.fromJson(body['data']['episode']);
          debugPrint('[ApiService] 🛬 Successfully fetched episode metadata: "${episode.title}" (ID: ${episode.id})');
          return episode;
        }
      } else {
        debugPrint('[ApiService] ❌ Server returned error response status: ${response.statusCode} - Body: ${response.body}');
      }
      
      return null;
    } catch (e) {
      debugPrint('[ApiService] 🚨 Critical error in getRandomEpisode connection flow: $e');
      return null;
    }
  }
}
