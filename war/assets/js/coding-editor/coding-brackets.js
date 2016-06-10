function createCodingBrackets(editorDoc, codedText){
	var svgContainer = editorDoc.createElement('div');
	svgContainer.id = "svgContainer";
	svgContainer.setAttribute("class", "svgContainer");
	
	var svgElem = createSVG(editorDoc, svgContainer);
	
	addAllBrackets(editorDoc,svgElem);
	
	return svgContainer;
}


function createSVG(editorDoc, svgContainer){
	var svgElem = editorDoc.createElement('svg');
	svgElem.id="svg1";
	
	var svgElement = d3.select(svgContainer).append("svg")
    .attr("width", 150)
    .attr("height", 1500); // FIXME Length of document

	return svgElement;
	
}



function addAllBrackets(editorDoc,svgElem){
	var codedText = editorDoc.body.innerHTML;
	var codingsArray = getCodingsFromText(codedText);
	var foundCodings = $('coding', codedText);
	var bracketIntervals = [];
	var labelIntervals = [];
	
	for ( var i = 0; i< codingsArray.length; i++) {
		var startY = codingsArray[i].offsetTop - 21;
		var endY = startY + codingsArray[i].height;
		var codingId = codingsArray[i].codingId;
		
		var offsetX = calculateOffsetX( startY, endY, bracketIntervals, svgElem);
		bracketIntervals.push({'codingId': codingId, 'start': startY, 'end':endY });
		
		var labelPosY = calculateLabelPosY( startY + (endY - startY)/2, labelIntervals);
		labelIntervals.push(labelPosY);
		
		addBracket(svgElem, codingId, codingsArray[i].name, startY, endY, offsetX, labelPosY);
	}

}


function addBracket(svgElement, codingId, name, startY,endY, offsetX, labelPosY){
	var pathRightX = 130;
	var pathLeftX = pathRightX - offsetX - 8;
	var labelX = pathLeftX - 8;
	
	createPath(svgElement, codingId, startY, endY, pathRightX, pathLeftX);
	labelCodingBracket(svgElement, codingId, name, labelX, labelPosY);
}

function calculateOffsetX( startY, endY, bracketIntervals, svgElem){
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

function calculateLabelPosY( labelPosition, labelPositions){
	var collisionCount = 0;
	var labelHeight = 7;
	for (var i = 0; i < labelPositions.length; i++){
		var existingLabel = labelPositions[i];
		if (labelPosition - existingLabel < labelHeight && labelPosition - existingLabel > 0){
			return calculateLabelPosY(labelPosition + labelHeight, labelPositions);
		}else if (labelPosition - existingLabel > -labelHeight && labelPosition - existingLabel < 0){
			return calculateLabelPosY(labelPosition + labelHeight, labelPositions);
		}
	}
	
	return labelPosition + 4;
}

function createPath(svgElement, codingId, startY, endY, rightX, leftX){
	
	var lineData = [{ "x": rightX,   "y": startY},  // Start point
	                { "x": leftX,   "y": startY   },  // Move left
	             	{ "x": leftX,   "y": endY     },  // Move down
	             	{ "x": rightX,   "y": endY  }]; // Move right to end point
	
	var lineFunction = d3.svg.line()
	.x(function(d) { return d.x; })
	.y(function(d) { return d.y; })
	.interpolate("linear");
	
	
	
	var lineGraph = svgElement.append("path")
	.attr("id", "path_"+codingId)
	.attr("d", lineFunction(lineData))
	.attr("stroke", "#000")
	.attr("fill", "none")
	.attr("coding_id", codingId);
}

function labelCodingBracket(svgElement, codingId, label, x, y){
	svgElement.append('text')
	.text(label)
	.attr("id", "label_"+codingId)
	.attr('x', x)
	.attr('y', y)
	.attr('style', 'text-anchor: end')
	.attr("coding_id", codingId);
}