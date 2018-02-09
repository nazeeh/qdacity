import React from "react";
import IntlProvider from "../../common/Localization/LocalizationProvider";

import SaturationWeights from "../saturation/SaturationWeights";

export default class SaturationCategorySettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      category: props.category,
      saturationParameters: props.saturationParameters,
      categoryIdx: props.catIdx
    };
  }

  toggleIsExpanded() {
    this.setState({
      isExpanded: !this.state.isExpanded
    });
  }

  toPercent(value) {
    if (value != "undefined") return (value * 100).toFixed(2);
    else return -1;
  }

  render() {
    var satWeights = new SaturationWeights(this.state.saturationParameters);
    var satNameWeights = satWeights.getNameAndWeightsArray();
    var catIndices = satWeights.getCategorizedArray()[this.state.category];
    let collapsibleText = "[-]";
    let rows = [];
    if (this.state.isExpanded) {
      for (var i in catIndices) {
        var id = catIndices[i];
        let rowID = `row${id}`;
        let rowkey = `key${id}`;

        let cell = [];
        for (var idx = 0; idx < 3; idx++) {
          let cellID = `cell${id}-${idx}`;
          let inputId = cellID + "-input";
          if (idx > 0) {
            cell.push(
              <td width="25%" key={cellID} id={cellID}>
                <input
                  id={inputId}
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={this.toPercent(
                    satNameWeights[catIndices[i]][idx]
                  )}
                />
              </td>
            );
          } else {
            cell.push(
              <td width="50%" key={cellID} id={cellID}>
                {satNameWeights[catIndices[i]][idx]}
              </td>
            );
          }
        }
        rows.push(
          <tr id={rowID} key={rowkey}>
            {cell}
          </tr>
        );
      }
    } else {
      let cell = [];
      collapsibleText = "[+]";
      let avgWeights = 0;
      let avgMax = 0;
      for (var i in catIndices) {
        avgWeights = avgWeights + satNameWeights[catIndices[i]][1];
        avgMax = avgMax + satNameWeights[catIndices[i]][2];
      }
      avgWeights = avgWeights / catIndices.length;
      avgMax = avgMax / catIndices.length;

      let rowId = "row-category-" + this.state.categoryIdx;
      let cellId1 = "cell-category-" + this.state.categoryIdx + "-1";
      let cellId2 = "cell-category-" + this.state.categoryIdx + "-2";
      let cellId2input = "input-category-" + this.state.categoryIdx + "-1";
      let cellId2inputOld =
        "input-category-" + this.state.categoryIdx + "-1-old";
      let cellId3 = "cell-category-" + this.state.categoryIdx + "-3";
      let cellId3input = "input-category-" + this.state.categoryIdx + "-2";
      let cellId3inputOld =
        "input-category-" + this.state.categoryIdx + "-2-old";
      const { formatMessage } = IntlProvider.intl;
      let label =
        this.state.category +
        " (" +
        formatMessage({
          id: "saturationcategorysettings.average",
          defaultMessage: "Average"
        }) +
        "):";
      cell.push(
        <td id={cellId1} key={cellId1} width="50%">
          {label}
        </td>
      );
      cell.push(
        <td id={cellId2} key={cellId2} width="25%">
          <input
            id={cellId2input}
            type="number"
            min="0"
            max="100"
            defaultValue={this.toPercent(avgWeights)}
          />
          <input
            id={cellId2inputOld}
            type="hidden"
            value={this.toPercent(avgWeights)}
          />
        </td>
      );
      cell.push(
        <td id={cellId3} key={cellId3} width="25%">
          <input
            id={cellId3input}
            type="number"
            min="0"
            max="100"
            defaultValue={this.toPercent(avgMax)}
          />
          <input
            id={cellId3inputOld}
            type="hidden"
            value={this.toPercent(avgMax)}
          />
        </td>
      );
      rows.push(
        <tr id={rowId} key={rowId}>
          {cell}
        </tr>
      );
    }
    //add all old values as hidden fields
    for (var i in catIndices) {
      var id = catIndices[i];
      let rowID = `row${id}-old`;
      let rowkey = `key${id}-old`;

      let cell = [];
      for (var idx = 1; idx < 3; idx++) {
        let cellID = `cell${id}-${idx}`;
        let inputIdOld = cellID + "-input-old";
        cell.push(
          <td width="25%" key={cellID} id={cellID}>
            <input
              id={inputIdOld}
              type="hidden"
              value={this.toPercent(satNameWeights[catIndices[i]][idx])}
            />
          </td>
        );
      }
      rows.push(
        <tr id={rowID} key={rowkey}>
          {cell}
        </tr>
      );
    }

    let fullCollapsibleText = this.props.category + " " + collapsibleText;
    return (
      <div>
        <p
          onClick={() => this.toggleIsExpanded()}
          style={{ cursor: "pointer" }}
        >
          <b>{fullCollapsibleText}</b>
        </p>
        <table id="saturationOptionsTable" className="display" width="100%">
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}
