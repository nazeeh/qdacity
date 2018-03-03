package com.qdacity.test.UmlCodePositionEndpoint;

import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.List;

import com.google.api.server.spi.response.UnauthorizedException;
import com.qdacity.endpoint.UmlCodePositionEndpoint;
import com.qdacity.umleditor.UmlCodePosition;
import com.qdacity.umleditor.UmlCodePositionList;

public class UmlCodePositionEndpointTestHelper {

	static public List<UmlCodePosition> listUmlCodePositions(Long codesystemId, com.google.api.server.spi.auth.common.User loggedInUser) {
		try {
			UmlCodePositionEndpoint endpoint = new UmlCodePositionEndpoint();

			return endpoint.listCodePositions(codesystemId, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User is not authorized to list umlCodePositions");
		}
		return null;
	}
	
	static public void insertUmlCodePosition(Long id, Long codeID, Long codesystemID, double x, double y, com.google.api.server.spi.auth.common.User loggedInUser) {
		try {
			final UmlCodePosition umlCodePosition = new UmlCodePosition();
			umlCodePosition.setId(id);
			umlCodePosition.setCodeId(codeID);
			umlCodePosition.setCodesystemId(codesystemID);
			umlCodePosition.setX(x);
			umlCodePosition.setY(y);
			
			final List<UmlCodePosition> list = new ArrayList<>();
			list.add(umlCodePosition);
			
			final UmlCodePositionList umlCodePositionList = new UmlCodePositionList(list);
			
			UmlCodePositionEndpoint endpoint = new UmlCodePositionEndpoint();
			endpoint.insertOrUpdateCodePositions(umlCodePositionList, loggedInUser);

		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for umlCodePosition creation");
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
			fail("Can not persist umlCodePosition objects with illegal parameters");
		}
	}
	
	static public void insertOrUpdateUmlCodePositions(List<UmlCodePosition> codePositions, com.google.api.server.spi.auth.common.User loggedInUser) {
		try {
			final UmlCodePositionList umlCodePositionList = new UmlCodePositionList(codePositions);
			
			UmlCodePositionEndpoint endpoint = new UmlCodePositionEndpoint();
			endpoint.insertOrUpdateCodePositions(umlCodePositionList, loggedInUser);

		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User could not be authorized for umlCodePosition creation");
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
			fail("Can not persist umlCodePosition objects with illegal parameters");
		}
	}
	
	static public void removeUmlCodePosition(Long id, com.google.api.server.spi.auth.common.User loggedInUser) {
		try {
			UmlCodePositionEndpoint endpoint = new UmlCodePositionEndpoint();
			endpoint.removeCodePosition(id, loggedInUser);
		} catch (UnauthorizedException e) {
			e.printStackTrace();
			fail("User is not authorized to delete the umlCodePosition");
		}
	}
}
