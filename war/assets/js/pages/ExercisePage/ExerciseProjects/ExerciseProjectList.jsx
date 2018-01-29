import React from "react";
import { FormattedMessage } from "react-intl";

import CourseEndpoint from "../../../common/endpoints/CourseEndpoint";
import ExerciseEndpoint from "../../../common/endpoints/ExerciseEndpoint";
import ProjectEndpoint from "../../../common/endpoints/ProjectEndpoint";
import styled from "styled-components";
import CustomForm from "../../../common/modals/CustomForm";
import Theme from "../../../common/styles/Theme.js";
import Confirm from "../../../common/modals/Confirm";
import IntlProvider from "../../../common/Localization/LocalizationProvider";

import {
  ItemList,
  ListMenu,
  StyledListItemBtn,
  StyledListItemPrimary,
  StyledListItemDefault
} from "../../../common/styles/ItemList.jsx";

import { BtnDefault } from "../../../common/styles/Btn.jsx";

const StyledNewExBtn = styled.div`
  padding-bottom: 5px;
`;

export default class ExerciseProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exerciseProjects: [],
    };

    this.init();

    this.renderExerciseProject = this.renderExerciseProject.bind(this);
  }

  init() {
    if (!this.userPromise) {
      this.userPromise = this.props.account.getCurrentUser();
      this.getExerciseProjectsPromise = ExerciseEndpoint.getExerciseProjectsByExerciseID(
        this.props.exercise.id
      );
      this.fetchExerciseData();
    }
  }

  fetchExerciseData() {
    var _this = this;
    this.getExerciseProjectsPromise.then(function(resp) {
      resp.items = resp.items || [];
      _this.setState({
        exerciseProjects: resp.items
      });
    });
  }


  editorClick(e, exerciseProject) {

  }


  renderExerciseProject(exerciseProject, index) {
    return (
      <StyledListItemDefault key={index} className="clickable">
        <span> {exerciseProject.name} </span>
        <div>
          <StyledListItemBtn
            onClick={e => this.editorClick(e, exerciseProject, index)}
            className=" btn fa-lg"
            color={Theme.rubyRed}
            colorAccent={Theme.rubyRedAccent}
          >
            <i className="fa fa-trash " />
          </StyledListItemBtn>
        </div>
      </StyledListItemDefault>
    );
  }

  render() {
    var _this = this;

    if (!this.props.account.getProfile() || !this.props.account.isSignedIn())
      return null;

    return (
      <div>
        <ItemList
          key={"itemlist"}
          hasPagination={true}
          itemsPerPage={8}
          items={this.state.exerciseProjects}
          renderItem={this.renderExerciseProject}
        />
      </div>
    );
  }
}
