import React from 'react';
import styled from 'styled-components';

export default class ButtonZoomSelect extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			zoomValue: this.getZoomValue(100)
		}

		this.umlEditor = this.props.umlEditor;
	}

	buttonClicked(zoom) {
		this.umlEditor.getUmlGraphView().zoomTo(zoom);
	}

	onZoom(percentage) {
		this.setState({
			zoomValue: this.getZoomValue(percentage)
		});
	}

	getZoomValue(percentage) {
		const rounded = Math.round(percentage * 100) / 100;
		return (rounded) + '%';
	}

	getStyles() {
		return {
			container: {
				marginLeft: '10px',
				display: 'inline-block',
				width: '75px'
			},
			button: {
				width: '75px'
			},
			caret: {
				marginLeft: '5px',
			},
			dropDown: {
				minWidth: '90px'
			}
		};
	}

	render() {
		const _this = this;

		const styles = this.getStyles();

		return (
			<div className='dropdown' style={styles.container}>
                <button className='btn btn-default dropdown-toggle' style={styles.button} type='button' data-toggle='dropdown'>
		            {this.state.zoomValue}
                    <span className='caret' style={styles.caret}></span>
                </button>
                <ul style={styles.dropDown} className='dropdown-menu'>
                    <li><a onClick={_this.buttonClicked.bind(_this, 10)} href='#'>10 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 25)} href='#'>25 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 33)} href='#'>33 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 50)} href='#'>50 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 66)} href='#'>66 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 75)} href='#'>75 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 100)} href='#'>100 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 125)} href='#'>125 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 150)} href='#'>150 %</a></li>
                </ul>
            </div>
		);
	}

}