import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../models/story_config.dart';
import 'loading_screen.dart';

class WizardScreen extends StatefulWidget {
  const WizardScreen({super.key});

  @override
  State<WizardScreen> createState() => _WizardScreenState();
}

class _WizardScreenState extends State<WizardScreen> {
  String _selectedStoryType = AppConstants.storyTypes.first;
  final List<String> _selectedCharacters = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Padding(
          padding: EdgeInsets.only(top: 20.0),
          child: Text('Create your Story'),
        ),
        centerTitle: true,
        toolbarHeight: 80,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select Story Type',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                children: AppConstants.storyTypes.map((type) {
                  final isSelected = _selectedStoryType == type;
                  return ChoiceChip(
                    label: Text(type),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedStoryType = type);
                      }
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 32),
              const Text(
                'Select Characters',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ...AppConstants.availableCharacters.map((char) {
                final isSelected = _selectedCharacters.contains(char);
                return CheckboxListTile(
                  title: Text(char),
                  value: isSelected,
                  onChanged: (val) {
                    setState(() {
                      if (val == true) {
                        _selectedCharacters.add(char);
                      } else {
                        _selectedCharacters.remove(char);
                      }
                    });
                  },
                );
              }),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _selectedCharacters.isEmpty
                      ? null
                      : () {
                          final config = StoryConfig(
                            storyType: _selectedStoryType,
                            characters: _selectedCharacters,
                          );
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LoadingScreen(config: config),
                            ),
                          );
                        },
                  child: const Text('Generate Story ✨', style: TextStyle(fontSize: 18)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
