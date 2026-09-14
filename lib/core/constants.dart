import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Toto';
  
  // API Configuration
  static String get apiBaseUrl {
    if (kReleaseMode) {
      return 'https://api.yourproductiondomain.com'; // Change this for production
    }

    // Dynamic discovery for local development
    if (kIsWeb) {
      return 'http://localhost:3000';
    } else if (Platform.isAndroid) {
      // NOTE: 10.0.2.2 is ONLY for Android Emulators. 
      // For real physical Android devices (like your SM E236B), it MUST use your computer's actual Wi-Fi IP address:
      return 'http://192.168.1.3:3000';
    } else if (Platform.isIOS || Platform.isMacOS) {
      return 'http://localhost:3000';
    }

    // Fallback
    return 'http://192.168.1.3:3000'; 
  }
  
  static const int apiTimeoutSeconds = 30;

  // Video Configuration (Placeholders)
  static const int maxVideoCacheSizeMB = 500;
  static const int maxVideoCacheAgeDays = 7;
}
