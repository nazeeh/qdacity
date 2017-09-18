import CodingBrackets from '../assets/js/pages/coding-editor/coding-brackets.js';


describe("CodingBrackets", function() {

  var editorDoc;
  var codedText;
  var codingMap;
  
  let instance;

  beforeEach(function() {
	  instance = new CodingBrackets();
	  editorDoc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
	  var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');
	  body.setAttribute('id', 'abc');
	  editorDoc.body = body;
	  
		codingMap = {};
		
		let codingData = {};
		
		codingData = {};
		codingData.offsetTop = 100;
		codingData.height = 50;
		codingData.name = "title"; 
		codingData.codingId = 1; 
		codingData.color = ("#fff");
		
		codingMap[1] = codingData;
		
		codingData = {};
		codingData.offsetTop = 200;
		codingData.height = 20;
		codingData.name = "title"; 
		codingData.codingId = 2; 
		codingData.color = ("#fff");
		
		codingMap[2] = codingData;
		
		codingData = {};
		codingData.offsetTop = 50;
		codingData.height = 110;
		codingData.name = "title"; 
		codingData.codingId = 3; 
		codingData.color = ("#fff");
		
		codingMap[3] = codingData;
		

  });

  it("should contain an SVG element", function() {
    var svgContainer = instance.createCodingBrackets(editorDoc,"");
    expect(svgContainer).toContainElement("svg");

  });
  
  it("should draw one bracket and one label for each coding", function() {
	  	var svgContainer = editorDoc.createElement('div');
		svgContainer.id = "svgContainer";
		svgContainer.setAttribute("class", "svgContainer");
		
		var svgElem = instance.createSVG(editorDoc, svgContainer);
		
	    var svgContainer = instance.addAllBrackets(editorDoc,svgElem, codingMap);

		expect($(svgContainer).find("path")).toHaveLength(3);
	    expect($(svgContainer).find("text")).toHaveLength(3);

	  });
  
  it("should draw overlapping brackets with spacing horizontically" , function() {
	  var svgContainer = editorDoc.createElement('div');
		svgContainer.id = "svgContainer";
		svgContainer.setAttribute("class", "svgContainer");
		
		var svgElem = instance.createSVG(editorDoc, svgContainer);
		
	    var svgContainer = instance.addAllBrackets(editorDoc,svgElem, codingMap);
	    var test = $(svgContainer).find("path[coding_id=3]").get(0);
	    expect($(svgContainer).find("path[coding_id=1]").get(0)).toHaveAttr("d","M150,79L142,79L142,129L150,129");
	    expect($(svgContainer).find("path[coding_id=2]").get(0)).toHaveAttr("d","M150,179L142,179L142,199L150,199");
	    expect($(svgContainer).find("path[coding_id=3]").get(0)).toHaveAttr("d","M150,29L135,29L135,139L150,139"); // 7 pixels to the left
	    
  });
});
