import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { BtnDefault } from "../../../common/styles/Btn.jsx";
const StyledPrjSearchBtn = BtnDefault.extend`
  text-align: center;
  width: 100%;
  margin-bottom: 5px;
`;

export default class SearchProjectBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StyledPrjSearchBtn onClick={this.props.toggleSearchBar}>
        <i className="fa fa-search fa-lg" />
        <span>
          <FormattedMessage
            id="searchprojectbtn.search_project"
            defaultMessage="Search Project"
          />
        </span>
      </StyledPrjSearchBtn>
    );
  }
}
