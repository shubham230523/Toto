import 'dart:io';
import 'package:ffmpeg_kit_flutter_new/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_new/return_code.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class ExportService {
  /// Compiles a list of image and audio file paths into a single MP4 video.
  Future<String> exportVideo(List<String> imagePaths, List<String> audioPaths, String outputFileName) async {
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
      // 1. Create individual clips for each image/audio pair
      final List<String> clipPaths = [];
      for (int i = 0; i < imagePaths.length; i++) {
        final clipPath = p.join(tempDir.path, 'clip_$i.mp4');
        // Command: loop image, add audio, stillimage tuning, shortest flag
        final command = '-loop 1 -i "${imagePaths[i]}" -i "${audioPaths[i]}" -c:v libx264 -tune stillimage -c:a aac -pix_fmt yuv420p -shortest "$clipPath"';
        
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
        debugPrint('[ExportService] 🎉 Successfully exported video to: $outputPath');
        return outputPath;
      } else {
        final logs = await finalSession.getLogsAsString();
        debugPrint('[ExportService] ❌ Final concatenation failed: $logs');
        throw Exception('FFmpeg final export failed');
      }
    } finally {
      // Cleanup temp clips
      // if (await tempDir.exists()) await tempDir.delete(recursive: true);
    }
  }
}
