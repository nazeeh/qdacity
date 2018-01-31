import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

import { BtnDefault } from '../../../common/styles/Btn.jsx';

const StyledCodeviewComponent = styled.div`
	padding: 8px 8px 0px 8px;
`;

const StyledMemoField = styled.textarea`
	height: 200px;
	width: 100%;
	background-color: #fff;
	resize: none;
`;

const StyledSaveBtn = styled.div`
	text-align: center;
`;

export default class ClassName extends React.Component {
	constructor(props) {
		super(props);
		this.changeMemo = this.changeMemo.bind(this);
	}

	changeMemo(event) {
		this.props.code.memo = event.target.value;
		this.forceUpdate();
	}

	render() {
		const memo = this.props.code.memo;
		return (
			<StyledCodeviewComponent>
				<StyledMemoField value={memo ? memo : ''} onChange={this.changeMemo} />
				<StyledSaveBtn>
					<BtnDefault
						onClick={() => this.props.updateSelectedCode(this.props.code, true)}
					>
						<i className="fa fa-floppy-o " />
						<span>
							<FormattedMessage id="classname.save" defaultMessage="Save" />
						</span>
					</BtnDefault>
				</StyledSaveBtn>
			</StyledCodeviewComponent>
		);
	}
}
