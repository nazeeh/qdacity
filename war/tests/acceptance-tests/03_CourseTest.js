var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;
var chrome = require("selenium-webdriver/chrome");

var loginHelper = require('./helper/LoginHelper.js');

var Common = require('./helper/Common.js');
var Conditions = require('./helper/Conditions.js');


const SPEC_NAME = 'Course test';

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

    it('Should create a new course', (done) => {
    	const courseName = 'Course_01';
    	const courseDescription = 'The course description.';
			const termCourseName = 'TermCourse_01';
    	const _this = this;

    	// Click new project button
    	this.driver.wait(until.elementLocated(By.id('newCourseBtn'))).click();

    	// Find the name field
    	this.driver.wait(until.elementLocated(By.xpath("//div[@class='vex-custom-field-wrapper']/div[@class='vex-custom-input-wrapper']/input[@name='name' and @type='text']"))).sendKeys(courseName);

    	// Find the description field
    	this.driver.findElement(By.xpath("//div[@class='vex-custom-field-wrapper']/div[@class='vex-custom-input-wrapper']/textarea[@type='text']")).sendKeys(courseDescription);

			// Find the term course field
    	this.driver.wait(until.elementLocated(By.xpath("//div[@class='vex-custom-field-wrapper']/div[@class='vex-custom-input-wrapper']/input[@name='term' and @type='text']"))).sendKeys(termCourseName);

    	// Find the "OK" button
    	this.driver.findElement(By.xpath("//div[@class='vex-dialog-buttons']/button[@type='submit' and contains(@class,'vex-dialog-button') and text()='OK']")).click();

    	// Is the project in the project-list?
    	// If xpath can't find the project, it was not created properly. The timeout will indicate the failure of the test.
    	// If the project was created properly, open it by clicking on it.
		Conditions.assertCourseExists(this.driver, courseName);
		this.driver.wait(until.elementLocated(Conditions.getCourse(courseName))).click();


		// Find the course name
			this.driver.wait(until.elementLocated(By.xpath("//span[text()='This course: Course_01']"))).then(() => {
				// Find the term course name
				this.driver.wait(until.elementLocated(By.xpath("//span[text()='TermCourse: TermCourse_01']"))).then(() => {
							// Check the URL
						_this.driver.getCurrentUrl().then((currentUrl) => {
								// Does the URL end with /TermDashboard?
								const urlContent = "/TermDashboard";
								expect(currentUrl.includes(urlContent)).toBeTruthy();

								done();
						});
				});
			});

    }, Common.getDefaultTimeout());
});
