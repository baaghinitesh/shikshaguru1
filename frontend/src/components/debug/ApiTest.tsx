import React, { useState, useEffect } from 'react';
import { testApiConnectivity } from '@/config/api';

interface ApiStatus {
  url: string;
  status: 'testing' | 'success' | 'failed';
  error?: string;
}

export const ApiTest: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [currentWorkingUrl, setCurrentWorkingUrl] = useState<string>('');

  useEffect(() => {
    testConnectivity();
  }, []);

  const testConnectivity = async () => {
    const testUrls = [
      'http://172.17.0.45:5001',
      `${window.location.protocol}//${window.location.hostname}:5001`,
      'http://localhost:5001'
    ];

    // Initialize all as testing
    setApiStatuses(testUrls.map(url => ({ url, status: 'testing' })));

    const results: ApiStatus[] = [];

    for (const baseUrl of testUrls) {
      try {
        console.log(`Testing ${baseUrl}/health...`);
        const response = await fetch(`${baseUrl}/health`, { 
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          results.push({ url: baseUrl, status: 'success' });
          if (!currentWorkingUrl) {
            setCurrentWorkingUrl(baseUrl);
          }
        } else {
          results.push({ 
            url: baseUrl, 
            status: 'failed', 
            error: `HTTP ${response.status}` 
          });
        }
      } catch (error: any) {
        results.push({ 
          url: baseUrl, 
          status: 'failed', 
          error: error.message || 'Network error' 
        });
      }
    }

    setApiStatuses(results);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing': return '🔄';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">API Connectivity</h3>
        <button 
          onClick={testConnectivity}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Retest
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-gray-600">
          <strong>Current URL:</strong> {currentWorkingUrl || 'None working'}
        </div>
        
        <div className="text-xs text-gray-600">
          <strong>Frontend:</strong> {window.location.origin}
        </div>
        
        <div className="border-t pt-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Backend Tests:</div>
          {apiStatuses.map((status, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="truncate flex-1 mr-2">{status.url}</span>
              <span className="flex items-center">
                {getStatusIcon(status.status)}
                {status.error && (
                  <span className="ml-1 text-red-600 text-xs">{status.error}</span>
                )}
              </span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-2 text-xs text-gray-500">
          <div><strong>Hostname:</strong> {window.location.hostname}</div>
          <div><strong>Port:</strong> {window.location.port}</div>
          <div><strong>Protocol:</strong> {window.location.protocol}</div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;