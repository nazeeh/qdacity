import React from "react";
import { FormattedMessage, defineMessages } from "react-intl";
import Jumbotron from "../../common/styles/Jumbotron";

export default class AdvertPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Jumbotron id="welcome">
        <h1>
          <FormattedMessage
            id="advertpanel.title"
            defaultMessage="Shameless Advertisement"
          />
        </h1>
        <div>
          <p>
            <FormattedMessage
              id="advertpanel.student_job_offer"
              defaultMessage="We offer {paid_jobs} to further develop QDAcity. Come talk to us if you are interested."
              values={{
                paid_jobs: (
                  <b>
                    <FormattedMessage
                      id="advertpanel.payed_jobs"
                      defaultMessage="paid student jobs"
                    />
                  </b>
                )
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="advertpanel.final_thesis_offer"
              defaultMessage="If you don't have a topic for your {final_thesis} yet, and like to program and build stuff, we've also got you covered. We are offering a variety of final thesis for students looking to program something awesome as part of a final thesis."
              values={{
                final_thesis: (
                  <b>
                    <FormattedMessage
                      id="advertpanel.final_thesis"
                      defaultMessage="final thesis"
                    />
                  </b>
                )
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="advertpanel.contact"
              defaultMessage="In both cases, shoot us an email and we will get back to you. {email}"
              values={{
                email: (
                  <a href="mailto:support@qdacity.com?Subject=QDAcity%20support">
                    <span> support@qdacity.com</span>
                  </a>
                )
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="advertpanel.additional_jobs"
              defaultMessage="For other types of jobs, check {student_jobs_url}"
              values={{
                student_jobs_url: (
                  <a href="https://osr.cs.fau.de/people/jobs/student-jobs/">
                    <FormattedMessage
                      id="advertpanel.our_blog"
                      defaultMessage="our blog"
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
