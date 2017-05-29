package com.qdacity.project.metrics.algorithms;

import org.junit.Before;
import org.junit.Test;

import com.qdacity.project.metrics.algorithms.datastructures.FleissKappaResult;

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
		FleissKappaResult result = new FleissKappa().compute(data, amountRaters);
		
		System.out.println("Category Agreement: "+result.getTotalCategoryAgreement());
		System.out.println("Unit 1: "+result.getAgreementOfCategoryPerUnits()[0]);
		System.out.println("Unit 2: "+result.getAgreementOfCategoryPerUnits()[1]);
		System.out.println("Unit 3: "+result.getAgreementOfCategoryPerUnits()[2]);
		System.out.println("Unit 4: "+result.getAgreementOfCategoryPerUnits()[3]);
		System.out.println("Unit 5: "+result.getAgreementOfCategoryPerUnits()[4]);
		assert(result.getTotalCategoryAgreement() == 0.44);
		assert(result.getAgreementOfCategoryPerUnits()[0] == 1.0);
		assert(result.getAgreementOfCategoryPerUnits()[1] == 0.4);
		assert(result.getAgreementOfCategoryPerUnits()[2] == 0.4);
		assert(result.getAgreementOfCategoryPerUnits()[3] == 1.0);
		assert(result.getAgreementOfCategoryPerUnits()[4] == 0.6000000000000001);
	}

}
