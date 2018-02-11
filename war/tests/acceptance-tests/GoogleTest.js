var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

describe('google test', function() {

	var defaultTimeout = 10000;
	
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

    it('Open google', (done) => {
		const _this = this;
		
    	console.log('First test. Waiting for Login button');
		
    	this.driver.wait(until.elementLocated(By.xpath("//input[@name='btnK']"))).then(() => {
    	console.log('Found login button');
		
    		_this.driver.getTitle().then((title) => {
    	    	console.log('Found title');
    	    	
        		expect(title).toBe('Google');
        		
    		    done();
    		})
    	});
    }, defaultTimeout);
});