package com.qdacity.servlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LetsencryptServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -5453403004097446885L;
	public static final Map<String, String> challenges = new HashMap<String, String>();

	static {
		challenges.put("17pmkD3noQ9GIARXYUbofNxkxxVv0I2wsWVR3-5nKdg", "17pmkD3noQ9GIARXYUbofNxkxxVv0I2wsWVR3-5nKdg.ksjKkyomkPeam8ULj6BQqQFbyDViwwuDAx8tg8uVuEc");
		challenges.put("c_rSqaYWs4qM1DvTstl2iZukhYmWk3pq5iccfLKyNss", "c_rSqaYWs4qM1DvTstl2iZukhYmWk3pq5iccfLKyNss.ksjKkyomkPeam8ULj6BQqQFbyDViwwuDAx8tg8uVuEc");
		challenges.put("soQhffJu3ge23g5yQ7_K9Ab67HGG_DALbgNxPPAodg0", "soQhffJu3ge23g5yQ7_K9Ab67HGG_DALbgNxPPAodg0.ksjKkyomkPeam8ULj6BQqQFbyDViwwuDAx8tg8uVuEc");
		challenges.put("XxOqKSdyggobVXCJcdp3qKJ0iUu6KX2GhKKBzEdkJ9I", "XxOqKSdyggobVXCJcdp3qKJ0iUu6KX2GhKKBzEdkJ9I.ksjKkyomkPeam8ULj6BQqQFbyDViwwuDAx8tg8uVuEc");
		challenges.put("_d48LgtnIRQb7BrKkbcNfQ399NCGb-O5_gYA0Zc0-mQ", "_d48LgtnIRQb7BrKkbcNfQ399NCGb-O5_gYA0Zc0-mQ.ksjKkyomkPeam8ULj6BQqQFbyDViwwuDAx8tg8uVuEc");
		challenges.put("QNXBg80jjbIP8iaIbCFBguREB40iycocTMw7XabtNOk", "QNXBg80jjbIP8iaIbCFBguREB40iycocTMw7XabtNOk.ksjKkyomkPeam8ULj6BQqQFbyDViwwuDAx8tg8uVuEc");
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		if (!req.getRequestURI().startsWith("/.well-known/acme-challenge/")) {
			resp.sendError(404);
			return;
		}
		String id = req.getRequestURI().substring("/.well-known/acme-challenge/".length());
		if (!challenges.containsKey(id)) {
			resp.sendError(404);
			return;
		}
		resp.setContentType("text/plain");
		resp.getOutputStream().print(challenges.get(id));
	}
}
