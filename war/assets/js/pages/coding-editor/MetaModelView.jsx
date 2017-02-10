import 'script!../../../../components/Easytabs/jquery.easytabs.js';
import Select from 'react-select';

export default class MetaModelView extends React.Component{
	constructor(props) {
	    super(props);
	    this.state = {elements: [{value:1,label:"one"},{value:2,label:"two"}], selected: 2};

	  }  
	  
	  setActiveElement(value){
	  	this.state.selected = value;
	  }
	  
	isActive(value){
    	return ((value==this.state.selected) ?'selected="selected"':'');
  	}

	  
	  render() {
	   var _this = this; 
      return (
      <div className="list-group">
	      <select>
	        {
	          this.state.elements.map(function(mmElement) {
	          	var attributes ={
	          		value:mmElement.value,
	          		onClick:_this.setActiveElement.bind(null,mmElement.value)
	          	}
	          	if (mmElement.value==_this.state.selected) attributes.selected = "selected";
	          	
	            return <option {...attributes} >{mmElement.label}</option>
	          })
	        }
	        </select>
      </div>
    );
   }

}