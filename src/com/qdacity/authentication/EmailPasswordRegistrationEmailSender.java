package com.qdacity.authentication;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.Credentials;
import com.qdacity.Sendgrid;

import java.text.Normalizer;
import java.util.logging.Level;
import java.util.logging.Logger;

public class EmailPasswordRegistrationEmailSender implements DeferredTask {

	private UnconfirmedEmailPasswordLogin unconfirmedEmailPasswordLogin;

	public EmailPasswordRegistrationEmailSender(UnconfirmedEmailPasswordLogin unconfirmedEmailPasswordLogin) {
		this.unconfirmedEmailPasswordLogin = unconfirmedEmailPasswordLogin;
	}

	@Override
	public void run() {
		sendRegistrationMail(unconfirmedEmailPasswordLogin);
	}
	
	private void sendRegistrationMail(UnconfirmedEmailPasswordLogin unconfirmedEmailPasswordLogin) {
		Sendgrid mail = new Sendgrid(Credentials.SENDGRID_USER, Credentials.SENDGRID_PW);
		
		String givenName = unconfirmedEmailPasswordLogin.getGivenName() == null ? "User" : unconfirmedEmailPasswordLogin.getGivenName();
		String surName = unconfirmedEmailPasswordLogin.getSurName() == null ? "" : unconfirmedEmailPasswordLogin.getSurName();
		
		String name = Normalizer.normalize(givenName, Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "") + " " + Normalizer.normalize(surName, Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "");
		Logger.getLogger("logger").log(Level.INFO, "Sending registration mail to: " + name + "(" + unconfirmedEmailPasswordLogin.getEmail() + ")");

		mail.addTo(unconfirmedEmailPasswordLogin.getEmail(), name);
		
		String greetingName = givenName + ", ";
		
		String msgBody = "Hi " + greetingName + "<br>";
		msgBody += 	"<p>"
				+	"thank you for your registration on QDAcity!<br>"
				+	"<br>"
				+ 	"Please enter the following code in the registration screen on QDAcity in order to complete the registration:<br>"
				+ 	unconfirmedEmailPasswordLogin.getConfirmationCode() + "<br>"
				+	"<br>"
				+	"Kind Regards,<br>"
				+ 	"Your QDAcity team";
		msgBody += "</p>";
		
		
		mail.setFrom("QDAcity <support@qdacity.com>");
		mail.setSubject("QDAcity User Migration");
		mail.setText(" ").setHtml(msgBody);

		mail.send();

		Logger.getLogger("logger").log(Level.INFO, mail.getServerResponse());
	}

}
