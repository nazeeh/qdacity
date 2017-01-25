import UMLClassEditor from './UMLClassEditor.js'


window.init = function() {
	var editor = new UMLClassEditor("DiagramSVG");
	
	editor.addClass(1,"Test Class", 50, 50 );
	
	editor.addClass(2,"Another Class", 50, 200 );
	
	editor.addAssociation(1,2);
	
}
 
