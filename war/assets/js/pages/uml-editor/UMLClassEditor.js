import UMLClass from './UMLClass.jsx';

export default class UMLClassEditor {
	constructor(svgContainerID) {
		this.svgContainer = document.getElementById(svgContainerID);
		this.svgElement = this.createSVG(800, 600);
		this.width = 250;
		this.heightHeader = 50;
		this.classes = {};

		this.edgesA = {};
		this.edgesB = {};

	}

	createSVG(width, height) {
		var svgElem = document.createElement('svg');
		svgElem.id = "svg1";

		var svgElement = d3.select(this.svgContainer).append("svg")
			.attr("width", width)
			.attr("height", height);

		return svgElement;
	}

	addClass(codeID, name, posX, posY) {
		var d = [{
			x: posX,
			y: posY
		}];

		var g = this.svgElement.data(d).append("g").attr("class", "umlClass").attr("transform", "translate(" + posX + "," + posY + ")");
		var class1 = ReactDOM.render(<UMLClass name={name} codeID={codeID} svgContainer={g} />, g[0][0]);
		class1.setPosition(posX, posY);

		var _this = this;
		var drag = d3.behavior.drag()
			.on("drag", function (d) {
				_this.dragClass(this, class1, d);
			});

		g.call(drag);

		this.classes[codeID] = class1;
	}

	addAssociation(codeID_A, codeID_B) {
		var classA = this.classes[codeID_A];
		var classB = this.classes[codeID_B];

		if (typeof classA == 'undefined' || typeof classB == 'undefined') {
			console.log("Class does not exist in the model")
		}

		var posA = classA.getConnector(classB);
		var posB = classB.getConnector(classA);

		var edge = this.svgElement.append("line")
			.style("stroke", "black")
			.attr("x1", posA.x)
			.attr("y1", posA.y)
			.attr("codeID_A", codeID_A)
			.attr("x2", posB.x)
			.attr("y2", posB.y)
			.attr("codeID_B", codeID_B);

		if (this.edgesA[codeID_A] === undefined) this.edgesA[codeID_A] = [];
		this.edgesA[codeID_A].push(edge[0][0]);

		if (this.edgesB[codeID_B] === undefined) this.edgesB[codeID_B] = [];
		this.edgesB[codeID_B].push(edge[0][0]);

	}

	dragClass(d3Obj, classObj, d) {
		var dx = d3.event.dx,
			dy = d3.event.dy;
		d.x += dx;
		d.y += dy;

		d3.select(d3Obj).attr("transform", "translate(" + d.x + "," + d.y + ")");
		classObj.setPosition(d.x, d.y);
		this.resolveCollisions(classObj, dx, dy);
		var codeID = classObj.getCodeID();
		var edgesOut = this.edgesA[codeID];

		if (typeof edgesOut != 'undefined') {
			for (var i = 0; i < edgesOut.length; i++) {
				var edge = edgesOut[i];
				var codeID_B = d3.select(edge).attr("codeID_B"); // FIXME continue: select both classes, find best connector, draw new line
				var classB = this.classes[codeID_B];
				this.redrawConnection(edge, classObj, classB);
			}
		}

		var edgesIn = this.edgesB[codeID];

		if (typeof edgesIn != 'undefined') {
			for (var i = 0; i < edgesIn.length; i++) {
				var edge = edgesIn[i];
				var codeID_A = d3.select(edge).attr("codeID_A"); // FIXME continue: select both classes, find best connector, draw new line
				var classA = this.classes[codeID_A];
				this.redrawConnection(edge, classA, classObj);

			}
		}

	}

	resolveCollisions(classObj, moveX, moveY) {
		for (var codeID in this.classes) {
			if (this.classes.hasOwnProperty(codeID)) {
				var otherClass = this.classes[codeID];
				if (codeID == classObj.getCodeID()) continue;
				var dx = classObj.calculateDeltaX(otherClass);
				var dy = classObj.calculateDeltaY(otherClass);
				if (dx == 0 && dy == 0) {
					console.log("Collision Found");

					otherClass.move(moveX, moveY);
					// Update colliding class
				}

			}
		}
	}

	redrawConnection(edge, classA, classB) {
		var connectorA = classA.getConnector(classB);
		var connectorB = classB.getConnector(classA);
		d3.select(edge).attr("x1", connectorA.x)
			.attr("y1", connectorA.y);

		d3.select(edge).attr("x2", connectorB.x)
			.attr("y2", connectorB.y)
	}

	getConnector(otherPos, classObj) {
		var classPosition
	}

}