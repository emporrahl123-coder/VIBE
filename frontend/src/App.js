import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectStatus, setProjectStatus] = useState(null);
  const [step, setStep] = useState(1); // 1: Describe, 2: Generate, 3: Download
  const messagesEndRef = useRef(null);

  const initialMessage = {
    id: 1,
    text: "👋 **Hello! I'm RAHL AI**\n\nDescribe the app you want to create in plain English, and I'll generate a complete Flutter app for both Android & iOS!\n\n*Examples:*\n- \"A todo list app with dark mode\"\n- \"A recipe app with categories and favorites\"\n- \"A fitness tracker with workout logs\"",
    sender: 'ai',
    timestamp: new Date()
  };

  useEffect(() => {
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);
    setStep(2);

    // Add AI thinking message
    const thinkingMessage = {
      id: messages.length + 2,
      text: "🤔 **RAHL is thinking...**\nAnalyzing your description and planning your app structure.",
      sender: 'ai',
      timestamp: new Date(),
      isThinking: true
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate/v2`, {
        description: inputText,
        appName: `RAHL_${Date.now().toString().slice(-4)}`,
        platform: 'both'
      });

      // Remove thinking message and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isThinking);
        return [...filtered, {
          id: filtered.length + 1,
          text: `🎉 **App Generation Started!**\n\n**Project ID:** ${response.data.projectId}\n**App Name:** ${response.data.appName}\n**Platforms:** ${response.data.platforms.join(' + ')}\n\n**Features detected:**\n${response.data.features.screens.map(s => `• ${s}`).join('\n')}\n\n${response.data.features.hasLogin ? '• User login system\n' : ''}${response.data.features.hasCamera ? '• Camera access\n' : ''}${response.data.features.hasMaps ? '• Maps integration\n' : ''}\n**Next:** Building your project...`,
          sender: 'ai',
          timestamp: new Date()
        }];
      });

      setCurrentProject(response.data);
      checkProjectStatus(response.data.projectId);
      
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isThinking);
        return [...filtered, {
          id: filtered.length + 1,
          text: "❌ **Sorry, there was an error generating your app.**\n\nPlease try again or simplify your description.",
          sender: 'ai',
          timestamp: new Date()
        }];
      });
      setIsGenerating(false);
    }
  };

  const checkProjectStatus = async (projectId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/project/${projectId}`);
      setProjectStatus(response.data);
      
      if (response.data.progress >= 100) {
        setIsGenerating(false);
        setStep(3);
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: `✅ **Your app is ready!**\n\n**Project:** ${response.data.projectId}\n**Status:** Complete\n**Files generated:**\n${response.data.logs.map(log => `• ${log}`).join('\n')}\n\nClick "Download Project" to get your complete Flutter app.`,
          sender: 'ai',
          timestamp: new Date()
        }]);
      } else {
        // Continue polling
        setTimeout(() => checkProjectStatus(projectId), 2000);
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const handleDownload = async () => {
    if (!currentProject) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download/${currentProject.projectId}`);
      alert(`Download ready! Files:\n${response.data.files.join('\n')}\n\n${response.data.instructions}`);
      
      // Reset for new app
      setMessages([initialMessage]);
      setCurrentProject(null);
      setProjectStatus(null);
      setStep(1);
      setIsGenerating(false);
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  const exampleDescriptions = [
    "A meditation app with timer and calming sounds",
    "Grocery list app that syncs between devices",
    "Daily journal with mood tracking",
    "Event countdown app with notifications",
    "Flashcard app for studying",
    "Water drinking reminder app",
    "Expense tracker with categories"
  ];

  const handleExampleClick = (example) => {
    setInputText(example);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-rahl-primary to-rahl-secondary p-2 rounded-xl">
                <RocketLaunchIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RAHL</h1>
                <p className="text-sm text-gray-600">Rapid App Helper & Launcher</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                <DevicePhoneMobileIcon className="h-4 w-4 inline mr-1" />
                Android + iOS
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                <CodeBracketIcon className="h-4 w-4 inline mr-1" />
                Flutter
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center mb-8">
          {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                  ${step >= stepNum 
                    ? 'bg-rahl-primary text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  {stepNum === 1 && '💬'}
                  {stepNum === 2 && '⚡'}
                  {stepNum === 3 && '📦'}
                </div>
                <span className="mt-2 text-sm font-medium">
                  {stepNum === 1 && 'Describe'}
                  {stepNum === 2 && 'Generate'}
                  {stepNum === 3 && 'Download'}
                </span>
              </div>
              {stepNum < 3 && (
                <div className={`
                  w-24 h-1 mx-4
                  ${step > stepNum ? 'bg-rahl-primary' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="card h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-rahl-primary mr-2" />
                  <h2 className="text-xl font-bold">Describe Your App</h2>
                </div>
                <div className="flex items-center">
                  <SparklesIcon className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">RAHL AI</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-2 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                      <ReactMarkdown className="prose prose-sm max-w-none">
                        {message.text}
                      </ReactMarkdown>
                      <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Describe your app idea here..."
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rahl-primary transition-colors"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isGenerating}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>
                
                {/* Quick Examples */}
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleDescriptions.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(example)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg transition-colors"
                        disabled={isGenerating}
                      >
                        {example.length > 40 ? example.substring(0, 40) + '...' : example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Project Info */}
          <div className="space-y-6">
            {/* Current Project Card */}
            {currentProject && (
              <div className="card">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <RocketLaunchIcon className="h-5 w-5 text-rahl-primary mr-2" />
                  Current Project
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Project ID</label>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded-lg">{currentProject.projectId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">App Name</label>
                    <p className="font-semibold">{currentProject.appName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Package Name</label>
                    <p className="font-mono text-sm">{currentProject.packageName}</p>
                  </div>
                  
                  {projectStatus && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Generation Progress</span>
                        <span>{projectStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-rahl-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${projectStatus.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {step === 3 && (
                    <button
                      onClick={handleDownload}
                      className="w-full btn-primary mt-4 flex items-center justify-center"
                    >
                      <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                      Download Project
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Features Card */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">✨ RAHL Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Zero Code</strong> - No programming needed</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Cross-Platform</strong> - Android & iOS from one description</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Cloud Build</strong> - No software installation required</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Publishing Ready</strong> - Includes store assets & configs</span>
                </li>
              </ul>
            </div>

            {/* Stats Card */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">📊 Generation Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-rahl-primary">~45s</div>
                  <div className="text-sm text-gray-600">Generation Time</div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-rahl-secondary">2</div>
                  <div className="text-sm text-gray-600">Platforms</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">5+</div>
                  <div className="text-sm text-gray-600">Files Created</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">100%</div>
                  <div className="text-sm text-gray-600">No-Code</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">
            <strong>RAHL</strong> - Rapid App Helper & Launcher • Making app development accessible to everyone
          </p>
          <p className="text-sm">
            Generated apps use Flutter • Cloud build system • No coding experience required
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
