var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

var loginHelper = require('./helper/LoginHelper.js');

var Common = require('./helper/Common.js');
var Conditions = require('./helper/Conditions.js');


const SPEC_NAME = 'Exercise test';

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

    it('Should create a new exercise from a project revision', (done) => {

		this.driver.wait(until.elementLocated(By.id('configureCourseBtn'))).click();
		this.driver.getCurrentUrl().then((currentUrl) => {
				// Does the URL end with /CourseDashboard?
				const urlContent = "/CourseDashboard";
				expect(currentUrl.includes(urlContent)).toBeTruthy();
				this.driver.wait(until.elementLocated(By.id('configureTermCourseBtn'))).click();

				this.driver.getCurrentUrl().then((currentUrl) => {
						// Does the URL end with /TermCourseConfig?
						const urlContent = "/TermCourseConfig";
						expect(currentUrl.includes(urlContent)).toBeTruthy();
						//Wait for projects & revisions to be retrieved
						this.driver.sleep(4000);
						this.driver.wait(until.elementLocated(By.id('newExerciseBtn'))).click();

						//Insert exercise parameters
			    	this.driver.wait(until.elementLocated(By.xpath("//div[@class='vex-custom-field-wrapper']/div[@class='vex-custom-input-wrapper']/input[@name='name' and @type='text']"))).sendKeys("Exercise_1");
						this.driver.wait(until.elementLocated(By.id('projectRevisionDropDownBtn'))).click();
						this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class,'customDropDownParent')]/ul/li[text()='0']"))).click();
						// click the "OK" button
			    	this.driver.findElement(By.xpath("//div[@class='vex-dialog-buttons']/button[@type='submit' and contains(@class,'vex-dialog-button') and text()='OK']")).click();

						// Find the exercise
					this.driver.wait(until.elementLocated(By.xpath("//div[@id='exerciseList']/div/ul/li/span"))).getText().then((text) => {
							expect(text).toBe("Exercise_1");
							done();
						});
				});

		});

    }, Common.getDefaultTimeout());
});
