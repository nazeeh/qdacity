var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");
var loginHelper = require('./helper/LoginHelper.js');

describe('Project test', function() {

	var defaultTimeout = 30000;
	
	var driver = null;
	
	beforeAll((done) => {
    	console.log(' ');
    	console.log('#########################################################');
    	console.log('####                  Project test                   ####');
    	console.log('#########################################################');
		done();
    });

    beforeEach((done) => {
    	const options = new chrome.Options();

        this.driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .withCapabilities(options.toCapabilities())
			.build();
			
			this.driver.get('http://localhost:8888/PersonalDashboard').then(() => {
				loginHelper.restoreLoginState(this.driver).then(done);
			});
    }, defaultTimeout);

    afterEach((done) => {
        this.driver.quit().then(done);   
    }, defaultTimeout);

    it('Should create a new project', (done) => {
    	const projectName = 'Project_01';
    	const projectDescription = 'The project description.'
    	
    	const _this = this;
    		
    	// Click new project button
    	this.driver.wait(until.elementLocated(By.id('newPrjBtn'))).click();    	
    	
    	// Find the name field
    	this.driver.wait(until.elementLocated(By.xpath("//div[@class='vex-custom-field-wrapper']/div[@class='vex-custom-input-wrapper']/input[@name='name' and @type='text']"))).sendKeys(projectName);    	

    	// Find the description field
    	this.driver.findElement(By.xpath("//div[@class='vex-custom-field-wrapper']/div[@class='vex-custom-input-wrapper']/textarea[@type='text']")).sendKeys(projectDescription);    	
    	
    	// Find the "OK" button
    	this.driver.findElement(By.xpath("//div[@class='vex-dialog-buttons']/button[@type='submit' and contains(@class,'vex-dialog-button') and text()='OK']")).click();    	
    	
    	// Is the project in the project-list?
    	// If xpath can't find the project, it was not created properly. The timeout will indicate the failure of the test.
    	// If the project was created properly, open it by clicking on it.
    	this.driver.wait(until.elementLocated(By.xpath("//ul/li/span[text()='" + projectName + "']"))).click();    	
    	
		// Find the project title
    	this.driver.wait(until.elementLocated(By.xpath("//h2[@class='page-header']/span[text()='" + projectName + "']"))).then(() => {
    		// Find the project description
        	_this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class,'box')]/div[text()='" + projectDescription + "']"))).then(() => {
        		// Check the URL
	    		_this.driver.getCurrentUrl().then((currentUrl) => {
	        		// Does the URL end with /ProjectDashboard?
	        		const urlContent = "/ProjectDashboard";
	        		expect(currentUrl.includes(urlContent)).toBeTruthy();
	        		
	    		    done();
	    		});
        	});
    	});
    }, defaultTimeout);
});