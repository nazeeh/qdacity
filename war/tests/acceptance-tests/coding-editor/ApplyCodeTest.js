var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

var loginHelper = require('../helper/LoginHelper.js');

var Common = require('../helper/Common.js');
var Conditions = require('../helper/Conditions.js');


const SPEC_NAME = 'Apply Code test';

describe(SPEC_NAME, function () {

	let driver = null;

	beforeAll(() => {
		Common.initializeSpec(SPEC_NAME);
    });

    beforeEach((done) => {
		this.driver = Common.setupChromeDriver();
		Common.openCodingEditor(this.driver, 'Project_01', done);
    }, Common.getExtendedTimeout());

    afterEach((done) => {
        this.driver.quit().then(done);
    }, Common.getExtendedTimeout());

    it('Should apply a code', (done) => {
    	const codeName = 'Code_01';
			const documentName = 'Document_01';
			const documentText = 'This is the text.';

		// Wait until documents are loaded
		this.driver.wait(until.elementLocated(By.id('documentList')));

		// Wait until codes are loaded
		this.driver.wait(until.elementLocated(By.id('codesystemTree')));

		// Find the document and select it
		this.driver.wait(until.elementLocated(By.xpath("//div[text()='" + documentName + "']"))).click();

		// Open Text-Editor
		this.driver.wait(until.elementLocated(By.xpath("//button/span[text()='Text-Editor']"))).click();

		// Focus text field and send input
		this.driver.actions().click(this.driver.findElement(By.xpath("//div[@role='textbox']"))).sendKeys(documentText).perform();


		// Find the document and select it
		this.driver.wait(until.elementLocated(By.xpath("//div[text()='" + documentName + "']"))).click();

		// Go to coding-editor
		this.driver.wait(until.elementLocated(By.xpath("//button/span[text()='Coding-Editor']"))).click();
		this.driver.sleep(2000);
		//Todo: Select the text

		//Apply code
		//this.driver.wait(until.elementLocated(By.id('applyCodeBtn'))).click();

    }, Common.getExtendedTimeout());
});
