// Messages that might come in from the user
const MSG = {
  USER: {
    UPDATE: 'user.update',
  },
  CODE: {
    INSERT: 'code.insert',
    RELOCATE: 'code.relocate',
    REMOVE: 'code.remove',
    UPDATE: 'code.update',
  },
  DOCUMENT: {
    APPLY_CODE: 'document.applyCode',
  },
};

// Events that might be sent to the users
const EVT = {
  USER: {
    CONNECTED: 'user.connected',
    UPDATED: 'user.updated',
  },
  CODE: {
    INSERTED: 'code.inserted',
    RELOCATED: 'code.relocated',
    REMOVED: 'code.removed',
    UPDATED: 'code.updated',
  },
  DOCUMENT: {
    CODE_APPLIED: 'document.codeApplied',
  },
};

module.exports = {
  MSG,
  EVT,
};
