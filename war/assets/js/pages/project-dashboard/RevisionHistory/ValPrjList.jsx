import React from "react";
import IntlProvider from "../../../common/Localization/LocalizationProvider";
import styled from "styled-components";
import Theme from "../../../common/styles/Theme.js";

import ProjectEndpoint from "../../../common/endpoints/ProjectEndpoint";

import {
  ItemList,
  ListMenu,
  StyledListItemBtn,
  StyledListItemPrimary,
  StyledListItemDefault
} from "../../../common/styles/ItemList.jsx";

import { BtnDefault } from "../../../common/styles/Btn.jsx";

export default class ValPrjList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      validationProjects: this.props.validationProjects
    };

    this.itemList = null;

    this.renderValidationProject = this.renderValidationProject.bind(this);
  }

  deleteValPrj(e, valPrjId, index) {
    const { formatMessage } = IntlProvider.intl;
    var _this = this;
    e.stopPropagation();
    ProjectEndpoint.removeValidationProject(valPrjId)
      .then(function(val) {
        alertify.success(
          formatMessage({
            id: "valprjlist.revision_deleted",
            defaultMessage: "Revision has been deleted"
          })
        );
        _this.state.validationProjects.splice(index, 1);
        _this.setState({
          validationProjects: _this.state.validationProjects
        });
      })
      .catch(this.handleBadResponse);
  }

  handleBadResponse(reason) {
    const { formatMessage } = IntlProvider.intl;
    alertify.error(
      formatMessage({
        id: "valprjlist.error",
        defaultMessage: "There was an error"
      })
    );
    console.log(reason.message);
  }

  renderDeleteBtn(valPrj, index) {
    if (this.props.isAdmin || this.props.isProjectOwner)
      return (
        <StyledListItemBtn
          onClick={e => this.deleteValPrj(e, valPrj.id, index)}
          className="btn fa-lg"
          color={Theme.rubyRed}
          colorAccent={Theme.rubyRedAccent}
        >
          <i className="fa fa-trash" />
        </StyledListItemBtn>
      );
    else return "";
  }

  valPrjLink(valPrjId) {
    if (this.props.isAdmin || this.props.isProjectOwner)
      this.props.history.push(
        "/CodingEditor?project=" + valPrjId + "&type=VALIDATION"
      );
  }

  renderValidationProject(valPrj, index) {
    return (
      <StyledListItemDefault
        key={valPrj.id}
        onClick={() => this.valPrjLink(valPrj.id)}
        clickable={true}
      >
        <span> {valPrj.creatorName} </span>
        {this.renderDeleteBtn(valPrj, index)}
      </StyledListItemDefault>
    );
  }

  render() {
    return (
      <div>
        <ListMenu>
          {this.itemList ? this.itemList.renderSearchBox() : ""}

          <BtnDefault type="button">
            <i className="fa fa-search  fa-lg" />
          </BtnDefault>
        </ListMenu>

        <ItemList
          ref={r => {
            if (r) this.itemList = r;
          }}
          hasSearch={true}
          hasPagination={true}
          doNotrenderSearch={true}
          itemsPerPage={8}
          items={this.state.validationProjects}
          renderItem={this.renderValidationProject}
        />
      </div>
    );
  }
}
