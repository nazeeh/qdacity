package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.algorithms.datastructures.ReliabilityData;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class ReliabilityDataGenerator {

    EvaluationUnit unitOfCoding;
    private final String CODING_TAG = "coding"; //TODO in eine Constants Klasse
    private final String CODING_ID_ATTRIBUTE = "code_id"; //TODO in eine Constants Klasse
    private final String PARAGRAPH_TAG = "p"; //TODO in eine Constants Klasse

    public ReliabilityDataGenerator(EvaluationUnit unitOfCoding) {
	this.unitOfCoding = unitOfCoding;
    }

    /**
     * Creates a ReliabilityData with the same document in the same revision,
     * but from differen raters per Code
     *
     * @param sameDocumentFromDifferentRaters provide the same document in same
     * revision from relevant raters here.
     * @param codeIds relevant codeIds
     * @return ReliabilityData derived from the given Documents
     */
    public List<ReliabilityData> generate(List<TextDocument> sameDocumentFromDifferentRaters, List<Long> codeIds) {
	int raters = sameDocumentFromDifferentRaters.size();
	List<List<String>> ratings = new ArrayList<>();
	List<ReliabilityData> rDatas = new ArrayList<>();
	Logger.getLogger("logger").log(Level.INFO, "Documents: "+sameDocumentFromDifferentRaters.size()); //TODO remove this in production environment

	for (TextDocument document : sameDocumentFromDifferentRaters) {
	    ratings.add(split(document));
	}
	Logger.getLogger("logger").log(Level.INFO, "Ratings: "+ratings.size()); //TODO remove this in production environment
	Logger.getLogger("logger").log(Level.INFO, "CodeIds: "+codeIds.size()); //TODO remove this in production environment

	for (long codeId : codeIds) {
	    ReliabilityData rData = new ReliabilityData(ratings.get(0).size(), raters); //TODO units nicht unbedingt gleich lang!! split nicht eindeutig!
	    for (int coder = 1; coder <= raters; coder++) {
		for (int unit = 1; unit <= ratings.get(coder - 1).size(); unit++) {
		    int valueToSet = 1; //1 not set
		    if(ratings.get(coder - 1).get(unit - 1).equals(codeId+"")) {
		    	//Only set 1 if code we are looking at right now is set.
		    	valueToSet = 2; //set
		    }
		    rData.set(unit, coder, valueToSet);
		}
	    }
	    rDatas.add(rData);
	    //String rDataAsString = rData.toString();
	    //Logger.getLogger("logger").log(Level.INFO, "Code-ID: "+codeId+" Adding Reliabillity Data: "+rDataAsString); //TODO remove this in production environment
	}

	return rDatas;
    }

    private List<String> split(TextDocument document) {
	Document parsedDocument = Jsoup.parse(document.getText().getValue());
	Elements paragraphs = parsedDocument.select(PARAGRAPH_TAG);
	List<String> ratings = new ArrayList<>();
	if (unitOfCoding == EvaluationUnit.PARAGRAPH) {
	    for (int i = 0; i < paragraphs.size(); i++) {
		Elements codings = paragraphs.get(i).select(CODING_TAG);
		//TODO Units sind hier nicht eindeutig wenn z.B. ein User einen Code nicht gesetzt hat!! Andere DS n�tig!
		ratings.addAll(getAppliedCodes(codings)); //ACHTUNG: Hier kann es mehr als einen pro Unit geben!! ODER AUCH KEINEN
	    }
	} else {
	    throw new UnsupportedOperationException("Evaluation Unit not supported yet."); //TODO
	}

	return ratings;
    }

    private List<String> getAppliedCodes(Elements codings) {
	List<String> originalCodeIDs = new ArrayList<>();
	for (Element originalCoding : codings) {
	    String codeId = originalCoding.attr(CODING_ID_ATTRIBUTE);
	    originalCodeIDs.add(codeId);
	}
	return originalCodeIDs;
    }
}
