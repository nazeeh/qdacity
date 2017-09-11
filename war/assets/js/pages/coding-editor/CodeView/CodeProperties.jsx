import React from 'react'
import styled from 'styled-components';

import {
	BtnDefault
} from '../../../common/styles/Btn.jsx';

import 'script-loader!../../../../../components/jQuery-UI/jquery-ui.min.js';
import 'script-loader!../../../../../components/colorpicker/evol.colorpicker.js';



const StyledColorPicker = styled.input `
    width: 80px;
`;

const StyledSaveBtn = styled.div `
	grid-column-start: 1;
	grid-column-end: 2;
	grid-row-start: 4;
	grid-row-end: 4;
	text-align: center;
`;

const StyledPropertyPanel = styled.div `
    padding: 8px 0px 0px 8px;
	display: grid;
	grid-template-columns: 70px 200px;
  	grid-template-rows: 30px 30px 30px auto;
	grid-row-gap: 5px;
`;


export default class CodeProperties extends React.Component {
	constructor(props) {
		super(props);
		this.changeName = this.changeName.bind(this);
		this.changeAuthor = this.changeAuthor.bind(this);
	}


	changeName(event) {
		this.props.code.name = event.target.value;
		this.forceUpdate();
	}

	changeAuthor(event) {
		this.props.code.author = event.target.value;
		this.forceUpdate();
	}

	changeColor(color) {
		this.props.code.color = color;
		this.forceUpdate();
	}

	componentDidMount() {
		var _this = this;
		$("#codePropColor").colorpicker({
			color: this.props.code.color
		});

		$("#codePropColor").on("change.color", function (event, color) {

			var value = $("#codePropColor").colorpicker("val");
			if (_this.props.code.color != value) _this.changeColor(value);
		});
	}

	componentDidUpdate() {
		$("#codePropColor").colorpicker("val", this.props.code.color);
	}

	render() {
		return (
			<div>
					<StyledPropertyPanel>
						<span>Name: </span>
						<input type="text" value={this.props.code.name} onChange={this.changeName}/>

						<span>Author: </span>
						<input type="text" value={this.props.code.author} onChange={this.changeAuthor}/>

						<span>Color: </span>
						<div className="evo-cp-wrap">
							<StyledColorPicker id="codePropColor" type="text" className="colorPicker evo-cp0"/>
						</div>
					</StyledPropertyPanel>
				<StyledSaveBtn>
				<BtnDefault onClick={() => this.props.updateSelectedCode(this.props.code, true)}>
						<i className="fa fa-floppy-o "></i>
						<span>Save</span>
				</BtnDefault>
				</StyledSaveBtn>
			</div>
		);
	}
}