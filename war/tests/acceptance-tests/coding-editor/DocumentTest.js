var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");
var loginHelper = require('../helper/LoginHelper.js');

import Common from '../helper/Common.js';
import Conditions from '../helper/Conditions.js';


const SPEC_NAME = 'Document test';

describe(SPEC_NAME, function () {

	let driver = null;
	
	beforeAll(() => {
		Common.initializeSpec(SPEC_NAME);
    });

    beforeEach((done) => {
    	this.driver = Common.setupChromeDriver();
		Common.openCodingEditor(this.driver, 'Project_01', () => {
			loginHelper.restoreLoginState(this.driver).then(done);
		});

	});
	
    afterEach((done) => {
        this.driver.quit().then(done);   
    });

    it('Should create a new document', (done) => {
    	const documentName = 'Document_01';
    	
    	// Find add document button
    	this.driver.wait(until.elementLocated(By.xpath("//div[@id='documents-ui']//button/i[contains(@class,'fa-plus')]"))).click();   

    	// Find new text document button
    	this.driver.wait(until.elementLocated(By.xpath("//button[text()='New Text Document']"))).click();   

    	// Find the document name input field
    	this.driver.wait(until.elementLocated(By.xpath("//input[@name='vex' and @type='text' and @class='vex-dialog-prompt-input']"))).sendKeys(documentName);   

    	// Press OK
    	this.driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(@class,'vex-dialog-button')]"))).click();   

    	// Is the document in the document-list?    	
		Conditions.assertDocumentExists(this.driver, documentName, done);
    }, Common.getDefaultTimeout());
    
    it('Should add text to a document', (done) => {
    	const documentName = 'Document_01';
    	
    	const documentText = 'This is the text.';
    	
    	const _this = this;
    	
    	// Find the document and select it
    	this.driver.wait(until.elementLocated(By.xpath("//div[text()='" + documentName + "']"))).click();
    	
    	// Open Text-Editor
    	this.driver.wait(until.elementLocated(By.xpath("//button/span[text()='Text-Editor']"))).click();
    	
    	// Focus text field and send input
    	this.driver.actions().click(this.driver.findElement(By.xpath("//div[@role='textbox']"))).sendKeys(documentText).perform();

        // Go to coding-editor
        this.driver.wait(until.elementLocated(By.xpath("//button/span[text()='Coding-Editor']"))).click();

    	// Find text field
		this.driver.wait(until.elementLocated(By.xpath("//div[@role='textbox']/p/span/span"))).getText().then((text) => {
    		expect(text).toBe(documentText);
    		done();
    	});
    }, Common.getDefaultTimeout());
});