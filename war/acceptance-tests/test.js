import webdriver from 'selenium-webdriver';

const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();

describe("Test", function() {

	beforeEach(() => {
        driver.navigate().to('https://1-dot-felix-lo-qdacity.appspot.com/').then(() => done())
	});

	afterEach(() => {
        driver.quit().then(() => done())
    });
    
    it("tests something", () => {
    	let element = driver.findElement(By.css('.autocomplete'));

    	expect(element).not.toBe(null);
    	
//        driver.wait(until.elementLocated(By.css('.suggestion')));
//        driver.findElement(By.css('.suggestion')).click()
//        	.then(() => done());
    });
});
