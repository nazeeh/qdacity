import React from "react";
import { FormattedMessage } from "react-intl";
import IntlProvider from "../../../common/Localization/LocalizationProvider";
import styled from "styled-components";

import ProjectEndpoint from "../../../common/endpoints/ProjectEndpoint";

import { ListMenu } from "../../../common/styles/ItemList.jsx";

import { StyledSearchField } from "../../../common/styles/SearchBox.jsx";

import { BtnDefault } from "../../../common/styles/Btn.jsx";

export default class InviteUserField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userEmail: ""
    };
    this.updateUserEmail = this.updateUserEmail.bind(this);
    this.inviteUser = this.inviteUser.bind(this);
  }

  updateUserEmail(e) {
    this.setState({
      userEmail: e.target.value
    });
  }

  inviteUser() {
    const { formatMessage } = IntlProvider.intl;
    var _this = this;
    ProjectEndpoint.inviteUser(this.props.project.getId(), this.state.userEmail)
      .then(function(resp) {
        alertify.success(
          formatMessage(
            {
              id: "inviteuserfield.invited",
              defaultMessage: "{email} has been invited"
            },
            {
              email: _this.state.userEmail
            }
          )
        );
      })
      .catch(function(resp) {
        alertify.error(
          formatMessage(
            {
              id: "inviteuserfield.not_found",
              defaultMessage: "{email} was not found"
            },
            {
              email: _this.state.userEmail
            }
          )
        );
      });
  }

  render() {
    if (this.props.isProjectOwner === false) return null;

    const { formatMessage } = IntlProvider.intl;

    const searchFieldPlaceholder = formatMessage({
      id: "inviteuserfield.search",
      defaultMessage: "User Email"
    });

    return (
      <ListMenu>
        <StyledSearchField
          type="text"
          className="searchfield"
          placeholder={searchFieldPlaceholder}
          value={this.state.userEmail}
          onChange={this.updateUserEmail}
          onKeyPress={e => {
            if (e.key === "Enter") this.inviteUser();
          }}
        />
        <BtnDefault type="button" onClick={this.inviteUser}>
          <i className="fa fa-paper-plane  fa-lg" />{" "}
          <FormattedMessage
            id="inviteuserfield.invite"
            defaultMessage="Invite"
          />
        </BtnDefault>
      </ListMenu>
    );
  }
}
