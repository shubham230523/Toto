import 'dart:convert';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../models/history_item.dart';

class HistoryService {
  static const String _historyFile = 'video_history.json';

  Future<List<HistoryItem>> getHistory() async {
    try {
      final file = await _getHistoryFile();
      if (!await file.exists()) return [];

      final content = await file.readAsString();
      final List<dynamic> jsonList = jsonDecode(content);
      return jsonList.map((item) => HistoryItem.fromJson(item)).toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    } catch (e) {
      return [];
    }
  }

  Future<void> addToHistory(HistoryItem item) async {
    final history = await getHistory();
    history.insert(0, item);
    
    final file = await _getHistoryFile();
    await file.writeAsString(jsonEncode(history.map((h) => h.toJson()).toList()));
  }

  Future<File> _getHistoryFile() async {
    final directory = await getApplicationDocumentsDirectory();
    return File(p.join(directory.path, _historyFile));
  }
}

final historyService = HistoryService();
