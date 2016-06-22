describe("CodingBrackets", function() {

  var editorDoc;
  var codedText;
  var codingMap;

  beforeEach(function() {
	  editorDoc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
	  var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');
	  body.setAttribute('id', 'abc');
	  editorDoc.body = body;
	  
		codingMap = {};
		
		codingData = {};
		
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
    var svgContainer = createCodingBrackets(editorDoc,"");
    expect(svgContainer).toContainElement("svg");

  });
  
  it("should draw one bracket and one label for each coding", function() {
	  	var svgContainer = editorDoc.createElement('div');
		svgContainer.id = "svgContainer";
		svgContainer.setAttribute("class", "svgContainer");
		
		var svgElem = createSVG(editorDoc, svgContainer);
		
	    var svgContainer = addAllBrackets(editorDoc,svgElem, codingMap);

		expect($(svgContainer).find("path")).toHaveLength(3);
	    expect($(svgContainer).find("text")).toHaveLength(3);

	  });
  
  it("should draw overlapping brackets with spacing horizontically" , function() {
	  var svgContainer = editorDoc.createElement('div');
		svgContainer.id = "svgContainer";
		svgContainer.setAttribute("class", "svgContainer");
		
		var svgElem = createSVG(editorDoc, svgContainer);
		
	    var svgContainer = addAllBrackets(editorDoc,svgElem, codingMap);
	    var test = $(svgContainer).find("path[coding_id=3]").get(0);
	    expect($(svgContainer).find("path[coding_id=1]").get(0)).toHaveAttr("d","M130,79L122,79L122,129L130,129");
	    expect($(svgContainer).find("path[coding_id=2]").get(0)).toHaveAttr("d","M130,179L122,179L122,199L130,199");
	    expect($(svgContainer).find("path[coding_id=3]").get(0)).toHaveAttr("d","M130,29L115,29L115,139L130,139"); // 7 pixels to the left
	    
  });
});
