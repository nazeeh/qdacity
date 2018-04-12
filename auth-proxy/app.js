var oauthshim = require('oauth-shim'),
	express = require('express');

var app = express();
app.listen(process.env.PORT || 8080);
app.all('/oauthproxy', oauthshim);

// Initiate the shim with Client ID's and secret, e.g.
oauthshim.init([{
	// id : secret
	client_id: '12345',
	client_secret: 'secret678910',
	// Define the grant_url where to exchange Authorisation codes for tokens
	grant_url: 'https://linkedIn.com',
	// Restrict the callback URL to a delimited list of callback paths
	domain: 'appspot.com, qdacity.com/redirect'
}
]);