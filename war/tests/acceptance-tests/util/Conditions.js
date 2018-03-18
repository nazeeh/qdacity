var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

export default class Conditions {

	static getProject(projectName) {
		return By.xpath("//ul/li/span[text()='" + projectName + "']");
	}

	static getProjectCodingEditorButton(projectName) {
		return By.xpath("//ul/li/span[text()='" + projectName + "']/following-sibling::div/button/i[contains(@class,'fa-tags')]");
	}

	static projectExists(driver, projectName) {
		driver.getCurrentUrl().then((currentUrl) => {
			const urlContent = "/PersonalDashboard";
			
			if (!currentUrl.includes(urlContent)) {
				throw new Error('The current page is not the PersonalDashboard.');
			}
		});

		// Will throw a timeout-exception if the project was not found
		driver.wait(until.elementLocated(Conditions.getProject(projectName)));
	}
}