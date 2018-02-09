import React from "react";
import styled from "styled-components";
import "./styles.css";

import DropDownButton from "../../common/styles/DropDownButton.jsx";
import { BtnDefault } from "../../common/styles/Btn.jsx";
import StyledInput from "../../common/styles/Input.jsx";

//import IntlProvider from '../../common/Localization/LocalizationProvider';
import { FormattedMessage } from "react-intl";

const SELECTION = {
  WEEK: "Week",
  MONTH: "Month",
  QUARTER: "Quarter",
  YEAR: "Year",
  CUSTOM: "Custom"
};

const DEFAULT_SELECTION = SELECTION.MONTH;

export default class UserRegistrationsChart extends React.Component {
  constructor(props) {
    super(props);

    const dateMaxDefault = new Date();
    const dateMinDefault = new Date();
    dateMinDefault.setMonth(dateMinDefault.getMonth() - 1);

    this.state = {
      selection: DEFAULT_SELECTION,
      customDateMin: dateMinDefault,
      customDateMax: dateMaxDefault
    };

    //Send once initially to apply default settings
    this.sendEvent();
  }

  setTimeFrame(selection) {
    this.setState(
      {
        selection: selection
      },
      () => {
        if (selection !== SELECTION.CUSTOM) {
          this.sendEvent();
        }
      }
    );
  }

  setCustomDateMin(value) {
    this.setState({
      customDateMin: value
    });
  }

  setCustomDateMax(value) {
    this.setState({
      customDateMax: value
    });
  }

  sendEvent() {
    this.props.onChangeTimeFrame(this.getDateStart(), this.getDateEnd());
  }

  getDateStart() {
    let dateStart;
    switch (this.state.selection) {
      case SELECTION.WEEK:
        dateStart = new Date();
        dateStart.setDate(dateStart.getDate() - 7);

        break;
      case SELECTION.MONTH:
        dateStart = new Date();
        dateStart.setMonth(dateStart.getMonth() - 1);

        break;
      case SELECTION.QUARTER:
        dateStart = new Date();
        dateStart.setMonth(dateStart.getMonth() - 3);

        break;
      case SELECTION.YEAR:
        dateStart = new Date();
        dateStart.setFullYear(dateStart.getFullYear() - 1);

        break;
      case SELECTION.CUSTOM:
        dateStart = this.state.customDateMin;

        break;
    }
    dateStart.setHours(0, 0, 0, 0);
    return dateStart;
  }

  getDateEnd() {
    let dateEnd;
    switch (this.state.selection) {
      case SELECTION.CUSTOM:
        dateEnd = this.state.customDateMax;

        break;
      default:
        dateEnd = new Date();

        break;
    }
    dateEnd.setHours(23, 59, 59);
    return dateEnd;
  }

  static toDateString(date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();

    return (
      year +
      "-" +
      (month[1] ? month : "0" + month[0]) +
      "-" +
      (day[1] ? day : "0" + day[0])
    );
  }

  render() {
    const items = [
      {
        text: SELECTION.WEEK,
        onClick: () => this.setTimeFrame(SELECTION.WEEK)
      },
      {
        text: SELECTION.MONTH,
        onClick: () => this.setTimeFrame(SELECTION.MONTH)
      },
      {
        text: SELECTION.QUARTER,
        onClick: () => this.setTimeFrame(SELECTION.QUARTER)
      },
      {
        text: SELECTION.YEAR,
        onClick: () => this.setTimeFrame(SELECTION.YEAR)
      },
      {
        text: SELECTION.CUSTOM,
        onClick: () => this.setTimeFrame(SELECTION.CUSTOM)
      }
    ];

    const CenteringDiv = styled.div`
      display: flex;
    `;

    const CustomStyledInput = StyledInput.extend`
      margin-left: 10px;
      ::-webkit-inner-spin-button {
        -webkit-appearance: none;
        display: none;
      }
    `;

    const StyledApplyButton = BtnDefault.extend`
      margin-left: 10px;
      vertical-align: top;
    `;

    return (
      <CenteringDiv>
        <DropDownButton
          initText={this.state.selection}
          items={items}
          fixedWidth={"150px"}
        />
        {this.state.selection === SELECTION.CUSTOM && (
          <div>
            <CustomStyledInput
              type={"date"}
              required={"required"}
              value={UserRegistrationsChart.toDateString(
                this.state.customDateMin
              )}
              onChange={event =>
                this.setCustomDateMin(new Date(event.target.value))
              }
              max={UserRegistrationsChart.toDateString(
                this.state.customDateMax
              )}
            />

            <CustomStyledInput
              type={"date"}
              required={"required"}
              value={UserRegistrationsChart.toDateString(
                this.state.customDateMax
              )}
              onChange={event =>
                this.setCustomDateMax(new Date(event.target.value))
              }
              min={UserRegistrationsChart.toDateString(
                this.state.customDateMin
              )}
              max={UserRegistrationsChart.toDateString(new Date())}
            />

            <StyledApplyButton onClick={() => this.sendEvent()}>
              <FormattedMessage id="modal.apply" defaultMessage="Apply" />
            </StyledApplyButton>
          </div>
        )}
      </CenteringDiv>
    );
  }
}
