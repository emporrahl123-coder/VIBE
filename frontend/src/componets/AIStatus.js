import React from 'react';
import { 
  CpuChipIcon, 
  SparklesIcon, 
  LightBulbIcon,
  BeakerIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const AIStatus = ({ analysis, status }) => {
  if (!analysis) return null;

  return (
    <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-center mb-4">
        <CpuChipIcon className="h-6 w-6 text-purple-600 mr-2" />
        <h3 className="text-lg font-bold text-gray-900">RAHL AI Analysis</h3>
        <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
          {status || 'Complete'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <SparklesIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
            <div>
              <p className="font-semibold">App Name</p>
              <p className="text-gray-700">{analysis.appName}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <p className="font-semibold">Complexity</p>
              <p className="text-gray-700 capitalize">{analysis.complexity}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <ChartBarIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <p className="font-semibold">Target Audience</p>
              <p className="text-gray-700">{analysis.targetAudience}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="font-semibold mb-1">Features Detected</p>
            <div className="flex flex-wrap gap-1">
              {analysis.features?.hasLogin && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Login</span>
              )}
              {analysis.features?.hasDatabase && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Database</span>
              )}
              {analysis.features?.hasCamera && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Camera</span>
              )}
              {analysis.features?.hasMaps && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Maps</span>
              )}
              {analysis.features?.hasNotifications && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Notifications</span>
              )}
            </div>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Screens</p>
            <div className="flex flex-wrap gap-1">
              {analysis.screens?.map((screen, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                  {screen}
                </span>
              ))}
            </div>
          </div>
          
          {analysis.recommendations && (
            <div>
              <p className="font-semibold mb-1 flex items-center">
                <BeakerIcon className="h-4 w-4 mr-1" />
                AI Recommendations
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-500 mr-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {analysis.estimatedDevelopmentTime && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">AI Estimate:</span> {analysis.estimatedDevelopmentTime} development time
          </p>
        </div>
      )}
    </div>
  );
};

export default AIStatus;
