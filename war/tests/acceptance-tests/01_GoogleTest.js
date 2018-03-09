var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('Google Test', function() {

	var defaultTimeout = 30000;
	
	var driver = null;
	
    beforeEach((done) => {
    	const options = new chrome.Options();

        this.driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .withCapabilities(options.toCapabilities())
	        .build();

        this.driver.get('https://www.google.de/').then(done);
    }, defaultTimeout);

    afterEach((done) => {
        this.driver.quit().then(done);   
    }, defaultTimeout);

    it('Load Google', (done) => {
		const _this = this;
		
    	this.driver.wait(until.elementLocated(By.xpath("//input[@name='btnK']"))).then(() => {
    		_this.driver.getTitle().then((title) => {
        		expect(title).toBe('Google');
        		
    		    done();
    		})
    	});
    }, defaultTimeout);
});