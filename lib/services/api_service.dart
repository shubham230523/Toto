import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import '../models/episode.dart';

class ApiService {
  final String _baseUrl = AppConstants.apiBaseUrl;

  /// Fetches a random ready episode from the backend with a timeout.
  Future<Episode?> getRandomEpisode() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/episodes/random'),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final Map<String, dynamic> body = jsonDecode(response.body);
        if (body['status'] == 'success' && body['data'] != null) {
          return Episode.fromJson(body['data']['episode']);
        }
      }
      
      // Log error or handle non-200 status codes appropriately
      return null;
    } catch (e) {
      // Handle network errors
      return null;
    }
  }
}
