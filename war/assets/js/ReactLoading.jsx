import React from 'react';
import Loading from 'react-loading';

export default class ReactLoading extends React.Component  {
  
	
  constructor(props) {
  	super(props);
  	this.state = {show: false};
  	if (typeof this.props.color != 'undefined') this.color = this.props.color;
  	else this.color = '#e3e3e3';
  }

	show(){
		this.setState({show: true});
	}
	
  render() {

    	//if(this.state.show) {
    	if(true){
           return <Loading type='bars' color={this.color} />;
        } else {
            return null;
        }
      

  }
  
}  