package com.qdacity.project.saturation;

import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.qdacity.Cache;
import com.qdacity.endpoint.CodeEndpoint;
import com.qdacity.endpoint.SaturationEndpoint;
import com.qdacity.endpoint.TextDocumentEndpoint;
import com.qdacity.logs.ChangeObject;
import com.qdacity.logs.ChangeType;
import com.qdacity.logs.CodeBookEntryChangeDetail;
import com.qdacity.logs.CodeChangeDetail;
import com.qdacity.project.Project;
import com.qdacity.util.DataStoreUtil;

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

    public SaturationResult calculateSaturation(PersistenceManager pmr) {
	SaturationResult result = new SaturationResult();
	pmr.makePersistent(result); //We need to persist it here because we will add a Child and we need an ID for that.
	result.setProjectId(projectId);
	result.setSaturationParameters(new SaturationParameters(params)); //we need to copy them due to DataStore restriction!

	if (!epochStart.equals(new Date(0))) {
	    calculateDocumentSaturation(result);
	    calculateCodeSaturation(result);
	} else {
	    setAllZero(result);
	}

	result.setCreationTime(new Date(System.currentTimeMillis()));
	result.setEvaluationStartDate(epochStart);
	return result;
    }

    private void calculateDocumentSaturation(SaturationResult result) {
	double numberOfNewDocuments = countChanges(ChangeObject.DOCUMENT, ChangeType.CREATED);
	double totalNumberOfDocuments = TextDocumentEndpoint.countDocuments(projectId);
	//counting the number of documents is correct here
	//we could count the number of insert document changes instead, but it is the same number.
	double numberOfDocumentsBeforeChange = totalNumberOfDocuments - numberOfNewDocuments;
	result.setDocumentSaturation(saturation(numberOfNewDocuments, numberOfDocumentsBeforeChange));
    }

    private void calculateCodeSaturation(SaturationResult result) {
	Project project = (Project) Cache.getOrLoad(projectId, Project.class);
	//Changes
	double numNewCodes = countChanges(ChangeObject.CODE, ChangeType.CREATED);
	double numDeletedCodes = countChanges(ChangeObject.CODE, ChangeType.DELETED);
	double numChangedCodes = countChanges(ChangeObject.CODE, ChangeType.MODIFIED); //actually unnecessary just for debugging
	//We need to look at modified changes in more detail
	Iterable<Entity> changesWithModified = getChangesForObjectOfType(ChangeObject.CODE, ChangeType.MODIFIED);
	double numAuthorChanged = 0.0;
	double numCodeIdChanged = 0.0;
	double numColorChanged = 0.0;
	double numMemoChanged = 0.0;
	double numNameChanged = 0.0;
	for (Entity changeEntity : changesWithModified) {
	    String completeDiff = getCompleteDiff(changeEntity);

	    if (completeDiff.contains(jsonize(CodeChangeDetail.AUTHOR))) {
		numAuthorChanged += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeChangeDetail.CODE_ID))) {
		numCodeIdChanged += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeChangeDetail.COLOR))) {
		numColorChanged += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeChangeDetail.MEMO))) {
		numMemoChanged += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeChangeDetail.NAME))) {
		numNameChanged += 1.0;
	    }
	    numChangedCodes -= 1.0;
	}
	assert (numChangedCodes == 0.0);
	Iterable<Entity> changesCodeBookWithModified = getChangesForObjectOfType(ChangeObject.CODEBOOK_ENTRY, ChangeType.MODIFIED);
	double numCodeBookDefinition = 0.0;
	double numCodeBookExample = 0.0;
	double numCodeBookShortdefinition = 0.0;
	double numCodeBookWhenNotToUse = 0.0;
	double numCodeBookWhenToUse = 0.0;
	for (Entity changeEntity : changesCodeBookWithModified) {
	    String completeDiff = getCompleteDiff(changeEntity);

	    if (completeDiff.contains(jsonize(CodeBookEntryChangeDetail.DEFINITION))) {
		numCodeBookDefinition += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeBookEntryChangeDetail.EXAMPLE))) {
		numCodeBookExample += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeBookEntryChangeDetail.SHORTDEFINITION))) {
		numCodeBookShortdefinition += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeBookEntryChangeDetail.WHENNOTTOUSE))) {
		numCodeBookWhenNotToUse += 1.0;
	    }
	    if (completeDiff.contains(jsonize(CodeBookEntryChangeDetail.WHENTOUSE))) {
		numCodeBookWhenToUse += 1.0;
	    }
	}
	double numRelocatedCodes = countChanges(ChangeObject.CODE, ChangeType.RELOCATE);
	double numAppliedCodes = countChanges(ChangeObject.DOCUMENT, ChangeType.APPLY);

	double numCodeRelationInsert = countChanges(ChangeObject.CODE_RELATIONSHIP, ChangeType.CREATED);
	double numCodeRelationDeleted = countChanges(ChangeObject.CODE_RELATIONSHIP, ChangeType.DELETED);

	//Project properties
	double numCurrentCodes = CodeEndpoint.countCodes(project.getCodesystemID());
	//Alternative thought: All Code System Changes before this epoch:
	//double totalNumberOfChangesBeforeEpochStart = countAllCodeSystemChangesBeforeEpochStart();
	//Alternative thought: Size of Code System. But it doesn't make much sense as it can not show developement over time
	//double totalNumberOfCodes = (numCurrentCodes - numNewCodes) + numDeletedCodes;

	Logger.getLogger("logger").log(Level.INFO, "Number of Changes since " + epochStart + "\n"
		+ "numNewCodes " + numNewCodes + "\n"
		+ "numDeletedCodes " + numDeletedCodes + "\n"
		+ "numAuthorChanged " + numAuthorChanged + "\n"
		+ "numCodeIdChanged " + numCodeIdChanged + "\n"
		+ "numColorChanged " + numColorChanged + "\n"
		+ "numMemoChanged " + numMemoChanged + "\n"
		+ "numNameChanged " + numNameChanged + "\n"
		+ "numCodeBookDefinition " + numCodeBookDefinition + "\n"
		+ "numCodeBookExample " + numCodeBookDefinition + "\n"
		+ "numCodeBookShortdefinition " + numCodeBookShortdefinition + "\n"
		+ "numCodeBookWhenNotToUse " + numCodeBookWhenNotToUse + "\n"
		+ "numCodeBookWhenToUse " + numCodeBookWhenToUse + "\n"
		+ "numRelocatedCodes " + numRelocatedCodes + "\n"
		+ "numAppliedCodes " + numAppliedCodes + "\n"
		+ "numCodeRelationInsert " + numCodeRelationInsert + "\n"
		+ "numCodeRelationDeleted " + numCodeRelationDeleted + "\n"
		+ "== PROJECT-PROPERTIES == \n"
		+ "numCurrentCodes " + numCurrentCodes + "\n"
	);

	//calculate saturation
	result.setInsertCodeSaturation(saturation(numNewCodes, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.CREATED)));
	result.setDeleteCodeSaturation(saturation(numDeletedCodes, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.DELETED)));
	//Code attributes
	result.setUpdateCodeAuthorSaturation(saturation(numAuthorChanged, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.MODIFIED)));
	result.setUpdateCodeColorSaturation(saturation(numColorChanged, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.MODIFIED)));
	result.setUpdateCodeIdSaturation(saturation(numCodeIdChanged, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.MODIFIED)));
	result.setUpdateCodeMemoSaturation(saturation(numMemoChanged, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.MODIFIED)));
	result.setUpdateCodeNameSaturation(saturation(numNameChanged, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.MODIFIED)));
	//CodeBookEntry attributes
	result.setUpdateCodeBookEntryDefinitionSaturation(saturation(numCodeBookDefinition, countTotalChangesBeforeEpochStart(ChangeObject.CODEBOOK_ENTRY, ChangeType.MODIFIED)));
	result.setUpdateCodeBookEntryExampleSaturation(saturation(numCodeBookExample, countTotalChangesBeforeEpochStart(ChangeObject.CODEBOOK_ENTRY, ChangeType.MODIFIED)));
	result.setUpdateCodeBookEntryShortDefinitionSaturation(saturation(numCodeBookShortdefinition, countTotalChangesBeforeEpochStart(ChangeObject.CODEBOOK_ENTRY, ChangeType.MODIFIED)));
	result.setUpdateCodeBookEntryWhenNotToUseSaturation(saturation(numCodeBookWhenNotToUse, countTotalChangesBeforeEpochStart(ChangeObject.CODEBOOK_ENTRY, ChangeType.MODIFIED)));
	result.setUpdateCodeBookEntryWhenToUseSaturation(saturation(numCodeBookWhenToUse, countTotalChangesBeforeEpochStart(ChangeObject.CODEBOOK_ENTRY, ChangeType.MODIFIED)));

	//Insert/Delete Code Relationships
	result.setInsertCodeRelationShipSaturation(saturation(numCodeRelationInsert, countTotalChangesBeforeEpochStart(ChangeObject.CODE_RELATIONSHIP, ChangeType.CREATED)));
	result.setDeleteCodeRelationShipSaturation(saturation(numCodeRelationDeleted, countTotalChangesBeforeEpochStart(ChangeObject.CODE_RELATIONSHIP, ChangeType.DELETED)));

	//Apply Code
	result.setApplyCodeSaturation(saturation(numAppliedCodes, countTotalChangesBeforeEpochStart(ChangeObject.DOCUMENT, ChangeType.APPLY)));
	//Relocate Code
	result.setRelocateCodeSaturation(saturation(numRelocatedCodes, countTotalChangesBeforeEpochStart(ChangeObject.CODE, ChangeType.RELOCATE)));
    }

    /**
     *
     * @param changeEntity needs to be a "Change" Entity
     * @return
     */
    private String getCompleteDiff(Entity changeEntity) {
	String diffNew = changeEntity.getProperty("newValue").toString();
	String diffOld = changeEntity.getProperty("oldValue").toString();
	return diffOld + diffNew;
    }

    /**
     * for usage with String.contains to avoid wrong matches in texts of diff
     *
     * @param variableName
     * @return
     */
    private String jsonize(String variableName) {
	return "{\"" + variableName + "\":";
    }

    /**
     * calculates the saturation for a change. In general saturation is 1 -
     * activity
     *
     * @param numberOfChangesOnObjectByType how many changes of the change exist
     * @param totalNumberOfChangesForObjectTypeBeforeTheLastSaturation how many
     * changes in total exist for this object and change type BEFORE the last
     * saturation
     * @return saturation between 0.0 and 1.0
     */
    private double saturation(double numberOfChangesOnObjectByType, double totalNumberOfChangesForObjectTypeBeforeTheLastSaturation) {
	if (numberOfChangesOnObjectByType == 0) {
	    return 1.0;  //no changes, so saturation is 1
	}
	if (totalNumberOfChangesForObjectTypeBeforeTheLastSaturation == 0) {
	    //numberOfChangesOnObjectByType is not 0 here!
	    return 0.0; //nothing was there and something changed 
	}
	double activity = numberOfChangesOnObjectByType / totalNumberOfChangesForObjectTypeBeforeTheLastSaturation;
	if (activity > 1.0) {
	    return 0.0; //more changes than objects before changes means there is no saturation
	}
	return 1.0 - activity;
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

    /**
     * Similar to count changes, but only counts changes until epoch Start
     *
     * @param changeObject
     * @param changeType
     * @return
     */
    private double countTotalChangesBeforeEpochStart(ChangeObject changeObject, ChangeType changeType) {
	Filter projectIdFilter = new Query.FilterPredicate("projectID", Query.FilterOperator.EQUAL, projectId);
	java.util.Date compatibleDate = new Date(epochStart.getTime());
	Filter changeUntil = new Query.FilterPredicate("datetime", Query.FilterOperator.LESS_THAN, compatibleDate);
	Filter changeObjectFilter = new Query.FilterPredicate("objectType", Query.FilterOperator.EQUAL, changeObject.toString());
	Filter changeTypeFilter = new Query.FilterPredicate("changeType", Query.FilterOperator.EQUAL, changeType.toString());
	Filter andFilter = CompositeFilterOperator.and(projectIdFilter, changeUntil, changeObjectFilter, changeTypeFilter);
	return DataStoreUtil.countEntitiesWithFilter("Change", andFilter);
    }

    private Filter makeFilterForThisProjectAndEpoch(ChangeObject changeObject, ChangeType changeType) {
	//See also: https://cloud.google.com/appengine/docs/standard/java/datastore/query-restrictions

	Filter projectIdFilter = new Query.FilterPredicate("projectID", Query.FilterOperator.EQUAL, projectId);
	//Workaround for GAE behaviour, see:
	//https://stackoverflow.com/questions/30616103/cant-query-by-date-in-appengine-org-datanucleus-store-types-sco-simple-date-i
	java.util.Date compatibleDate = new Date(epochStart.getTime());
	Filter changeFromDates = new Query.FilterPredicate("datetime", Query.FilterOperator.GREATER_THAN_OR_EQUAL, compatibleDate);
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

    private void setAllZero(SaturationResult result) {
	result.setApplyCodeSaturation(0);
	result.setDeleteCodeRelationShipSaturation(0);
	result.setDeleteCodeSaturation(0);
	result.setDocumentSaturation(0);
	result.setInsertCodeRelationShipSaturation(0);
	result.setInsertCodeSaturation(0);
	result.setRelocateCodeSaturation(0);
	result.setUpdateCodeAuthorSaturation(0);
	result.setUpdateCodeBookEntryDefinitionSaturation(0);
	result.setUpdateCodeBookEntryExampleSaturation(0);
	result.setUpdateCodeBookEntryShortDefinitionSaturation(0);
	result.setUpdateCodeBookEntryWhenNotToUseSaturation(0);
	result.setUpdateCodeBookEntryWhenToUseSaturation(0);
	result.setUpdateCodeColorSaturation(0);
	result.setUpdateCodeIdSaturation(0);
	result.setUpdateCodeMemoSaturation(0);
	result.setUpdateCodeNameSaturation(0);
    }

}
