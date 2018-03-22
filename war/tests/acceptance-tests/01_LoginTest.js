var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('Login test', function() {

	var defaultTimeout = 30000;
	
	var driver = null;
	
	beforeAll((done) => {
    	console.log(' ');
    	console.log('#########################################################');
    	console.log('####                   Login test                    ####');
    	console.log('#########################################################');
		done();
    });

    beforeEach((done) => {
    	const options = new chrome.Options();
    	
        this.driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .withCapabilities(options.toCapabilities())
	        .build();

        this.driver.get('http://localhost:8888/').then(done);
    }, defaultTimeout);

    afterEach((done) => {
        this.driver.quit().then(done);
    }, defaultTimeout);

    /**
     * This function tests the login of QDAcity with a google test-account. If the test-account
     * is not registered within QDAcity, the test registers the account.
     */
    it('Should register and login a user', (done) => {
    	const displayName = 'Test Name';
    	const qdacityFirstName = 'Max';
    	const qdacityLastName = 'Mustermann';
		const qdacityEmail = 'felixtest22@gmail.com';
		const userPassword = 'password123';
    	
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
        		
    		    done();
    		})
    	});
    }, defaultTimeout);
});