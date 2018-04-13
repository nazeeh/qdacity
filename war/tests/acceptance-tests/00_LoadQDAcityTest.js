var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

var Common = require('./helper/Common.js');


const SPEC_NAME = 'Load QDAcity test';

describe(SPEC_NAME, function () {

	let driver = null;
	
	beforeAll(() => {
		Common.initializeSpec(SPEC_NAME);
    });
	
    beforeEach((done) => {
		console.log("Starting test at " + new Date() );
    	this.driver = Common.setupChromeDriver();
        this.driver.get('http://localhost:8888/').then(done);
    });

    afterEach((done) => {
        this.driver.quit().then(done);
		console.log("Ending test at " + new Date() );
    });

    it('The system is running', (done) => {
		// Find login button
		this.driver.wait(until.elementLocated(By.xpath("//button//i[contains(@class,'fa-sign-in')]"))).then(() =>  {
			console.log('Found the login button. Test passed!');
			console.log("Found button at " + new Date() );
			done();
		});
	}, Common.getDefaultTimeout());
});