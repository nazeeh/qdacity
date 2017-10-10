package com.qdacity.test.UploadEndpoint;

import static org.junit.Assert.assertTrue;

import java.io.IOException;

import javax.jdo.PersistenceManager;

import org.datanucleus.util.Base64;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Blob;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalTaskQueueTestConfig;
import com.qdacity.PMF;
import com.qdacity.endpoint.UploadEndpoint;
import com.qdacity.project.data.TextDocument;
import com.qdacity.test.ProjectEndpoint.ProjectEndpointTestHelper;
import com.qdacity.test.UserEndpoint.UserEndpointTestHelper;
import com.qdacity.upload.Upload;

public class UploadEndpointTest {
	private final LocalTaskQueueTestConfig.TaskCountDownLatch latch = new LocalTaskQueueTestConfig.TaskCountDownLatch(1);

	private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalTaskQueueTestConfig().setQueueXmlPath("war/WEB-INF/queue.xml").setDisableAutoTaskExecution(false).setCallbackClass(LocalTaskQueueTestConfig.DeferredTaskCallback.class).setTaskExecutionLatch(latch));
	private final com.google.appengine.api.users.User testUser = new com.google.appengine.api.users.User("asd@asd.de", "bla", "123456");
	@Before
	public void setUp() {
		helper.setUp();
	}

	@After
	public void tearDown() {
		latch.reset();
		helper.tearDown();
	}
	
	@Rule
	public ExpectedException expectedException = ExpectedException.none();

	@Test
	public void testUploadRTF() throws UnauthorizedException, IOException {
		UserEndpointTestHelper.addUser("asd@asd.de", "firstName", "lastName", testUser);
		ProjectEndpointTestHelper.setupProjectWithCodesystem(1L, "My Project", "desc", testUser);

		UploadEndpoint ue = new UploadEndpoint();
		Upload upload = new Upload();

		byte[] decodedString = Base64.decode("e1xydGYxXGFuc2lcZGVmZjBcYWRlZmxhbmcxMDI1DQp7XGZvbnR0Ymx7XGYwXGZyb21hblxmcHJxMlxmY2hhcnNldDAgVGltZXMgTmV3IFJvbWFuO317XGYxXGZyb21hblxmcHJxMlxmY2hhcnNldDIgU3ltYm9sO317XGYyXGZzd2lzc1xmcHJxMlxmY2hhcnNldDAgQXJpYWw7fXtcZjNcZnJvbWFuXGZwcnEyXGZjaGFyc2V0MCBMaWJlcmF0aW9uIFNlcmlme1wqXGZhbHQgVGltZXMgTmV3IFJvbWFufTt9e1xmNFxmbmlsXGZwcnEyXGZjaGFyc2V0MCBBbmRhbGUgU2FucyBVSXtcKlxmYWx0IEFyaWFsIFVuaWNvZGUgTVN9O317XGY1XGZuaWxcZnBycTJcZmNoYXJzZXQwIFRhaG9tYTt9e1xmNlxmbmlsXGZwcnEwXGZjaGFyc2V0MCBUYWhvbWE7fX0NCntcY29sb3J0Ymw7XHJlZDBcZ3JlZW4wXGJsdWUwO1xyZWQwXGdyZWVuMFxibHVlMjU1O1xyZWQwXGdyZWVuMjU1XGJsdWUyNTU7XHJlZDBcZ3JlZW4yNTVcYmx1ZTA7XHJlZDI1NVxncmVlbjBcYmx1ZTI1NTtccmVkMjU1XGdyZWVuMFxibHVlMDtccmVkMjU1XGdyZWVuMjU1XGJsdWUwO1xyZWQyNTVcZ3JlZW4yNTVcYmx1ZTI1NTtccmVkMFxncmVlbjBcYmx1ZTEyODtccmVkMFxncmVlbjEyOFxibHVlMTI4O1xyZWQwXGdyZWVuMTI4XGJsdWUwO1xyZWQxMjhcZ3JlZW4wXGJsdWUxMjg7XHJlZDEyOFxncmVlbjBcYmx1ZTA7XHJlZDEyOFxncmVlbjEyOFxibHVlMDtccmVkMTI4XGdyZWVuMTI4XGJsdWUxMjg7XHJlZDE5MlxncmVlbjE5MlxibHVlMTkyO30NCntcc3R5bGVzaGVldHtcczBcc25leHQwXG5vd2lkY3RscGFyXGh5cGhwYXIwXGFzcGFscGhhXGx0cnBhclxsYW5nZmUyNTVcYWxhbmcyNTVcY2YwXGtlcm5pbmcxXGRiY2hcYWY0XGRiY2hcYWY1XGFmczI0XGxhbmcyNTVcbG9jaFxmMFxoaWNoXGFmMFxmczI0IE5vcm1hbDt9DQp7XHMxNVxzYmFzZWRvbjBcc25leHQxNlxzYjI0MFxzYTEyMFxrZWVwblxkYmNoXGFmNFxsYW5nZmUyNTVcZGJjaFxhZjVcYWZzMjhcYWxhbmcyNTVcbG9jaFxmMlxmczI4XGxhbmcyNTUgSGVhZGluZzt9DQp7XHMxNlxzYmFzZWRvbjBcc25leHQxNlxzYjBcc2ExMjBcbGFuZ2ZlMjU1XGFsYW5nMjU1XGxhbmcyNTUgVGV4dCBCb2R5O30NCntcczE3XHNiYXNlZG9uMTZcc25leHQxN1xzYjBcc2ExMjBcbGFuZ2ZlMjU1XGRiY2hcYWY2XGFsYW5nMjU1XGxhbmcyNTUgTGlzdDt9DQp7XHMxOFxzYmFzZWRvbjBcc25leHQxOFxzYjEyMFxzYTEyMFxub2xpbmVcaVxsYW5nZmUyNTVcZGJjaFxhZjZcYWZzMjRcYWxhbmcyNTVcYWlcZnMyNFxsYW5nMjU1IENhcHRpb247fQ0Ke1xzMTlcc2Jhc2Vkb24wXHNuZXh0MTlcbm9saW5lXGxhbmdmZTI1NVxkYmNoXGFmNlxhbGFuZzI1NVxsYW5nMjU1IEluZGV4O30NCn17XCpcZ2VuZXJhdG9yIExpYnJlT2ZmaWNlLzUuMi43LjIkV2luZG93c19YODZfNjQgTGlicmVPZmZpY2VfcHJvamVjdC8yYjdmMWU2NDBjNDZjZWIyOGFkZjQzZWUwNzVhNmU4Yjg0MzllZDEwfXtcaW5mb3tcY3JlYXRpbVx5cjIwMDlcbW80XGR5MTZcaHIxMVxtaW4zMn17XHJldnRpbVx5cjIwMTdcbW8xMFxkeTlcaHIxNVxtaW40NX17XHByaW50aW1ceXIwXG1vMFxkeTBcaHIwXG1pbjB9fXtcKlx1c2VycHJvcHN7XHByb3BuYW1lIEluZm8gMX1ccHJvcHR5cGUzMHtcc3RhdGljdmFsIH17XHByb3BuYW1lIEluZm8gMn1ccHJvcHR5cGUzMHtcc3RhdGljdmFsIH17XHByb3BuYW1lIEluZm8gM31ccHJvcHR5cGUzMHtcc3RhdGljdmFsIH17XHByb3BuYW1lIEluZm8gNH1ccHJvcHR5cGUzMHtcc3RhdGljdmFsIH19XGRlZnRhYjcwNg0KXHZpZXdzY2FsZTEwMA0Ke1wqXHBnZHNjdGJsDQp7XHBnZHNjMFxwZ2RzY3VzZTQ1MVxwZ3dzeG4xMTkwNlxwZ2hzeG4xNjgzOFxtYXJnbHN4bjExMzRcbWFyZ3JzeG4xMTM0XG1hcmd0c3huMTEzNFxtYXJnYnN4bjExMzRccGdkc2NueHQwIERlZmF1bHQgU3R5bGU7fX0NClxmb3Jtc2hhZGVccGFwZXJoMTY4MzhccGFwZXJ3MTE5MDZcbWFyZ2wxMTM0XG1hcmdyMTEzNFxtYXJndDExMzRcbWFyZ2IxMTM0XHNlY3RkXHNia25vbmVcc2VjdHVubG9ja2VkMVxwZ25kZWNccGd3c3huMTE5MDZccGdoc3huMTY4MzhcbWFyZ2xzeG4xMTM0XG1hcmdyc3huMTEzNFxtYXJndHN4bjExMzRcbWFyZ2JzeG4xMTM0XGZ0bmJqXGZ0bnN0YXJ0MVxmdG5yc3Rjb250XGZ0bm5hclxhZW5kZG9jXGFmdG5yc3Rjb250XGFmdG5zdGFydDFcYWZ0bm5ybGMNCntcKlxmdG5zZXBcY2hmdG5zZXB9XHBnbmRlY1xwYXJkXHBsYWluIFxzMFxub3dpZGN0bHBhclxoeXBocGFyMFxhc3BhbHBoYVxsdHJwYXJcbGFuZ2ZlMjU1XGFsYW5nMjU1XGNmMFxrZXJuaW5nMVxkYmNoXGFmNFxkYmNoXGFmNVxhZnMyNFxsYW5nMjU1XGxvY2hcZjBcaGljaFxhZjBcZnMyNHtccnRsY2ggXGx0cmNoXGxvY2gNClNvbWUgdGV4dCBpbnNpZGUgc2ltcGxlIHRleHQgZG9jfQ0KXHBhciB9");
		Blob fileData = new Blob(decodedString);
		upload.setFileData(fileData);

		upload.setFileName("MyFile");
		upload.setProject(1L);
		upload.setFileSize(decodedString.length);
		TextDocument doc = ue.insertUpload(upload, testUser);
		assertTrue(doc.getText().getValue().startsWith("<p>Some text inside simple text doc</p>"));
	}


	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}
}