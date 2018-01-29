import React from "react";
import IntlProvider from "../../common/Localization/LocalizationProvider";
import styled from "styled-components";
import Theme from "../../common/styles/Theme.js";

import CourseEndpoint from "endpoints/CourseEndpoint";
import "script-loader!../../../../components/URIjs/URI.min.js";
import "script-loader!../../../../components/alertify/alertify-0.3.js";
import TermCourse from "./TermCourse";
import BtnDefault from "../../common/styles/Btn.jsx";
import Participants from "./Participants/Participants.jsx";
import Exercises from "./Exercises/Exercises.jsx";
import TitleRow from "./TitleRow/TitleRow.jsx";
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

  }

  init() {
    if (!this.userPromise) {
      this.userPromise = this.props.account.getCurrentUser();
      this.setTermCourseInfo();
    }
  }


  render() {
    return null;
  }
}
