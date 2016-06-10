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
	for ( var i = 0; i< codingsArray.length; i++) {
		var startY = codingsArray[i].offsetTop - 21;
		var endY = startY + codingsArray[i].height;
		addBracket(svgElem, startY, endY);
	}

}


function addBracket(svgElement,startY,endY){
	createPath(svgElement, startY, endY);
}


function createPath(svgElement, startY, endY){
	var rightX = 130;
	var leftX = rightX - 15;
	var offsetX;
	
	var lineData = [{ "x": rightX,   "y": startY},  // Start point
	                { "x": leftX,   "y": startY   },  // Move left
	             	{ "x": leftX,   "y": endY     },  // Move down
	             	{ "x": rightX,   "y": endY  }]; // Move right to end point
	
	var lineFunction = d3.svg.line()
	.x(function(d) { return d.x; })
	.y(function(d) { return d.y; })
	.interpolate("linear");
	
	
	var lineGraph = svgElement.append("path")
	.attr("id", "path1")
	.attr("d", lineFunction(lineData))
	.attr("stroke", "#000")
	.attr("fill", "none");
}

