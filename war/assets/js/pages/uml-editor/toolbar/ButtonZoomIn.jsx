import React from "react";
import IntlProvider from "../../../common/Localization/LocalizationProvider";

import { BtnDefault } from "../../../common/styles/Btn.jsx";

export default class ButtonZoomIn extends React.Component {
  constructor(props) {
    super(props);

    this.umlEditor = this.props.umlEditor;

    this.buttonClicked = this.buttonClicked.bind(this);
  }

  buttonClicked() {
    this.umlEditor.getGraphView().zoomIn();
  }

  render() {
    const _this = this;
    const { formatMessage } = IntlProvider.intl;
    const zoomIn = formatMessage({
      id: "buttonzoomin",
      defaultMessage: "Zoom into the graph."
    });

    return (
      <BtnDefault title={zoomIn} onClick={_this.buttonClicked}>
        <i className="fa fa-search-plus" />
      </BtnDefault>
    );
  }
}
