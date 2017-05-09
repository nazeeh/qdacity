package com.qdacity.endpoint;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.users.User;
import com.qdacity.Constants;
import com.qdacity.PMF;
import com.qdacity.project.metrics.FMeasureResult;
import com.qdacity.project.metrics.TabularValidationReportRow;
import com.qdacity.project.metrics.algorithms.datastructures.converter.ParagraphAgreementConverter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;

/**
 * This Endpoint is intented to be used for Data migration when changes in the
 * data model need to be applied in a given dataset. Use this Endpoint with
 * care!
 */
@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class DataMigrationEndpoint {

    /**
     * Tranforms and persists a paragraphAgreement in the Datastore to a
     * TabularValidationReportRow in the Datastore. The paragraphAgreement will
     * NOT be deleted from the Datastore. You need to do this manually when you
     * think the result of this method is correct.
     *
     * @param paragraphAgreementId the if of the ParagraphAgreement you want to
     * convert.
     * @param coderName the Name of the Coder of this ParagraphAgreement (should
     * be from the parent ValidationResult or DocumentResult)
     * @param user user with the proper rights to perform this method
     * (administrative rights recommended).
     * @return the converted paragraphAgreement as TabularValidationReportRow so
     * you can manually check if it is correct.
     * @throws UnauthorizedException
     */
    @ApiMethod(
	    name = "migration.migrateParagraphAgreementToTabularValidationReportRow",
	    scopes = {Constants.EMAIL_SCOPE},
	    clientIds = {Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID},
	    audiences = {Constants.WEB_CLIENT_ID})
    public TabularValidationReportRow migrateParagraphAgreementToTabularValidationReportRow(@Named("paragraphAgreementId") Long paragraphAgreementId, @Named("coderName") String coderName, User user) throws UnauthorizedException {
	PersistenceManager mgr = getPersistenceManager();
	
	//TODO nicht über einzelne Paragraph Agreements, sondern immer über die Elternobjekte!
	List<FMeasureResult> pAgreements;
	TabularValidationReportRow tabularValidationReportRow = null;
	try {
	    Query q = mgr.newQuery(FMeasureResult.class, "id  == :id");
	    Map<String, Long> params = new HashMap<>();
	    params.put("id", paragraphAgreementId);

	    pAgreements = (List<FMeasureResult>) q.execute(params);
	    if (pAgreements.size() == 1) {
		tabularValidationReportRow = ParagraphAgreementConverter.paragraphAgreementToTabularValidationReportRow(pAgreements.get(0), null, coderName);
		mgr.makePersistent(tabularValidationReportRow);
	    }
	} finally {
	    mgr.close();
	}

	return tabularValidationReportRow;
    }

    private static PersistenceManager getPersistenceManager() {
	return PMF.get().getPersistenceManager();
    }
}
