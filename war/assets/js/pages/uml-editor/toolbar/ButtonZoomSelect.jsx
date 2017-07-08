import React from 'react';

export default class ButtonZoomSelect extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditor = this.props.umlEditor;
	}

	buttonClicked(zoom) {
	    this.umlEditor.getUmlGraphView().zoom(zoom);
	}

	getStyles() {
		return {
			button: {
				marginLeft: '10px',
				display: 'inline-block'
			},
			image: {
				marginRight: '8px',
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
			<div className='dropdown' style={styles.button}>
                <button className='btn btn-default dropdown-toggle' type='button' data-toggle='dropdown'>
                    <i style={styles.image} className='fa fa-search'></i>
                    <span className='caret'></span>
                </button>
                <ul style={styles.dropDown} className='dropdown-menu'>
                    <li><a onClick={_this.buttonClicked.bind(_this, 10)} href='#'>10 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 25)} href='#'>25 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 33)} href='#'>33 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 50)} href='#'>50 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 66)} href='#'>66 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 75)} href='#'>75 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 100)} href='#'><b>100 %</b></a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 125)} href='#'>125 %</a></li>
                    <li><a onClick={_this.buttonClicked.bind(_this, 150)} href='#'>150 %</a></li>
                </ul>
            </div>
		);
	}

}