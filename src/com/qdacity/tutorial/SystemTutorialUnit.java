package com.qdacity.tutorial;

import javax.jdo.annotations.Discriminator;
import javax.jdo.annotations.Inheritance;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.InheritanceStrategy;

@PersistenceCapable
public class SystemTutorialUnit extends TutorialUnit {

	public SystemTutorialUnit(long id, TutorialGroup inGroup, String title) {
		super(id, inGroup, title);
	}

}
