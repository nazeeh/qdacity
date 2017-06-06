import React from 'react';

export default class UnmappedCodeElement extends React.Component {

	constructor(props) {
		super(props);

		this.umlEditorView = this.props.umlEditorView;
		this.code = this.props.code;

		this.state = {
			active: false
		};
	}

	toggleActive() {
		this.setActive(!this.state.active);
	}

	setActive(isActive) {
		this.setState({
			active: isActive
		});

		if (isActive) {
			this.umlEditorView.addUnmappedCode(this.code);
		} else {
			this.umlEditorView.removeUnmappedCode(this.code);
		}
	}

	getStyle() {
		return {
			item: {
				width: '250px'
			},
			text: {
				height: '30px',
				lineHeight: '30px',
				display: 'inline-block'
			},
			button: {
				marginLeft: '10px',
				right: '15px',
				position: 'absolute'
			}
		};
	}

	render() {
		const _this = this;

		const style = this.getStyle();

		const buttonClass = 'pull-right btn btn-sm ' + (this.state.active ? 'btn-primary' : 'btn-default');
		const iconClass = 'fa ' + (this.state.active ? 'fa-eye' : 'fa-eye-slash');

		return (
			<li style={style.item} className="list-group-item">
                
		        <div style={style.text}>{_this.code.name}</div>

                <button style={style.button} type="button" className={buttonClass} onClick={_this.toggleActive.bind(_this)}><i className={iconClass}></i></button>
            </li>
		);
	}
}