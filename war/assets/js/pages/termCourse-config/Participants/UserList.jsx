import React from "react";

import CourseEndpoint from "../../../common/endpoints/CourseEndpoint";
import styled from "styled-components";

import {
  ItemList,
  ListMenu,
  StyledListItemBtn,
  StyledListItemPrimary,
  StyledListItemDefault
} from "../../../common/styles/ItemList.jsx";

import { BtnDefault } from "../../../common/styles/Btn.jsx";

const StyledInviteButton = styled.div`
  padding-bottom: 5px;
`;

export default class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };

    this.init();

    this.renderUser = this.renderUser.bind(this);
  }

  init() {
    this.addOwners();
  }

  addOwners() {
    var _this = this;
    CourseEndpoint.listTermCourseParticipants(
      this.props.termCourse.getId()
    ).then(function(resp) {
      resp.items = resp.items || [];
      _this.setState({
        users: resp.items
      });
    });
  }

  renderUser(user, index) {
    return (
      <StyledListItemDefault key={index} className="clickable">
        <span> {user.givenName + " " + user.surName} </span>
      </StyledListItemDefault>
    );
  }

  render() {
    return (
      <ItemList
        key={"itemlist"}
        hasPagination={true}
        itemsPerPage={8}
        items={this.state.users}
        renderItem={this.renderUser}
      />
    );
  }
}
