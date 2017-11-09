package com.qdacity.endpoint;

import java.util.List;

import javax.inject.Named;
import javax.persistence.EntityNotFoundException;

import com.google.api.server.spi.auth.common.User;
import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.qdacity.Authorization;
import com.qdacity.Constants;
import com.qdacity.authentication.FirebaseAuthenticator;
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
		packagePath = "server.project"),
	authenticators = {FirebaseAuthenticator.class})
public class MaintenanceEndpoint {

	private MetaModelEntityEndpoint metaModelEntityEndpoint = new MetaModelEntityEndpoint();
	private MetaModelRelationEndpoint metaModelRelationEndpoint = new MetaModelRelationEndpoint();
	
	@ApiMethod(name = "maintenance.cleanupValidationResults")
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
	@ApiMethod(name = "maintenance.initializeDatabase")
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
		insertMetaModelEntity("", true, 1L, 1, "Dynamic Aspect", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", true, 1L, 1, "Aspect", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, 1, "Activity", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, 1, "Place", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, 1, "Object", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, 1, "Actor", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, 1, "Process", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", true, 1L, 1, "Structural Aspect", MetaModelEntityType.PROPERTY, user);

		insertMetaModelEntity("", true, 1L, 2, "Concept", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", true, 1L, 2, "Category", MetaModelEntityType.PROPERTY, user);
		insertMetaModelEntity("", false, 1L, 2, "Property", MetaModelEntityType.PROPERTY, user);

		insertMetaModelEntity("", false, 1L, 3, "causes", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", true, 1L, 3, "Dynamic Relationship", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", true, 1L, 3, "Structural Relationship", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, 3, "is consequence of", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("association name", false, 1L, 3, "performs", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, 3, "is a", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, 3, "influences", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", true, 1L, 3, "Relationship", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("assocation name", false, 1L, 3, "is related to", MetaModelEntityType.RELATIONSHIP, user);
		insertMetaModelEntity("", false, 1L, 3, "is part of", MetaModelEntityType.RELATIONSHIP, user);
	}

	private void insertMetaModelEntity(String attributes, boolean isAbstract, Long metaModelId, Integer group, String name, MetaModelEntityType type, User user) throws UnauthorizedException {
		MetaModelEntity metaModelEntity = new MetaModelEntity();
		metaModelEntity.setAttributes(attributes);
		metaModelEntity.setIsAbstract(isAbstract);
		metaModelEntity.setMetaModelId(metaModelId);
		metaModelEntity.setGroup(group);
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
		
		MetaModelEntity sourceEntity = getMetaModelEntityByName(source, user);
		MetaModelEntity destinationEntity =getMetaModelEntityByName(destination, user);
		
		metaModelRelation.setSrc(sourceEntity.getId());
		metaModelRelation.setDst(destinationEntity.getId());
		
		metaModelRelationEndpoint.insertMetaModelRelation(metaModelRelation, user);
	}
	
	private MetaModelEntity getMetaModelEntityByName(String name, User user) throws UnauthorizedException {
		List<MetaModelEntity> entities = metaModelEntityEndpoint.getMetaModelEntitiesByName(name, user);
		
		if (entities == null || entities.size() == 0) {
			throw new EntityNotFoundException("Entity with name " + name + " was not found.");
		}
		
		return entities.get(0);
	}
}
