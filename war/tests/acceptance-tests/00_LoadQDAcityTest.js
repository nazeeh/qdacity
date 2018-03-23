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
    	this.driver = Common.setupChromeDriver();
        this.driver.get('http://localhost:8888/').then(done);
    });

    afterEach((done) => {
        this.driver.quit().then(done);   
    });

    it('The system is running', (done) => {
		// Find login button
		this.driver.wait(until.elementLocated(By.xpath("//button//i[contains(@class,'fa-google')]"))).then(() =>  {
			expect(1).toBe(1);
			done();
		});
    }, Common.getDefaultTimeout());
});