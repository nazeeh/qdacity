import React from "react";
import IntlProvider from "../../../../common/Localization/LocalizationProvider";

import Table from "../../../../common/Table/Table.jsx";

export default class DocumentSearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { formatMessage } = IntlProvider.intl;
    let tableContent = [];
    let results = this.props.documentResults;
    for (var i = 0; i < results.length; i++) {
      let result = results[i];
      tableContent.push({
        row: [result.title, ""],
        onClick: result.onClick
      });
    }

    const tableHeader = [
      formatMessage({
        id: "documentsearchresults.document",
        defaultMessage: "Document"
      }),
      formatMessage({
        id: "documentsearchresults.excerpt",
        defaultMessage: "Excerpt"
      })
    ];

    return (
      <div>
        <Table
          columns={"1fr 1fr"}
          tableHeader={tableHeader}
          tableContent={tableContent}
        />
      </div>
    );
  }
}
