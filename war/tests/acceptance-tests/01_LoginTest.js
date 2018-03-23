var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");
var loginHelper = require('./helper/LoginHelper.js');

var Common = require('./helper/Common.js');


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
		const qdacityEmail = 'felixtest27@gmail.com';
		const userPassword = 'Password123';
    	
    	const _this = this;
    
		// Register Account
		this.driver.wait(until.elementLocated(By.xpath("//a[@id='signin-formula-register-link']"))).click();

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

		// Password
		let fieldPassword = this.driver.findElement(By.xpath("//input[@name='pwd']"));
		fieldPassword.clear();
		fieldPassword.sendKeys(userPassword);
		
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
				
				// Check if the token of the signed-in user is stored in the localStorage 
				_this.driver.executeScript('return localStorage.getItem("qdacity-emai-password-token")').then(function (token) {
					expect(token).not.toBeUndefined();
					expect(token).not.toBeNull();
				});

				loginHelper.storeLoginState(this.driver).then(() => {
					done();
				});
    		})
    	});
    }, Common.getDefaultTimeout());
});