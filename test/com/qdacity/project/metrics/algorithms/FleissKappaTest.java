package com.qdacity.project.metrics.algorithms;

import org.junit.Before;
import org.junit.Test;


public class FleissKappaTest {
	
	Integer[] data;
	int amountRaters;
	
	@Before
	public void init() {
		amountRaters = 5;
		Integer[] datatmp = {0,3,2,5,1};
		data = datatmp;
	}
	
	@Test
	public void test() {
		double totalCategoryAgreement = new FleissKappa().compute(data, amountRaters);
		
		System.out.println("Category Agreement: "+totalCategoryAgreement);
		assert(totalCategoryAgreement == 0.44);
	}

}
