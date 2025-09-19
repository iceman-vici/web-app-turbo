import React from 'react';
import { Activity, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useDialerStore } from '../store/dialerStore';
import { DispositionLabels } from '../constants';

export function SessionInfo() {
  const {
    sessionId,
    spreadsheetId,
    tabId,
    callCount,
    dispositionCount,
    currentRowId,
    currentNumIndex
  } = useDialerStore();
  
  const totalDispositions = Object.values(dispositionCount).reduce((a, b) => a + b, 0);
  
  if (!sessionId) {
    return (
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Session Info</h3>
        <p className="text-gray-500 text-center py-8">
          No active session
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Session Info</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Session ID</span>
            <span className="text-sm font-mono">
              {sessionId.slice(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Spreadsheet</span>
            <span className="text-sm font-mono">
              {spreadsheetId?.slice(0, 8)}...
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tab</span>
            <span className="text-sm font-mono">{tabId}</span>
          </div>
          
          {currentRowId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Row</span>
              <span className="text-sm font-mono">
                {currentRowId} / #{currentNumIndex}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Phone className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold">{callCount}</p>
            <p className="text-sm text-gray-600">Calls Made</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold">{totalDispositions}</p>
            <p className="text-sm text-gray-600">Dispositions</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 mb-2">Disposition Breakdown</p>
          {Object.entries(dispositionCount).map(([key, value]) => {
            if (value === 0) return null;
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {DispositionLabels[key]}
                </span>
                <span className="font-medium">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={16} />
            <span className="text-sm">
              Success Rate: {callCount > 0 ? Math.round((dispositionCount.CORRECT_NUMBER / callCount) * 100) : 0}%
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <XCircle className="text-red-500" size={16} />
            <span className="text-sm">
              Wrong Numbers: {dispositionCount.WRONG_OR_DISCONNECTED}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="text-yellow-500" size={16} />
            <span className="text-sm">
              No Answer: {dispositionCount.NO_ANSWER}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}