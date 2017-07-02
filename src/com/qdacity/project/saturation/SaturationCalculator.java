package com.qdacity.project.saturation;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.qdacity.endpoint.CodeEndpoint;
import com.qdacity.endpoint.SaturationEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
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

	double documentSaturation = calculateDocumentSaturation();
	result.setDocumentSaturation(documentSaturation);
	result.setDocumentSaturation(documentSaturation);

	double codeSaturation = calculateCodeSaturation();
	result.setCodeSaturation(codeSaturation);

	double totalSaturation = (codeSaturation + documentSaturation) / 2.0;
	result.setTotalSaturation(totalSaturation);

	result.setCreationTime(new Date(System.currentTimeMillis()));
	return result;
    }

    private double calculateDocumentSaturation() {
	double numberOfNewDocuments = countChanges(ChangeObject.DOCUMENT, ChangeType.CREATED);
	double totalNumberOfDocuments = TextDocumentEndpoint.countDocuments(projectId);
	double numberOfDocumentsBeforeChange = totalNumberOfDocuments - numberOfNewDocuments;

	return 1.0 - activity(numberOfNewDocuments, numberOfDocumentsBeforeChange, params.getInsertDocumentChangeWeight());

    }

    private double calculateCodeSaturation() {
	double numNewCodes = countChanges(ChangeObject.CODE, ChangeType.CREATED);
	double numDeletedCodes = countChanges(ChangeObject.CODE, ChangeType.DELETED);
	double numChangedCodes = countChanges(ChangeObject.CODE, ChangeType.MODIFIED);
	double numRelocatedCodes = countChanges(ChangeObject.CODE, ChangeType.RELOCATE);
	double numAppliedCodes = countChanges(ChangeObject.DOCUMENT, ChangeType.APPLY);
	double numCurrentCodes = CodeEndpoint.countCodes(projectId);
	double totalNumberOfCodesBeforeChanges = (numCurrentCodes - numNewCodes) + numDeletedCodes;
	//activity
	double activityNewCodes = activity(numNewCodes, totalNumberOfCodesBeforeChanges, params.getInsertCodeChangeWeight());
	double activityDeleteCodes = activity(numDeletedCodes, totalNumberOfCodesBeforeChanges, params.getDeleteCodeChangeWeight());
	//TODO Changes einzeln, was genau verändert wurde... Da kann man sich die Changes dann tatsächlich holen und reinschauen. Aber man sollte sich halt nicht ALLE auf einmal holen (wegen vieler Code Applies)

	//TODO einzelergebnisse sind eigentlich auch interessant. Persitieren!!
	//saturation average of all activities
	return 1 - 0; //1 - durchschnitt der aktivität...
    }
    
    /**
     * calculates the weighted activity for a change
     * @param numberOfChangesOnObjectByType how many changes of the change exist
     * @param totalNumberOfObjectsBeforeChanges how many objects potentially affected by these changes existed before the changes
     * @param weight how important is this activity
     * @return the activity between 0.0 and 1.0. Note that saturation is 1.0 - this result.
     */
    private double activity(double numberOfChangesOnObjectByType, double totalNumberOfObjectsBeforeChanges, double weight) {
	return (weight * numberOfChangesOnObjectByType) / totalNumberOfObjectsBeforeChanges;
    }
    
    /**
     * count the changes by changeType for a changeObject from this project since the last epoch start
     * @param changeObject
     * @param changeType
     * @return 
     */
    private double countChanges(ChangeObject changeObject, ChangeType changeType) {
	//See also: https://cloud.google.com/appengine/docs/standard/java/datastore/query-restrictions
	Filter projectIdFilter = new Query.FilterPredicate("projectID", Query.FilterOperator.EQUAL, projectId);
	Filter changeFromDates = new Query.FilterPredicate("datetime", Query.FilterOperator.GREATER_THAN_OR_EQUAL, epochStart);
	Filter changeObjectFilter = new Query.FilterPredicate("objectType", Query.FilterOperator.EQUAL, changeObject.toString());
	Filter changeTypeFilter = new Query.FilterPredicate("changeType", Query.FilterOperator.EQUAL, changeType.toString());
	Filter andFilter = CompositeFilterOperator.and(projectIdFilter, changeFromDates, changeObjectFilter,changeTypeFilter);
	return DataStoreUtil.countEntitiesWithFilter("Change", andFilter);
    }

}
