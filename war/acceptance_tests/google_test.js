var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;

describe('Google test', function() {

	var defaultTimeout = 10000;
	
	var driver = null;
	
    beforeEach((done) => {
        this.driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .build();
        
        this.driver.get('http://www.google.com').then(done);
    }, defaultTimeout);

    afterEach((done) => {
        this.driver.quit().then(done);   
    }, defaultTimeout);

    it('Should search for webdriver', (done) => {
    	const _this = this;
    	
    	this.driver.findElement(By.name('q')).sendKeys('webdriver');
    	
    	this.driver.sleep(1000).then(function() {
    		_this.driver.findElement(By.name('q')).sendKeys(webdriver.Key.TAB);
		});
    	
    	this.driver.findElement(By.name('btnK')).click();
    	
    	this.driver.sleep(2000).then(() => {
    		_this.driver.getTitle().then((title) => {
    			console.log(title);
			    expect(title == 'webdriver - Google Search' || title == 'webdriver - Google-Suche').toBe(true);
			    done();
    		});
		});
    });
});