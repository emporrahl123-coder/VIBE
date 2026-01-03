const AIService = require('./services/ai-service');

async function testAI() {
  console.log('🧪 Testing RAHL AI Integration...\n');
  
  const aiService = new AIService();
  
  const testDescriptions = [
    "A meditation app with timer and calming sounds",
    "Grocery list app that syncs between family members",
    "Fitness tracker with workout plans and progress charts"
  ];
  
  for (const desc of testDescriptions) {
    console.log(`📝 Testing: "${desc}"`);
    console.log('─'.repeat(50));
    
    try {
      const analysis = await aiService.analyzeDescription(desc);
      
      console.log(`✅ App Name: ${analysis.appName}`);
      console.log(`📱 Screens: ${analysis.screens?.join(', ')}`);
      console.log(`🎯 Target: ${analysis.targetAudience}`);
      console.log(`⚡ Complexity: ${analysis.complexity}`);
      console.log(`🔧 Features:`);
      
      Object.entries(analysis.features || {}).forEach(([key, value]) => {
        if (value === true) {
          console.log(`   • ${key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}`);
        }
      });
      
      console.log('\n');
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('\n');
    }
  }
  
  console.log('🎉 AI Test Complete!');
}

// Run test if called directly
if (require.main === module) {
  testAI();
}

module.exports = testAI;
