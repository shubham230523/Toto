import 'dart:io';
import 'package:ffmpeg_kit_flutter_new/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_new/return_code.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../models/story_script.dart';

class ExportService {
  /// Compiles a list of image and audio file paths into a single MP4 video.
  Future<String> exportVideo(
    StoryScript script,
    List<String> backgroundPaths,
    List<String> audioPaths,
    List<List<String>> overlayPaths,
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

    debugPrint('[ExportService] 📽️ Starting FFmpeg multi-stage render pipeline with Overlays...');

    try {
      final List<String> clipPaths = [];
      for (int i = 0; i < script.scenes.length; i++) {
        final scene = script.scenes[i];
        final clipPath = p.join(tempDir.path, 'clip_$i.mp4');
        
        final bg = backgroundPaths[i];
        final audio = audioPaths[i];
        final currentOverlays = overlayPaths[i];

        // 1. Construct Inputs
        // -i background -i audio -i overlay1 -i overlay2 ...
        String inputs = '-loop 1 -i "$bg" -i "$audio"';
        for (final ovPath in currentOverlays) {
          inputs += ' -i "$ovPath"';
        }

        // 2. Construct Filter Complex
        // Scale overlays and position them
        String filter = '';
        String lastOverlayOut = '0:v';

        for (int j = 0; j < currentOverlays.length; j++) {
          final overlayModel = scene.overlays[j];
          final inputIdx = j + 2; // 0=bg, 1=audio, 2+=overlays
          
          // Scale overlay to 300px width
          final scaledTag = 'ov${j}_scaled';
          filter += '[$inputIdx:v]scale=300:-1[$scaledTag];';

          // Position overlay
          String x = '10';
          String y = '10';
          switch (overlayModel.position) {
            case 'bottom_left':
              x = '40'; y = 'main_h-overlay_h-40'; break;
            case 'bottom_right':
              x = 'main_w-overlay_w-40'; y = 'main_h-overlay_h-40'; break;
            case 'top_left':
              x = '40'; y = '40'; break;
            case 'top_right':
              x = 'main_w-overlay_w-40'; y = '40'; break;
            case 'center':
              x = '(main_w-overlay_w)/2'; y = '(main_h-overlay_h)/2'; break;
          }

          final overlayOut = 'v$j';
          filter += '[$lastOverlayOut][$scaledTag]overlay=x=$x:y=$y[$overlayOut];';
          lastOverlayOut = overlayOut;
        }

        // Ensure final output has the right pixel format and frame rate
        // If no overlays, just pass through the background
        final finalVTag = currentOverlays.isEmpty ? '0:v' : lastOverlayOut;
        final filterComplex = '$filter[$finalVTag]format=yuv420p[outv]';

        final command = '$inputs -filter_complex "$filterComplex" -map "[outv]" -map 1:a -c:v libx264 -tune stillimage -c:a aac -shortest -y "$clipPath"';
        
        debugPrint('[ExportService] ⚙️ Encoding sub-clip $i with overlays...');
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

      // 3. Create concat list
      final listFile = File(p.join(tempDir.path, 'clips.txt'));
      final content = clipPaths.map((path) => "file '$path'").join('\n');
      await listFile.writeAsString(content);

      // 4. Concat all clips into final video
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
      // Cleanup temp clips handled by system/manual if needed
    }
  }
}
