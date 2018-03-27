//@ts-check

var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");
var loginHelper = require('../helper/LoginHelper.js');

describe('Setting Delete Qdacity User', function() {

	var defaultTimeout = 30000;
	
	var driver = null;
	
	beforeAll((done) => {
    	console.log(' ');
    	console.log('#########################################################');
    	console.log('####                  Settings test                  ####');
    	console.log('#########################################################');
		done();
    });

    beforeEach((done) => {
    	const options = new chrome.Options();

        this.driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .withCapabilities(options.toCapabilities())
			.build();
			
			this.driver.get('http://localhost:8888/Settings').then(() => {
				loginHelper.restoreLoginState(this.driver).then(done);
			});
    }, defaultTimeout);

    afterEach((done) => {
        this.driver.quit().then(done);   
    }, defaultTimeout);

    it('deletes user and signs-out', (done) => {
        const _this = this;
        const deleteInput = 'DELETE';	
    	
    	// Press delete button
        this.driver.wait(until.elementLocated(By.xpath("//button[@id='profile-settings-delete-button']"))).click();    	
        
    	this.driver.sleep(1000);

    	// Write DELETE into popup
    	this.driver.findElement(By.xpath("//div[contains(@class,'vex-dialog-input')]/input[@name='deleteInput']")).sendKeys(deleteInput);    	
    	
    	// Find the "Delete" button
        this.driver.findElement(By.xpath("//div[contains(@class,'vex-dialog-buttons')]/button[@type='submit']")).click();    
        
    	this.driver.sleep(1000);	
        
    	// Find the "OK" button
    	this.driver.findElement(By.xpath("//div[contains(@class,'vex-dialog-buttons')]/button[@type='button']")).click();    

        this.driver.sleep(2000);	

        this.driver.getCurrentUrl().then((currentUrl) => {
            // check if user got redirected to index
            expect(currentUrl.includes('Settings')).toBeFalsy();

            // Check if the user got logged out
            _this.driver.executeScript('return localStorage.getItem("qdacity-jwt-token")').then(function (token) {
                expect(token).toBeNull();
            });

            // Try to login (should fail)
            _this.driver.wait(until.elementLocated(By.xpath("//input[contains(@id, 'signin-forumla-email')]"))).sendKeys(loginHelper.userData.qdacityEmail);
            _this.driver.findElement(By.xpath("//input[contains(@id, 'signin-formula-password')]")).sendKeys(loginHelper.userData.userPassword);
            _this.driver.findElement(By.xpath("//button[contains(@id, 'signin-formula-signin-btn')]")).click();
        
            _this.driver.sleep(1000);

            this.driver.getCurrentUrl().then((currentUrl) => {
                expect(currentUrl.includes('PersonalDashboard')).toBeFalsy();

                done();
            });

        });

    }, defaultTimeout);
});