package com.qdacity.project.metrics.algorithms;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.qdacity.project.data.TextDocument;
import com.qdacity.project.metrics.DocumentResult;
import com.qdacity.project.metrics.ParagraphAgreement;

public class FMeasure {
	static public DocumentResult calculateParagraphAgreement(TextDocument original, TextDocument recoded) {
		DocumentResult docResults = new DocumentResult();
		docResults.setDocumentID(recoded.getId());
		docResults.setDocumentName(recoded.getTitle());

		String recodedText = recoded.getText().getValue();
		String originalText = original.getText().getValue();

		Document originalDoc = Jsoup.parse(originalText);
		Document recodedDoc = Jsoup.parse(recodedText);

		Elements originalParagraphs = originalDoc.select("p");
		Elements recodedParagraphs = recodedDoc.select("p");

		Integer truePositiveCount = 0;
		Integer falsePositiveCount = 0;
		Integer falseNegativeCount = 0;

		List<String> truePositives = new ArrayList<String>();
		List<String> falsePositives = new ArrayList<String>();
		List<String> falseNegatives = new ArrayList<String>();

		for (int i = 0; i < originalParagraphs.size(); i++) {
			Elements originalCodings = originalParagraphs.get(i).select("coding");
			HashSet<String> originalCodeIDs = getAppliedCodes(originalCodings);

			Elements recodedCodings = recodedParagraphs.get(i).select("coding");
			HashSet<String> recodedCodeIDs = getAppliedCodes(recodedCodings);
			ArrayList<String> tpList = countTruePositives(originalCodeIDs, recodedCodeIDs);
			truePositiveCount += tpList.size();

			ArrayList<String> fpList = countFalsePositives(originalCodeIDs, recodedCodeIDs);
			falsePositiveCount += fpList.size();

			ArrayList<String> fnList = countFalseNegatives(originalCodeIDs, recodedCodeIDs);
			falseNegativeCount += fnList.size();

			truePositives.add(tpList.toString());
			falsePositives.add(fpList.toString());
			falseNegatives.add(fnList.toString());

		}

		ParagraphAgreement totalAgreement = calculateFMeasure(truePositiveCount, falsePositiveCount, falseNegativeCount);


		docResults.setParagraphAgreement(totalAgreement);
		docResults.setTruePositives(truePositives);
		docResults.setFalsePositives(falsePositives);
		docResults.setFalseNegatives(falseNegatives);

		return docResults;
	}

        
	static public ParagraphAgreement calculateFMeasure(Integer truePositives, Integer falsePositives, Integer falseNegatives) {
                //See https://en.wikipedia.org/wiki/F1_score
		ParagraphAgreement agreement = new ParagraphAgreement();
		double recall = truePositives.doubleValue() / (falseNegatives + truePositives);
		if ((falseNegatives + truePositives) == 0) recall = 1;

		double precision = truePositives.doubleValue() / (truePositives + falsePositives);
		if ((truePositives + falsePositives) == 0) precision = 1;

		double fMeasure = 2 * (precision * recall) / (precision + recall);
		if ((precision + recall) == 0) fMeasure = 0;

		agreement.setRecall(recall);
		agreement.setPrecision(precision);
		agreement.setFMeasure(fMeasure);
		return agreement;
	}

	static public ParagraphAgreement calculateAverageAgreement(List<ParagraphAgreement> documentAgreements) {
		ParagraphAgreement avg = new ParagraphAgreement();
		avg.setFMeasure(0);
		avg.setPrecision(0);
		avg.setRecall(0);

		if (!documentAgreements.isEmpty()) {
			double avgRecall = 0;
			double avgPrecision = 0;
			double avgFMeasure = 0;
			for (ParagraphAgreement agreement : documentAgreements) {
				avgRecall += agreement.getRecall();
				avgPrecision += agreement.getPrecision();
				avgFMeasure += agreement.getFMeasure();
			}
			avgRecall = avgRecall / documentAgreements.size();
			avgPrecision = avgPrecision / documentAgreements.size();
			avgFMeasure = avgFMeasure / documentAgreements.size();

			avg.setRecall(avgRecall);
			avg.setPrecision(avgPrecision);
			avg.setFMeasure(avgFMeasure);
		}
		return avg;
	}

	static private HashSet<String> getAppliedCodes(Elements codings) {
		HashSet<String> originalCodeIDs = new HashSet<String>();
		for (Element originalCoding : codings) {
			String codeId = originalCoding.attr("code_id");
			originalCodeIDs.add(codeId);
		}
		return originalCodeIDs;
	}

	static private ArrayList<String> countTruePositives(HashSet<String> originalCodeIDs, HashSet<String> recodedCodeIDs) {
		ArrayList<String> truePositives = new ArrayList<String>();
		for (String codeId : recodedCodeIDs) {
			if (originalCodeIDs.contains(codeId)) {
				truePositives.add(codeId);
			}
		}
		return truePositives;
	}

	static private ArrayList<String> countFalsePositives(HashSet<String> originalCodeIDs, HashSet<String> recodedCodeIDs) {
		ArrayList<String> falsePositives = new ArrayList<String>();
		for (String codeId : recodedCodeIDs) {
			if (!originalCodeIDs.contains(codeId)) {
				falsePositives.add(codeId);
			}
		}
		return falsePositives;
	}

	static private ArrayList<String> countFalseNegatives(HashSet<String> originalCodeIDs, HashSet<String> recodedCodeIDs) {
		ArrayList<String> falseNegatives = new ArrayList<String>();
		for (String codeId : originalCodeIDs) {
			if (!recodedCodeIDs.contains(codeId)) {
				falseNegatives.add(codeId);
			}
		}

		return falseNegatives;
	}

	static public void generateAgreementMaps(List<DocumentResult> documentResults, Collection<TextDocument> originalDocs) {
		for (TextDocument textDocument : originalDocs) {
			for (DocumentResult documentResult : documentResults) {
				if (documentResult.getDocumentID().equals(textDocument.getId())) {
					Logger.getLogger("logger").log(Level.INFO, "Generating map for: " + textDocument.getId());
					documentResult.generateAgreementMap(textDocument);
					break;
				}

			}
		}

	}
}
