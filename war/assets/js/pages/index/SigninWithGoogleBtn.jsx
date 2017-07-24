import React from 'react'
import styled from 'styled-components';

import ReactLoading from '../../common/ReactLoading.jsx';



const StyledBtnText = styled.span `
    font-size: 18px;
`;

const StyledBtnLabel = styled.span `
	color: rgba(0, 0, 0, 1.0);
`;

const StyledSigninBtn = styled.a `
    background-color: rgba(255, 255, 255, 0.4);
	border-width: 1px;
	border-color: #fff;
	&:hover {
        background-color: rgba(255, 255, 255, 1.0);
		border-color: #fff;
    }
`;

export default class SigninWithGoogleBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false
		};
	}

	signIn(){
		this.setState({
			loading: true
		});
		this.props.signIn()
	}


	render() {
		if (this.state.loading) return <ReactLoading />;
		return (
			<StyledSigninBtn id="signinGoogleBtn" className="btn btn-default" href="#" onClick={() => this.signIn()}>
				<StyledBtnLabel>
					<i className="fa fa-google fa-2x pull-left"></i>
					<StyledBtnText>Sign in with Google</StyledBtnText>
				</StyledBtnLabel>
			</StyledSigninBtn>
		);
	}
}