import React from 'react';
import ProjectEndpoint from '../../common/endpoints/ProjectEndpoint';


export default class ProjectStats extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			docCount: "N/A",
			codeCount: "N/A",
			codingCount: "N/A",
                        saturation: "N/A"
		};

		this.init();
	}

	init() {
		var _this = this;
		ProjectEndpoint.getProjectStats(this.props.project.getId(), this.props.project.getType()).then(function (resp) {
			_this.setState({
				docCount: resp.documentCount,
				codeCount: resp.codeCount,
				codingCount: resp.codingCount,
                                saturation: resp.saturation
			});
		});
	}
        
        calculateAvgSaturation() {
            var sr = this.state.saturation;
            var pr = sr.saturationParameters;
            if(pr != undefined) {
                //weights are set beween 0 and 1 and are > 1 in total. 
                // we need to normalize them when calculating the weighted average
                var sumParameters = pr.appliedCodesChangeWeight
                                    + pr.deleteCodeRelationShipChangeWeight
                                    + pr.deleteCodeChangeWeight
                                    + pr.insertDocumentChangeWeight
                                    + pr.insertCodeRelationShipChangeWeight
                                    + pr.insertCodeChangeWeight
                                    + pr.relocateCodeChangeWeight
                                    + pr.updateCodeAuthorChangeWeight
                                    + pr.updateCodeBookEntryDefinitionChangeWeight
                                    + pr.updateCodeBookEntryExampleChangeWeight
                                    + pr.updateCodeBookEntryShortDefinitionChangeWeight
                                    + pr.updateCodeBookEntryWhenNotToUseChangeWeight
                                    + pr.updateCodeBookEntryWhenToUseChangeWeight
                                    + pr.updateCodeColorChangeWeight
                                    + pr.updateCodeIdChangeWeight
                                    + pr.updateCodeMemoChangeWeight
                                    + pr.updateCodeNameChangeWeight;
                var weightedAvg = sr.applyCodeSaturation * ( pr.appliedCodesChangeWeight / sumParameters )
                            + sr.deleteCodeRelationShipSaturation * ( pr.deleteCodeRelationShipChangeWeight / sumParameters )
                            + sr.deleteCodeSaturation * ( pr.deleteCodeChangeWeight / sumParameters )
                            + sr.documentSaturation * ( pr.insertDocumentChangeWeight / sumParameters )
                            + sr.insertCodeRelationShipSaturation * ( pr.insertCodeRelationShipChangeWeight / sumParameters )
                            + sr.insertCodeSaturation * ( pr.insertCodeChangeWeight / sumParameters )
                            + sr.relocateCodeSaturation * ( pr.relocateCodeChangeWeight / sumParameters )
                            + sr.updateCodeAuthorSaturation * ( pr.updateCodeAuthorChangeWeight / sumParameters )
                            + sr.updateCodeBookEntryDefinitionSaturation * ( pr.updateCodeBookEntryDefinitionChangeWeight / sumParameters )
                            + sr.updateCodeBookEntryExampleSaturation * ( pr.updateCodeBookEntryExampleChangeWeight / sumParameters )
                            + sr.updateCodeBookEntryShortDefinitionSaturation * ( pr.updateCodeBookEntryShortDefinitionChangeWeight / sumParameters )
                            + sr.updateCodeBookEntryWhenNotToUseSaturation * ( pr.updateCodeBookEntryWhenNotToUseChangeWeight / sumParameters )
                            + sr.updateCodeBookEntryWhenToUseSaturation * ( pr.updateCodeBookEntryWhenToUseChangeWeight / sumParameters )
                            + sr.updateCodeColorSaturation * ( pr.updateCodeColorChangeWeight / sumParameters )
                            + sr.updateCodeIdSaturation * ( pr.updateCodeIdChangeWeight / sumParameters )
                            + sr.updateCodeMemoSaturation * ( pr.updateCodeMemoChangeWeight / sumParameters )
                            + sr.updateCodeNameSaturation * ( pr.updateCodeNameChangeWeight / sumParameters);
                return (weightedAvg*100).toFixed(2)+"%";
          } else {
              return "N/A";
          }
        }

	render() {
		var _this = this;

		return (
			<div className="box box-default">
				<div className="box-header with-border">
				<h3 className="box-title">Project Stats</h3>
				</div>
				<div className="box-body">
				<div className="row" >
					<div className="col-lg-3 col-xs-6 small-gutter-right">
						<div className="info-box">
							<div className="info-box-icon bg-aqua">
							<i className="fa fa-file-o "></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Documents</span>
								<span className="info-box-number">
									{this.state.docCount}
								</span>
							</div>
						</div>
					</div>
					
			
					<div className="col-lg-3 col-xs-6 small-gutter">
						<div className="info-box">
							<div className="info-box-icon bg-yellow">
							<i className="fa fa-tag"></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Codes</span>
								<span className="info-box-number">
									{this.state.codeCount}
								</span>
							</div>
						</div>
					</div>
					
					<div className="col-lg-3 col-xs-6 small-gutter">
						<div className="info-box">
							<div className="info-box-icon bg-red">
							<i className="fa fa-tags"></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Codings</span>
								<span className="info-box-number">
									{this.state.codingCount}
								</span>
							</div>
						</div>
						
					</div>
					
					<div className="col-lg-3 col-xs-6 small-gutter-left">
					<div className="info-box">
							<div className="info-box-icon bg-green">
							<i className="fa fa-bar-chart"></i>
								
							</div>
							<div className="info-box-content">
								<span className="info-box-text">Saturation</span>
								<span className="info-box-number">{this.calculateAvgSaturation()}</span>
							</div>
						</div>
					</div>
					
				</div>
				</div>
			</div>
		);
	}


}