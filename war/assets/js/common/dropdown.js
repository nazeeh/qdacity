export default class Dropdown {
	static isDropDownToggle(element) {
		if (element instanceof HTMLElement) {
			if (element.classList.contains('dropdownToggle')) {
				return true;
			}
			return this.isDropDownToggle(element.parentNode);
		}
		return false;
	}
	static initDropDown() {
		window.onclick = function(event) {
			if (!Dropdown.isDropDownToggle(event.target)) {
				var dropdowns = document.getElementsByClassName('dropdownContent');

				for (var i = 0; i < dropdowns.length; i++) {
					var openDropdown = dropdowns[i];
					if (openDropdown.classList.contains('show')) {
						openDropdown.classList.remove('show');
					}
				}
			}

			// DropDown Component
			var eventTargetIsNotDropdown = true;

			var element = event.target;

			while (element != null && eventTargetIsNotDropdown == true) {
				if (
					element.classList != null &&
					element.classList.contains('customDropDownParent')
				) {
					eventTargetIsNotDropdown = false;
				}

				element = element.parentNode;
			}

			if (eventTargetIsNotDropdown) {
				var customDropdownComponents = document.getElementsByClassName(
					'customDropDownEventNode'
				);

				var event = new Event('hideDropDown');

				for (var i = 0; i < customDropdownComponents.length; i++) {
					var customDropdownComponent = customDropdownComponents[i];
					customDropdownComponent.dispatchEvent(event);
				}
			}
		};
	}
}
