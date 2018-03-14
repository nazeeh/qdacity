import React from 'react';
import styled from 'styled-components';

import { PageView } from '../View/PageView.js';

const StyledContainer = styled.div`
	border-left: 1px solid #888;
	height: 100%;
`;

export default class CodeQueries extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedCode: null
		}
	}

	codesystemSelectionChanged(code) {
		this.setState({
			selectedCode: code
		});
	}

	getCodeSystemArray() {
		let codes = [];

		let createSimpleArray = code => {
			codes.push(code);

			if (code.children) {
				code.children.forEach(createSimpleArray);
			}
		};

		this.props.getCodeSystem().forEach(createSimpleArray);

		return codes;
	}

	calculateOverlap(otherCode) {
		let overlaps = 0;

		let documents = this.props.getDocuments();

		if (documents) {
			for (let i = 0; i < documents.length; i++) {
				let document = documents[i];

				console.log(document.title);
			}
		}

		return overlaps;
	}

	render() {
		const _this = this;

		// Render only if the page is code_queries
		if (this.props.selectedEditor != PageView.CODE_QUERIES) {
			return null;
		}

		// Dont render if the code is empty
		if (this.state.selectedCode == null) {
			return null;
		}

		return (
			<StyledContainer>
				<div>Selected Code: {this.state.selectedCode.name}</div>

				<table>
					<thead>
						<th>Code</th>
						<th>Overlaps</th>
					</thead>
					<tbody>
						{
							this.getCodeSystemArray().map((code) => {
								return (
									<tr>
										<td>{code.name}</td>
										<td>{_this.calculateOverlap(code)}</td>
									</tr>
								);
							})
						}
					</tbody>
				</table>
			</StyledContainer>
		);
	}
}
