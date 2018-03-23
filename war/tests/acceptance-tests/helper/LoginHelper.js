class LoginHelper {

    constructor() { }

    async storeLoginState(driver) {
        this.token = await driver.executeScript('return localStorage.getItem("qdacity-emai-password-token")');
        if(this.token !== undefined && this.token !== null) {
            console.log('Token successfully stored.')
        } else {
            console.error('Could not receive token from localStorage!');
        }
    }

    async restoreLoginState(driver) {
        if(this.token !== undefined && this.token !== null) {
            try {
                await driver.executeScript('localStorage.setItem("qdacity-emai-password-token", "' + this.token + '")');
                console.log('Token successfully restored.');
            } catch (e) {
                console.error('Error while restoring token');
                console.error(e);
            }
        } else {
            console.error('Could not restore token!');
        }
    }
}

export let loginHelper = new LoginHelper();