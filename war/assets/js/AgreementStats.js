//import 'slick-carousel';
import 'script!slick-carousel';
export default class Timeline {
  constructor(rootElemID) {
	  this.drawReport = this.drawReport.bind(this); 
	  this.rootElement = document.getElementById(rootElemID);
	  $(this.rootElement).empty();
	  
	  $(this.rootElement).append( '<div id="documentResultCharts"></div>');
	  this.documentResults = $("#documentResultCharts");
//	  $(this.rootElement).slick();
	  
	  google.charts.load('current', {packages: ['corechart', 'bar']});

    
    
    //this.drawBasic();
  }
  
  addReports(reports){
	  var _this = this;
	  google.charts.setOnLoadCallback(function() {
		  reports.forEach(function(report) {
				  if (typeof report.documentResults != 'undefined'){
				    	//Create node for report
				    	var div = document.createElement("div"); 
				    	_this.documentResults.append(div);
				    	
				    	// Add chart
				    	_this.drawReport(report, div);
				    	
				    	// Prepend title
				    	var title = document.createElement("h4"); 
				    	title.innerHTML = "<b>"+report.name+"</b>"; 
				    	div.insertBefore(title, div.firstChild);
				  }

		    });
	  	_this.documentResults.slick({dots: true});
		});
	  
	 
	  
  }
  
  getHTML(){
	  return this.html;
  }

  drawReport(report, element) {
	  
	  
	  

      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Document');
      data.addColumn('number', 'F-Measure');
      data.addColumn('number', 'Recall');
      data.addColumn('number', 'Precision');

      report.documentResults.forEach(function(docResult) {
    	  data.addRow([docResult.documentName, docResult.paragraphAgreement.fMeasure, docResult.paragraphAgreement.recall, docResult.paragraphAgreement.precision]);
    	  
		});
 

      var options = {
        title: 'Agreement by Document',
        colors: [ '#00a65a', '#5f5f5f','#797979', '#929292','#337ab7'],
        hAxis: {
          title: 'Documents',
          format: 'h:mm a',
          
        },
        vAxis: {
          title: 'Agreement',
        	  viewWindow: {
                  min: 0,
                  max: 1
                }
        },
        chartArea: { left: '8%', top: '8%', width: "70%", height: "70%" }
      };
      

      var chart = new google.visualization.ColumnChart(element);
      
      

      chart.draw(data, options);
      
      
    }
   
   addToDom(selector){
	   $(selector).append(this.html);
	   
	   
   }
}

 