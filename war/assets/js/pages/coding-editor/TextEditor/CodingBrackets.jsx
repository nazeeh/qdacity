import React from 'react';
import styled from 'styled-components';

// The top level <svg>
const StyledSvgContainer = styled.svg`
	width: 170px;
	height: 100%;
`;

// The path element of each bracket
const StyledPath = styled.path`
	stroke-width: 2px;
	fill: none;
	margin-left:90px;
	cursor: pointer;

	.hover>& {
		stroke: red !important;
	}
`;

// The label of each bracket
const StyledText = styled.text`
	text-anchor: end;
	user-select: none;
	cursor: pointer;

	.hover>& {
		fill: red !important;
	}
`;

/**
 * Stateless component to display the coding brackets aside the text editor
 */
export default class CodingBrackets extends React.Component {

	/**
	 * When hovering a <text> or <path> append `.hover` class to parent <svg>
	 * to trigger both siblings to display a hover state. Additionally the
	 * svg element is moved to the end of its parent to move it in the
	 * foreground
	 */
	handleBracketMouseOver(e) {
		const svgElement = e.target.parentNode;
		svgElement.parentNode.appendChild(svgElement);
		svgElement.classList.add('hover');
	}

	/**
	 * When moving away from a <text> or <path> the `.hover` class is removed
	 * from their parent to end the hovering display state
	 */
	handleBracketMouseOut(e) {
		e.target.parentNode.classList.remove('hover');
	}

	/**
	 * Recursive function to reposition labels that would otherwise overlap
	 */
	calculateLabelPosY(labelPosition, labelPositions) {
		const labelHeight = 7;

		for (let i = 0; i < labelPositions.length; i++) {
			const existingLabel = labelPositions[i];
			if (
				labelPosition - existingLabel < labelHeight &&
				labelPosition - existingLabel > 0
			) {
				return this.calculateLabelPosY(
					labelPosition + labelHeight,
					labelPositions
				);
			} else if (
				labelPosition - existingLabel > -labelHeight &&
				labelPosition - existingLabel < 0
			) {
				return this.calculateLabelPosY(
					labelPosition + labelHeight,
					labelPositions
				);
			}
		}

		return labelPosition + 4;
	}

	/**
	 * Calculate all bracket positions and call this.renderBracket() for each
	 */
	renderAllBrackets() {
		const bracketIntervals = [];
		const labelIntervals = [];
		const labelCorrections = {};

		return this.props.codingData.map(coding => {
			const {
				offsetTop: top,
				codingId,
			} = coding;
			const bottom = top + coding.height;
			labelCorrections[codingId] = 0;

			const offsetX = bracketIntervals.reduce((offsetX, interval) => {
				if (
					(top <= interval.bottom && top >= interval.top) ||
					(bottom <= interval.bottom && bottom >= interval.top) ||
					(top <= interval.top && bottom >= interval.bottom)
				) {
					labelCorrections[interval.codingId] += 7;
					return offsetX + 7;
				} else {
					return offsetX;
				}
			}, 0);

			bracketIntervals.push({
				codingId,
				top,
				bottom,
			});

			const labelPosY = this.calculateLabelPosY(
				top + (bottom - top) / 2,
				labelIntervals
			);

			labelIntervals.push(labelPosY);

			return {
				codingId,
				label: coding.name,
				color: coding.color,
				y0: top,
				y1: bottom,
				offsetX,
				labelY: labelPosY
			};
		}).map(bracket => {
			bracket.labelCorrections = labelCorrections[bracket.codingId];
			return bracket;
		}).map(bracket => this.renderBracket(bracket));
	}

	/**
	 * Renders a single bracket <svg> with their <path> and <text>
	 */
	renderBracket(bracket) {
		const {
			codingId,
			label,
			color,
			y0,
			y1,
			offsetX,
			labelCorrections,
			labelY,
		} = bracket;
		const x1 = 150;
		const x0 = x1 - offsetX - 8;
		const labelX = x0 - labelCorrections - 8;

		// Calculate d attribute for <path>
		// M x1,y0 : move to upper right corner
		// L x0,y0 : line to upper left corner
		// L x0,y1 : line to lower left corner
		// L x1,y1 : line to lower right corner
		const path = `M${x1},${y0}L${x0},${y0}L${x0},${y1}L${x1},${y1}`;

		return (
			<svg>
				<StyledPath
					d={path}
					stroke={color}
					onClick={() => this.props.onBracketClick(codingId, false)}
					onMouseOver={this.handleBracketMouseOver}
					onMouseOut={this.handleBracketMouseOut}
				/>
				<StyledText
					x={labelX}
					y={labelY}
					fill={color}
					onClick={() => this.props.onBracketClick(codingId, false)}
					onMouseOver={this.handleBracketMouseOver}
					onMouseOut={this.handleBracketMouseOut}
				>
					{label}
				</StyledText>
			</svg>
		);
	}

	render() {
		return (
			<StyledSvgContainer>
				{this.renderAllBrackets()}
			</StyledSvgContainer>
		);
	}
}
