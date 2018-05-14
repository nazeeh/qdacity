import React from 'react';
import styled from 'styled-components';

const StyledExpander = styled.div`
	overflow: hidden;
`;

const StyledWrapper = styled.div`
	overflow: hidden;
	height: ${props =>
		props.mode == Mode.COLLAPSING
			? props.height + 'px'
			: props.mode == Mode.COLLAPSED
				? '0px'
				: props.mode == Mode.EXPANDING
					? props.height + 'px'
					: props.mode == Mode.EXPANDED ? 'auto' : ''};
`;

const StyledContent = styled.div``;

const Mode = {
	COLLAPSING: 1,
	COLLAPSED: 2,
	EXPANDING: 3,
	EXPANDED: 4
};

/**
 * Available props:
 * - defaultExpanded: specifies if the content should be collapsed or expanded by default
 * - duration: specifies how much time the animation lasts
 * - onCollapse: function which is called when the Collapsible finishs the collapse animation
 * - onExpand: function which is called when the Collapsible finishs the expand animation
 */
class Collapsible extends React.Component {
	constructor(props) {
		super(props);

		this.duration = this.props.duration ? this.props.duration : 300;

		this.interval = 30;
		this.intervalOffset = 0;

		this.contentRef = null;

		this.timerId = 0;
		this.contentHeight = 0;

		this.state = {
			mode:
				this.props.defaultCollapsed === true ? Mode.EXPANDED : Mode.COLLAPSED,
			height: 0
		};

		this.timerCallback = this.timerCallback.bind(this);
	}

	componentWillUnmount() {
		this.endTimer();
	}

	toggle() {
		if (this.state.mode == Mode.COLLAPSED) {
			this.expand();
		} else if (this.state.mode == Mode.EXPANDED) {
			this.collapse();
		} else {
			// Do nothings
		}
	}

	collapse() {
		if (this.state.mode != Mode.EXPANDED) {
			// Do nothing
			return;
		}

		this.setState(
			{
				mode: Mode.COLLAPSING
			},
			() => {
				this.startTimer();
			}
		);
	}

	expand() {
		if (this.state.mode != Mode.COLLAPSED) {
			// Do nothing
			return;
		}

		this.setState(
			{
				mode: Mode.EXPANDING
			},
			() => {
				this.startTimer();
			}
		);
	}

	startTimer() {
		this.contentHeight = this.contentRef.offsetHeight;
		this.intervalOffset = this.contentHeight / (this.duration / this.interval);

		this.timerId = setInterval(this.timerCallback, this.interval);
	}

	endTimer() {
		clearInterval(this.timerId);
	}

	timerCallback() {
		// Collapsing
		if (this.state.mode == Mode.COLLAPSING) {
			if (
				this.contentHeight != 0 &&
				this.intervalOffset != 0.0 &&
				this.state.height - this.intervalOffset > 0
			) {
				this.setState({
					height: this.state.height - this.intervalOffset
				});
			} else {
				this.setState({
					mode: Mode.COLLAPSED,
					height: 0
				});

				this.endTimer();

				if (this.props.onCollapse) {
					this.props.onCollapse();
				}
			}
		} else if (this.state.mode == Mode.EXPANDING) {
			// Expanding
			if (
				this.contentHeight != 0 &&
				this.intervalOffset != 0.0 &&
				this.state.height + this.intervalOffset <= this.contentHeight
			) {
				this.setState({
					height: this.state.height + this.intervalOffset
				});
			} else {
				this.setState({
					mode: Mode.EXPANDED,
					height: this.contentHeight
				});

				this.endTimer();

				if (this.props.onExpand) {
					this.props.onExpand();
				}
			}
		} else {
			// Invalid state
			throw new Error('Invalid state in timer interval: ' + this.state.mode);
		}
	}

	render() {
		return (
			<StyledWrapper mode={this.state.mode} height={this.state.height}>
				<StyledContent
					innerRef={r => {
						if (r) this.contentRef = r;
					}}
				>
					{this.props.children}
				</StyledContent>
			</StyledWrapper>
		);
	}
}

export { Collapsible, Mode };
