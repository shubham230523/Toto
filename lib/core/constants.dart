class AppConstants {
  static const String appName = 'Toto';

  // AI Configuration
  // TODO: Replace with your actual Gemini API Key from Google AI Studio
  static const String geminiApiKey = 'YOUR_GEMINI_API_KEY_HERE';
  static const String geminiModel = 'gemini-1.5-flash';

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
