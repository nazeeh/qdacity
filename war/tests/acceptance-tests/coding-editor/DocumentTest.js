var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

import Common from '../util/Common.js';


const TEST_NAME = 'Document test';

describe(TEST_NAME, function () {

	var defaultTimeout = 30000;
	
	var driver = null;
	
	beforeAll(() => {
		Common.initializeTest(TEST_NAME);
    });

    beforeEach((done) => {
    	const options = new chrome.Options();
    	
        this.driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .withCapabilities(options.toCapabilities())
	        .build();

        this.driver.get('http://localhost:8888/PersonalDashboard').then(done);
    }, defaultTimeout);

    afterEach((done) => {
        this.driver.quit().then(done);   
    }, defaultTimeout);

    it('Should create a new document', (done) => {
    	const projectName = 'Project_01';
    	const documentName = 'Document_01';
    	
    	// Find an existing project and open the coding editor
    	this.driver.wait(until.elementLocated(By.xpath("//ul/li/span[text()='" + projectName + "']/following-sibling::div/button/i[contains(@class,'fa-tags')]"))).click();    	
    	
    	// Find add document button
    	this.driver.wait(until.elementLocated(By.xpath("//div[@id='documents-ui']//button/i[contains(@class,'fa-plus')]"))).click();   

    	// Find new text document button
    	this.driver.wait(until.elementLocated(By.xpath("//button[text()='New Text Document']"))).click();   

    	// Find the document name input field
    	this.driver.wait(until.elementLocated(By.xpath("//input[@name='vex' and @type='text' and @class='vex-dialog-prompt-input']"))).sendKeys(documentName);   

    	// Press OK
    	this.driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(@class,'vex-dialog-button')]"))).click();   

    	// Is the document in the document-list?    	
    	this.driver.wait(until.elementLocated(By.xpath("//div[text()='" + documentName + "']"))).then(() => {
    		done();
    	});
    }, defaultTimeout);
    
    it('Should add text to a document', (done) => {
    	const projectName = 'Project_01';
    	const documentName = 'Document_01';
    	
    	const documentText = 'This is the text.';
    	
    	const _this = this;
    	
    	// Find an existing project and open the coding editor
    	this.driver.wait(until.elementLocated(By.xpath("//ul/li/span[text()='" + projectName + "']/following-sibling::div/button/i[contains(@class,'fa-tags')]"))).click();    	
    	
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
    }, defaultTimeout);
});