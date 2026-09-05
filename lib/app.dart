import 'package:flutter/material.dart';
import 'core/constants.dart';
import 'core/theme.dart';
import 'features/splash/splash_screen.dart';

class TotoApp extends StatelessWidget {
  const TotoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: AppConstants.appName,
      theme: TotoTheme.light,
      darkTheme: TotoTheme.dark,
      themeMode: ThemeMode.dark,
      home: const TotoSplashScreen(),
    );
  }
}
