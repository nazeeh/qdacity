import UMLClass from './UMLClass.jsx';

export default class UMLClassEditor {
	constructor(svgContainerID) {
		this.svgContainer = document.getElementById(svgContainerID);
		this.svgElement = this.createSVG(800,600);
		this.width = 250;
		this.heightHeader = 50;
		this.classes = {};
		
		this.edgesA = {};
		this.edgesB = {};
			  
	}
  
  createSVG(width, height){
		var svgElem = document.createElement('svg');
		svgElem.id="svg1";
		
		var svgElement = d3.select(this.svgContainer).append("svg")
	    .attr("width", width)
	    .attr("height", height);
	
		return svgElement;
	}
	
	addClass(codeID, name, posX, posY){
		var d = [{ x: posX, y: posY }];
		
		var g = this.svgElement.data(d).append("g").attr("class","umlClass").attr("transform", "translate(" + posX + "," + posY + ")");
		var class1 = ReactDOM.render(<UMLClass name={name} />, g[0][0]);
		class1.setPosition(posX ,posY );
		
		var _this = this;
		var drag = d3.behavior.drag()
        .on("drag", function(d) {
			d.x += d3.event.dx;
            d.y += d3.event.dy;
            d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
			class1.setPosition(d.x ,d.y );
			
			var edgesOut = _this.edgesA[codeID];
			
			if (typeof edgesOut != 'undefined'){
				for (var i=0;i<edgesOut.length;i++) {
					var edge = edgesOut[i];
					d3.select(edge).attr("x1", class1.getTopConnector().x)
					.attr("y1", class1.getTopConnector().y)
				}
			}
			
			var edgesIn = _this.edgesB[codeID];
			
			if (typeof edgesIn != 'undefined'){
				for (var i=0;i<edgesIn.length;i++) {
					var edge = edgesIn[i];
					d3.select(edge).attr("x2", class1.getTopConnector().x)
					.attr("y2", class1.getTopConnector().y)
				}
			}
        });
		
		g.call(drag);
		
		this.classes[codeID] = class1;
	}
	
	addAssociation(codeID_A, codeID_B){
		var classA = this.classes[codeID_A];
		var classB = this.classes[codeID_B];
		
		if (typeof classA == 'undefined' || typeof classB == 'undefined'){
			console.log("Class does not exist in the model")
		}
		
		var posA = classA.getTopConnector();
		var posB = classB.getTopConnector();
		
		var edge = this.svgElement.append("line")
		.style("stroke", "black")
		.attr("x1", posA.x)
		.attr("y1", posA.y)
		.attr("x2", posB.x)
		.attr("y2", posB.y);
		
		if (this.edgesA[codeID_A] === undefined) this.edgesA[codeID_A] = [];
		this.edgesA[codeID_A].push(edge[0][0]);
		
		if (this.edgesB[codeID_B] === undefined) this.edgesB[codeID_B] = [];
		this.edgesB[codeID_B].push(edge[0][0]);
		
	}

}