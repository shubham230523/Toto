import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Configure immersive fullscreen mode globally
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  
  // iOS-specific: Auto-hide the home indicator for an immersive experience
  // SystemChrome.setPrefersHomeIndicatorAutoHidden(true);

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    systemNavigationBarColor: Colors.transparent,
  ));
  
  runApp(const TotoApp());
}
