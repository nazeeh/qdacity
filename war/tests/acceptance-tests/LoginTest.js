var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('Login test', function() {

	var defaultTimeout = 20000;
	
	var driver = null;
	
    beforeEach((done) => {
    	console.log('STARTING LOGIN ACCEPTANCE TEST');
    	
    	const options = new chrome.Options();
    	options.addArguments('headless');
    	options.addArguments('window-size=1200x600');
    	
//    	options.addArguments('user-data-dir=C:\Users\Felix\AppData\Local\Google\Chrome\User Data\Profile 1');
//    	options.addArguments('start-maximized');   	

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
    	const googleLogin = 'felixtest22@gmail.com';
    	const googlePassword = 'felix12345';
    	const googleFirstName = 'Max';
    	const qdacityFirstName = 'Test-Dummy First Name';
    	const qdacityLastName = 'Test-Dummy Last Name';
    	const qdacityEmail = 'felixtest22@gmail.com';
    	
    	const _this = this;
    	
    	console.log('LOGIN-TEST: first step');
    	
    	// Click login button
    	this.driver.wait(until.elementLocated(By.xpath("//button//i[contains(@class,'fa-google')]"))).click();    	

    	console.log('LOGIN-TEST: found login button');
    	
    	// Switch to Google-Login popup window
    	const currentWindow = { handle: null };
    	
    	this.driver.getAllWindowHandles().then((handles) => {
        	_this.driver.getWindowHandle().then((currentHandle) => {
        		currentWindow.handle = currentHandle;
        		
	    		if (handles) {
		    		for (let i = 0; i < handles.length; i++) {
		    			const handle = handles[i];
		    			
		    			if (handle != currentHandle) {
		    				_this.driver.switchTo().window(handle);
		    				break;
		    			}
		    		}
	    		}	    		
        	});
    	});

    	console.log('LOGIN-TEST: switched to google popup');
    	
    	// Email
    	let byEmailInput = By.xpath("//input[@type='email' and @name='identifier']");
    	this.driver.wait(until.elementLocated(byEmailInput));
    	this.driver.wait(until.elementIsVisible(this.driver.findElement(byEmailInput))).sendKeys(googleLogin);

    	console.log('LOGIN-TEST: found email field');
    	
    	// Wait
    	this.driver.sleep(200);
    	
		// Next
		let byNextButtonEmail = By.xpath("//div[@role='button' and @id='identifierNext']");
    	this.driver.wait(until.elementLocated(byNextButtonEmail));
    	this.driver.wait(until.elementIsVisible(this.driver.findElement(byNextButtonEmail))).click();  
    	
    	// Password    	
    	let byPasswordInput = By.xpath("//input[@type='password' and @name='password']");
    	this.driver.wait(until.elementLocated(byPasswordInput));
    	this.driver.wait(until.elementIsVisible(this.driver.findElement(byPasswordInput))).sendKeys(googlePassword);

    	console.log('LOGIN-TEST: found password field');
    	
    	// Wait
    	this.driver.sleep(200);
    	
		// Next
		let byNextButtonPassword = By.xpath("//div[@role='button' and @id='passwordNext']");
    	this.driver.wait(until.elementLocated(byNextButtonPassword));
    	this.driver.wait(until.elementIsVisible(this.driver.findElement(byNextButtonPassword))).click();   	

    	console.log('LOGIN-TEST: continue with next button');
    	
    	// Switch back to main window
    	this.driver.sleep(500).then(() => {
    		_this.driver.switchTo().window(currentWindow.handle);
    	});

    	console.log('LOGIN-TEST: switched back to main window');
    	
    	// These steps are necessary if the test-account is not registered yet
    	this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class,'vex-dialog-button') and text()='Register Account']")), 3000).then(() => {
        	// Register Account (QDAcity)
    		_this.driver.findElement(By.xpath("//button[contains(@class,'vex-dialog-button') and text()='Register Account']")).click();

        	console.log('LOGIN-TEST: registering account');
        	
    		// First name
    		let fieldFirstName = _this.driver.findElement(By.xpath("//input[@name='firstName']"));
    		fieldFirstName.clear();
    		fieldFirstName.sendKeys(qdacityFirstName);

    		// Last name
    		let fieldLastName = _this.driver.findElement(By.xpath("//input[@name='lastName']"));
    		fieldLastName.clear();
    		fieldLastName.sendKeys(qdacityLastName);

    		// Email
    		let fieldEmail = _this.driver.findElement(By.xpath("//input[@name='email']"));
    		fieldEmail.clear();
    		fieldEmail.sendKeys(qdacityEmail);
        	
    		// Register  
    		_this.driver.findElement(By.xpath("//button[contains(@class,'vex-dialog-button') and text()='Register']")).click(); 		
    	}, (err) => {
    		console.log('User is already registered in the database. Continue the test.');
    	});		
    	

    	console.log('LOGIN-TEST: Should go to ProjectDashboard now. Wait 5 Seconds first.');
    	
    	this.driver.sleep(5000);
    	

    	console.log('LOGIN-TEST: Waited 5 Seconds');
    	
    	// DEBUG
    	this.driver.wait(until.elementLocated(By.xpath("//h1/span[starts-with(text(),'QDAcity')]"))).getText().then((text) => {
	    	console.log('LOGIN-TEST: WE ARE STILL ON THE HOMEPAGE');
    		
    	});	
    	
		
		// Check welcome message and URL
    	this.driver.wait(until.elementLocated(By.xpath("//span[starts-with(text(),'Welcome ')]"))).getText().then((text) => {
    		_this.driver.getCurrentUrl().then((currentUrl) => {
    	    	console.log('LOGIN-TEST: found welcome message');
    	    	
    			// Check the welcome message
        		expect(text).toBe("Welcome " + googleFirstName);
        		
        		// Does the URL end with /PersonalDashboard?
        		const urlEnd = "/PersonalDashboard";
        		expect(currentUrl.substring(currentUrl.length - urlEnd.length, currentUrl.length)).toBe(urlEnd);
        		
    		    done();
    		})
    	});
    }, defaultTimeout);
});