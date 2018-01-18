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

    it('Should create a new project', (done) => {
    	const projectName = 'Project_01';
    	const projectDescription = 'The project description.'
    	
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
    	this.driver.wait(until.elementLocated(By.xpath("//h2[@class='page-header']/span[text()='" + projectName + "']")));    	
    	
    	// Check the project description
    	this.driver.findElement(By.xpath(""));    	
    	// TODO
    	
    	// überprüfen ob die Description übereinstimmt
    	// überprüfen ob in der URL /ProjectDashboard steht
    	
    	
    	
    	
		// Check the URL
//    	this.driver.wait(until.elementLocated(By.xpath("//span[starts-with(text(),'Welcome ')]"))).getText().then((text) => {
//    		_this.driver.getCurrentUrl().then((currentUrl) => {
//    			// Check the welcome message
//        		expect(text).toBe("Welcome " + googleFirstName);
//        		
//        		// Does the URL end with /PersonalDashboard?
//        		const urlEnd = "/PersonalDashboard";
//        		expect(currentUrl.substring(currentUrl.length - urlEnd.length, currentUrl.length)).toBe(urlEnd);
//        		
//    		    done();
//    		})
//    	});

    	
    }, defaultTimeout);
});