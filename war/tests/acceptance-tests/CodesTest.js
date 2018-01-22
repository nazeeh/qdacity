var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('Project test', function() {

	var defaultTimeout = 20000;
	
	var driver = null;
	
    beforeEach((done) => {
    	const options = new chrome.Options();
    	
    	options.addArguments('user-data-dir=C:\\Users\\Felix\\AppData\\Local\\Google\\Chrome\\User Data');
    	options.addArguments('start-maximized');   	

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

    	// Find an existing project
    	this.driver.wait(until.elementLocated(By.xpath("//ul/li/span[text()='" + projectName + "']"))).click();    	
    	
    	// Find the coding editor button
    	this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class,'btn')]/i[contains(@class,'fa-tags')]"))).click();   
    	
    	// Find add code button
    	this.driver.wait(until.elementLocated(By.id('addCodeButtonId'))).click();   

    	// Find code name field
    	this.driver.wait(until.elementLocated(By.xpath("//input[@name='vex' and @type='text' and @class='vex-dialog-prompt-input']"))).sendKeys(codeName); 
    	
    	// Find the OK button
    	this.driver.findElement(By.xpath("//div[@class='vex-dialog-buttons']/button[@type='submit' and contains(@class,'vex-dialog-button') and text()='OK']")).click();    	
    	
    	// Find the code in the codesystem
    	this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class,'clickable') and text()='" + codeName + "']"))).then(() => {
    		done();
    	});    		
    }, defaultTimeout);
});