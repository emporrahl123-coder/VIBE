const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import services
const FlutterGenerator = require('./flutter-generator');
const AIService = require('./services/ai-service');

const generator = new FlutterGenerator();
const aiService = new AIService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active projects (in production, use database)
const activeProjects = new Map();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'RAHL AI Backend',
    status: 'running',
    version: '1.0.0',
    aiEnabled: !!process.env.OPENAI_API_KEY
  });
});

// AI Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'App description is required' });
    }

    console.log('🔍 Analyzing description:', description.substring(0, 100));
    
    const analysis = await aiService.analyzeDescription(description);
    
    res.json({
      success: true,
      analysis,
      message: 'AI analysis complete'
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'AI analysis failed',
      details: error.message 
    });
  }
});

// Enhanced generate endpoint with AI
app.post('/api/generate/ai', async (req, res) => {
  try {
    const { description, appName, platform = 'both' } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'App description is required' });
    }

    const projectId = 'rahl_ai_' + Date.now();
    
    // Store project in memory
    activeProjects.set(projectId, {
      id: projectId,
      status: 'analyzing',
      progress: 10,
      description,
      createdAt: new Date()
    });

    // Immediate response
    res.json({
      success: true,
      projectId,
      message: 'AI is analyzing your app description...',
      nextSteps: [
        'Analyzing requirements',
        'Designing architecture',
        'Generating Flutter code',
        'Setting up project structure'
      ],
      estimatedTime: '30-60 seconds'
    });

    // Async processing
    processProjectAsync(projectId, description, appName);
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Generation failed: ' + error.message });
  }
});

async function processProjectAsync(projectId, description, customAppName) {
  try {
    const project = activeProjects.get(projectId);
    project.status = 'analyzing';
    project.progress = 25;
    
    // Step 1: AI Analysis
    const analysis = await aiService.analyzeDescription(description);
    
    project.status = 'generating';
    project.progress = 50;
    project.analysis = analysis;
    
    // Use custom name or AI-generated name
    project.appName = customAppName || analysis.appName;
    project.packageName = analysis.packageName;
    
    // Step 2: Generate code snippets
    project.status = 'coding';
    project.progress = 75;
    
    const codeSnippets = await aiService.generateCodeSnippets(analysis);
    project.codeSnippets = codeSnippets;
    
    // Step 3: Generate full project
    project.status = 'building';
    project.progress = 90;
    
    const flutterProject = generator.generateProject(description, project.appName);
    project.files = flutterProject.files;
    project.features = flutterProject.features;
    
    // Enhance with AI-generated code
    project.files['lib/main.dart'] = codeSnippets.main || project.files['lib/main.dart'];
    project.files['pubspec.yaml'] = codeSnippets.pubspec || project.files['pubspec.yaml'];
    
    // Add AI-generated screens
    for (const [screenName, code] of Object.entries(codeSnippets)) {
      if (screenName !== 'main' && screenName !== 'pubspec') {
        project.files[`lib/screens/${screenName.toLowerCase()}.dart`] = code;
      }
    }
    
    // Mark as complete
    project.status = 'completed';
    project.progress = 100;
    project.completedAt = new Date();
    project.downloadUrl = `/api/download/ai/${projectId}`;
    
    console.log(`✅ Project ${projectId} completed: ${project.appName}`);
    
  } catch (error) {
    console.error(`❌ Project ${projectId} failed:`, error);
    const project = activeProjects.get(projectId);
    project.status = 'failed';
    project.error = error.message;
  }
}

// Project status endpoint
app.get('/api/project/ai/:id', (req, res) => {
  const { id } = req.params;
  const project = activeProjects.get(id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Prepare response based on status
  const response = {
    projectId: id,
    status: project.status,
    progress: project.progress,
    appName: project.appName,
    packageName: project.packageName,
    downloadLinks: project.downloadUrl ? { 
      zip: project.downloadUrl,
      github: `https://github.com/rahl/project/${id}`
    } : {},
    logs: this.getStatusLogs(project.status),
    analysis: project.analysis || {},
    estimatedTime: this.getEstimatedTime(project.status)
  };
  
  res.json(response);
});

// Download AI project
app.get('/api/download/ai/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const project = activeProjects.get(projectId);
  
  if (!project || project.status !== 'completed') {
    return res.status(404).json({ error: 'Project not ready or not found' });
  }
  
  // In production, this would generate and serve a ZIP file
  res.json({
    projectId,
    appName: project.appName,
    files: Object.keys(project.files || {}),
    codeSnippets: Object.keys(project.codeSnippets || {}),
    downloadInstructions: `
1. Create a new Flutter project: flutter create ${project.appName.toLowerCase().replace(/\s+/g, '_')}
2. Replace files with the generated ones
3. Run: flutter pub get
4. Run: flutter run

For iOS: Requires macOS with Xcode
For Android: Requires Android Studio or VS Code
    `,
    nextSteps: [
      'Review the generated code',
      'Test on emulator/device',
      'Customize as needed',
      'Prepare for store submission'
    ]
  });
});

// Helper functions
function getStatusLogs(status) {
  const logs = {
    analyzing: ['Analyzing description...', 'Identifying features...', 'Planning architecture...'],
    generating: ['Generating UI components...', 'Creating screens...', 'Setting up navigation...'],
    coding: ['Writing Dart code...', 'Generating widgets...', 'Adding business logic...'],
    building: ['Configuring pubspec.yaml...', 'Setting up Android manifest...', 'Configuring iOS info.plist...'],
    completed: ['Project generated successfully!', 'All files created.', 'Ready for download.'],
    failed: ['Generation failed.', 'Please try again with a simpler description.']
  };
  
  return logs[status] || ['Processing...'];
}

function getEstimatedTime(status) {
  const times = {
    analyzing: '10 seconds',
    generating: '20 seconds',
    coding: '15 seconds',
    building: '10 seconds',
    completed: 'Ready',
    failed: 'Failed'
  };
  
  return times[status] || 'Unknown';
}

// Update existing endpoints to use AI
app.post('/api/generate/v3', async (req, res) => {
  try {
    const { description, appName } = req.body;
    
    // First get AI analysis
    const analysis = await aiService.analyzeDescription(description);
    
    // Then generate project
    const project = generator.generateProject(description, appName || analysis.appName);
    
    // Merge AI insights
    project.aiAnalysis = analysis;
    project.generatedAt = new Date();
    project.rahlVersion = '1.0.0';
    
    res.json({
      success: true,
      projectId: project.projectId,
      appName: project.appName,
      packageName: project.packageName,
      analysis: analysis,
      features: project.features,
      message: 'RAHL AI has generated your app!',
      insights: [
        `Target audience: ${analysis.targetAudience}`,
        `Complexity: ${analysis.complexity}`,
        `Estimated dev time: ${analysis.estimatedDevelopmentTime}`,
        `Recommended packages: ${analysis.dependencies.join(', ')}`
      ]
    });
    
  } catch (error) {
    console.error('V3 generation error:', error);
    // Fallback to non-AI version
    const project = generator.generateProject(req.body.description, req.body.appName);
    res.json({
      success: true,
      projectId: project.projectId,
      appName: project.appName,
      message: 'Generated with basic template (AI unavailable)',
      fallback: true
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RAHL AI Backend running on port ${PORT}`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
  console.log(`🤖 AI Status: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled (using fallback)'}`);
});
