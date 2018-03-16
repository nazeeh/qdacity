var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('Load QDAcity', function() {

	var defaultTimeout = 30000;
	
	var driver = null;
	
	beforeAll((done) => {
    	console.log('#########################################################');
    	console.log('####                Load QDAcity test                ####');
    	console.log('#########################################################');
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

    it('The system is running', (done) => {
		// Find login button
		this.driver.wait(until.elementLocated(By.xpath("//button//i[contains(@class,'fa-google')]"))).then(() =>  {
			expect(1).toBe(1);
			done();
		});
    }, defaultTimeout);
});