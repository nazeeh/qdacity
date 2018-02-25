import React from 'react';
import styled from 'styled-components';

const StyledCenteredContainer = styled.div`
	display: flex;
	justify-content: center;
`;

const StyledLoagingAnimation = styled.div`
	height: ${props => (props.size ? props.size : 64)}px;
	width: ${props => (props.size ? props.size : 64)}px;
	fill: ${props => (props.color ? props.color : '#fff')};
`;

/**
 * Loading SVG Animation component.
 * 
 * default size is 64x64
 * can be changed with prop size

 * default color is white
 * can be changed with prop color
 */
export default class ReactLoading extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false
		};
	}

	show() {
		this.setState({
			show: true
		});
	}

	render() {
		if (true) {
			return (
				<StyledCenteredContainer>
					<StyledLoagingAnimation
						color={this.props.color}
						size={this.props.size}
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
							<path transform="translate(2)" d="M0 12 V20 H4 V12z">
								<animate
									attributeName="d"
									values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
									dur="1.2s"
									repeatCount="indefinite"
									begin="0"
									keyTimes="0;.2;.5;1"
									keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
									calcMode="spline"
								/>
							</path>
							<path transform="translate(8)" d="M0 12 V20 H4 V12z">
								<animate
									attributeName="d"
									values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
									dur="1.2s"
									repeatCount="indefinite"
									begin="0.2"
									keyTimes="0;.2;.5;1"
									keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
									calcMode="spline"
								/>
							</path>
							<path transform="translate(14)" d="M0 12 V20 H4 V12z">
								<animate
									attributeName="d"
									values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
									dur="1.2s"
									repeatCount="indefinite"
									begin="0.4"
									keyTimes="0;.2;.5;1"
									keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
									calcMode="spline"
								/>
							</path>
							<path transform="translate(20)" d="M0 12 V20 H4 V12z">
								<animate
									attributeName="d"
									values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
									dur="1.2s"
									repeatCount="indefinite"
									begin="0.6"
									keyTimes="0;.2;.5;1"
									keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
									calcMode="spline"
								/>
							</path>
							<path transform="translate(26)" d="M0 12 V20 H4 V12z">
								<animate
									attributeName="d"
									values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
									dur="1.2s"
									repeatCount="indefinite"
									begin="0.8"
									keyTimes="0;.2;.5;1"
									keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
									calcMode="spline"
								/>
							</path>
						</svg>
					</StyledLoagingAnimation>
				</StyledCenteredContainer>
			);
		} else {
			return null;
		}
	}
}
