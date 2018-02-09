import React from "react";
import styled from "styled-components";

import CodeView from "../CodeView/CodeView.jsx";
import SearchResults from "./SearchResults/SearchResults.jsx";

import { BottomPanelType } from "./BottomPanelType.js";

const StyledCloseFooterBtn = styled.a`
  float: right;
  color: black;
`;

export default class BottomPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderPanel() {
    if (this.props.panelType === BottomPanelType.SEARCHRESULTS) {
      this.updateCode = () => {};
      return <SearchResults searchResults={this.props.searchResults} />;
    }
    if (this.props.panelType === BottomPanelType.CODEVIEW)
      return (
        <CodeView
          ref={c => {
            if (c) this.updateCode = c.updateCode;
          }}
          {...this.props}
        />
      );
  }

  render() {
    return (
      <div>
        <StyledCloseFooterBtn onClick={this.props.hideCodingView}>
          <i className="fa fa-times-circle fa-2x fa-hover" />
        </StyledCloseFooterBtn>
        {this.renderPanel()}
      </div>
    );
  }
}
