var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

import Common from './util/Common.js';


const SPEC_NAME = 'Login test';

describe(SPEC_NAME, function () {

	let driver = null;
	
	beforeAll(() => {
		Common.initializeSpec(SPEC_NAME);
    });

    beforeEach((done) => {
    	this.driver = Common.setupChromeDriver();
        this.driver.get('http://localhost:8888/').then(done);
    });

    afterEach((done) => {
        this.driver.quit().then(done);   
    });

    /**
     * This function tests the login of QDAcity with a google test-account. It registers a new account in QDAcity.
     */
    it('Should register and login a user', (done) => {
    	const displayName = 'Max Mustermann';
    	const qdacityFirstName = 'Max';
    	const qdacityLastName = 'Mustermann';
    	const qdacityEmail = 'felixtest22@gmail.com';
    	
    	const _this = this;
    	
    	// Click login button
    	this.driver.wait(until.elementLocated(By.xpath("//button//i[contains(@class,'fa-google')]"))).click();    	

		// Register Account
		this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class,'vex-dialog-button') and text()='Register Account']"))).click();

		// First name
		let fieldFirstName = this.driver.findElement(By.xpath("//input[@name='firstName']"));
		fieldFirstName.clear();
		fieldFirstName.sendKeys(qdacityFirstName);

		// Last name
		let fieldLastName = this.driver.findElement(By.xpath("//input[@name='lastName']"));
		fieldLastName.clear();
		fieldLastName.sendKeys(qdacityLastName);

		// Email
		let fieldEmail = this.driver.findElement(By.xpath("//input[@name='email']"));
		fieldEmail.clear();
		fieldEmail.sendKeys(qdacityEmail);
		
		// Register  
		this.driver.findElement(By.xpath("//button[contains(@class,'vex-dialog-button') and text()='Register']")).click(); 		
    	    	
    	this.driver.sleep(2000);
    	
		// Check welcome message and URL
    	this.driver.wait(until.elementLocated(By.xpath("//span[starts-with(text(),'Welcome ')]"))).getText().then((text) => {
    		_this.driver.getCurrentUrl().then((currentUrl) => {	
    			// Check the welcome message
        		expect(text).toBe("Welcome " + displayName);
        		
        		// Does the URL end with /PersonalDashboard?
        		const urlEnd = "/PersonalDashboard";
        		expect(currentUrl.substring(currentUrl.length - urlEnd.length, currentUrl.length)).toBe(urlEnd);
        		
    		    done();
    		})
    	});
    }, Common.getDefaultTimeout());
});