// Hotkey manager for power dialer shortcuts
export const HOTKEYS = {
  // Session controls
  START_SESSION: 's',
  PAUSE_RESUME: ' ', // spacebar
  STOP_SESSION: 'Escape',
  
  // Disposition shortcuts
  DISPO_CONNECTED: '1',
  DISPO_NO_ANSWER: '2',
  DISPO_VOICEMAIL: '3',
  DISPO_CALLBACK: '4',
  DISPO_DO_NOT_CALL: '5',
  
  // Navigation
  SKIP_NUMBER: 'n',
  PREVIOUS_NUMBER: 'p',
  
  // View toggles
  TOGGLE_STATS: 't',
  TOGGLE_HISTORY: 'h',
  TOGGLE_NOTES: 'o',
  
  // Utility
  MUTE_UNMUTE: 'm',
  VOLUME_UP: '+',
  VOLUME_DOWN: '-'
};

export const registerHotkey = (key, handler, options = {}) => {
  const { 
    ctrlKey = false, 
    shiftKey = false, 
    altKey = false,
    preventDefault = true 
  } = options;

  const listener = (event) => {
    if (
      event.key === key &&
      event.ctrlKey === ctrlKey &&
      event.shiftKey === shiftKey &&
      event.altKey === altKey
    ) {
      if (preventDefault) {
        event.preventDefault();
      }
      handler(event);
    }
  };

  document.addEventListener('keydown', listener);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', listener);
  };
};

export const registerMultipleHotkeys = (hotkeys) => {
  const cleanupFunctions = hotkeys.map(({ key, handler, options }) => 
    registerHotkey(key, handler, options)
  );
  
  // Return cleanup function for all hotkeys
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};