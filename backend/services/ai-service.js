const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-key-here'
    });
    
    this.systemPrompt = `You are RAHL (Rapid App Helper & Launcher), an expert Flutter developer that creates complete mobile applications from descriptions.

CRITICAL RULES:
1. Always return valid JSON with this EXACT structure:
{
  "appName": "Creative name based on description",
  "packageName": "com.rahl.appname",
  "screens": ["Screen1", "Screen2"],
  "features": {
    "hasLogin": boolean,
    "hasDatabase": boolean,
    "hasCamera": boolean,
    "hasMaps": boolean,
    "hasPayments": boolean,
    "hasNotifications": boolean,
    "theme": "light" or "dark"
  },
  "description": "One sentence app description",
  "targetAudience": "Who the app is for",
  "complexity": "low/medium/high",
  "dependencies": ["package1", "package2"],
  "uiStyle": "material/cupertino/both",
  "colorScheme": {
    "primary": "#7C3AED",
    "secondary": "#10B981",
    "background": "#FFFFFF"
  }
}

2. Generate REALISTIC Flutter app structures based on the user's description.
3. For no-code users, keep screens between 2-5.
4. Include standard features: home screen, navigation, settings.
5. Use proper Flutter conventions and naming.

USER DESCRIPTION:`;
  }

  async analyzeDescription(userDescription) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.systemPrompt
          },
          {
            role: "user",
            content: userDescription
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(completion.choices[0].message.content);
      
      // Enhance with additional analysis
      const enhanced = this.enhanceAnalysis(aiResponse, userDescription);
      return enhanced;
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      // Fallback to rule-based analysis
      return this.fallbackAnalysis(userDescription);
    }
  }

  enhanceAnalysis(aiAnalysis, userDescription) {
    // Add generated code snippets
    const screens = aiAnalysis.screens || ['HomeScreen', 'DetailsScreen'];
    
    return {
      ...aiAnalysis,
      timestamp: new Date().toISOString(),
      estimatedDevelopmentTime: this.calculateDevTime(aiAnalysis.complexity),
      screens: screens,
      widgets: this.generateWidgetList(screens),
      fileStructure: this.generateFileStructure(aiAnalysis),
      recommendations: this.generateRecommendations(aiAnalysis)
    };
  }

  calculateDevTime(complexity) {
    const times = {
      'low': '2-4 hours',
      'medium': '1-2 days', 
      'high': '3-5 days'
    };
    return times[complexity] || '1-2 days';
  }

  generateWidgetList(screens) {
    const allWidgets = [
      'AppBar', 'Scaffold', 'Container', 'Column', 'Row', 
      'ListView', 'GridView', 'Card', 'Button', 'TextField',
      'Image', 'Icon', 'Text', 'Padding', 'Margin'
    ];
    
    // Add screen-specific widgets
    return [...allWidgets, ...screens.map(s => `${s} Widget`)];
  }

  generateFileStructure(analysis) {
    const baseFiles = [
      'lib/main.dart',
      'lib/app.dart',
      'pubspec.yaml',
      'README.md'
    ];
    
    const screenFiles = (analysis.screens || []).map(screen => 
      `lib/screens/${screen.toLowerCase()}.dart`
    );
    
    const serviceFiles = [];
    if (analysis.features.hasLogin) serviceFiles.push('lib/services/auth_service.dart');
    if (analysis.features.hasDatabase) serviceFiles.push('lib/services/database_service.dart');
    if (analysis.features.hasCamera) serviceFiles.push('lib/services/camera_service.dart');
    
    return [...baseFiles, ...screenFiles, ...serviceFiles];
  }

  generateRecommendations(analysis) {
    const recs = [];
    
    if (analysis.features.hasLogin) {
      recs.push('Add Firebase Authentication for user management');
    }
    
    if (analysis.features.hasDatabase) {
      recs.push('Use Firebase Firestore or SQLite for data storage');
    }
    
    if (analysis.features.hasMaps) {
      recs.push('Integrate Google Maps API (requires API key)');
    }
    
    if (analysis.complexity === 'high') {
      recs.push('Consider starting with MVP version first');
    }
    
    return recs;
  }

  fallbackAnalysis(description) {
    // Simple keyword-based fallback
    const desc = description.toLowerCase();
    
    return {
      appName: this.generateAppName(description),
      packageName: `com.rahl.${Math.random().toString(36).substring(7)}`,
      screens: ['HomeScreen', 'ProfileScreen', 'SettingsScreen'],
      features: {
        hasLogin: desc.includes('login') || desc.includes('sign'),
        hasDatabase: desc.includes('store') || desc.includes('save'),
        hasCamera: desc.includes('camera') || desc.includes('photo'),
        hasMaps: desc.includes('map') || desc.includes('location'),
        hasPayments: false,
        hasNotifications: desc.includes('notify') || desc.includes('alert'),
        theme: desc.includes('dark') ? 'dark' : 'light'
      },
      description: description.substring(0, 100) + '...',
      targetAudience: 'General users',
      complexity: desc.split(' ').length > 20 ? 'medium' : 'low',
      dependencies: ['flutter', 'cupertino_icons'],
      uiStyle: 'material',
      colorScheme: {
        primary: '#7C3AED',
        secondary: '#10B981',
        background: '#FFFFFF'
      }
    };
  }

  generateAppName(description) {
    const keywords = description.toLowerCase().split(' ');
    const prefixes = ['My', 'Quick', 'Smart', 'Easy', 'Pro'];
    const suffixes = ['App', 'Tool', 'Manager', 'Tracker', 'Hub'];
    
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const keyword = keywords.find(w => w.length > 3) || 'App';
    
    return `${randomPrefix} ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} ${randomSuffix}`;
  }

  async generateCodeSnippets(analysis) {
    const snippets = {};
    const screens = analysis.screens || ['HomeScreen'];
    
    for (const screen of screens) {
      snippets[screen] = await this.generateScreenCode(screen, analysis);
    }
    
    snippets['main'] = this.generateMainCode(analysis);
    snippets['pubspec'] = this.generatePubspecCode(analysis);
    
    return snippets;
  }

  async generateScreenCode(screenName, analysis) {
    const prompt = `Generate a complete Flutter screen class for ${screenName}.
App features: ${JSON.stringify(analysis.features)}
Theme: ${analysis.theme}
Color scheme: ${JSON.stringify(analysis.colorScheme)}

Return ONLY the Dart code, no explanations.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a Flutter expert. Return ONLY Dart code, no markdown, no explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      return completion.choices[0].message.content;
    } catch (error) {
      // Fallback template
      return this.getScreenTemplate(screenName, analysis);
    }
  }

  getScreenTemplate(screenName, analysis) {
    return `import 'package:flutter/material.dart';

class ${screenName} extends StatelessWidget {
  const ${screenName}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${screenName.replace('Screen', '')}'),
        backgroundColor: Color(0xFF${analysis.colorScheme.primary.replace('#', '')}),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Welcome to ${screenName}!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ${analysis.features.hasLogin ? 'ElevatedButton(\n              onPressed: () {},\n              child: const Text("Login"),\n            ),' : 'const Text("RAHL Generated Screen")'}
          ],
        ),
      ),
    );
  }
}`;
  }

  generateMainCode(analysis) {
    const screens = analysis.screens || ['HomeScreen', 'DetailsScreen'];
    const routes = screens.map(s => `        '/${s.toLowerCase()}': (context) => const ${s}(),`).join('\n');
    
    return `import 'package:flutter/material.dart';
${screens.map(s => `import './screens/${s.toLowerCase()}.dart';`).join('\n')}

void main() {
  runApp(const ${analysis.appName.replace(/\s+/g, '')}());
}

class ${analysis.appName.replace(/\s+/g, '')} extends StatelessWidget {
  const ${analysis.appName.replace(/\s+/g, '')}({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${analysis.appName}',
      theme: ThemeData(
        primaryColor: Color(0xFF${analysis.colorScheme.primary.replace('#', '')}),
        colorScheme: ColorScheme.fromSeed(
          seedColor: Color(0xFF${analysis.colorScheme.primary.replace('#', '')}),
        ),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
${routes}
      },
      home: const ${screens[0]}(),
    );
  }
}`;
  }

  generatePubspecCode(analysis) {
    let dependencies = '\n  flutter:\n    sdk: flutter\n  cupertino_icons: ^1.0.2';
    
    if (analysis.features.hasLogin) dependencies += '\n  firebase_auth: ^4.2.5\n  firebase_core: ^2.24.1';
    if (analysis.features.hasDatabase) dependencies += '\n  cloud_firestore: ^4.8.4';
    if (analysis.features.hasCamera) dependencies += '\n  camera: ^0.10.5\n  image_picker: ^0.8.9';
    if (analysis.features.hasMaps) dependencies += '\n  google_maps_flutter: ^2.2.3\n  geolocator: ^10.0.0';
    if (analysis.features.hasPayments) dependencies += '\n  in_app_purchase: ^3.1.9';
    if (analysis.features.hasNotifications) dependencies += '\n  firebase_messaging: ^14.7.7';
    
    return `name: ${analysis.appName.toLowerCase().replace(/\s+/g, '_')}
description: ${analysis.description}
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.0.0'

dependencies:${dependencies}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
  
  # For iOS specific configuration
  ios:
    supports-portrait: true
    
  # For Android specific configuration  
  android:
    enable-jetifier: true`;
  }
}

module.exports = AIService;
