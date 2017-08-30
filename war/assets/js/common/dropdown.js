export default class Dropdown {
	static initDropDown() {
		window.onclick = function (event) {
			if (!event.target.matches('.dropdownToggle')) {

				var dropdowns = document.getElementsByClassName("dropdownContent");
				var i;
				for (i = 0; i < dropdowns.length; i++) {
					var openDropdown = dropdowns[i];
					if (openDropdown.classList.contains('show')) {
						openDropdown.classList.remove('show');
					}
				}
			}
		}
	}

}