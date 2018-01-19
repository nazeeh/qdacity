import React from "react";
import Jumbotron from "../../common/styles/Jumbotron";
import { FormattedMessage } from "react-intl";

export default class WelcomePanel extends React.Component {
  constructor(props) {
    super(props);
    this.redirectToNytProject = this.redirectToNytProject.bind(this);
  }

  redirectToNytProject() {
    this.props.history.push(
      "/ProjectDashboard?project=6263559650541568&amp;type=PROJECT"
    );
  }

  render() {
    return (
      <Jumbotron id="welcome">
        <h1>
          <FormattedMessage
            id="welcomepanel.welcome_user"
            defaultMessage="Welcome {user}"
            values={{
              user: this.props.account.getProfile().getGivenName()
            }}
          />
        </h1>
        <div>
          <p>
            <FormattedMessage
              id="welcomepanel.qda_status"
              defaultMessage="QDAcity is currently in beta. We appreciate feedback to {email}."
              values={{
                email: (
                  <a href="mailto:support@qdacity.com?Subject=QDAcity%20support">
                    <span>support@qdacity.com</span>
                  </a>
                )
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="welcomepanel.qda_nyt_access"
              defaultMessage="For {nyt} please request access to {nyt_link} by clicking &quot;Re-Code&quot; for a specific revision. You will then need to wait for authorization."
              values={{
                nyt: (
                  <b>
                    <FormattedMessage
                      id="welcomepanel.nyt"
                      defaultMessage="NYT WS2017 at FAU"
                    />
                  </b>
                ),
                nyt_link: (
                  <a onClick={this.redirectToNytProject} className="clickable">
                    <FormattedMessage
                      id="welcomepanel.this_project"
                      defaultMessage="this project"
                    />
                  </a>
                )
              }}
            />
          </p>
        </div>
      </Jumbotron>
    );
  }
}
