import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import Account from "./Account.jsx";

const StyledAccountTab = styled.li`
  display: ${props => (props.loggedIn ? "block" : "none")} !important;
`;

const StyledHelpTab = styled.li`
  display: block;
`;

const StyledSigninTab = styled.li`
  display: ${props => (props.loggedIn ? "none" : "block")} !important;
`;

const StyledNavbarItem = styled.a`
  color: ${props => props.theme.defaultText} !important;
`;

const StyledDropdownLinks = styled.div`
  display: ${props =>
    !props.showOnlyIfLoggedIn || (props.showOnlyIfLoggedIn && props.loggedIn)
      ? "block"
      : "none"};
  background: #efe8e8;
  margin: 5px;
  &:hover {
    background: #dcdada !important;
  }
`;

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };

    this.account = {};

    this.redirectToPersonalDashbaord = this.redirectToPersonalDashbaord.bind(
      this
    );
    this.initializeAccount = this.initializeAccount.bind(this);
  }

  redirectToPersonalDashbaord() {
    this.props.history.push("/PersonalDashboard");
  }

  showAccountDropdown() {
    document.getElementById("accountView").classList.toggle("show");
  }

  showSigninDropdown() {
    document.getElementById("signinView").classList.toggle("show");
  }

  showHelpDropdown() {
    document.getElementById("helpView").classList.toggle("show");
  }

  initializeAccount(c) {
    this.account = c;
    this.account.auth2.currentUser.listen(googleUser => {
      if (googleUser.isSignedIn()) {
        this.account.getCurrentUser().then(
          value => {
            this.setState({
              user: value
            });
          },
          () => {
            console.log("Could not get current user");
          }
        );
      }
    });
  }

  render() {
    var isLoggedIn = this.account.isSignedIn && this.account.isSignedIn();

    return (
      <nav
        className="navbar navbar-default navbar-fixed-top topnav"
        role="navigation"
      >
        <div className="container topnav">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle"
              data-toggle="collapse"
              data-target="#bs-example-navbar-collapse-1"
            >
              <span className="sr-only">
                <FormattedMessage
                  id="navbar.toggle_navigation"
                  defaultMessage="Toggle navigation"
                />
              </span>{" "}
              <span className="icon-bar" /> <span className="icon-bar" />{" "}
              <span className="icon-bar" />
            </button>
            <StyledNavbarItem
              className="navbar-brand topnav clickable"
              onClick={this.redirectToPersonalDashbaord}
            >
              QDAcity
            </StyledNavbarItem>
          </div>
          <div
            className="collapse navbar-collapse"
            id="bs-example-navbar-collapse-1"
          >
            <ul className="nav navbar-nav navbar-right">
              <StyledHelpTab loggedIn={isLoggedIn} className="dropdown">
                <StyledNavbarItem
                  className="dropdownToggle clickable"
                  onClick={function() {
                    this.showHelpDropdown();
                  }.bind(this)}
                >
                  Help
                </StyledNavbarItem>
                <div id="helpView" className="dropdown-menu dropdownContent">
                  <StyledDropdownLinks
                    loggedIn={isLoggedIn}
                    className="clickable"
                    onClick={() => this.props.history.push("/Faq")}
                  >
                    <div>Faq</div>
                  </StyledDropdownLinks>
                  <StyledDropdownLinks
                    showOnlyIfLoggedIn
                    loggedIn={isLoggedIn}
                    className="clickable"
                    onClick={function() {
                      this.props.tutorial.tutorialEngine.showOverviewWindow();
                    }.bind(this)}
                  >
                    <div>Tutorial Overview</div>
                  </StyledDropdownLinks>
                </div>
              </StyledHelpTab>
              <StyledAccountTab loggedIn={isLoggedIn} className="dropdown">
                <StyledNavbarItem
                  className="dropdownToggle clickable"
                  onClick={this.showAccountDropdown}
                >
                  <FormattedMessage
                    id="navbar.account"
                    defaultMessage="Account"
                  />{" "}
                  <b className="caret" />
                </StyledNavbarItem>
                <div id="accountView" className="dropdown-menu dropdownContent">
                  <Account
                    ref={this.initializeAccount}
                    client_id={this.props.client_id}
                    scopes={this.props.scopes}
                    callback={this.props.callback}
                    history={this.props.history}
                  />
                </div>
              </StyledAccountTab>
              <StyledSigninTab loggedIn={isLoggedIn} className="dropdown">
                <StyledNavbarItem
                  href="#"
                  className="dropdownToggle"
                  onClick={this.showSigninDropdown}
                >
                  <FormattedMessage
                    id="navbar.sign_in"
                    defaultMessage="Sign in"
                  />{" "}
                  <b className="caret" />
                </StyledNavbarItem>
                <ul id="signinView" className="dropdown-menu dropdownContent">
                  <li>
                    <div className="navbar-content">
                      <div className="row">
                        <div className="col-md-12">
                          <a
                            id="navBtnSigninGoogle"
                            className="btn  btn-primary"
                            href="#"
                          >
                            <i className="fa fa-google fa-2x pull-left" />
                            <span>
                              <FormattedMessage
                                id="navbar.google_sign_in"
                                defaultMessage="Sign in with Google"
                              />
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="navbar-footer">
                      <div className="navbar-footer-content">
                        <div className="row">
                          <div className="col-md-12" />
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </StyledSigninTab>
              {this.state.user.type === "ADMIN" && (
                <li>
                  <StyledNavbarItem
                    className="topnav clickable"
                    onClick={() => this.props.history.push("/Admin")}
                  >
                    Administration
                  </StyledNavbarItem>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
