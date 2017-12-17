package com.qdacity.endpoint.datastructures;

import java.util.ArrayList;
import java.util.List;

import com.qdacity.project.data.TextDocument;

public class TextDocumentList {

	private List<TextDocument> documents;

	public TextDocumentList() {
		this.documents = new ArrayList<>();
	}
	
	public TextDocumentList(List<TextDocument> documents) {
		this.documents = documents;
	}
	
	public List<TextDocument> getDocuments() {
		return documents;
	}

	public void setDocuments(List<TextDocument> documents) {
		this.documents = documents;
	}
}
