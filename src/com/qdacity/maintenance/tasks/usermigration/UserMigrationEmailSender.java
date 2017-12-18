package com.qdacity.maintenance.tasks.usermigration;

import java.text.Normalizer;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.Credentials;
import com.qdacity.Sendgrid;
import com.qdacity.user.User;

public class UserMigrationEmailSender implements DeferredTask {
	
	private User user;
	private String href;
	
	public UserMigrationEmailSender(User user, String href) {
		this.user = user;
		this.href = href;
	}

	@Override
	public void run() {
		sendUserMigrationEmail(user, href);
	}
	
	private void sendUserMigrationEmail(User user, String href) {
		Sendgrid mail = new Sendgrid(Credentials.SENDGRID_USER, Credentials.SENDGRID_PW);
		
		String name = Normalizer.normalize(user.getGivenName(), Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "") + " " + Normalizer.normalize(user.getSurName(), Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "");
		Logger.getLogger("logger").log(Level.INFO, "Sending notification mail to: " + name + "(" + user.getEmail() + ")");
		mail.addTo(user.getEmail(), name);
		
		String greetingName = user.getGivenName() + ", ";
		
		String msgBody = "Hi " + greetingName + "<br>";
		msgBody += 	"<p>"
				+	"We have geat news for you! We will soon add some new features to QDAcity.<br>"
				+ 	"This includes also the possibility to sign-in with other Social Providers than Google (or even with only your Email and password).<br>"
				+	"<br>"
				+ 	"Because of this, every user needs to <strong>migrate his/her account</strong>. No worries, it is just clicking the link and following the instructions (~1min)."
				+	"<br>"
				+	"<a href=" + href + ">" + href + "</a>"
				+	"<br>"
				+	"<br>"
				+ 	"We hope you are looking forward to the new features."
				+	"<br>"
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
