package com.qdacity.maintenance.tasks;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.QueryResultIterable;

import javax.jdo.PersistenceManager;















import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;


public class OrphanDeletion  implements DeferredTask {


  public OrphanDeletion() {
    super();
  }

  @Override
  public void run() {
    DatastoreService service = DatastoreServiceFactory.getDatastoreService();
    int counter = 0;
    Query mapsQuery = new Query("AgreementMap");
    mapsQuery.setKeysOnly();
    
    Iterable<Entity> results = service.prepare(mapsQuery).asIterable();
    List<Key> orphans = new ArrayList<Key>();
    for (Entity entity : results) {
      Key parentKey = entity.getParent();

      if (parentKey != null){

        try {
          Entity parent = service.get(parentKey);
        } catch (EntityNotFoundException e) {
          Logger.getLogger("logger").log(Level.WARNING,  " Found Orphan:" + entity.getKey() );
          orphans.add(entity.getKey());
        }
      }
      
      counter++;
    }
    
    Logger.getLogger("logger").log(Level.INFO,  "Checked " + counter + " AgreementMaps." );
    service.delete(orphans);
    
    Logger.getLogger("logger").log(Level.INFO,  "Deleted " + orphans.size() + " Orphans." );
  }
  
  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }

}
