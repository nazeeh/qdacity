package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.project.saturation.SaturationCalculator;
import com.qdacity.project.saturation.SaturationResult;
import javax.inject.Named;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class SaturationEndpoint {
    	@ApiMethod(
		name = "saturation.getSaturation",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public SaturationResult getCode(@Named("projectId") Long projectId, User user) throws UnauthorizedException {
	    return new SaturationCalculator().calculateSaturation(projectId);
	}
}
