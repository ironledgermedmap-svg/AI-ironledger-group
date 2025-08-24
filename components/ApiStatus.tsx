import React, { useState, useEffect } from 'react';
import { aiService } from '../src/utils/aiService';

export const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      setStatus('checking');
      
      if (!aiService.isAvailable()) {
        setStatus('unavailable');
        return;
      }

      try {
        const isWorking = await aiService.testConnection();
        setTestResult(isWorking);
        setStatus('available');
      } catch (error) {
        console.error('API status check failed:', error);
        setStatus('unavailable');
      }
    };

    checkStatus();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'checking': return 'text-yellow-400';
      case 'available': return 'text-green-400';
      case 'unavailable': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '🔄';
      case 'available': return '✅';
      case 'unavailable': return '❌';
      default: return '❓';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking': return 'Checking AI service...';
      case 'available': return testResult ? 'AI service ready' : 'AI service available (not tested)';
      case 'unavailable': return 'AI service unavailable - using templates';
      default: return 'Unknown status';
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
      <span>{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
    </div>
  );
};
