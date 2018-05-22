var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

var loginHelper = require('./helper/LoginHelper.js');

var Common = require('./helper/Common.js');
var Conditions = require('./helper/Conditions.js');


const SPEC_NAME = 'Project revision test';

describe(SPEC_NAME, function () {

	let driver = null;

	beforeAll(() => {
		Common.initializeSpec(SPEC_NAME);
    });

    beforeEach((done) => {
		const _this = this;
		this.driver = Common.setupChromeDriver();

		this.driver.get('http://localhost:8888/PersonalDashboard').then(() => {
			// switch to english version
			_this.driver.executeScript('localStorage.setItem("language", "en-US")')
				.then(() => {
					loginHelper.restoreLoginState(this.driver).then(done);
				});
		});
	}, Common.getDefaultTimeout());

    afterEach((done) => {
        this.driver.quit().then(done);
    }, Common.getDefaultTimeout());

    it('Should create a new project revision', (done) => {
    	const projectName = 'Project_01';
    	const projectRevisionDescription = 'The project revision description.'

    	const _this = this;

    	//Open the project (existing project with name projectName) by clicking on it
			Conditions.assertProjectExists(this.driver, projectName);
			this.driver.wait(until.elementLocated(Conditions.getProject(projectName))).click();

			//Click new project revision button
			this.driver.wait(until.elementLocated(By.id('CreateRevisionBtn'))).click();

    	//Find the description field
    	this.driver.findElement(By.xpath("//div[@class='vex-custom-field-wrapper']/div[@class='vex-custom-input-wrapper']/textarea[@type='text']")).sendKeys(projectRevisionDescription);

    	//Find the "OK" button
    	this.driver.findElement(By.xpath("//div[@class='vex-dialog-buttons']/button[@type='submit' and contains(@class,'vex-dialog-button') and text()='OK']")).click();

			this.driver.wait(until.elementLocated(By.xpath("//div[@class='timeline-body timelineContent']"))).getText().then((text) => {
					expect(text).toBe(projectRevisionDescription);
					done();
				});

    }, Common.getDefaultTimeout());
});
