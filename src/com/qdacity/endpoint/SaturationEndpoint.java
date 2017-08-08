package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.saturation.DefaultSaturationParameters;
import com.qdacity.project.saturation.DeferredSaturationCalculationTask;
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
	    name = "saturation.calculateNewSaturation",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void calculateNewSaturation(@Named("projectId") Long projectId, User user) throws UnauthorizedException {
	DeferredSaturationCalculationTask deferredSaturationTask = new DeferredSaturationCalculationTask(projectId);
	Queue queue = QueueFactory.getDefaultQueue();
	queue.add(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(deferredSaturationTask));
    }

    /**
     * Retrieves the latest SaturationResult from the Datastore for the given
     * projectId. If there is no SaturationResult yet an empty SaturationResult
     * (all values 0.0) with the default SaturationParameters is returned.
     *
     * @param projectId
     * @param user
     * @return
     */
    @ApiMethod(
	    name = "saturation.getLatestSaturation",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public SaturationResult getLatestSaturation(@Named("projectId") Long projectId, User user) {
	List<SaturationResult> allSaturations = getHistoricalSaturationResults(projectId, user);
	SaturationResult latestSaturation = new SaturationResult();
	latestSaturation.setSaturationParameters(new DefaultSaturationParameters());
	latestSaturation.setCreationTime(new Date(0));
	for (SaturationResult sr : allSaturations) {
	    if (sr.getCreationTime().after(latestSaturation.getCreationTime())) {
		latestSaturation = sr;
	    }
	}
	return latestSaturation;
    }

    @ApiMethod(
	    name = "saturation.getHistoricalSaturationResults",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public List<SaturationResult> getHistoricalSaturationResults(@Named("projectId") Long projectId, User user) {
	PersistenceManager mgr = getPersistenceManager();
	Query query = mgr.newQuery(SaturationResult.class);
	query.setFilter("projectId == :id");
	Map<String, Long> paramValues = new HashMap<>();
	paramValues.put("id", projectId);
	List<SaturationResult> lazySatResults = (List<SaturationResult>) query.executeWithMap(paramValues);
	for (SaturationResult sr : lazySatResults) {
	    sr.getCreationTime(); //Lazy fetch
	}
	return lazySatResults;
    }

    @ApiMethod(
	    name = "saturation.setSaturationParameters",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void setSaturationParameters(SaturationParameters saturationParams, User user) throws UnauthorizedException {
	Authorization.checkAuthorization(saturationParams.getProjectId(), user);
	PersistenceManager pmr = getPersistenceManager();
	saturationParams.setCreationTime(new Date(System.currentTimeMillis()));

	pmr.makePersistent(saturationParams);
    }

    /**
     * Returns the latest SaturationParameters from the DataStore for the given
     * projectId
     *
     * @param projectId
     * @return
     * @throws UnauthorizedException
     */
    @ApiMethod(
	    name = "saturation.getSaturationParameters",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public SaturationParameters getSaturationParameters(@Named("projectId") Long projectId) throws UnauthorizedException {
	PersistenceManager pmr = getPersistenceManager();
	pmr.setMultithreaded(true);
	Query query = pmr.newQuery(SaturationParameters.class);

	query.setFilter("projectId == :projectId");
	Map<String, Long> paramValues = new HashMap<>();
	paramValues.put("projectId", projectId);

	List<SaturationParameters> parameters = (List<SaturationParameters>) query.executeWithMap(paramValues);
	if (parameters.isEmpty()) {
	    SaturationParameters defaultParams = new DefaultSaturationParameters();
	    //It is necessary to call a copy constructor here due to DataStore problems when persisting a sub-type
	    SaturationParameters realParameters = new SaturationParameters(defaultParams);
	    realParameters.setProjectId(projectId);
	    return realParameters;
	}
	SaturationParameters toReturn = parameters.get(0);
	for (SaturationParameters params : parameters) {
	    if (params.getCreationTime().after(toReturn.getCreationTime())) {
		toReturn = params;
	    }
	}
	return toReturn;
    }

    @ApiMethod(
	    name = "saturation.saveSaturationParameters",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public void saveSaturationParameters(SaturationParameters saturationParameters, User user) {
	if (saturationParameters.getCreationTime() == null) {
	    saturationParameters.setCreationTime(new Date());
	}
	getPersistenceManager().makePersistent(saturationParameters);

    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }

}
