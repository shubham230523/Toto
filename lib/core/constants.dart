class AppConstants {
  static const String appName = 'Toto';

  // AI Configuration
  // Gemini API Key is injected via --dart-define-from-file=secrets.json
  static const String geminiApiKey = String.fromEnvironment('GEMINI_API_KEY');
  static const String geminiModel = 'gemini-3.5-flash-lite';

  // Story Configuration Presets
  static const List<String> storyTypes = [
    'Child Story',
    'Sci-Fi Adventure',
    'Mystery Tale',
    'Nature Discovery',
  ];

  static const List<String> availableCharacters = [
    'Toto the Turtle',
    'Mimi the Rabbit',
    'Bobo the Bear',
    'Zuzu the Zebra',
  ];

  // Pollinations AI Configuration
  static const String pollinationsBaseUrl = 'https://image.pollinations.ai/p/';

  // UI / Animation Configuration
  static const int sceneDurationSeconds = 6;
  static const double defaultCharacterSize = 250.0;
}
