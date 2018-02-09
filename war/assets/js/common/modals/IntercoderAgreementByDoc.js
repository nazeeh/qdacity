import ReactDOM from "react-dom";

import ReactLoading from "../ReactLoading.jsx";

import VexModal from "./VexModal";

import "script-loader!../../../../components/DataTables-1.10.7/media/js/jquery.dataTables.min.js";
import IntlProvider from "../Localization/LocalizationProvider";

export default class IntercoderAgreementByDoc extends VexModal {
  constructor(resultID, validationProjectID, projectID, history) {
    super();
    this.history = history;

    this.formElements =
      '<div id="intercoderAgreementByDoc" style="text-align: center; background-color: #eee; font-color:#222;"><div id="loadingAnimationDocAgreement" class="centerParent"><div id="reactLoadingDocAgreement" class="centerChild"></div></div><table cellpadding="0" cellspacing="0" border="0" class="display" id="agreementByDocTable"></table></div>';

    this.resultID = resultID;

    this.validationProjectID = validationProjectID;

    this.projectID = projectID;

    this.results;
  }

  showModal() {
    var _this = this;
    const { formatMessage } = IntlProvider.intl;
    var promise = new Promise(function(resolve, reject) {
      var formElements = _this.formElements;

      vex.dialog.open({
        message: formatMessage({
          id: "intercoderagreementbydoc.agreement_by_doc",
          defaultMessage: "Agreement By Document"
        }),
        contentCSS: {
          width: "900px"
        },
        input: formElements,
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, {
            text: formatMessage({ id: "modal.ok", defaultMessage: "OK" })
          }),
          $.extend({}, vex.dialog.buttons.NO, {
            className: "vex-dialog-button-primary",
            text: formatMessage({
              id: "intercoderagreementbydoc.agreement_maps",
              defaultMessage: "Agreement Maps"
            }),
            click: function() {
              _this.history.push(
                "/CodingEditor?project=" +
                  _this.validationProjectID +
                  "&type=VALIDATION&report=" +
                  _this.resultID +
                  "&parentproject=" +
                  _this.projectID +
                  "&parentprojecttype=" +
                  _this.projectType
              );
            }
          })
        ],
        callback: function(data) {
          if (data != false) {
            resolve(data);
          } else reject(data);
        }
      });
      ReactDOM.render(
        <ReactLoading color={"#444"} />,
        document.getElementById("reactLoadingDocAgreement")
      );

      gapi.client.qdacity.validation
        .listDocumentResults({
          validationRresultID: _this.resultID
        })
        .execute(function(resp) {
          if (!resp.code) {
            $("#loadingAnimationDocAgreement").addClass("hidden");
            _this.results = resp.items || [];
            _this.setupDataTable();
          } else {
            // Log error
          }
        });
    });

    return promise;
  }

  setupDataTable() {
    var dataSet = [];

    // initialize if not initialized
    if (!$.fn.dataTable.isDataTable("#agreementByDocTable")) {
      var table1 = $("#agreementByDocTable").dataTable({
        iDisplayLength: 15,
        bLengthChange: false,
        data: dataSet,
        autoWidth: false,
        columnDefs: [
          {
            width: "20%"
          },
          {
            width: "25%"
          },
          {
            width: "25%"
          },
          {
            width: "25%"
          }
        ],
        columns: [
          {
            title: "Document",
            width: "20%"
          },
          {
            title: "F-Measure",
            width: "25%"
          },
          {
            title: "Recall",
            width: "25%"
          },
          {
            title: "Precision",
            width: "25%"
          }
        ]
      });
    }

    var table = $("#agreementByDocTable").DataTable();

    table.clear();
    if (typeof this.resultID != "undefined") {
      for (var i = 0; i < this.results.length; i++) {
        var result = this.results[i];
        table.row.add(result.reportRow.split(","));
      }
    }

    table.draw();
  }
}
