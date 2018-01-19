import React from "react";
import styled from "styled-components";
import { FormattedMessage } from "react-intl";

const StyledPage = styled.div`
  margin-top: 40px;
`;

export default class Faq extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <StyledPage className="container main-content">
        <h1>
          <FormattedMessage
            id="faq.title"
            defaultMessage="Frequently asked questions (FAQ)"
          />
        </h1>
        <h3>
          <FormattedMessage
            id="faq.signin.title"
            defaultMessage="I&apos;m having trouble signing in. What can I do?"
          />
        </h3>
        <div>
          <FormattedMessage
            id="faq.signin.description"
            defaultMessage="If you are experiencing trouble registering or signing in try the following:"
          />
          <ul>
            <li>
              <FormattedMessage
                id="faq.signin.signout"
                defaultMessage="Sign out of all accounts you use for signing into or registering for QDAcity. If you want to use your google account, sign out of all google accounts on the machine you are using."
              />
            </li>
            <li>
              <FormattedMessage
                id="faq.signin.clear_cache"
                defaultMessage="Clear your browser cache. Try Ctrl + Shift + Del to do so"
              />
            </li>
            <li>
              <FormattedMessage
                id="faq.signin.disable_adblock"
                defaultMessage="Try disabling your ad-blocker. QDAcity should work with ad-block plus. There are known issues with using uBlock, though."
              />
            </li>
          </ul>
        </div>
        <h3>
          <FormattedMessage
            id="faq.can_i_use"
            defaultMessage="Can I use QDAcity for my project/thesis?"
          />
        </h3>
        <FormattedMessage
          id="faq.can_i_use.answer"
          defaultMessage="We try to keep our production version as stable as possible. However, since our service is still in beta, features may be removed at any time, and there is no guarantee on service availability or failure. Further, there is a limited feature set at the moment. We only support input in plain text, or uploads of RTF documents."
        />
        <h3>
          <FormattedMessage
            id="faq.pricing"
            defaultMessage="What is the pricing for using QDAcity?"
          />
        </h3>
        <FormattedMessage
          id="faq.pricing.answer"
          defaultMessage="You can use QDAcity free of charge."
        />
      </StyledPage>
    );
  }
}
