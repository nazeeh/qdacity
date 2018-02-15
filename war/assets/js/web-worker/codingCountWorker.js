
import cheerio from 'cheerio';

/*
* handle messages from the client
* expects documents and codeIDs as input parameters through the data attribute
* {
*  	documents: [{
*					text: String
*      			},
*		]
*  	codeID: [Long]
* }
*
* returns a map with the codeIDs as keys and the codingCount as value
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

	const codingElements = getCodingsFromDocuments(documents);

	for (let index in codeIDs) {
		console.log('Processing code ' + codeIDs[index]);
		const codeID  = codeIDs[index];
		const codingCount = calculateCodingCount(codingElements, codeID);
		codingMap.set(codeID, codingCount);
	}

	return codingMap;
}

function getCodingsFromDocuments(documents){
	let codingElements = [];
	// searching for coding instances in all documents
	for (let index in documents) {
		const $ = cheerio.load(documents[index].text);
		let codings = $('coding');
		codingElements = codingElements.concat(codings.toArray());
	}

	return codingElements;
}

function calculateCodingCount(codingElements, codeID){

	let uniqueIDs = new Set();

	let foundArray= codingElements.filter((el)=>{
		return el.attribs.code_id === codeID
	});

	for (let i = 0; i < foundArray.length; i++) {
		uniqueIDs.add(foundArray[i].attribs.id);
	}

	return uniqueIDs.size;
}