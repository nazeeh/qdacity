var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
	until = webdriver.until;

describe('Localhost test', function() {

	var defaultTimeout = 10000;
	
	var driver = null;
	
    beforeEach((done) => {
        this.driver = new webdriver.Builder()
	        .forBrowser('chrome')
	        .build();
        
        this.driver.get('http://localhost:8888/').then(done);
    }, defaultTimeout);

    afterEach((done) => {
        this.driver.quit().then(done);   
    }, defaultTimeout);

    it('Should render the title', (done) => {
    	this.driver.getTitle().then((title) => {
		    expect(title).toBe('QDAcity');
		    done();
    	});
    });

    // We need to log in first!
    
    
//    it('Should create a new project', (done) => {
//    	this.driver.sleep(15000).then((done) => {
//    		this.driver.findElement(By.id('newPrjBtn')).click();
//    	});
//    	
//    	this.driver.sleep(20000).then((done) => {
//		    done();
//    	});
//    }, 25000);
});