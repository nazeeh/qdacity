import React from 'react';
import IntlProvider from '../../../common/Localization/LocalizationProvider';
import styled from 'styled-components';

import DropDownButton from '../../../common/styles/DropDownButton.jsx';

const StyledZoomBtn = styled.div`
	display: inline-block;
`;

export default class ButtonZoomSelect extends React.Component {
	constructor(props) {
		super(props);

		this.zoomValue = this.getZoomValue(100);

		this.umlEditor = this.props.umlEditor;

		this.dropDownButtonRef = null;
	}

	buttonClicked(zoom) {
		this.umlEditor.getGraphView().zoomTo(zoom);
	}

	onZoom(percentage) {
		this.zoomValue = this.getZoomValue(percentage);

		this.dropDownButtonRef.setText(this.zoomValue);
	}

	getZoomValue(percentage) {
		const rounded = Math.round(percentage * 100) / 100;
		return rounded + '%';
	}

	render() {
		const _this = this;
		const { formatMessage } = IntlProvider.intl;

		const items = [];
		items.push({
			text: '10 %',
			onClick: _this.buttonClicked.bind(_this, 10)
		});
		items.push({
			text: '30 %',
			onClick: _this.buttonClicked.bind(_this, 30)
		});
		items.push({
			text: '50 %',
			onClick: _this.buttonClicked.bind(_this, 50)
		});
		items.push({
			text: '80 %',
			onClick: _this.buttonClicked.bind(_this, 80)
		});
		items.push({
			text: '100 %',
			onClick: _this.buttonClicked.bind(_this, 100)
		});
		items.push({
			text: '120 %',
			onClick: _this.buttonClicked.bind(_this, 120)
		});
		items.push({
			text: '150 %',
			onClick: _this.buttonClicked.bind(_this, 150)
		});
		const selectZoom = formatMessage({
			id: 'buttonzoomselect.select_zoom',
			defaultMessage: 'Select a zoom value.'
		});
		return (
			<StyledZoomBtn title={selectZoom}>
				<DropDownButton
					ref={r => {
						if (r) _this.dropDownButtonRef = r;
					}}
					initText={this.zoomValue}
					items={items}
					fixedWidth={'35px'}
				/>
			</StyledZoomBtn>
		);
	}
}
