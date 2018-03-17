var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

export default class Common {

	static initializeSpec(testName) {
		const headerTextBorderChar = '#';
		const headerTextWidth = 60;
		const headerTextBorderWidth = 4;

		const repeat = (str, length) => Array(length + 1).join(str);

		const headerTextRemainingSpaces = Math.max(0, headerTextWidth - 2 * headerTextBorderWidth - testName.length);
		const headerTextRemainingSpacesHalf = Math.floor(headerTextRemainingSpaces / 2);

		const textContentBorder = repeat(headerTextBorderChar, headerTextBorderWidth);
		const textContentName = testName;
		const textContentSpacesBefore = repeat(' ', Math.max(1, headerTextRemainingSpacesHalf));
		const textContentSpacesAfter = repeat(' ', Math.max(1, ((headerTextRemainingSpaces % 2) == 1) ? headerTextRemainingSpacesHalf + 1 : headerTextRemainingSpacesHalf));

		const textBorder = repeat(headerTextBorderChar, headerTextWidth);
		
		console.log(' ');
		console.log(textBorder);
		console.log(textContentBorder + textContentSpacesBefore + textContentName + textContentSpacesAfter + textContentBorder);
		console.log(textBorder);
	} 

	static setupChromeDriver() {
		const options = new chrome.Options();
    	
    	const driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .withCapabilities(options.toCapabilities())
			.build();
			
		return driver;
	}

	static getDefaultTimeout() {
		return 30000;
	}
}