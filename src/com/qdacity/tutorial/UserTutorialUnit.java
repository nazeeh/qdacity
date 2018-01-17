package com.qdacity.tutorial;

import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.InheritanceStrategy;
import javax.jdo.annotations.PersistenceCapable;

@PersistenceCapable
public class UserTutorialUnit extends TutorialUnit {

	public UserTutorialUnit(long id, TutorialGroup inGroup, String title) {
		super(id, inGroup, title);
	}

}
