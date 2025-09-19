import { useHotkeys as useHotkeysHook } from 'react-hotkeys-hook';
import { useDialerStore } from '../store/dialerStore';
import { Disposition } from '../constants';
import { dialerService } from '../services/dialer';
import toast from 'react-hot-toast';

export function useHotkeys() {
  const {
    showDispositionModal,
    dispositionData,
    selectedDisposition,
    confirmChecked,
    sessionId,
    setSelectedDisposition,
    setConfirmChecked,
    hideDisposition,
    incrementDispositionCount
  } = useDialerStore();
  
  // Disposition hotkeys (1-6)
  useHotkeysHook('1', () => {
    if (showDispositionModal) {
      setSelectedDisposition(Disposition.VM_OR_NA_UNKNOWN);
    }
  }, [showDispositionModal]);
  
  useHotkeysHook('2', () => {
    if (showDispositionModal) {
      setSelectedDisposition(Disposition.WRONG_OR_DISCONNECTED);
    }
  }, [showDispositionModal]);
  
  useHotkeysHook('3', () => {
    if (showDispositionModal) {
      setSelectedDisposition(Disposition.CURRENT_CLIENT);
    }
  }, [showDispositionModal]);
  
  useHotkeysHook('4', () => {
    if (showDispositionModal) {
      setSelectedDisposition(Disposition.VM_SAME_NAME_UNCONFIRMED);
    }
  }, [showDispositionModal]);
  
  useHotkeysHook('5', () => {
    if (showDispositionModal) {
      setSelectedDisposition(Disposition.CORRECT_NUMBER);
    }
  }, [showDispositionModal]);
  
  useHotkeysHook('6', () => {
    if (showDispositionModal) {
      setSelectedDisposition(Disposition.NO_ANSWER);
    }
  }, [showDispositionModal]);
  
  // Space to toggle confirm checkbox
  useHotkeysHook('space', (e) => {
    if (showDispositionModal) {
      e.preventDefault();
      setConfirmChecked(!confirmChecked);
    }
  }, [showDispositionModal, confirmChecked]);
  
  // Enter to submit disposition
  useHotkeysHook('enter', async (e) => {
    if (showDispositionModal && selectedDisposition && confirmChecked && dispositionData && sessionId) {
      e.preventDefault();
      
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
        const state = useDialerStore.getState();
        if (state.readyState === 'PLAY') {
          await dialerService.dial(sessionId);
        }
      } catch (error) {
        console.error('Failed to submit disposition:', error);
        toast.error('Failed to submit disposition');
      }
    }
  }, [showDispositionModal, selectedDisposition, confirmChecked, dispositionData, sessionId]);
  
  // ESC to close modal
  useHotkeysHook('escape', () => {
    if (showDispositionModal) {
      hideDisposition();
    }
  }, [showDispositionModal]);
}