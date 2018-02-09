import React from "react";
import IntlProvider from "../../common/Localization/LocalizationProvider";
import styled from "styled-components";
import Theme from "../../common/styles/Theme.js";

import ExerciseEndpoint from "endpoints/ExerciseEndpoint";
import "script-loader!../../../../components/URIjs/URI.min.js";
import "script-loader!../../../../components/alertify/alertify-0.3.js";
import Exercise from "./Exercise";
import ExerciseProjects from "./ExerciseProjects/ExerciseProjects.jsx";
import BtnDefault from "../../common/styles/Btn.jsx";
import Confirm from "../../common/modals/Confirm";

const StyledNewPrjBtn = styled.div`
  padding-left: 5px;
`;
const StyledDashboard = styled.div`
  margin-top: 70px;
  margin-left: auto;
  margin-right: auto;
  width: 1170px;
  display: grid;
  grid-template-columns: 6fr 6fr;
  grid-template-areas:
    "titlerow titlerow"
    "terms teachers";
  grid-column-gap: 20px;
`;

const StyledTitleRow = styled.div`
  grid-area: titlerow;
`;

export default class ExercisePage extends React.Component {
  constructor(props) {
    super(props);

    var urlParams = URI(window.location.search).query(true);
    var exercise = new Exercise(urlParams.exercise);

    this.state = {
      exercise: exercise,
      isTermCourseOwner: false
    };
  }

  init() {
    if (!this.userPromise) {
      this.userPromise = this.props.account.getCurrentUser();
      this.getExerciseByIDPromise = ExerciseEndpoint.getExerciseByID(
        this.state.exercise.id
      );

      this.setExerciseInfo();
    }
  }

  setExerciseInfo() {
    var _this = this;
    var exercise = this.state.exercise;
    this.userPromise.then(function(user) {
      _this.getExerciseByIDPromise.then(function(exerciseResp) {
        var isTermCourseOwner = _this.props.account.isTermCourseOwner(
          user,
          exerciseResp.termCourseID
        );
        _this.setState({
          exercise: exercise,
          isTermCourseOwner: isTermCourseOwner
        });
      });
    });
  }

  renderExerciseProjects() {
    var isUserTermCourseOwner = this.state.isTermCourseOwner;
    if (!isUserTermCourseOwner) {
      return "";
    } else {
      return (
        <ExerciseProjects
          exercise={this.state.exercise}
          account={this.props.account}
        />
      );
    }
  }

  render() {
    if (!this.props.account.getProfile() || !this.props.account.isSignedIn())
      return null;
    this.init();

    return <StyledDashboard>{this.renderExerciseProjects()}</StyledDashboard>;
  }
}
