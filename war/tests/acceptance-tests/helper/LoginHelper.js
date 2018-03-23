
var token;

module.exports.storeLoginState = async function(driver) {
        token = await driver.executeScript('return localStorage.getItem("qdacity-emai-password-token")');
        if(token !== undefined && token !== null) {
            console.log('Token successfully stored.')
        } else {
            console.error('Could not receive token from localStorage!');
        }
    };

module.exports.restoreLoginState = async function(driver) {
    if(token !== undefined && token !== null) {
        try {
            await driver.executeScript('localStorage.setItem("qdacity-emai-password-token", "' + token + '")');
            console.log('Token successfully restored.');
        } catch (e) {
            console.error('Error while restoring token');
            console.error(e);
        }
    } else {
        console.error('Could not restore token!');
    }
}