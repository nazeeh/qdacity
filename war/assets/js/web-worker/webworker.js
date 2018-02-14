// handle messages from the client
self.onmessage = (event) => {
	console.log('Received a message in webworker.js');
	const result = event.data.firstNum + event.data.secondNum;
	self.postMessage(result);
};