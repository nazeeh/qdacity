export default class CodingBrackets {
	
	constructor() {

	    this.html = "";
	  
	  }

	createCodingBrackets (editorDoc, codingsMap){
		var svgContainer = editorDoc.createElement('div');
		svgContainer.id = "svgContainer";
		svgContainer.setAttribute("class", "svgContainer");
		
		var svgElem = this.createSVG(editorDoc, svgContainer);
		
		
		
		this.addAllBrackets(editorDoc, svgElem, codingsMap);
		
		return svgContainer;
	}
	
	
	 createSVG(editorDoc, svgContainer){
		var svgElem = editorDoc.createElement('svg');
		svgElem.id="svg1";
		
		var scrollHeight = $(editorDoc).find('html')[0].scrollHeight;
	
		var svgElement = d3.select(svgContainer).append("svg")
	    .attr("width", 150)
	    .attr("height", scrollHeight); // FIXME Length of document
	
		return svgElement;
		
	}
	
	
	
	 addAllBrackets(editorDoc,svgElem, codingsMap){
		var codedText = editorDoc.body.innerHTML;
		
		var bracketIntervals = [];
		var labelIntervals = [];
		
		for ( var i in codingsMap) {
			var startY = codingsMap[i].offsetTop - 21;
			var endY = startY + codingsMap[i].height;
			var codingId = codingsMap[i].codingId;
			
			var offsetX = this.calculateOffsetX( startY, endY, bracketIntervals, svgElem);
			bracketIntervals.push({'codingId': codingId, 'start': startY, 'end':endY });
			
			var labelPosY = this.calculateLabelPosY( startY + (endY - startY)/2, labelIntervals);
			labelIntervals.push(labelPosY);
			
			this.addBracket(svgElem, codingId, codingsMap[i].name, codingsMap[i].color, startY, endY, offsetX, labelPosY);
		}
		
		return svgElem[0][0];
	
	}
	
	
	 addBracket(svgElement, codingId, name, color, startY,endY, offsetX, labelPosY){
		var pathRightX = 130;
		var pathLeftX = pathRightX - offsetX - 8;
		var labelX = pathLeftX - 8;
		
		var codingBracketDiv = svgElement.append("svg")
		.attr("id", "bracket_"+codingId)
		.attr("class", "codingBracket")
		.attr("coding_id", codingId);
		
		this.createPath(codingBracketDiv, codingId, color, startY, endY, pathRightX, pathLeftX);
		this.labelCodingBracket(codingBracketDiv, codingId, name, color, labelX, labelPosY);
		
	}
	
	 calculateOffsetX( startY, endY, bracketIntervals, svgElem){
		var collisionCount = 0;
		for (var i = 0; i < bracketIntervals.length; i++){
			var intervalStart = bracketIntervals[i].start;
			var intervalEnd = bracketIntervals[i].end;
			var codingId = bracketIntervals[i].codingId;
			
			if (((startY <= intervalEnd) && (startY >= intervalStart)) ||
				(endY <= intervalEnd && endY >= intervalStart)         ||
				(startY <= intervalStart && endY >= intervalEnd))        {
				var elements = $(svgElem).find("text");
				var collidingElement = svgElem.select("#label_"+codingId);
				var labelPosX = collidingElement.attr("x");
				collidingElement.attr("x", labelPosX -7);
				collisionCount++;
			}
		}
		
		return 7*collisionCount;
	}
	
	 calculateLabelPosY( labelPosition, labelPositions){
		var collisionCount = 0;
		var labelHeight = 7;
		for (var i = 0; i < labelPositions.length; i++){
			var existingLabel = labelPositions[i];
			if (labelPosition - existingLabel < labelHeight && labelPosition - existingLabel > 0){
				return this.calculateLabelPosY(labelPosition + labelHeight, labelPositions);
			}else if (labelPosition - existingLabel > -labelHeight && labelPosition - existingLabel < 0){
				return this.calculateLabelPosY(labelPosition + labelHeight, labelPositions);
			}
		}
		
		return labelPosition + 4;
	}
	
	 createPath(svgElement, codingId, color, startY, endY, rightX, leftX){
		
		var lineData = [{ "x": rightX,   "y": startY},  // Start point
		                { "x": leftX,    "y": startY},  // Move left
		             	{ "x": leftX,    "y": endY  },  // Move down
		             	{ "x": rightX,   "y": endY  }]; // Move right to end point
		
		var lineFunction = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.interpolate("linear");
		
		
		
		var lineGraph = svgElement.append("path")
		.attr("id", "path_"+codingId)
		.attr("d", lineFunction(lineData))
		.attr("stroke", color)
		.attr("style", "stroke="+color)
		.attr("fill", "none")
		.attr("coding_id", codingId);
		
		lineGraph.on("mouseover", function(d) {
		       d3.select(this.parentNode).classed('hover', true);
		       this.parentNode.parentNode.appendChild(this.parentNode);
		   })
		   .on("mouseout", function(d) {
		       d3.select(this.parentNode).classed('hover', false);
		   })
		   .on("click", function(d) {
			   window.activateCodingInEditor(codingId, false);
		   })
	}
	
	 labelCodingBracket(svgElement, codingId, label, color, x, y){
		var labelElement = svgElement.append('text')
		.text(label)
		.attr("id", "label_"+codingId)
		.attr('x', x)
		.attr('y', y)
		.attr('style', 'text-anchor: end; fill:' + color +';')
		.attr("coding_id", codingId);
		
		labelElement.on("mouseover", function(d) {
		       d3.select(this.parentNode).classed('hover', true);
		       this.parentNode.parentNode.appendChild(this.parentNode);
		   })
		   .on("mouseout", function(d) {
		       d3.select(this.parentNode).classed('hover', false);
		   })
		   .on("click", function(d) {
			   window.activateCodingInEditor(codingId, false);
		   })
	}
}