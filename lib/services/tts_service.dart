import 'dart:io';
import 'package:edge_tts/edge_tts.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class TTSService {
  final FlutterTts _nativeTts = FlutterTts();

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
  Future<String> generateSpeech(String text, String fileName, {bool isChild = true}) async {
    final directory = await getApplicationDocumentsDirectory();
    final ttsDir = Directory(p.join(directory.path, 'tts_cache'));
    if (!await ttsDir.exists()) {
      await ttsDir.create(recursive: true);
    }

    // Include voice type in filename to avoid cache collision between child/adult
    final finalFileName = '${fileName}_${isChild ? 'child' : 'adult'}';
    final filePath = p.join(ttsDir.path, '$finalFileName.mp3');
    final file = File(filePath);

    if (await file.exists()) {
      debugPrint('[TTSService] 📦 Cache HIT: $finalFileName');
      return filePath;
    }

    try {
      final voice = isChild ? 'en-US-AnaNeural' : 'en-US-AndrewNeural';
      debugPrint('[TTSService] 🎙️ Generating ${isChild ? 'child' : 'adult'} voice using Edge TTS ($voice): "$text"');
      
      final edge = Communicate(
        text: text, 
        voice: voice, 
        rate: isChild ? '-10%' : '+0%',
      );
      
      await edge.save(filePath);
      debugPrint('[TTSService] ✅ Successfully generated: $finalFileName');
      return filePath;
    } catch (e) {
      debugPrint('[TTSService] ⚠️ Edge TTS failed, falling back to native TTS: $e');
      try {
        if (Platform.isAndroid || Platform.isIOS) {
          await _nativeTts.synthesizeToFile(text, '$finalFileName.mp3');
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
