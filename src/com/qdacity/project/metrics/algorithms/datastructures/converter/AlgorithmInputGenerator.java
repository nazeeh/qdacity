package com.qdacity.project.metrics.algorithms.datastructures.converter;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.EvaluationUnit;
import com.qdacity.project.metrics.constants.TextDocumentConstants;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public abstract class AlgorithmInputGenerator {

    protected final List<TextDocument> sameDocumentsFromDifferentRaters;
    protected final Collection<Long> codeIds;
    protected final EvaluationUnit evalUnit;

    public AlgorithmInputGenerator(List<TextDocument> sameDocumentsFromDifferentRaters, Collection<Long> codeIds, EvaluationUnit evalUnit) {
	this.sameDocumentsFromDifferentRaters = sameDocumentsFromDifferentRaters;
	this.codeIds = codeIds;
	this.evalUnit = evalUnit;
    }

    protected List<String> split(TextDocument document) {
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

    protected List<String> getAppliedCodes(Elements codings) {
	List<String> originalCodeIDs = new ArrayList<>();
	for (Element originalCoding : codings) {
	    String codeId = originalCoding.attr(TextDocumentConstants.CODING_ID_ATTRIBUTE);
	    originalCodeIDs.add(codeId);
	}
	return originalCodeIDs;
    }
}
