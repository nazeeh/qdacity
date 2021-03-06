var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

var loginHelper = require('../helper/LoginHelper.js');

var Conditions = require('./Conditions.js');

function color(color, output) {
    return '\x1b['+color+'m'+output+'\x1b[0m';
}

const log = (s) => {
	process.stdout.write(color(95,s)+"\n");
};

class Common {

	static getDefaultTimeout() {
		return 30000;
	}
	
	static getExtendedTimeout() {
		return 120000;
	}
	
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
		
		log(textBorder);
		log(textContentBorder + textContentSpacesBefore + textContentName + textContentSpacesAfter + textContentBorder);
		log(textBorder);
	} 

	static setupChromeDriver() {
		const options = new chrome.Options();
    	
    	const driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .withCapabilities(options.toCapabilities())
			.build();
			
		return driver;
	}

	static openCodingEditor(driver, projectName, done) {
		driver.get('http://localhost:8888/PersonalDashboard').then(() => {
			loginHelper.restoreLoginState(driver);

			Conditions.assertProjectExists(driver, projectName);
		
			driver.wait(until.elementLocated(Conditions.getProjectCodingEditorButton(projectName))).click().then(done); 
		});
	}
}

module.exports = Common;