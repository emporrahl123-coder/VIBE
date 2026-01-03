const FlutterGenerator = require('./flutter-generator');
const generator = new FlutterGenerator();

// Enhanced generate endpoint
app.post('/api/generate/v2', async (req, res) => {
  try {
    const { description, appName = 'RAHLApp', platform = 'both' } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'App description is required' });
    }

    // Generate Flutter project
    const project = generator.generateProject(description, appName);
    
    // Simulate AI processing delay
    setTimeout(() => {
      res.json({
        success: true,
        projectId: project.projectId,
        appName: project.appName,
        packageName: project.packageName,
        features: project.features,
        message: 'RAHL has generated your Flutter app!',
        nextSteps: [
          'Download the project ZIP',
          'Open in VS Code/Android Studio',
          'Run "flutter pub get"',
          'Test on emulator/device'
        ],
        platforms: platform === 'both' ? ['android', 'ios'] : [platform]
      });
    }, 2000);
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Generation failed: ' + error.message });
  }
});

// Download project endpoint
app.get('/api/download/:projectId', (req, res) => {
  const { projectId } = req.params;
  
  // In production, this would serve a ZIP file
  res.json({
    projectId,
    downloadUrl: `/api/projects/${projectId}.zip`,
    files: [
      'pubspec.yaml',
      'lib/main.dart',
      'android/app/src/main/AndroidManifest.xml',
      'ios/Runner/Info.plist',
      'README.md'
    ],
    instructions: 'Run "flutter pub get" then "flutter run"'
  });
});
