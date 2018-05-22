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
		});

    }, Common.getDefaultTimeout());
});
