import { create } from 'zustand';
import { ReadyState, Disposition, DispositionData } from '../types';

interface DialerState {
  // Session state
  sessionId: string | null;
  readyState: ReadyState;
  spreadsheetId: string | null;
  tabId: number | null;
  
  // Current call state
  currentCallId: string | null;
  currentRowId: string | null;
  currentNumIndex: number | null;
  currentLeadName: string | null;
  
  // Disposition modal state
  showDispositionModal: boolean;
  dispositionData: DispositionData | null;
  selectedDisposition: Disposition | null;
  confirmChecked: boolean;
  
  // Statistics
  callCount: number;
  dispositionCount: Record<Disposition, number>;
  
  // Actions
  setSession: (sessionId: string, spreadsheetId: string, tabId: number) => void;
  setReadyState: (state: ReadyState) => void;
  setCurrentCall: (callId: string, rowId: string, numIndex: number, leadName?: string) => void;
  clearCurrentCall: () => void;
  showDisposition: (data: DispositionData) => void;
  hideDisposition: () => void;
  setSelectedDisposition: (disposition: Disposition | null) => void;
  setConfirmChecked: (checked: boolean) => void;
  incrementCallCount: () => void;
  incrementDispositionCount: (disposition: Disposition) => void;
  reset: () => void;
}

const initialDispositionCount: Record<Disposition, number> = {
  [Disposition.VM_OR_NA_UNKNOWN]: 0,
  [Disposition.WRONG_OR_DISCONNECTED]: 0,
  [Disposition.CURRENT_CLIENT]: 0,
  [Disposition.VM_SAME_NAME_UNCONFIRMED]: 0,
  [Disposition.CORRECT_NUMBER]: 0,
  [Disposition.NO_ANSWER]: 0
};

export const useDialerStore = create<DialerState>((set) => ({
  // Initial state
  sessionId: null,
  readyState: ReadyState.STOP,
  spreadsheetId: null,
  tabId: null,
  currentCallId: null,
  currentRowId: null,
  currentNumIndex: null,
  currentLeadName: null,
  showDispositionModal: false,
  dispositionData: null,
  selectedDisposition: null,
  confirmChecked: false,
  callCount: 0,
  dispositionCount: { ...initialDispositionCount },
  
  // Actions
  setSession: (sessionId, spreadsheetId, tabId) =>
    set({ sessionId, spreadsheetId, tabId, readyState: ReadyState.PLAY }),
  
  setReadyState: (readyState) => set({ readyState }),
  
  setCurrentCall: (callId, rowId, numIndex, leadName) =>
    set({
      currentCallId: callId,
      currentRowId: rowId,
      currentNumIndex: numIndex,
      currentLeadName: leadName
    }),
  
  clearCurrentCall: () =>
    set({
      currentCallId: null,
      currentRowId: null,
      currentNumIndex: null,
      currentLeadName: null
    }),
  
  showDisposition: (data) =>
    set({
      showDispositionModal: true,
      dispositionData: data,
      selectedDisposition: null,
      confirmChecked: false
    }),
  
  hideDisposition: () =>
    set({
      showDispositionModal: false,
      dispositionData: null,
      selectedDisposition: null,
      confirmChecked: false
    }),
  
  setSelectedDisposition: (disposition) => set({ selectedDisposition: disposition }),
  
  setConfirmChecked: (checked) => set({ confirmChecked: checked }),
  
  incrementCallCount: () => set((state) => ({ callCount: state.callCount + 1 })),
  
  incrementDispositionCount: (disposition) =>
    set((state) => ({
      dispositionCount: {
        ...state.dispositionCount,
        [disposition]: state.dispositionCount[disposition] + 1
      }
    })),
  
  reset: () =>
    set({
      sessionId: null,
      readyState: ReadyState.STOP,
      spreadsheetId: null,
      tabId: null,
      currentCallId: null,
      currentRowId: null,
      currentNumIndex: null,
      currentLeadName: null,
      showDispositionModal: false,
      dispositionData: null,
      selectedDisposition: null,
      confirmChecked: false,
      callCount: 0,
      dispositionCount: { ...initialDispositionCount }
    })
}));