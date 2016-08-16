package com.qdacity.project;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class Agreement {
  static public double calculateParagraphAgreement(TextDocument original, TextDocument recoded) {
    
    HashMap<Long, Integer> hits = new HashMap<Long, Integer>();
    HashMap<Long, Integer> misses = new HashMap<Long, Integer>();

    String recodedText = recoded.getText().getValue();
    String originalText = original.getText().getValue();
    
    Document originalDoc = Jsoup.parse(originalText);
    Document recodedDoc = Jsoup.parse(recodedText);
    
    Elements originalParagraphs = originalDoc.select("p");
    Elements recodedParagraphs = recodedDoc.select("p");
    
    ArrayList<Double> paragraphAgreement = new ArrayList<Double>();
    Integer truePositives = 0;
    Integer falsePositives = 0;
    Integer falseNegatives = 0;
    for (int i = 0; i < originalParagraphs.size(); i++) {
      Elements originalCodings = originalParagraphs.get(i).select("coding");
      HashSet<String> originalCodeIDs = getAppliedCodes(originalCodings);
      //Logger.getLogger("logger").log(Level.INFO,   "Number of codings in original paragraph: " + originalCodeIDs.size()+ " | " + originalCodeIDs);
      
      Elements recodedCodings = recodedParagraphs.get(i).select("coding");
      HashSet<String> recodedCodeIDs = getAppliedCodes(recodedCodings);
      //Logger.getLogger("logger").log(Level.INFO,   "Number of codings in recoded paragraph: " + recodedCodeIDs.size() + " | " + recodedCodeIDs);
      
      truePositives += countTruePositives(originalCodeIDs, recodedCodeIDs);
      falsePositives += countFalsePositives(originalCodeIDs, recodedCodeIDs);
      falseNegatives += countFalseNegatives(originalCodeIDs, recodedCodeIDs);

    }
    Logger.getLogger("logger").log(Level.INFO,   "True Pos: " + truePositives + ", False Pos: " + falsePositives + ", False Neg" + falseNegatives);
    
    
    //double fMeasureParagraph = calculateFMeasure(originalParagraphs.get(i), recodedParagraphs.get(i));
    double totalAgreement = calculateFMeasure(truePositives, falsePositives, falseNegatives);
    Logger.getLogger("logger").log(Level.INFO,   "Total Agreement" + totalAgreement);
    return totalAgreement;
  }

  static public double calculateFMeasure(Integer truePositives, Integer falsePositives, Integer falseNegatives){
    
    double recall = truePositives.doubleValue()/(falseNegatives + truePositives);
    if ((falseNegatives + truePositives) == 0) recall = 1;
    
    double precision = truePositives.doubleValue()/(truePositives + falsePositives);
    if ((truePositives + falsePositives) == 0) precision = 1;
    
    double fMeasure = 2*(precision*recall)/(precision + recall);
    
    return fMeasure;
  }

  static public double calculateAverageAgreement(List <Double> agreements) {
    double avg = 0;
    if(!agreements.isEmpty()) {
      for (double agreement : agreements) {
        avg += agreement;
      }
      return avg / agreements.size();
    }
    return avg;
  }

  static private HashSet<String> getAppliedCodes(Elements codings){
    HashSet<String> originalCodeIDs = new HashSet<String>();
    for (Element originalCoding : codings) {
      String codeId = originalCoding.attr("code_id");
      originalCodeIDs.add(codeId);
    }
    return originalCodeIDs;
  }

  static private Integer countTruePositives(HashSet<String> originalCodeIDs, HashSet<String> recodedCodeIDs){
    int count = 0;
    for (String codeId : recodedCodeIDs) {
      if (originalCodeIDs.contains(codeId)) count++;
    }
    return count;
  }

  static private Integer countFalsePositives(HashSet<String> originalCodeIDs, HashSet<String> recodedCodeIDs){
    int count = 0;
    for (String codeId : recodedCodeIDs) {
      if (!originalCodeIDs.contains(codeId)) count++;
    }
    return count;
  }

  static private Integer countFalseNegatives(HashSet<String> originalCodeIDs, HashSet<String> recodedCodeIDs){
    int count = 0;
    for (String codeId : originalCodeIDs) {
      if (!recodedCodeIDs.contains(codeId)) count++;
    }
    
    return count;
  }
}
