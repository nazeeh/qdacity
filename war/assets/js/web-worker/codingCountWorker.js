
import cheerio from 'cheerio';

/*
* handle messages from the client
* expects documents and codeID as input parameters through the data attribute
* {
*  	documents: [{
*					text: String
*      			},
*		]
*  	codeID: Long
* }
*
* returns the number of times the code has been applied with unique coding id
*/
self.onmessage = (event) => {
	console.log('Received a message in codingCountWebWorker.js');
	var dict = {};
	// get input data from parameters passed as event data
	const documents = event.data.documents;
	const codeIDs = event.data.codeIDs;

	let codingMap = processCodingIDs(codeIDs, documents);
	// Send result as a message
	self.postMessage(codingMap);
};

function processCodingIDs(codeIDs, documents){
	let codingMap = new Map();

	for (let index in codeIDs) {
		console.log('Processing code ' + codeIDs[index]);
		const codeID  = codeIDs[index];
		const codingCount = calculateCodingCount(documents, codeID);
		codingMap.set(codeID, codingCount);
	}

	return codingMap;
}

function calculateCodingCount(documents, codeID){
	let uniqueIDs = new Set();
	// searching for coding instances in all documents
	for (let index in documents) {
		const $ = cheerio.load(documents[index].text);

		// get all coding tags for the codeID
		// When a coding spans multiple HTML blocks,
		// then there will be multiple elements with
		// the same ID
		let foundArray = $('coding[code_id=\'' + codeID + '\']');

		// put unique ids in set
		for (let i = 0; i < foundArray.length; i++) {
			uniqueIDs.add(foundArray[i].attribs.id);
		}
	}
	return uniqueIDs.size;
}