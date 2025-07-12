import { useState, useEffect } from 'react';

const BackendStatus = () => {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    backendInfo: null
  });

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStatus({
            connected: true,
            loading: false,
            error: null,
            backendInfo: data
          });
        } else {
          throw new Error('Backend health check failed');
        }
      } catch (error) {
        setStatus({
          connected: false,
          loading: false,
          error: error.message,
          backendInfo: null
        });
      }
    };

    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (status.loading) {
    return (
      <div className="flex items-center space-x-2 text-yellow-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm">Checking backend connection...</span>
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm">Backend disconnected: {status.error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm">
        Backend connected - {status.backendInfo?.environment} mode
      </span>
    </div>
  );
};

export default BackendStatus;
