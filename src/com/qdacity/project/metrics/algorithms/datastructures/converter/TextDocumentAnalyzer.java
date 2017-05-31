package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.constants.TextDocumentConstants;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class TextDocumentAnalyzer {

    /**
     * Get the applied codes of a textDocument 
     * @param document one document to get the codes from
     * @param evalUnit which evaluation Unit
     * @return List of Strings containing the codes
     */
    public static List<String> split(TextDocument document, EvaluationUnit evalUnit) {
	//TODO revise this method!
	Document parsedDocument = Jsoup.parse(document.getText().getValue());
	Elements paragraphs = parsedDocument.select(TextDocumentConstants.PARAGRAPH_TAG);
	List<String> ratings = new ArrayList<>();
	if (evalUnit == EvaluationUnit.PARAGRAPH) {
	    for (int i = 0; i < paragraphs.size(); i++) {
		Elements codings = paragraphs.get(i).select(TextDocumentConstants.CODING_TAG);
		//TODO Units sind hier nicht eindeutig wenn z.B. ein User einen Code nicht gesetzt hat!! Andere DS n�tig!
		ratings.addAll(getAppliedCodes(codings)); //ACHTUNG: Hier kann es mehr als einen pro Unit geben!! ODER AUCH KEINEN
	    }
	} else {
	    throw new UnsupportedOperationException("Evaluation Unit not supported yet."); //TODO
	}

	return ratings;
    }

    /**
     * Maps the Applied Codes per Unit per Rater of one document (by different Raters)
     * @param sameDocumentsFromDifferentRaters List of Ids of a document by different Raters. It has to be the same document
     * @param evalUnit which evaluation Unit
     * @return A List of List containing the applied codes (String List) per unit.
     */
    public static List<List<List<String>>> getDocumentUnitCodes(List<TextDocument> sameDocumentsFromDifferentRaters, EvaluationUnit evalUnit) {
	//Documents->Units->Codes->codeId(String)
	List<List<List<String>>> alltxDocUnitCodes = new ArrayList<>();
	for (TextDocument document : sameDocumentsFromDifferentRaters) {
	    List<List<String>> txDocUnitCodes = new ArrayList<>();
	    Document parsedDocument = Jsoup.parse(document.getText().getValue());
	    Elements paragraphs = parsedDocument.select(TextDocumentConstants.PARAGRAPH_TAG);
	    if (evalUnit == EvaluationUnit.PARAGRAPH) {
		for (int i = 0; i < paragraphs.size(); i++) {
		    Elements codings = paragraphs.get(i).select(TextDocumentConstants.CODING_TAG);
		    Logger.getLogger("logger").log(Level.INFO, "Unit " + i + " get Codes");
		    List<String> appliedCodes = getAppliedCodes(codings);
		    txDocUnitCodes.add(appliedCodes);
		}
	    } else {
		throw new UnsupportedOperationException("Evaluation Unit not supported yet."); //TODO
	    }
	    alltxDocUnitCodes.add(txDocUnitCodes);
	}

	return alltxDocUnitCodes;
    }

    /**
     * Get the applied codes of a unit in a document
     * @param codings the elements of  the unit which contain the coding tag
     * @return the Code Ids (not DB Keys) of the applied codes in this unit as String List
     */
    private static List<String> getAppliedCodes(Elements codings) {
	List<String> originalCodeIDs = new ArrayList<>();
	for (Element originalCoding : codings) {
	    String codeId = originalCoding.attr(TextDocumentConstants.CODING_ID_ATTRIBUTE);
	    originalCodeIDs.add(codeId);
	}
	return originalCodeIDs;
    }
    
    /**
     * Get the number of units from a Textdocument according to the evaluation Unit
     * @param document a TextDocument instance
     * @param evalUnit which evaluation unit
     * @return number of units
     */
    public static int getAmountOfUnits(TextDocument document, EvaluationUnit evalUnit) {
	Document parsedDocument = Jsoup.parse(document.getText().getValue());
	Elements paragraphs = parsedDocument.select(TextDocumentConstants.PARAGRAPH_TAG);
	int units = 0;
	if (evalUnit == EvaluationUnit.PARAGRAPH) {
	    units = paragraphs.size();
	} else {
	    throw new UnsupportedOperationException("Evaluation Unit not supported yet."); //TODO
	}
	return units;
    }
}
