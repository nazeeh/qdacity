var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('Project test', function() {

	var defaultTimeout = 30000;
	
	var driver = null;
	
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

    it('Should create a new code', (done) => {
    	const projectName = 'Project_01';
    	const codeName = 'Code_01';

    	// Find an existing project and open the coding editor
    	this.driver.wait(until.elementLocated(By.xpath("//ul/li/span[text()='" + projectName + "']/following-sibling::div/button/i[contains(@class,'fa-tags')]"))).click();    	
    	
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
    }, defaultTimeout);
});