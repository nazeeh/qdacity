// Messages that might come in from the user
const MSG = {
	USER: {
		UPDATE: 'user.update',
	},
};

// Events that might be sent to the users
const EVT = {
	USER: {
		CONNECTED: 'user.connected',
		UPDATED: 'user.updated',
	},
};

module.exports = {
	MSG,
	EVT,
};