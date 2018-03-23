// Messages that might come in from the client to the server
const MSG = {
	USER: {
		UPDATE: 'user.update'
	},
	CODE: {
		INSERT: 'code.insert',
		RELOCATE: 'code.relocate',
		REMOVE: 'code.remove',
		UPDATE: 'code.update'
	},
	CODING: {
		ADD: 'coding.add',
		REMOVE: 'coding.remove',
	},
};

// Events that might be sent to the client by the server
const EVT = {
	USER: {
		CONNECTED: 'user.connected',
		UPDATED: 'user.updated'
	},
	CODE: {
		INSERTED: 'code.inserted',
		RELOCATED: 'code.relocated',
		REMOVED: 'code.removed',
		UPDATED: 'code.updated'
	},
	CODING: {
		ADDED: 'coding.added',
		REMOVED: 'coding.removed',
	},
};

module.exports = {
	MSG,
	EVT
};
