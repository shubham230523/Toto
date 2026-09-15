import 'dart:io';
import 'package:ffmpeg_kit_flutter_new/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_new/return_code.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:gal/gal.dart';
import '../models/story_script.dart';

class ExportService {
  /// Compiles 10 scenes into a single 1-minute MP4 video and saves to gallery.
  Future<String> exportVideo(
    StoryScript script,
    List<String> backgroundPaths,
    List<String> audioPaths,
    String outputFileName,
  ) async {
    final directory = await getApplicationDocumentsDirectory();
    final exportDir = Directory(p.join(directory.path, 'exports'));
    if (!await exportDir.exists()) {
      await exportDir.create(recursive: true);
    }

    final outputPath = p.join(exportDir.path, '$outputFileName.mp4');
    final tempDir = Directory(p.join(directory.path, 'temp_clips'));
    if (await tempDir.exists()) await tempDir.delete(recursive: true);
    await tempDir.create(recursive: true);

    debugPrint('[ExportService] 📽️ Starting 1-minute multi-stage render pipeline...');

    try {
      final List<String> clipPaths = [];
      for (int i = 0; i < script.scenes.length; i++) {
        final scene = script.scenes[i];
        final clipPath = p.join(tempDir.path, 'clip_$i.mp4');
        
        final bg = backgroundPaths[i];
        final audio = audioPaths[i];
        final bgColor = scene.backgroundColor.replaceAll('#', '0x');

        // FFmpeg Command:
        // 1. Scales image to 1280x720 (16:9)
        // 2. Pads with the dominant background color from AI
        // 3. Merges audio and video into a sub-clip
        final command = '-loop 1 -i "$bg" -i "$audio" -c:v libx264 -tune stillimage -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=$bgColor,format=yuv420p" -c:a aac -shortest -y "$clipPath"';
        
        debugPrint('[ExportService] ⚙️ Encoding sub-clip $i/10...');
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

      // 2. Create absolute path concat list
      final listFile = File(p.join(tempDir.path, 'clips.txt'));
      final content = clipPaths.map((path) => "file '$path'").join('\n');
      await listFile.writeAsString(content);

      // 3. Concat all 10 clips into final 1-minute video
      debugPrint('[ExportService] 🖇️ Merging all clips into final 1-minute container...');
      final concatCommand = '-f concat -safe 0 -i "${listFile.path}" -c copy -y "$outputPath"';
      final finalSession = await FFmpegKit.execute(concatCommand);
      final finalReturnCode = await finalSession.getReturnCode();

      if (ReturnCode.isSuccess(finalReturnCode)) {
        debugPrint('[ExportService] 🎉 Successfully exported full video: $outputPath');
        
        // 4. Save to System Gallery
        await Gal.putVideo(outputPath, album: 'Toto');
        debugPrint('[ExportService] ✅ Video saved to System Gallery.');
        
        return outputPath;
      } else {
        final logs = await finalSession.getLogsAsString();
        debugPrint('[ExportService] ❌ Final merge failed: $logs');
        throw Exception('FFmpeg final merge failed');
      }
    } finally {
      if (await tempDir.exists()) await tempDir.delete(recursive: true);
    }
  }
}
