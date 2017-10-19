package com.qdacity.umleditor;

import java.util.ArrayList;
import java.util.List;

public class UmlCodePositionList {

	private List<UmlCodePosition> umlCodePositions;

	public UmlCodePositionList() {
		this.umlCodePositions = new ArrayList<>();
	}
	
	public UmlCodePositionList(List<UmlCodePosition> umlCodePositions) {
		this.umlCodePositions = umlCodePositions;
	}
	
	public List<UmlCodePosition> getUmlCodePositions() {
		return umlCodePositions;
	}

	public void setUmlCodePositions(List<UmlCodePosition> codePositions) {
		this.umlCodePositions = codePositions;
	}
}
