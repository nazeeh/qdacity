package com.qdacity.endpoint;

import javax.inject.Named;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.users.User;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.maintenance.tasks.OrphanDeletion;
import com.qdacity.maintenance.tasks.ValidationCleanup;
import com.qdacity.metamodel.MetaModelEntity;
import com.qdacity.metamodel.MetaModelEntityType;
import com.qdacity.metamodel.MetaModelRelation;

@Api(
	name = "qdacity",
	version = Constants.VERSION,
	namespace = @ApiNamespace(
		ownerDomain = "qdacity.com",
		ownerName = "qdacity.com",
		packagePath = "server.project"))
public class MaintenanceEndpoint {

	private MetaModelEntityEndpoint metaModelEntityEndpoint = new MetaModelEntityEndpoint();
	private MetaModelRelationEndpoint metaModelRelationEndpoint = new MetaModelRelationEndpoint();
	
	@ApiMethod(
		name = "maintenance.cleanupValidationResults",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void cleanupValidationResults(com.google.appengine.api.users.User user) throws UnauthorizedException {

		cleanUpValidationResults();

		cleanUpOrphans();

	}

	private void cleanUpValidationResults() {
		ValidationCleanup task = new ValidationCleanup();
		Queue queue = QueueFactory.getDefaultQueue();
		queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}

	private void cleanUpOrphans() {
		OrphanDeletion task = new OrphanDeletion();
		Queue queue = QueueFactory.getDefaultQueue();
		queue.addAsync(com.google.appengine.api.taskqueue.TaskOptions.Builder.withPayload(task));
	}
	
	/**
	 * Initializes the database entities and should not be executed more than once.
	 * 
	 * @param initializeMetaModel
	 * @param user
	 * @throws UnauthorizedException
	 */
	@ApiMethod(
		name = "maintenance.initializeDatabase",
		scopes = { Constants.EMAIL_SCOPE },
		clientIds = { Constants.WEB_CLIENT_ID, com.google.api.server.spi.Constant.API_EXPLORER_CLIENT_ID },
		audiences = { Constants.WEB_CLIENT_ID })
	public void initializeDatabase(@Named("initializeMetaModel") Boolean initializeMetaModel, User user) throws UnauthorizedException {
		
		Authorization.checkDatabaseInitalizationAuthorization(user);

		if (initializeMetaModel) {
			initializeMetaModelEntities(user);
			initializeMetaModelRelations(user);
		}
	}
	
	/**
	 * Initializes the database with the MetaModelEntities.
	 * 
	 * @param user required for authorization
	 * @throws UnauthorizedException
	 */
	private void initializeMetaModelEntities(User user) throws UnauthorizedException {
		insertMetaModelEntity("", true, 1L, "Dynamic Relationship", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", true, 1L, "Dynamic Aspect", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, "causes", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", true, 1L, "Category", MetaModelEntityType.OTHER, user);
		insertMetaModelEntity("", true, 1L, "Aspect", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, "is part of", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("assocation name", false, 1L, "is related to", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, "Activity", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", true, 1L, "Relationship", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, "Place", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, "Object", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, "influences", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, "Actor", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, "Process", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", true, 1L, "Concept", MetaModelEntityType.OTHER, user);
		insertMetaModelEntity("", true, 1L, "Structural Aspect", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", true, 1L, "Structural Relationship", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, "is consequence of", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("association name", false, 1L, "performs", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, "is a", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, "Property", MetaModelEntityType.PROPERTY, user);
	}

	private void insertMetaModelEntity(String attributes, boolean isAbstract, Long metaModelId, String name, MetaModelEntityType type, User user) throws UnauthorizedException {
		MetaModelEntity metaModelEntity = new MetaModelEntity();
		metaModelEntity.setAttributes(attributes);
		metaModelEntity.setIsAbstract(isAbstract);
		metaModelEntity.setMetaModelId(metaModelId);
		metaModelEntity.setName(name);
		metaModelEntity.setType(type);
		
		metaModelEntityEndpoint.insertMetaModelEntity(metaModelEntity, user);
	}
	
	/**
	 * Initializes the database with the MetaModelRelations.
	 * 
	 * @param user required for authorization
	 * @throws UnauthorizedException
	 */
	private void initializeMetaModelRelations(User user) throws UnauthorizedException {
		insertMetaModelRelation("", "", 1L, "Generalization", "Object", "Structural Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "is related to", "Structural Relationship", user);
		insertMetaModelRelation("1:2", "connects", 1L, "Association", "Relationship", "Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Structural Aspect", "Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Dynamic Relationship", "Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "performs", "Dynamic Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "influences", "Dynamic Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Category", "Concept", user);
		insertMetaModelRelation("", "labels", 1L, "Association", "Concept", "Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Activity", "Dynamic Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Structural Relationship", "Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "is consequence of", "Dynamic Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "is a", "Structural Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "causes", "Dynamic Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "is part of", "Structural Relationship", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Place", "Structural Aspect", user);
		insertMetaModelRelation("", "labels", 1L, "Association", "Property", "Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Process", "Dynamic Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Dynamic Aspect", "Aspect", user);
		insertMetaModelRelation("", "", 1L, "Generalization", "Actor", "Structural Aspect", user);
	}
	
	private void insertMetaModelRelation(String cardinality, String label, Long metaModelId, String type, String source, String destination, User user) throws UnauthorizedException {
		MetaModelRelation metaModelRelation = new MetaModelRelation();
		metaModelRelation.setCardinality(cardinality);
		metaModelRelation.setLabel(label);
		metaModelRelation.setMetaModelId(metaModelId);
		metaModelRelation.setType(type);
		
		MetaModelEntity sourceEntity = metaModelEntityEndpoint.getMetaModelEntityByName(source, user);
		MetaModelEntity destinationEntity = metaModelEntityEndpoint.getMetaModelEntityByName(destination, user);
		
		metaModelRelation.setSrc(sourceEntity.getId());
		metaModelRelation.setDst(destinationEntity.getId());
		
		metaModelRelationEndpoint.insertMetaModelRelation(metaModelRelation, user);
	}
}
