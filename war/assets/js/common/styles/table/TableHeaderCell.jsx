import React from 'react';
import styled from 'styled-components';

import { SortMode } from './SortMode.js';

const StyledHeaderCell = styled.th`
	padding: 8px 0px;
	font-weight: normal;
	color: ${props => props.isSortColumn ? props.theme.fgPrimary : ''};
	background-color: ${props => props.isSortColumn ? '#F0F6FF' : ''};
	user-select: none;

	&:hover {
		cursor: ${props => (props.sortable ? 'pointer' : '')};
		background-color: ${props => (props.sortable && !props.isSortColumn ? '#F0F6FF' : '')};
	}
`;

const StyledHeaderCellContentContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

const StyledHeaderCellSeparator = styled.div`
	align-self: auto;
	flex-grow: 0;
	width: ${props => !props.firstColumn ? '1px' : '0px'};
	margin-right: 13px;
	margin-top: 7px;
	margin-bottom: 7px;
	background-color: ${props => props.theme.borderDefault};
`;

const StyledHeaderCellContent = styled.div`
	align-self: center;
	flex-grow: 1;
`;

const StyledHeaderCellSort = styled.div`
	align-self: center;
	flex-grow: 0;
`;

const StyledHeaderCellSortArrowContainer = styled.div`
	font-size: 9px !important;
	margin-top: 5px;
	margin-right: 5px;
	margin-bottom: 5px;
	margin-left: 2px;
`;

const StyledHeaderCellSortArrow = styled.i`
	color: ${props => 
		(props.show && props.highlight ? props.theme.fgPrimary : 
		(props.show && !props.highlight ? '#cdcdcd' : 'transparent'))} !important;
`;

/**
 * Available props:
 * - column
 * - columnIndex
 * - sortable
 * - isSortColumn
 * - sortMode
 * - headerCellSelected: function
 * - renderHeaderCellContent: function
 */
export default class TableHeaderCell extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<StyledHeaderCell 
				sortable={this.props.sortable}
				isSortColumn={this.props.isSortColumn}
				onClick={() => this.props.headerCellSelected(this.props.column, this.props.columnIndex)}
			>
				<StyledHeaderCellContentContainer>
					{this.renderSeparator()}
					{this.renderContent()}
					{this.renderSort()}
				</StyledHeaderCellContentContainer>
			</StyledHeaderCell>
		);
	}

	renderSeparator() {
		return (
			<StyledHeaderCellSeparator firstColumn={this.props.columnIndex == 0}/>
		);
	}

	renderContent() {
		const content = this.props.renderHeaderCellContent ? this.props.renderHeaderCellContent(this.props.column, this.props.columnIndex) : '';

		return (
			<StyledHeaderCellContent>
				{content}
			</StyledHeaderCellContent>
		);
	}

	renderSort() {
		if (!this.props.sortable) {
			return '';
		}

		const highlightArrowUp = this.props.sortMode == SortMode.ASCENDING;
		const highlightArrowDown = this.props.sortMode == SortMode.DESCENDING;

		return (
			<StyledHeaderCellSort>
				<StyledHeaderCellSortArrowContainer className="fa-stack fa-lg">
					<StyledHeaderCellSortArrow show={this.props.isSortColumn} highlight={highlightArrowUp} className="fa fa-sort-up fa-stack-2x" />
					<StyledHeaderCellSortArrow show={this.props.isSortColumn} highlight={highlightArrowDown} className="fa fa-sort-down fa-stack-2x" />
				</StyledHeaderCellSortArrowContainer>
			</StyledHeaderCellSort>
		);
	}
}