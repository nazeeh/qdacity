var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('Simple test', function() {

	var defaultTimeout = 40000;
	
	var driver = null;
	
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

    it('The system is working', (done) => {
		// Find login button
		this.driver.wait(until.elementLocated(By.xpath("//button//i[contains(@class,'fa-google')]"))).then(() =>  {
			expect(1).toBe(2);
			done();
		});
    }, defaultTimeout);
});