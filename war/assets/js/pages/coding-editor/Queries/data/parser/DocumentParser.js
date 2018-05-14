import cheerio from 'cheerio';

import CodingResult from '../CodingResult.js';
import CodingDocument from '../CodingDocument.js';
import CodingOverlapCollection from '../CodingOverlapCollection.js';
import CodingOverlap from '../CodingOverlap.js';
import CodingOverlapText from '../CodingOverlapText.js';
import CodingOverlapTextParagraph from '../CodingOverlapTextParagraph.js';
import CodingOverlapTextPart from '../CodingOverlapTextPart.js';

class CodingGroup {
	constructor(mainCoding, siblingCodings) {
		this.mainCoding = mainCoding;
		this.siblingCodings = siblingCodings;
	}

	getMainCoding() {
		return this.mainCoding;
	}

	getSiblingCodings() {
		return this.siblingCodings;
	}
}

export default class DocumentParser {
	constructor(code) {
		this.code = code;

		this.codingResult = new CodingResult(this.code);

		this.document = null;
		this.allCodings = null;
		this.allParagraphs = null;
		this.codingGroups = null;
		this.allCodeIds = null;
	}

	parseDocuments(documents) {
		if (documents) {
			for (let i = 0; i < documents.length; i++) {
				let document = documents[i];

				this.parseDocument(document);
			}
		}

		return this.codingResult;
	}

	parseDocument(document) {
		this.document = document;

		const $ = cheerio.load(this.document.text);

		this.allCodings = $('coding');
		this.allParagraphs = $('p');

		this.codingGroups = this.buildCodingGroups();

		this.allCodeIds = this.getAllCodeIds();

		// Init document
		this.codingResult.addDocument(
			new CodingDocument(
				this.document,
				this.getTotalCodingsCount(this.code.codeID)
			)
		);

		const codingDocument = this.codingResult.getDocument(document.id);

		for (let i = 0; i < this.allCodeIds.length; i++) {
			const codeId = this.allCodeIds[i];

			if (codeId != this.code.codeID) {
				codingDocument.createEntry(
					codeId,
					new CodingOverlapCollection(codeId, this.getTotalCodingsCount(codeId))
				);
			}
		}

		// Evaluate coding groups
		for (let i = 0; i < this.codingGroups.length; i++) {
			const codingGroup = this.codingGroups[i];

			const siblings = codingGroup.getSiblingCodings();

			// Evaluate other codings
			for (let j = 0; j < siblings.length; j++) {
				let sibling = siblings[j];

				this.evaluateCodingOverlap(codingGroup.getMainCoding(), sibling);
			}
		}
	}

	evaluateCodingOverlap(mainCoding, coding) {
		const codeId = coding.attribs.code_id;

		const codingIdMain = mainCoding.attribs.id;
		const codingIdOther = coding.attribs.id;

		const codingDocument = this.codingResult.getDocument(this.document.id);

		// Overlapping codings can have multiple entries
		const exists = codingDocument.hasCodingOverlap(
			codeId,
			codingIdMain,
			codingIdOther
		);

		if (!exists) {
			const codingOverlap = new CodingOverlap(codingIdMain, codingIdOther);

			const textContent = this.buildTextContent(
				codingIdMain,
				codingIdOther,
				codingOverlap
			);
			codingOverlap.setTextContent(textContent);

			codingDocument.addCodingOverlap(codeId, codingOverlap);
		}
	}

	buildCodingGroups() {
		// Find root codings
		const rootCodings = this.allCodings.filter((index, coding) => {
			return coding.parent && coding.parent.name && coding.parent.name == 'p';
		});

		// Build coding groups
		const codingGroups = [];

		for (let i = 0; i < rootCodings.length; i++) {
			const rootCoding = rootCodings[i];

			// Get all codings
			const codings = this.getSiblings(rootCoding);
			codings.push(rootCoding);

			// Find main coding and siblings
			let mainCoding = null;
			let siblings = [];

			for (let j = 0; j < codings.length; j++) {
				let coding = codings[j];

				if (coding.attribs.code_id == this.code.codeID) {
					mainCoding = coding;
				} else {
					siblings.push(coding);
				}
			}

			// Skip the coding group
			// Only return codingGroups which belong to the main code
			if (mainCoding == null || siblings.length != codings.length - 1) {
				continue;
			}

			// Create coding group
			const codingGroup = new CodingGroup(mainCoding, siblings);
			codingGroups.push(codingGroup);
		}

		return codingGroups;
	}

	buildTextContent(codingIdMain, codingIdOther, codingOverlap) {
		// Get relevant paragraphs
		let relevantParagraphs = this.allParagraphs.filter((index, paragraph) => {
			const isValidCoding = element => {
				return element.name && element.name == 'coding';
			};

			const evaluateElement = element => {
				if (isValidCoding(element)) {
					if (
						element.attribs.id == codingIdMain ||
						element.attribs.id == codingIdOther
					) {
						return true;
					}
				}
				if (element.children) {
					for (let i = 0; i < element.children.length; i++) {
						if (isValidCoding(element.children[i])) {
							let result = evaluateElement(element.children[i]);

							if (result) {
								return true;
							}
						}
					}
				}

				return false;
			};

			return evaluateElement(paragraph);
		});

		const textContent = new CodingOverlapText(codingOverlap);

		// Evaluate paragraphs
		for (let i = 0; i < relevantParagraphs.length; i++) {
			const relevantParagraph = relevantParagraphs[i];

			const textParagraph = new CodingOverlapTextParagraph();

			for (let j = 0; j < relevantParagraph.children.length; j++) {
				const paragraphChild = relevantParagraph.children[j];

				// Find text node and all coding ids
				const findTextElement = (arr, element) => {
					if (element.type == 'text') {
						return element;
					} else if (element.name && element.name == 'coding') {
						arr.push(element.attribs.id);
					}

					if (element.children && element.children.length == 1) {
						return findTextElement(arr, element.children[0]);
					}
					return null;
				};

				const codingIds = [];
				const textElement = findTextElement(codingIds, paragraphChild);

				const textPart = new CodingOverlapTextPart(textElement.data, codingIds);

				textParagraph.addPart(textPart);
			}

			textContent.addParagraph(textParagraph);
		}

		return textContent;
	}

	getCodingsByCodeId(codeId) {
		return this.allCodings.filter((index, coding) => {
			return coding.attribs.code_id == codeId;
		});
	}

	getAllCodeIds() {
		let uniqueIds = new Set();

		for (let i = 0; i < this.allCodings.length; i++) {
			uniqueIds.add(this.allCodings[i].attribs.code_id);
		}

		return Array.from(uniqueIds);
	}

	getTotalCodingsCount(codeId) {
		let elements = this.getCodingsByCodeId(codeId);

		let uniqueIds = new Set();

		for (let i = 0; i < elements.length; i++) {
			uniqueIds.add(elements[i].attribs.id);
		}

		return uniqueIds.size;
	}

	getSiblings(coding) {
		const searchParents = (arr, currentCoding) => {
			const parent = currentCoding.parent;

			if (parent && parent.name == 'coding') {
				arr.push(parent);

				searchParents(arr, parent);
			}
		};
		const searchChildren = (arr, currentCoding) => {
			if (currentCoding.children) {
				for (let i = 0; i < currentCoding.children.length; i++) {
					const child = currentCoding.children[i];

					if (child.name == 'coding') {
						arr.push(child);

						searchChildren(arr, child);
					}
				}
			}
		};

		const siblings = [];
		searchParents(siblings, coding);
		searchChildren(siblings, coding);

		return siblings;
	}
}
