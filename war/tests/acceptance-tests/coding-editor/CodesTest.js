var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

import Common from '../util/Common.js';


const SPEC_NAME = 'Codesystem test';

describe(SPEC_NAME, function () {

	let driver = null;
	
	beforeAll(() => {
		Common.initializeSpec(SPEC_NAME);
    });

    beforeEach((done) => {
		this.driver = Common.setupChromeDriver();
		Common.openCodingEditor(this.driver, done, 'Project_01');
    });

    afterEach((done) => {
        this.driver.quit().then(done);   
    });

    it('Should create a new code', (done) => {
    	const codeName = 'Code_01';

    	// Find add code button
    	this.driver.wait(until.elementLocated(By.id('addCodeButtonId'))).click();   

    	// Find code name field
    	let codeNameField = By.xpath("//input[@name='vex' and @type='text' and @class='vex-dialog-prompt-input']");
    	this.driver.wait(until.elementLocated(codeNameField)).sendKeys(codeName); 
    	this.driver.findElement(codeNameField).sendKeys(webdriver.Key.TAB);
    	
    	// Find the OK button
    	this.driver.findElement(By.xpath("//div[@class='vex-dialog-buttons']/button[@type='submit' and contains(@class,'vex-dialog-button') and text()='OK']")).click();    	
    	
    	// Find the code in the codesystem
    	this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class,'clickable') and text()='" + codeName + "']"))).then(() => {
        	done();
    	});    		
    }, Common.getDefaultTimeout());
});