package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.saturation.SaturationCalculator;
import com.qdacity.project.saturation.SaturationParameters;
import com.qdacity.project.saturation.SaturationResult;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

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
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public SaturationResult getSaturation(@Named("projectId") Long projectId, User user) throws UnauthorizedException {
	//TODO result persistieren und als DeferredTask
	return new SaturationCalculator(projectId).calculateSaturation();
    }

    @ApiMethod(
	    name = "saturation.getSaturation",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void setSaturationParameters(@Named("saturationParams") SaturationParameters saturationParams, User user) throws UnauthorizedException {
	PersistenceManager pmr = getPersistenceManager();
	saturationParams.setCreationTime(new Date(System.currentTimeMillis()));

	pmr.makePersistent(saturationParams);
    }

    public SaturationParameters getSaturationParameters(@Named("projectId") Long projectId) throws UnauthorizedException {
	PersistenceManager pmr = getPersistenceManager();
	pmr.setMultithreaded(true);
	//check if Parameters already exist for this project and if yes, overwrite.
	Query query = pmr.newQuery(SaturationParameters.class);

	query.setFilter("projectId == :projectId");
	Map<String, Long> paramValues = new HashMap<>();
	paramValues.put("projectId", projectId);

	List<SaturationParameters> parameters = (List<SaturationParameters>) query.executeWithMap(paramValues);
	if (parameters.isEmpty()) {
	    return null;
	}
	return parameters.get(0);
    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

}
