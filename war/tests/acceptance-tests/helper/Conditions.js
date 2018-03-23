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

	static getProjectDescription(projectDescription) {
		return By.xpath("//div[contains(@class,'box')]/div[text()='" + projectDescription + "']");
	}

	static getCode(codeName) {
		return By.xpath("//div[contains(@class,'clickable') and text()='" + codeName + "']");
	}

	static getDocument(documentName) {
		return By.xpath("//div[text()='" + documentName + "']");
	}

	static assertUrlContainsText(driver, requiredUrl) {
		driver.getCurrentUrl().then((currentUrl) => {
			if (!currentUrl.includes(requiredUrl)) {
				throw new Error('The current page is not ' + requiredUrl);
			}
		});
	}

	static assertElementExists(driver, url, elementName, by, then) {
		if (url) {
			Conditions.assertUrlContainsText(driver, url);
		}

		driver.wait(until.elementLocated(by)).then(then, () => { throw new Error('Element not found: ' + elementName) });
	}

	static assertProjectExists(driver, projectName, then) {
		Conditions.assertElementExists(driver, '/PersonalDashboard', 'Project', Conditions.getProject(projectName), then);
	}

	static assertProjectDescription(driver, projectDescription, then) {
		Conditions.assertElementExists(driver, '/ProjectDashboard', 'Project description', Conditions.getProjectDescription(projectDescription), then);
	}

	static assertCodeExists(driver, codeName, then) {
		Conditions.assertElementExists(driver, '/CodingEditor', 'Code', Conditions.getCode(codeName), then);
	}
	
	static assertDocumentExists(driver, documentName, then) {
		Conditions.assertElementExists(driver, '/CodingEditor', 'Document', Conditions.getDocument(documentName), then);
	}
}