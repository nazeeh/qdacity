import CodingBrackets from './coding-brackets';
import Prompt from '../modals/Prompt.js';
import 'script!../../../components/Squire/squire-raw.js';
import 'script!../../../components/tooltip/tooltip.js';

export default class EditorCtrl {

	constructor( easytree ) {
		this.easytree = easytree;
		this.iframe = document.getElementById('editor');
		
		
		
		// Make sure we're in standards mode.
		var doc = this.iframe.contentDocument;
		$("#editor").css({
			height : $(window).height() - 52
		});
		if (doc.compatMode !== 'CSS1Compat') {
			doc.open();
			doc.write('<!DOCTYPE html><title></title>');
			doc.close();
		}

		doc.open();
		doc.write('<!DOCTYPE html><title>test</title><head></head>');
		doc.close();
		// doc.close() can cause a re-entrant load event in some browsers, such as IE9.
		if (this.editor) {
			return;
		}
		// Create Squire instance
		this.editor = new Squire(doc, {
			blockTag : 'p',
			blockAttributes : {
				'class' : 'paragraph'
			},
			tagAttributes : {
				ul : {
					'class' : 'UL'
				},
				ol : {
					'class' : 'OL'
				},
				li : {
					'class' : 'listItem'
				}
			}
		});
		this.editor['readOnly']('true');
		
		var editorStyle = doc.createElement('link');
		editorStyle.href = 'assets/css/editorView.css';
		editorStyle.rel = 'stylesheet';
		doc.querySelector('head').appendChild(editorStyle);
			
		var codingBracketStyle = doc.createElement('link');
		codingBracketStyle.href = 'assets/css/codingBrackets.css';
		codingBracketStyle.rel = 'stylesheet';
		doc.querySelector('head').appendChild(codingBracketStyle);
		
		this.registerEventHandlers(this.editor);
	}
  
	registerEventHandlers(editor){
		document.getElementById('btnTxtBold').onclick = function() {
			editor['bold']();
		}

		document.getElementById('btnTxtItalic').onclick = function() {
			editor['italic']();
		}

		document.getElementById('btnTxtUnderline').onclick = function() {
			editor['underline']();
		}

		

		$("#txtSizeSpinner").on("spin", function(event, ui) {
			editor['setFontSize'](ui.value);
		});
	}

	setDocumentView(doc) {
		if (typeof doc.text == 'undefined') {
			this.editor.setHTML("");
		} else {
			this.editor.setHTML(doc.text);
			this.addTooltipsToEditor(doc);
		}
		this.addCodingBrackets();
	}
	
	addTooltipsToEditor(doc) {
		var elements = doc.text;
		var foundArray = $("#editor").contents().find('coding');

		foundArray = foundArray.toArray();

		for (var i = 0; i < foundArray.length; i++) {
			var node = foundArray[i];
			$(node).tooltip({
				"content" : "Code [" + $(node).attr('codeName') + "]",
				placement : 'top'
			});

		}
	}
	
	addCodingBrackets(){
		var doc = this.iframe.contentDocument;
		var _this = this;
		$(doc).imagesLoaded( function() {
			$(doc).find(".svgContainer").remove();
			var codingsMap = _this.getCodingsFromText(doc);
			var svgDiv = (new CodingBrackets(_this)).createCodingBrackets(doc, codingsMap);
			var body = doc.querySelector('body');
			body.insertBefore(svgDiv, body.firstChild);
		});
		
	}
	
	getCodingsFromText(text){
		var codingMap = {};
		var codingNodes = $("#editor").contents().find('coding');
		if (codingNodes.length > 0){
			var codingData = {};
			var currentID = -1;
			for ( var i = 0; i< codingNodes.length; i++) {
				var codingNode = codingNodes[i];
				currentID = codingNode.getAttribute("id");
				// One code ID may have multiple DOM elements, if this is a new one create a coding object
				if (!(currentID in codingMap)){
					codingData = {};
					codingData.offsetTop = codingNode.offsetTop;
					codingData.height = codingNode.offsetHeight;
					codingData.name = codingNode.getAttribute("title"); 
					codingData.codingId = currentID; 
					codingData.color = this.getCodeColor(codingNode.getAttribute("code_id"));
					
					codingMap[currentID] = codingData;
				}
				// if this is just another DOM element for a coding that has already been created, then adjust the hight
				else{ 
					codingMap[currentID].height = codingNode.offsetTop - codingMap[currentID].offsetTop + codingNode.offsetHeight;
				}
			}
		}
	
	return codingMap;
	}
	
	getCodeColor(id, target) {
		var node = this.easytree.getNode(id);
		if (node != null) return node.color;
		else return "#000";
	}
	
	activateCodingInEditor (codingID, scrollToSection) {
				var range;
				range = document.createRange();
				var codingNodes = $("#editor").contents().find('coding[id=\'' + codingID + '\']');
				var startNode = codingNodes[0];
				var endNode = codingNodes[codingNodes.length - 1];

				var raWnge = this.iframe.contentDocument.createRange();
				range.setStart(startNode, 0);
				range.setEnd(endNode, endNode.childNodes.length);
				this.editor.setSelection(range);
				
				//Scroll to selection
				if (scrollToSection){
					var offset = startNode.offsetTop;
					$("#editor").contents().scrollTop(offset);
				}

//			}
//		}
	}
	
	setCoding(codingID, activeID, name, author){
		this.editor['setCoding'](codingID, activeID, name, author);
		this.addCodingBrackets();
	}
	
	setHTML(content){
		this.editor.setHTML(content);
		this.addCodingBrackets();
		this.addTooltipsToEditor(textDocumentID);
	}
	
	getHTML(){
		return this.editor.getHTML()
	}
	
	setReadOnly(value){
		this.editor.readOnly('false');
		//resizeElements();
	}
}