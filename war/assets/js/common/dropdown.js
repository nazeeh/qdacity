export default class Dropdown {
	static initDropDown() {
		window.onclick = function (event) {
			if (!event.target.matches('.dropdownToggle')) {

				var dropdowns = document.getElementsByClassName("dropdownContent");

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
				if (element.classList != null && element.classList.contains('customDropDownParent')) {
					eventTargetIsNotDropdown = false;
				}

				element = element.parentNode;
			}


			if (eventTargetIsNotDropdown) {
				var customDropdownComponents = document.getElementsByClassName("customDropDownEventNode");

				var event = new Event('hideDropDown');

				for (var i = 0; i < customDropdownComponents.length; i++) {
					var customDropdownComponent = customDropdownComponents[i];
					customDropdownComponent.dispatchEvent(event);
				}
			}
		}
	}

}