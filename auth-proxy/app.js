var oauthshim = require('oauth-shim'),
	express = require('express');

var app = express();
app.listen(process.env.PORT || 8080);
app.all('/oauthproxy', oauthshim);

// Initiate the shim with Client ID's and secret, e.g.
oauthshim.init([{
	// id : secret
	client_id: '8WjTuE2g5hc5FJA4nsY5ykXCa',
	client_secret: 'XOgdbf7LN79OmIsIBAT7jnzqU4AfIRtaFIYEBfQCyfVopoxH0N',
	// Define the grant_url where to exchange Authorisation codes for tokens
	grant_url: 'https://api.twitter.com/oauth/access_token',
	// Restrict the callback URL to a delimited list of callback paths
	domain: '*qdacity-app.appspot.com, https://qdacity.com*, https://www.qdacity.com*'
}
]);