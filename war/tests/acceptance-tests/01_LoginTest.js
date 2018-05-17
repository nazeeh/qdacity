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
		const _this = this;
		this.driver = Common.setupChromeDriver();
		this.driver.get('http://localhost:8888/').then(() => {
			// switch to english version
			_this.driver.executeScript('localStorage.setItem("language", "en-US")')
				.then(done);
		});
    }, Common.getDefaultTimeout());

    afterEach((done) => {
        this.driver.quit().then(done);   
    }, Common.getDefaultTimeout());

    /**
     * This function tests the login of QDAcity with a google test-account. It registers a new account in QDAcity.
     */
    it('Should register and login a user', async (done) => {
    	
    	const _this = this;
    
		// Register Account
		this.driver.wait(until.elementLocated(By.xpath("//a[@id='signin-formula-register-link']"))).click().then(() => {
			console.log('Found and clicked the login button.');
		});

		// First name
		let fieldFirstName = this.driver.findElement(By.xpath("//input[@name='firstName']"));
		fieldFirstName.clear();
		fieldFirstName.sendKeys(loginHelper.userData.qdacityFirstName);

		// Last name
		let fieldLastName = this.driver.findElement(By.xpath("//input[@name='lastName']"));
		fieldLastName.clear();
		fieldLastName.sendKeys(loginHelper.userData.qdacityLastName);

		// Email
		let fieldEmail = this.driver.findElement(By.xpath("//input[@name='email']"));
		fieldEmail.clear();
		fieldEmail.sendKeys(loginHelper.userData.qdacityEmail);

		// Password
		let fieldPassword = this.driver.findElement(By.xpath("//input[@name='pwd']"));
		fieldPassword.clear();
		fieldPassword.sendKeys(loginHelper.userData.userPassword);
		
		// Register  
		this.driver.findElement(By.xpath("//button[contains(@class,'vex-dialog-button') and text()='Register']")).click().then(() => {
			console.log('Filled the form and clicked the register button.');
		}); 		
		
		this.driver.sleep(2000);
		this.driver.get('http://localhost:8888/').then( async () => {
			this.driver.wait(until.elementLocated(By.xpath("//a[@id='signin-formula-register-link']")));
			
			// Login Email
			let fieldEmailLogin = _this.driver.findElement(By.xpath("//input[@id='signin-forumla-email']"));
			fieldEmailLogin.clear();
			fieldEmailLogin.sendKeys(loginHelper.userData.qdacityEmail);

			// Login Password
			let fieldPasswordLogin = _this.driver.findElement(By.xpath("//input[@id='signin-formula-password']"));
			fieldPasswordLogin.clear();
			fieldPasswordLogin.sendKeys(loginHelper.userData.userPassword);

			// Login
			_this.driver.findElement(By.xpath("//button[@id='signin-formula-signin-btn']")).click().then(() => {
				console.log('Signed in.');
			}); 

			await _this.driver.wait(until.urlContains('PersonalDashboard'), 6000);
			
			// Check welcome message and URL
			_this.driver.wait(until.elementLocated(By.xpath("//span[starts-with(text(),'Welcome ')]"))).getText().then((text) => {
				console.log('Found the welcome message.');

				_this.driver.getCurrentUrl().then((currentUrl) => {	
					// Check the welcome message
					expect(text).toBe("Welcome " + loginHelper.userData.displayName);
					
					// Does the URL end with /PersonalDashboard?
					const urlEnd = "/PersonalDashboard";
					expect(currentUrl.substring(currentUrl.length - urlEnd.length, currentUrl.length)).toBe(urlEnd);
					
					// Check if the token of the signed-in user is stored in the localStorage 
					_this.driver.executeScript('return localStorage.getItem("qdacity-jwt-token")').then(function (token) {
						expect(token).not.toBeUndefined();
						expect(token).not.toBeNull();
					});

					loginHelper.storeLoginState(_this.driver).then(() => {
						console.log('Test Successful!');
						done();
					});
				})
			});
		});
    }, Common.getDefaultTimeout());
});