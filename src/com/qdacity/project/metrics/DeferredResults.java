package com.qdacity.project.metrics;

import java.util.List;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.PMF;

public class DeferredResults implements DeferredTask {
  
  ValidationResult result;
  
  

  public DeferredResults(ValidationResult result) {
    super();
    this.result = result;
  }



  @Override
  public void run() {
    PersistenceManager mgr = getPersistenceManager();
    try {
      
      mgr.makePersistent(this.result);
      
      
    } finally {
      mgr.close();
    }
    
  }

  private static PersistenceManager getPersistenceManager() {
    return PMF.get().getPersistenceManager();
  }
}
