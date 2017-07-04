import React from 'react'
import styled from 'styled-components';

import 'script!../../../../../components/colorpicker/evol.colorpicker.js';

const StyledColorPicker = styled.input `
    width: 80px;
`;

const StyledSaveBtn = styled.div `
    width: 8em;
	text-align: center;
	margin: 0 auto;
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
			<div className="active-content-div">
					<table>
						<tbody>
						<tr>
							<td><span>Name: </span></td>
							<td><input id="codePropName" type="text" value={this.props.code.name} onChange={this.changeName}/></td>
						</tr>
						<tr>
							<td><span>Author: </span></td>
							<td><input id="codePropAuthor" type="text" value={this.props.code.author} onChange={this.changeAuthor}/></td>
						</tr>
						<tr>
							<td><span>Color: </span></td>
							<td>
								<div className="evo-cp-wrap">
									<StyledColorPicker id="codePropColor" type="text" className="colorPicker evo-cp0"/>

								</div>
							</td>
						</tr>
					</tbody>
				</table>

				<StyledSaveBtn onClick={() => this.props.updateSelectedCode(this.props.code, true)}>
					<a id="btnCodeSave" className="btn btn-default btn-default">
						<i className="fa fa-floppy-o "></i>
						Save
					</a>
				</StyledSaveBtn>
			</div>
		);
	}
}