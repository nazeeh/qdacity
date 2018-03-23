package com.qdacity.authentication;

import com.google.appengine.api.taskqueue.DeferredTask;
import com.qdacity.Credentials;
import com.qdacity.Sendgrid;
import com.qdacity.user.User;

import java.text.Normalizer;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ForgotPasswordEmailSender implements DeferredTask {

    private final String generatedPassword;
    private final User user;
    private final String loginEmail;

    public ForgotPasswordEmailSender(User user, String loginEmail, String generatedPassword) {
        this.user = user;
        this.generatedPassword = generatedPassword;
        this.loginEmail = loginEmail;
    }

    @Override
    public void run() {
        sendUserMigrationEmail(user, loginEmail, generatedPassword);
    }

    private void sendUserMigrationEmail(User user, String loginEmail, String generatedPassword) {
        Sendgrid mail = new Sendgrid(Credentials.SENDGRID_USER, Credentials.SENDGRID_PW);

        String givenName = user.getGivenName() == null ? "User" : user.getGivenName();
        String surName = user.getSurName() == null ? "" : user.getSurName();

        String name = Normalizer.normalize(givenName, Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "") + " " + Normalizer.normalize(surName, Normalizer.Form.NFKD).replaceAll("[^\\p{ASCII}]", "");
        Logger.getLogger("logger").log(Level.INFO, "Sending notification mail to: " + name + "(" + user.getEmail() + ")");

        if(user.getEmail() == null) {
            Logger.getLogger("logger").log(Level.SEVERE, "Sending new password aborted because the given email was null");
            return;
        }

        mail.addTo(user.getEmail(), name);

        String greetingName = givenName + ", ";

        String msgBody = "Hi " + greetingName + "<br>";
        msgBody += 	"<p>"
                +	"You requested a new password in order to be able to sign in with <u>" +  loginEmail + "</u> again.<br>"
                +	"<br>"
                + 	"Your new password: " + generatedPassword
                +   "<br>"
                +	"Please be sure to change that password in order to keep your account secure!"
                +	"<br>"
                +	"<br>"
                +	"Kind Regards,<br>"
                + 	"Your QDAcity team";
        msgBody += "</p>";


        mail.setFrom("QDAcity <support@qdacity.com>");
        mail.setSubject("QDAcity forgot password");
        mail.setText(" ").setHtml(msgBody);

        mail.send();

        Logger.getLogger("logger").log(Level.INFO, mail.getServerResponse());
    }
}
