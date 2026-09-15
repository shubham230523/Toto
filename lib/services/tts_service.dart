import 'dart:io';
import 'package:edge_tts/edge_tts.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class TTSService {
  final FlutterTts _nativeTts = FlutterTts();
  // Using 'en-US-AnaNeural' which is a dedicated CHILD voice for a friendlier toddler tone
  static const String _voice = 'en-US-AnaNeural';

  TTSService() {
    _initNative();
  }

  Future<void> _initNative() async {
    await _nativeTts.setLanguage("en-US");
    await _nativeTts.setSpeechRate(0.5);
    await _nativeTts.setVolume(1.0);
    await _nativeTts.setPitch(1.0);
  }

  /// Generates speech for the given text and returns the file path.
  Future<String> generateSpeech(String text, String fileName) async {
    final directory = await getApplicationDocumentsDirectory();
    final ttsDir = Directory(p.join(directory.path, 'tts_cache'));
    if (!await ttsDir.exists()) {
      await ttsDir.create(recursive: true);
    }

    final filePath = p.join(ttsDir.path, '$fileName.mp3');
    final file = File(filePath);

    if (await file.exists()) {
      debugPrint('[TTSService] 📦 Cache HIT: $fileName');
      return filePath;
    }

    try {
      debugPrint('[TTSService] 🎙️ Generating toddler-friendly voice using Edge TTS (Ana): "$text"');
      final edge = Communicate(text: text, voice: _voice, rate: '-10%'); // Slightly slower for better toddler processing
      await edge.save(filePath);
      debugPrint('[TTSService] ✅ Successfully generated: $fileName');
      return filePath;
    } catch (e) {
      debugPrint('[TTSService] ⚠️ Edge TTS failed, falling back to native TTS: $e');
      // Native TTS usually speaks directly, but some versions support saving to file.
      // For this flow, we'll try to save to file if supported, or just log error for now.
      // Most mobile native TTS can synthesize to file.
      try {
        if (Platform.isAndroid || Platform.isIOS) {
          await _nativeTts.synthesizeToFile(text, '$fileName.mp3');
          // Note: synthesizeToFile behavior varies by platform. 
          // On Android, it saves to the path provided relative to external storage or absolute.
          // We'll assume for now we need a working audio file for FFmpeg.
          return filePath; 
        }
      } catch (nativeError) {
        debugPrint('[TTSService] 🚨 Native fallback also failed: $nativeError');
      }
      rethrow;
    }
  }

  Future<void> clearCache() async {
    final directory = await getApplicationDocumentsDirectory();
    final ttsDir = Directory(p.join(directory.path, 'tts_cache'));
    if (await ttsDir.exists()) {
      await ttsDir.delete(recursive: true);
      debugPrint('[TTSService] 🧹 Cache cleared.');
    }
  }
}
