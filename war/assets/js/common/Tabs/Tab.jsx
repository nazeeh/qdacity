import React from "react";
import styled from "styled-components";

const StyledTab = styled.div`
  padding: 5px 10px 5px 10px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  color: ${props => (props.isActive ? "#fff" : "#000")};
  background-color: ${props =>
    props.isActive ? props.theme.bgPrimaryHighlight : ""};
  border-bottom-style: solid;
  border-bottom-color: ${props => props.theme.bgPrimaryHighlight};
`;

export default class Tab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StyledTab
        isActive={this.props.isActive}
        onClick={() => this.props.changeTab(this.props.tabIndex)}
      >
        {this.props.tabTitle}
      </StyledTab>
    );
  }
}
