import React, { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useDialerStore } from '../store/dialerStore';
import { dialerService } from '../services/dialer';
import { Disposition, DispositionLabels, DispositionColors } from '../constants';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export function DispositionModal() {
  const {
    showDispositionModal,
    dispositionData,
    selectedDisposition,
    confirmChecked,
    sessionId,
    readyState,
    setSelectedDisposition,
    setConfirmChecked,
    hideDisposition,
    incrementDispositionCount
  } = useDialerStore();
  
  const dispositions = Object.values(Disposition);
  
  const handleSubmit = async () => {
    if (!selectedDisposition || !confirmChecked || !dispositionData || !sessionId) {
      toast.error('Please select a disposition and confirm');
      return;
    }
    
    try {
      await dialerService.submitDisposition(
        sessionId,
        dispositionData.callId,
        dispositionData.rowId,
        dispositionData.numIndex,
        selectedDisposition
      );
      
      incrementDispositionCount(selectedDisposition);
      hideDisposition();
      toast.success('Disposition submitted');
      
      // Auto-dial next if in PLAY state
      if (readyState === 'PLAY') {
        await dialerService.dial(sessionId);
      }
    } catch (error) {
      console.error('Failed to submit disposition:', error);
      toast.error('Failed to submit disposition');
    }
  };
  
  useEffect(() => {
    // Reset state when modal opens
    if (showDispositionModal) {
      setSelectedDisposition(null);
      setConfirmChecked(false);
    }
  }, [showDispositionModal, setSelectedDisposition, setConfirmChecked]);
  
  return (
    <Dialog
      open={showDispositionModal}
      onClose={() => {}}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-bold">
              Call Disposition Required
            </Dialog.Title>
            <button
              onClick={hideDisposition}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
          
          {dispositionData && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium text-blue-900">
                Lead: {dispositionData.leadName || 'Unknown'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Row: {dispositionData.rowId} | Number #{dispositionData.numIndex}
              </p>
            </div>
          )}
          
          <div className="space-y-2 mb-6">
            {dispositions.map((disposition, index) => (
              <button
                key={disposition}
                onClick={() => setSelectedDisposition(disposition)}
                className={clsx(
                  'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                  {
                    'border-blue-500 bg-blue-50': selectedDisposition === disposition,
                    'border-gray-200 hover:border-gray-300': selectedDisposition !== disposition
                  }
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: DispositionColors[disposition] }}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium">
                      {DispositionLabels[disposition]}
                    </span>
                  </div>
                  {selectedDisposition === disposition && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">
                I confirm this disposition is correct
              </span>
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedDisposition || !confirmChecked}
              className="flex-1 btn-primary"
            >
              Submit (Enter)
            </button>
            <button
              onClick={hideDisposition}
              className="btn-secondary"
            >
              Cancel (Esc)
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Keyboard shortcuts: Press 1-6 to select, Space to confirm, Enter to submit
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}