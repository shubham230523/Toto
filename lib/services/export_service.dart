import 'dart:io';
import 'package:ffmpeg_kit_flutter_new/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_new/return_code.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:gal/gal.dart';
import '../models/story_script.dart';

class ExportService {
  /// Compiles a list of image and audio file paths into a single MP4 video
  /// and saves it to the system gallery.
  Future<String> exportVideo(
    StoryScript script,
    List<String> backgroundPaths,
    List<String> audioPaths,
    String outputFileName,
  ) async {
    // 1. Determine temporary internal directory for rendering
    final directory = await getApplicationDocumentsDirectory();
    final exportDir = Directory(p.join(directory.path, 'exports'));
    if (!await exportDir.exists()) {
      await exportDir.create(recursive: true);
    }

    final outputPath = p.join(exportDir.path, '$outputFileName.mp4');
    final tempDir = Directory(p.join(directory.path, 'temp_clips'));
    if (await tempDir.exists()) await tempDir.delete(recursive: true);
    await tempDir.create(recursive: true);

    debugPrint('[ExportService] 📽️ Starting FFmpeg multi-stage render pipeline...');

    try {
      final List<String> clipPaths = [];
      for (int i = 0; i < script.scenes.length; i++) {
        final clipPath = p.join(tempDir.path, 'clip_$i.mp4');
        
        final bg = backgroundPaths[i];
        final audio = audioPaths[i];

        // Improved FFmpeg command:
        // 1. Scales the 1:1 image to fit the 1080x1920 vertical canvas
        // 2. Adds black padding (letterboxing) to ensure the full square image is visible
        // 3. Sets pixel format for maximum compatibility
        final command = '-loop 1 -i "$bg" -i "$audio" -c:v libx264 -tune stillimage -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:a aac -shortest -y "$clipPath"';
        
        debugPrint('[ExportService] ⚙️ Encoding sub-clip $i...');
        final session = await FFmpegKit.execute(command);
        final returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          clipPaths.add(clipPath);
        } else {
          final logs = await session.getLogsAsString();
          debugPrint('[ExportService] ❌ Failed to encode clip $i: $logs');
          throw Exception('FFmpeg clip encoding failed at index $i');
        }
      }

      // 2. Create concat list
      final listFile = File(p.join(tempDir.path, 'clips.txt'));
      final content = clipPaths.map((path) => "file '$path'").join('\n');
      await listFile.writeAsString(content);

      // 3. Concat all clips into final video
      debugPrint('[ExportService] 🖇️ Concatenating all sub-clips into final container...');
      final concatCommand = '-f concat -safe 0 -i "${listFile.path}" -c copy -y "$outputPath"';
      final finalSession = await FFmpegKit.execute(concatCommand);
      final finalReturnCode = await finalSession.getReturnCode();

      if (ReturnCode.isSuccess(finalReturnCode)) {
        debugPrint('[ExportService] 🎉 Successfully exported video locally: $outputPath');
        
        // 4. Save to System Gallery using Gal
        debugPrint('[ExportService] 📁 Saving to System Gallery...');
        await Gal.putVideo(outputPath, album: 'Toto');
        debugPrint('[ExportService] ✅ Video available in System Gallery.');
        
        return outputPath;
      } else {
        final logs = await finalSession.getLogsAsString();
        debugPrint('[ExportService] ❌ Final concatenation failed: $logs');
        throw Exception('FFmpeg final export failed');
      }
    } finally {
      if (await tempDir.exists()) await tempDir.delete(recursive: true);
    }
  }
}
