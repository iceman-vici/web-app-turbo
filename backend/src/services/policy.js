const { config } = require('../config');
const { Disposition, PhoneStatus, SkipReason } = require('../constants');
const { logger } = require('../utils/logger');
const { addMinutes } = require('date-fns');

class PolicyManager {
  constructor() {
    this.policies = config.policies;
  }
  
  // Get disposition mapping
  getDispositionMapping(disposition) {
    const now = new Date();
    
    switch (disposition) {
      case Disposition.VM_OR_NA_UNKNOWN:
        return {
          disposition,
          phoneStatus: PhoneStatus.VOICEMAIL,
          color: config.policies.statusColors.voicemail,
          nextRetryAt: addMinutes(now, this.policies.retryDelaysMin.vmOrNaUnknown)
        };
      
      case Disposition.WRONG_OR_DISCONNECTED:
        return {
          disposition,
          phoneStatus: PhoneStatus.WRONG,
          color: config.policies.statusColors.wrong
        };
      
      case Disposition.CURRENT_CLIENT:
        return {
          disposition,
          phoneStatus: PhoneStatus.CORRECT,
          color: config.policies.statusColors.currentClient
        };
      
      case Disposition.VM_SAME_NAME_UNCONFIRMED:
        return {
          disposition,
          phoneStatus: PhoneStatus.VOICEMAIL,
          color: '#DADA00',
          nextRetryAt: addMinutes(now, this.policies.retryDelaysMin.vmSameNameUnconfirmed)
        };
      
      case Disposition.CORRECT_NUMBER:
        return {
          disposition,
          phoneStatus: PhoneStatus.CORRECT,
          color: config.policies.statusColors.correct
        };
      
      case Disposition.NO_ANSWER:
        return {
          disposition,
          phoneStatus: PhoneStatus.NO_ANSWER,
          color: config.policies.statusColors.noAnswer,
          nextRetryAt: addMinutes(now, this.policies.retryDelaysMin.noAnswer)
        };
      
      default:
        throw new Error(`Unknown disposition: ${disposition}`);
    }
  }
  
  // Check if disposition triggers sibling skip
  shouldSkipSiblings(disposition) {
    return this.policies.selection.stopOnFirstCorrect &&
      (disposition === Disposition.CORRECT_NUMBER || 
       disposition === Disposition.CURRENT_CLIENT);
  }
  
  // Check if number can be dialed based on attempts
  canDialNumber(attemptCount) {
    return attemptCount < this.policies.selection.maxAttemptsPerPhone;
  }
  
  // Check if within call window
  isWithinCallWindow(timezone, now = new Date()) {
    if (!this.policies.selection.respectTimeWindows) {
      return true;
    }
    
    // This would be implemented with proper timezone handling
    // For now, simplified logic
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;
    
    const [startHour, startMin] = this.policies.defaultCallWindow.startLocal.split(':').map(Number);
    const [endHour, endMin] = this.policies.defaultCallWindow.endLocal.split(':').map(Number);
    
    const startTime = startHour * 100 + startMin;
    const endTime = endHour * 100 + endMin;
    
    if (endTime < startTime) {
      // Overnight window
      return currentTime >= startTime || currentTime < endTime;
    }
    
    return currentTime >= startTime && currentTime < endTime;
  }
  
  // Check if retry window has passed
  canRetryNow(nextRetryAt) {
    if (!this.policies.selection.respectNextRetryAt) {
      return true;
    }
    
    if (!nextRetryAt) {
      return true;
    }
    
    return new Date() >= nextRetryAt;
  }
  
  // Determine skip reason
  getSkipReason({
    attemptCount,
    nextRetryAt,
    timezone,
    hasSiblingCorrect
  }) {
    if (hasSiblingCorrect && this.policies.selection.stopOnFirstCorrect) {
      return SkipReason.SIBLING_CORRECT;
    }
    
    if (!this.canDialNumber(attemptCount)) {
      return SkipReason.MAX_ATTEMPTS;
    }
    
    if (timezone && !this.isWithinCallWindow(timezone)) {
      return SkipReason.OUTSIDE_WINDOW;
    }
    
    if (!this.canRetryNow(nextRetryAt)) {
      return SkipReason.RETRY_PENDING;
    }
    
    return null;
  }
  
  // Get all policies for frontend
  getAllPolicies() {
    return {
      ...this.policies,
      dispositionColors: this.getDispositionColors()
    };
  }
  
  // Get disposition colors for UI
  getDispositionColors() {
    return {
      [Disposition.VM_OR_NA_UNKNOWN]: config.policies.statusColors.voicemail,
      [Disposition.WRONG_OR_DISCONNECTED]: config.policies.statusColors.wrong,
      [Disposition.CURRENT_CLIENT]: config.policies.statusColors.currentClient,
      [Disposition.VM_SAME_NAME_UNCONFIRMED]: '#DADA00',
      [Disposition.CORRECT_NUMBER]: config.policies.statusColors.correct,
      [Disposition.NO_ANSWER]: config.policies.statusColors.noAnswer
    };
  }
  
  // Validate policy update
  validatePolicyUpdate(updates) {
    // Add validation logic here
    return true;
  }
  
  // Log policy decision
  logPolicyDecision(
    action,
    decision,
    reason,
    context
  ) {
    logger.debug('Policy decision', {
      action,
      decision,
      reason,
      context,
      policies: this.policies
    });
  }
}

module.exports = { PolicyManager };