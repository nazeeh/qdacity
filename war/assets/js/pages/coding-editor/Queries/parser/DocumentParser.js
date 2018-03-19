import cheerio from 'cheerio';

import CodingOverlap from '../data/CodingOverlap.js';
import CodingOverlapResult from '../data/CodingOverlapResult.js';

export default class DocumentParser {
    
	constructor() {
        this.selectedCode = null;
        this.codingOverlapResult = null;
        this.allCodings = null;
    }
    
    parseDocuments(selectedCode, documents) {
        this.selectedCode = selectedCode
        this.codingOverlapResult = new CodingOverlapResult(this.selectedCode);
        this.allCodings = null;

		if (documents) {
			for (let i = 0; i < documents.length; i++) {
				let document = documents[i];

                this.parseDocument(document);
			}
		}

		return this.codingOverlapResult;
    }

    parseDocument(document) {
        const $ = cheerio.load(document.text);

        this.allCodings = $('coding');

        const codingGroups = this.getCodingGroups();

        // Evaluate coding groups
        for (let i = 0; i < codingGroups.length; i++) {
            let codingGroup = codingGroups[i];

            // Evaluate coding which belongs to the selected code
            let mainCoding = null;

            for (let j = 0; j < codingGroup.length; j++) {
                let coding = codingGroup[j];

                if (coding.attribs.code_id == this.selectedCode.codeID) {
                    mainCoding = coding;
                    break;
                }
            }

            // Evaluate other codings
            for (let j = 0; j < codingGroup.length; j++) {
                let coding = codingGroup[j];

                // Skip selected code
                if (coding.attribs.code_id != this.selectedCode.codeID) {                
                    this.evaluateCoding(mainCoding, coding);
                }
            }
        }
    }
    
    getCodingGroups() {
        // Find root codings
        const rootCodings = this.getRootCodings();

        // Collect siblings and create coding groups
        const codingGroups = this.buildCodingGroups(rootCodings);

        // Remove all groups that dont contain the selected code
        return this.filterCodingGroups(codingGroups);
    }

    buildCodingGroups(rootCodings) {
        const codingGroups = [];

        for (let i = 0; i < rootCodings.length; i++) {
            let rootCoding = rootCodings[i];

            let codings = this.getSiblings(rootCoding);
            codings.push(rootCoding);

            codingGroups.push(codings);
        }

        return codingGroups;
    }

    filterCodingGroups(codingGroups) {
        return codingGroups.filter((codingGroup, index) => {
            for (let i = 0; i < codingGroup.length; i++) {
                let coding = codingGroup[i];
                
                if (coding.attribs.code_id == this.selectedCode.codeID) {
                    return true;
                }
            }
            return false;
        });
    }

    evaluateCoding(mainCoding, coding) {
        const codeKey = coding.attribs.code_id.toString();
        const codingOverlapKey = mainCoding.attribs.id + '_' + coding.attribs.id;

        // Overlapping codings can have multiple entries
        const exists = this.codingOverlapResult.hasCodingOverlap(codeKey, codingOverlapKey);

        if (!exists) {
            const codingOverlap = new CodingOverlap(
                codingOverlapKey,
                this.getCodingText(mainCoding.attribs.id),
                this.getCodingText(coding.attribs.id),
                this.getOverlappingText(mainCoding.attribs.id, coding.attribs.id)
            );
            this.codingOverlapResult.addCodingOverlap(codeKey, codingOverlap);
        }
    }

    getRootCodings() {
        return this.allCodings.filter((index, coding) => {
            return coding.parent && coding.parent.name && coding.parent.name == 'p';
        });
    }

    getCodingsByCodingId(codingId) {
        return this.allCodings.filter((index, coding) => {
            return coding.attribs.id == codingId;
        });
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

    getCodingText(codingId) {
        let text = '';
            
        let filteredCodings = this.getCodingsByCodingId(codingId);

        for (let i = 0; i < filteredCodings.length; i++) {
            const textNode = this.getTextNode(filteredCodings[i]);
            text += textNode.data;
        }

        return text;
    }

    getOverlappingText(codingId1, codingId2) {
        const _this = this;

        let text = '';
            
        let elements = this.getCodingsByCodingId(codingId1);

        // Filter relevant nodes
        let filteredElements = elements.filter((index, coding) => {
            const siblings = _this.getSiblings(coding);

            for (let i = 0; i < siblings.length; i++) {
                let sibling = siblings[i];

                if (sibling.attribs.id == codingId2) {
                    return true;
                }
            }
            return false;
        });

        // Build text
        for (let i = 0; i < filteredElements.length; i++) {
            const textNode = this.getTextNode(filteredElements[i]);
            text += textNode.data;
        }

        return text;
    }
    
    getTextNode(coding) {
        if (coding.children != null) {
            if (coding.children.length != 1) {
                throw new Error('Expected a different data format.');
            }
            return this.getTextNode(coding.children[0]);
        }

        if (coding.type == 'text') {
            return coding;
        }
        else {
            return null;
        }
    }
}
