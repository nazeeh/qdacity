import CodingBrackets from './coding-brackets';
import Prompt from '../../common/modals/Prompt.js';
import 'script-loader!../../../../components/Squire/squire-raw.js';
import 'script-loader!../../../../components/tooltip/tooltip.js';
import 'script-loader!../../../../components/imagesloaded/imagesloaded.pkgd.min.js';

import IntlProvider from '../../common/Localization/LocalizationProvider';

export default class EditorCtrl {

	constructor(getCodeByCodeID, agreementMap) {
		this.getCodeByCodeID = getCodeByCodeID;
		this.agreementMap = agreementMap;
		this.isReadOnly = true;
		this.setupFontSelector();
		this.setupFontSizeSelector();

		this.iframe = document.getElementById('textEditor');

		this.setFontFace = this.setFontFace.bind(this);
		this.setFontSize = this.setFontSize.bind(this);

		// Make sure we're in standards mode.
		var doc = this.iframe.contentDocument;
		// $("#textEditor").css({
		// 	height: $(window).height() - 52
		// });
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
			blockTag: 'p',
			blockAttributes: {
				'class': 'paragraph'
			},
			tagAttributes: {
				ul: {
					'class': 'UL'
				},
				ol: {
					'class': 'OL'
				},
				li: {
					'class': 'listItem'
				}
			}
		});
		this.editor.readOnly(true);

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


	showsAgreementMap(mapFlag) {
		this.agreementMap = mapFlag;
	}

	registerEventHandlers(editor) {
		document.getElementById('btnTxtBold').onclick = function () {
			editor['bold']();
		}

		document.getElementById('btnTxtItalic').onclick = function () {
			editor['italic']();
		}

		document.getElementById('btnTxtUnderline').onclick = function () {
			editor['underline']();
		}



		$("#txtSizeSpinner").on("spin", function (event, ui) {
			editor['setFontSize'](ui.value);
		});
	}

	setFontFace(fontface) {
		this.editor.setFontFace(fontface);
	}

	setFontSize(size) {
		size = parseInt(size);
		console.log('setFontSize has value', size);
		this.editor.setFontSize(size);
	}

	setDocumentView(doc) {
		var _this = this;
		if (typeof doc.text == 'undefined') {
			this.editor.setHTML("");
		} else {
			this.editor.setHTML(doc.text);
			this.addTooltipsToEditor(doc);
		}
		this.addCodingBrackets();
		if (this.agreementMap) {
			$("#agreementMapSettings").removeClass("hidden");
			var maxVal = this.getMaxFalseNeg();
			this.highlightAgreementMap(Math.ceil(maxVal / 2));
			$("#agreementMapSlider").slider({
				range: "max",
				min: 1,
				max: maxVal,
				value: Math.ceil(maxVal / 2),
				slide: function (event, ui) {
					_this.highlightAgreementMap(ui.value);
				}
			});
		}
	}

	addTooltipsToEditor(doc) {
		var elements = doc.text;
		var foundArray = $("#textEditor").contents().find('coding');

		foundArray = foundArray.toArray();

		for (var i = 0; i < foundArray.length; i++) {
			var node = foundArray[i];
			$(node).tooltip({
				"content": "Code [" + $(node).attr('codeName') + "]",
				placement: 'top'
			});

		}
	}

	highlightAgreementMap(maxValue) {
		$("#maxFalseNeg").html(maxValue);
		var all = $("#textEditor").contents().find('p');
		var filtered = $("#textEditor").contents().find('p').filter(function () {
			var falseNegCount = $(this).attr('falsenegcount');
			return falseNegCount >= maxValue;
		});

		filtered.css("backgroundColor", "#cc6666");
		all.not(filtered).css("backgroundColor", "white");
	}

	getMaxFalseNeg() {
		var max = 0;
		$("#textEditor").contents().find('p').each(function () {
			var falsenegcount = $(this).attr('falsenegcount');
			if (falsenegcount > max) max = falsenegcount;
		});
		return max;
	}

	addCodingBrackets() {
		var doc = this.iframe.contentDocument;
		var _this = this;
		$(doc).imagesLoaded(function () {
			$(doc).find(".svgContainer").remove();
			var codingsMap = _this.getCodingsFromText(doc);
			var svgDiv = (new CodingBrackets(_this)).createCodingBrackets(doc, codingsMap);
			var body = doc.querySelector('body');
			body.insertBefore(svgDiv, body.firstChild);
		});

	}

	getCodingsFromText(text) {
		var codingMap = {};
		var codingNodes = $("#textEditor").contents().find('coding');
		if (codingNodes.length > 0) {
			var codingData = {};
			var currentID = -1;
			for (var i = 0; i < codingNodes.length; i++) {
				var codingNode = codingNodes[i];
				currentID = codingNode.getAttribute("id");
				// One code ID may have multiple DOM elements, if this is a new one create a coding object
				if (!(currentID in codingMap)) {
					codingData = {};
					codingData.offsetTop = codingNode.offsetTop;
					codingData.height = codingNode.offsetHeight;
					codingData.name = codingNode.getAttribute("title");
					codingData.codingId = currentID;
					codingData.color = this.getCodeColor(codingNode.getAttribute("code_id"));

					codingMap[currentID] = codingData;
				}
				// if this is just another DOM element for a coding that has already been created, then adjust the hight
				else {
					codingMap[currentID].height = codingNode.offsetTop - codingMap[currentID].offsetTop + codingNode.offsetHeight;
				}
			}
		}

		return codingMap;
	}

	getCodeColor(id, target) {
		var node = this.getCodeByCodeID(id);
		if (node != null) return node.color;
		else return "#000";
	}

	activateCodingInEditor(codingID, scrollToSection) {
		var range;
		range = document.createRange();
		var codingNodes = $("#textEditor").contents().find('coding[id=\'' + codingID + '\']');
		var startNode = codingNodes[0];
		var endNode = codingNodes[codingNodes.length - 1];

		var raWnge = this.iframe.contentDocument.createRange();
		range.setStart(startNode, 0);
		range.setEnd(endNode, endNode.childNodes.length);
		this.editor.setSelection(range);

		//Scroll to selection
		if (scrollToSection) {
			var offset = startNode.offsetTop;
			$("#textEditor").contents().scrollTop(offset);
		}

		//			}
		//		}
	}

	setCoding(codingID, activeID, name, author) {
		this.editor['setCoding'](codingID, activeID, name, author);
		this.addCodingBrackets();
	}

	removeCoding(copdingID) {
		return this.editor['removeCoding'](copdingID);
	}

	setHTML(content) {
		this.editor.setHTML(content);
		this.addCodingBrackets();
		this.addTooltipsToEditor(textDocumentID);
	}

	getHTML() {
		return this.editor.getHTML()
	}

	toggleReadOnly() {
		this.isReadOnly = !this.isReadOnly;
		this.editor.readOnly(this.isReadOnly);
	}

	setReadOnly(value) {
		this.editor.readOnly(value);
		this.isReadOnly = value;
	}

	setupFontSelector() {
		var _this = this;
		$.widget("custom.combobox", {
			_create: function () {
				this.wrapper = $("<span>").addClass("custom-combobox").insertAfter(this.element);

				this.element.hide();
				this._createAutocomplete();
				this._createShowAllButton();
			},

			_createAutocomplete: function () {
				var selected = this.element.children(":selected"),
					value = selected.val() ? selected.text() : " ";

				this.input = $("<input>").appendTo(this.wrapper).val(value).attr("title", "").addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left").autocomplete({
					delay: 0,
					minLength: 0,
					source: $.proxy(this, "_source")
				}).tooltip({
					"trigger": "manual"
				});

				this._on(this.input, {
					autocompleteselect: function (event, ui) {
						ui.item.option.selected = true;
						this._trigger("select", event, {
							item: ui.item.option
						});
						_this.editor.setFontFace(ui.item.option.innerHTML);
					},

					autocompletechange: "_removeIfInvalid"
				});
			},

			_createShowAllButton: function () {
				var input = this.input,
					wasOpen = false;
				const {formatMessage} = IntlProvider.intl;
				$('<a>').attr('tabIndex', -1).attr('title', formatMessage({id: 'editorctrl.show_all_items', defaultMessage: 'Show All Items'})).appendTo(this.wrapper).button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				}).removeClass("ui-corner-all").addClass("custom-combobox-toggle ui-corner-right").mousedown(function () {
					wasOpen = input.autocomplete("widget").is(":visible");
				}).click(function () {
					input.focus();

					// Close if already visible
					if (wasOpen) {
						return;
					}

					// Pass empty string as value to search for, displaying all
					// results
					input.autocomplete("search", "");
				});
			},

			_source: function (request, response) {
				var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
				response(this.element.children("option").map(function () {
					var text = $(this).text();
					if (this.value && (!request.term || matcher.test(text)))
						return {
							label: text,
							value: text,
							option: this
						};
				}));
			},

			_removeIfInvalid: function (event, ui) {
				const {formatMessage} = IntlProvider.intl;

				// Selected an item, nothing to do
				if (ui.item) {
					return;
				}

				// Search for a match (case-insensitive)
				var value = this.input.val(),
					valueLowerCase = value.toLowerCase(),
					valid = false;
				this.element.children("option").each(function () {
					if ($(this).text().toLowerCase() === valueLowerCase) {
						this.selected = valid = true;
						return false;
					}
				});

				// Found a match, nothing to do
				if (valid) {
					return;
				}

				// Remove invalid value
				this.input.val('').tooltip('set', 'content',
					formatMessage({ id: 'editorctrl.value_not_supported', defaultMessage: '{value} is not supported'}, { value: value})).tooltip('show');
				this.element.val('');
				this._delay(function () {
					this.input.tooltip("hide");
				}, 2500);
				this.input.autocomplete("instance").term = "";
			},

			_destroy: function () {
				this.wrapper.remove();
				this.element.show();
			}
		});

		//make searchable and styled:
		$("#combobox").combobox();
		$("#toggle").click(function () {
			$("#combobox").toggle();
		});
	}

	setupFontSizeSelector() {
		$('#txtSizeSpinner').spinner({
			min: 1,
			max: 99,
			step: 1
		});
		$('#txtSizeSpinner').width(20);
		$('#txtSizeSpinner').height(25);
	}
}