package com.qdacity.project.saturation;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.qdacity.endpoint.ChangeEndpoint;
import com.qdacity.endpoint.CodeEndpoint;
import com.qdacity.endpoint.SaturationEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.logs.Change;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeType;
import com.qdacity.util.DataStoreUtil;
import java.util.Date;

public class SaturationCalculator {

    private final Long projectId;
    private final SaturationParameters params;
    private final Date epochStart;

    public SaturationCalculator(Long projectId, Date epochStart) throws UnauthorizedException {
	this.projectId = projectId;
	SaturationEndpoint se = new SaturationEndpoint();
	this.params = se.getSaturationParameters(projectId);
	this.epochStart = epochStart;
    }

    public SaturationResult calculateSaturation() {
	SaturationResult result = new SaturationResult();
	result.setProjectId(projectId);
	result.setSaturationParameters(params);

	calculateDocumentSaturation(result);
	calculateCodeSaturation(result);

	result.setCreationTime(new Date(System.currentTimeMillis()));
	return result;
    }

    private void calculateDocumentSaturation(SaturationResult result) {
	double numberOfNewDocuments = countChanges(ChangeObject.DOCUMENT, ChangeType.CREATED);
	double totalNumberOfDocuments = TextDocumentEndpoint.countDocuments(projectId);
	double numberOfDocumentsBeforeChange = totalNumberOfDocuments - numberOfNewDocuments;
	result.setDocumentSaturation(saturation(numberOfNewDocuments, numberOfDocumentsBeforeChange));
    }

    private void calculateCodeSaturation(SaturationResult result) {
	//Changes
	double numNewCodes = countChanges(ChangeObject.CODE, ChangeType.CREATED);
	double numDeletedCodes = countChanges(ChangeObject.CODE, ChangeType.DELETED);
	double numChangedCodes = countChanges(ChangeObject.CODE, ChangeType.MODIFIED);
	double numRelocatedCodes = countChanges(ChangeObject.CODE, ChangeType.RELOCATE);
	double numAppliedCodes = countChanges(ChangeObject.DOCUMENT, ChangeType.APPLY);
	//Project properties
	double numCurrentCodes = CodeEndpoint.countCodes(projectId);
	double totalNumberOfCodesBeforeChanges = (numCurrentCodes - numNewCodes) + numDeletedCodes;
	//saturation
	result.setInsertCodeSaturation(saturation(numNewCodes, totalNumberOfCodesBeforeChanges));
	result.setDeleteCodeSaturation(saturation(numDeletedCodes, totalNumberOfCodesBeforeChanges));

	//We need to look at modified changes in more detail
	Iterable<Entity> changesWithModified = getChangesForObjectOfType(ChangeObject.CODE, ChangeType.MODIFIED);

	for (Entity changeEntity : changesWithModified) {
	    String diffNew = changeEntity.getProperty("newValue").toString();
	    String diffOld = changeEntity.getProperty("oldValue").toString();

	    //TODO analyze details here
	    numChangedCodes -= 1.0;
	}
	assert (numChangedCodes == 0.0);

	result.setApplyCodeSaturation(saturation(numAppliedCodes, totalNumberOfCodesBeforeChanges)); //TODO mit Anzahl Codes zu Bezug setzen stimmt so?
	result.setRelocateCodeSaturation(saturation(numRelocatedCodes, totalNumberOfCodesBeforeChanges));
    }

    /**
     * calculates the saturation for a change
     *
     * @param numberOfChangesOnObjectByType how many changes of the change exist
     * @param totalNumberOfObjectsBeforeChanges how many objects potentially
     * affected by these changes existed before the changes
     * @param weight how important is this activity
     * @return
     */
    private double saturation(double numberOfChangesOnObjectByType, double totalNumberOfObjectsBeforeChanges) {
	return 1.0 - (numberOfChangesOnObjectByType / totalNumberOfObjectsBeforeChanges);
    }

    /**
     * count the changes by changeType for a changeObject from this project
     * since the last epoch start
     *
     * @param changeObject
     * @param changeType
     * @return
     */
    private double countChanges(ChangeObject changeObject, ChangeType changeType) {
	Filter andFilter = makeFilterForThisProjectAndEpoch(changeObject, changeType);
	return DataStoreUtil.countEntitiesWithFilter("Change", andFilter);
    }

    private Filter makeFilterForThisProjectAndEpoch(ChangeObject changeObject, ChangeType changeType) {
	//See also: https://cloud.google.com/appengine/docs/standard/java/datastore/query-restrictions
	Filter projectIdFilter = new Query.FilterPredicate("projectID", Query.FilterOperator.EQUAL, projectId);
	Filter changeFromDates = new Query.FilterPredicate("datetime", Query.FilterOperator.GREATER_THAN_OR_EQUAL, epochStart);
	Filter changeObjectFilter = new Query.FilterPredicate("objectType", Query.FilterOperator.EQUAL, changeObject.toString());
	Filter changeTypeFilter = new Query.FilterPredicate("changeType", Query.FilterOperator.EQUAL, changeType.toString());
	Filter andFilter = CompositeFilterOperator.and(projectIdFilter, changeFromDates, changeObjectFilter, changeTypeFilter);
	return andFilter;
    }

    private Iterable<Entity> getChangesForObjectOfType(ChangeObject changeObject, ChangeType changeType) {
	Filter andFilter = makeFilterForThisProjectAndEpoch(changeObject, changeType);

	DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	com.google.appengine.api.datastore.Query q = new com.google.appengine.api.datastore.Query("Change");
	q.setFilter(andFilter);
	PreparedQuery pq = datastore.prepare(q);
	return pq.asIterable(FetchOptions.Builder.withDefaults());
    }

}
