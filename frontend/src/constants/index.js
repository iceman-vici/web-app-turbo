export const ReadyState = {
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  STOP: 'STOP'
};

export const Disposition = {
  VM_OR_NA_UNKNOWN: 'VM_OR_NA_UNKNOWN',
  WRONG_OR_DISCONNECTED: 'WRONG_OR_DISCONNECTED',
  CURRENT_CLIENT: 'CURRENT_CLIENT',
  VM_SAME_NAME_UNCONFIRMED: 'VM_SAME_NAME_UNCONFIRMED',
  CORRECT_NUMBER: 'CORRECT_NUMBER',
  NO_ANSWER: 'NO_ANSWER'
};

export const DispositionLabels = {
  [Disposition.VM_OR_NA_UNKNOWN]: 'Voicemail / NA (Unknown)',
  [Disposition.WRONG_OR_DISCONNECTED]: 'Wrong / Disconnected',
  [Disposition.CURRENT_CLIENT]: 'Current Client',
  [Disposition.VM_SAME_NAME_UNCONFIRMED]: 'VM (Same Name)',
  [Disposition.CORRECT_NUMBER]: 'Correct Number',
  [Disposition.NO_ANSWER]: 'No Answer'
};

export const DispositionColors = {
  [Disposition.VM_OR_NA_UNKNOWN]: '#6C97DD',
  [Disposition.WRONG_OR_DISCONNECTED]: '#C07772',
  [Disposition.CURRENT_CLIENT]: '#F09001',
  [Disposition.VM_SAME_NAME_UNCONFIRMED]: '#DADA00',
  [Disposition.CORRECT_NUMBER]: '#4AA031',
  [Disposition.NO_ANSWER]: '#6AC4CB'
};