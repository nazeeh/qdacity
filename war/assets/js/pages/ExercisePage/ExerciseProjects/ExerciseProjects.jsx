import React from "react";
import { FormattedMessage } from "react-intl";

import ExerciseProjectList from "./ExerciseProjectList.jsx";

export default class ExerciseProjects extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="user-section" className="box box-default">
        <div className="box-header with-border">
          <h3 className="box-title">
            <FormattedMessage
              id="exerciseProjects.exerciseProjects"
              defaultMessage="Exercise Projects"
            />
          </h3>
        </div>
        <div className="box-body">
          <div>
            <ExerciseProjectList
              exercise={this.props.exercise}
              auth={this.props.auth}
              history={this.props.history}
            />
          </div>
        </div>
      </div>
    );
  }
}
