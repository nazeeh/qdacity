import Promisizer from '../endpoints/Promisizer';

/**
 * @author Robin Kreuzer
 */

export default class DomInteractor {
	//funcs = [];

	constructor() {
		this.funcs = [];
	}

	getElementById(id) {
		return document.getElementById(id);
	}

	getElementsByClass(cclass) {
		return document.getElementsByClassName(cclass);
	}

	applyFunctionToElementsByClass(cclass, func) {
		var back = this.getElementsByClass(cclass);
		for (var i = 0; i < back.length; i++) {
			func(back[i]);
		}
	}
	//last state of display can be important: https://stackoverflow.com/questions/13688238/javascript-style-display-none-or-jquery-hide-is-more-efficient
	//but is not yet implemented
	showElement(domObject) {
		domObject.classList.remove('noneDisplay');
		if (domObject.style.display == 'none') {
			domObject.style.display = 'inline';
		}
	}

	showElementAnimated(domObject, duration) {
		$(domObject).stop(true);
		$(domObject).show(duration);
	}

	hideElement(domObject) {
		domObject.classList.add('noneDisplay');
	}

	hideElementAnimated(domObject, duration) {
		$(domObject).stop(true);
		$(domObject).hide(duration);
	}

	//**************
	//the following methods are only be used, if i dont have direct access to the dom elements,
	//for example: third party libraries, which dont use react or sth. like that

	//func_jq: the function, which will be called if test_if_exists in the dome is available
	//public
	future_jq(func_jq, test_if_exists) {
		var dhis = this;

		obs = function(func) {
			if (
				test_if_exists().html() != undefined &&
				test_if_exists().html() != ''
			) {
				func_jq();
				dhis.delete_observer(func);
			}
		};

		dhis.push_observer(obs);
	}

	//private
	observe_dom() {
		for (i = 0; i < funcs.length; ++i) {
			funcs[i](funcs[i]);
		}
	}

	//private
	push_observer(func) {
		funcs.push(func);
	}

	//private
	delete_observer(func) {
		index = funcs.indexOf(func);
		if (index > -1) {
			funcs.splice(index, 1);
		}
	}
}
