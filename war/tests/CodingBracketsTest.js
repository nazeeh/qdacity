describe("CodingBrackets", function() {

  var editorDoc;
  var codedText;

  beforeEach(function() {
	  editorDoc = document.implementation.createDocument ('http://www.w3.org/1999/xhtml', 'html', null);
	  var body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');
	  body.setAttribute('id', 'abc');
	  editorDoc.body = body;
  });

  it("should contain an SVG element", function() {
    var svgContainer = createCodingBrackets(editorDoc,"");
    expect(svgContainer).toContainElement("svg");

  });
});
