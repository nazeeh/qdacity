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

    it('Should create a new document', (done) => {
    	const projectName = 'Project_01';
    	const documentName = 'Document_01';
    	
    	// Find an existing project
    	this.driver.wait(until.elementLocated(By.xpath("//ul/li/span[text()='" + projectName + "']"))).click();    	
    	
    	// Find the coding editor button
    	this.driver.wait(until.elementLocated(By.xpath("//button[contains(@class,'btn')]/i[contains(@class,'fa-tags')]"))).click();   
    	
    	// Find add document button
    	this.driver.wait(until.elementLocated(By.xpath("//div[@id='documents-ui']//button/i[contains(@class,'fa-plus')]"))).click();   

    	// Find new text document button
    	this.driver.wait(until.elementLocated(By.xpath("//button[text()='New Text Document']"))).click();   

    	// Find the document name input field
    	this.driver.wait(until.elementLocated(By.xpath("//input[@name='vex' and @type='text' and @class='vex-dialog-prompt-input']"))).sendKeys(documentName);   

    	// Press OK
    	this.driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(@class,'vex-dialog-button')]"))).click();   

    	// Is the document in the document-list?    	
    	this.driver.wait(until.elementLocated(By.xpath("//div[text()='" + documentName + "']"))).then(() => {
    		done();
    	});
    }, defaultTimeout);
});