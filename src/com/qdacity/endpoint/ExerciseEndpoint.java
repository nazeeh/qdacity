package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiNamespace;
import com.qdacity.Constants;


@Api(name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class ExerciseEndpoint {

	

}
