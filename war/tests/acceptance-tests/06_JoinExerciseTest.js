var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

var loginHelper = require('./helper/LoginHelper.js');

var Common = require('./helper/Common.js');
var Conditions = require('./helper/Conditions.js');


const SPEC_NAME = 'Join exercise test';

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

    it('Should join an existing exercise', (done) => {
    	const courseName = 'Course_01';
    	const _this = this;

		//Click on the course in the list to open its term course page (default is first in the list, which in this case is the only term course)
		Conditions.assertCourseExists(this.driver, courseName);
		this.driver.wait(until.elementLocated(Conditions.getCourse(courseName))).click();

		this.driver.getCurrentUrl().then((currentUrl) => {
				// Does the URL end with /TermDashboard?
				const urlContent = "/TermDashboard";
				expect(currentUrl.includes(urlContent)).toBeTruthy();
				this.driver.wait(until.elementLocated(By.id('joinTermCourseBtn'))).click();
	    	this.driver.findElement(By.xpath("//div[@class='vex-dialog-buttons']/button[@type='submit' and contains(@class,'vex-dialog-button') and text()='OK']")).click();
				this.driver.wait(until.elementLocated(By.xpath("//div[@id='exerciseList']/div/ul/li/span"))).getText().then((text) => {
						expect(text).toBe("Exercise_1");
						this.driver.wait(until.elementLocated(By.id('joinExerciseBtn'))).click();
						this.driver.sleep(3000);
						this.driver.getCurrentUrl().then((currentUrl) => {
								// Does the URL end with /CodingEditor?
								const urlContent = "/CodingEditor";
								expect(currentUrl.includes(urlContent)).toBeTruthy();
								done();
						});
					});
		});

    }, Common.getDefaultTimeout());
});
