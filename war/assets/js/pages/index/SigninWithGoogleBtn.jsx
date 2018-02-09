import React from "react";
import styled from "styled-components";

import { FormattedMessage } from "react-intl";
import IntlProvider from "../../common/Localization/LocalizationProvider";

import ReactLoading from "../../common/ReactLoading.jsx";
import BinaryDecider from "../../common/modals/BinaryDecider.js";

import { BtnLg } from "../../common/styles/Btn.jsx";

export default class SigninWithGoogleBtn extends React.Component {
  constructor(props) {
    super(props);

    this.authenticationProvider = props.auth.authentication;
    this.state = {
      loading: false
    };

    this.redirect = this.redirect.bind(this);
  }

  redirect() {
    const { formatMessage } = IntlProvider.intl;

    const _this = this;
    this.authenticationProvider.getCurrentUser().then(
      function(value) {
        _this.props.history.push("/PersonalDashboard");
      },
      function(value) {
        var decider = new BinaryDecider(
          formatMessage({
            id: "sign.in.with.google.btn.register_prompt",
            defaultMessage:
              "Your account does not seem to be registered with QDAcity."
          }),
          formatMessage({
            id: "sign.in.with.google.btn.use_different",
            defaultMessage: "Use Different Account"
          }),
          formatMessage({
            id: "sign.in.with.google.btn.register_account",
            defaultMessage: "Register Account"
          })
        );
        decider.showModal().then(function(value) {
          if (value == "optionA") {
            _this.authenticationProvider.changeAccount().then(function() {
              _this.redirect();
            });
          } else _this.registerAccount();
        });
      }
    );
  }

  registerAccount() {
    const { formatMessage } = IntlProvider.intl;

    var _this = this;
    _this.authenticationProvider.getProfile().then(function(userProfile) {
      const esc = text =>
        text.replace(
          /([&<>"'` !@$%()[\]=+{}])/g,
          code => `&#${code.charCodeAt(0)};`
        );
      const displayNameParts = userProfile.name.split(" ");
      const lastName = esc(displayNameParts.pop());
      const firstName = esc(displayNameParts.join(" "));
      const email = esc(userProfile.email);

      const firstNameLabel = formatMessage({
        id: "signinwithgooglebtn.first_name",
        defaultMessage: "First Name"
      });
      const lastNameLabel = formatMessage({
        id: "signinwithgooglebtn.last_name",
        defaultMessage: "Last Name"
      });
      const emailLabel = formatMessage({
        id: "signinwithgooglebtn.email",
        defaultMessage: "Email"
      });

      vex.dialog.open({
        message: formatMessage({
          id: "sign.in.with.google.btn.confirm",
          defaultMessage: "Please confirm:"
        }),
        // FIXME
        input: [
          `<label for="firstName">${firstNameLabel}</label><input name="firstName" type="text" placeholder="${firstNameLabel}" value="${firstName}" required />`,
          `<label for="lastName">${lastNameLabel}</label><input name="lastName" type="text" placeholder="${lastNameLabel}" value="${lastName}" required />`,
          `<label for="email">${emailLabel}</label><input name="email" type="text" placeholder="${emailLabel}" value="${email}" required />`
        ].join("\n"),
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, {
            text: formatMessage({
              id: "sign.in.with.google.btn.register",
              defaultMessage: "Register"
            })
          }),
          $.extend({}, vex.dialog.buttons.NO, {
            text: formatMessage({
              id: "sign.in.with.google.btn.cancel",
              defaultMessage: "Cancel"
            })
          })
        ],
        callback: function(data) {
          if (data === false) {
            return console.log("Cancelled");
          }
          _this.authenticationProvider
            .registerCurrentUser(data.firstName, data.lastName, data.email)
            .then(function() {
              _this.props.auth.updateUserStatus().then(function() {
                _this.redirect();
              });
            });
          return console.log(
            "First",
            data.firstName,
            "Last Name",
            data.lastName,
            "Email",
            data.email
          );
        }
      });
    });
  }

  signIn() {
    this.setState({
      loading: true
    });

    if (this.authenticationProvider.isSignedIn()) {
      this.redirect();
    } else {
      var _this = this;
      this.authenticationProvider.signInWithGoogle().then(function() {
        if (_this.authenticationProvider.isSignedIn()) {
          _this.redirect();
        }
      });
    }
  }

  render() {
    if (this.state.loading) return <ReactLoading />;
    return (
      <BtnLg href="#" onClick={() => this.signIn()}>
        <a>
          <i className="fa fa-google fa-2x" />
        </a>
        <span>
          <FormattedMessage
            id="sign.in.with.google.btn.sign_in_with_google"
            defaultMessage="Sign in with Google"
          />
        </span>
      </BtnLg>
    );
  }
}
