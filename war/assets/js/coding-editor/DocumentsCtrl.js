import DocumentsView from './DocumentsView.jsx';
import 'script!../../../components/filer/js/jquery.filer.min.js';

export default class DocumentsCtrl {
	
  constructor(documentsView, projectID) {
	  this.view = documentsView;
	  this.projectID = projectID;
	  this.addDocument = this.addDocument.bind(this);
  }

  addDocument(){
	  var _this = this;
		vex.dialog.open({ 
		    message: 'Empty Document or Upload?',
		    contentCSS: { width: '500px' },
		    buttons: [
	         	$.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn vex-dialog-button-primary', text: 'Upload Documents', click: function($vexContent, event) {
		            $vexContent.data().vex.value = 'uploadDocs';
		            vex.close($vexContent.data().vex.id);
		        }}),
		        $.extend({}, vex.dialog.buttons.NO, { className: 'deciderBtn pull-left vex-dialog-button-primary ', text: 'New Text Document', click: function($vexContent, event) {
		            $vexContent.data().vex.value = 'emptyDoc';
		            vex.close($vexContent.data().vex.id);
		        }}),
		       
		    ],
		    callback: function(value) {
		        switch (value) {
				case 'emptyDoc':
					_this.addEmptyDocument();
					break;
				case 'uploadDocs':
					_this.addUploadDocuments();
					break;

				default:
					break;
				}
		        
		    }
		});
	}
  
  addEmptyDocument(){
	  var _this = this;
		vex.dialog.prompt({
			message : 'Give your code a name',
			placeholder : 'Code Name',
			callback : function(docTitle) {
				if (docTitle != false) {
					_this.addDocumentToProject(docTitle);
				}
			}
		});
	}
  
  addUploadDocuments(){
	  var _this = this;
	  vex.dialog.open({
		  contentCSS: { width: '500px' },
		  message: 'Select a date and color.',
		  input: '<form action="" method="post" class="filerModal" enctype="multipart/form-data"><input type="file" name="files" id="filer_input" multiple="multiple">    </form>',
		  
			  afterOpen: function($vexContent) {
				  var filerInput = $vexContent.find("#filer_input");
				  filerInput.filer({
					    limit: 10,
					    maxSize: 3,
					    extensions: ['rtf'],
					    changeInput: true,
					    showThumbs: true,
					    captions:{
					    	errors: {
						        filesType: "Only text files are allowed to be uploaded.",
						    }
					    }
					    
					});
				  return $vexContent;
			  },
		  callback: function(data) {
			  if (data){
				  var test = data.files;
				  var jFiler = $(this.content).find("#filer_input").prop("jFiler");;
				  var files = jFiler.files;
				  _this.uploadDocuments(files);
			  }
			  
		  }
		});
	}
  
  
  addDocumentToProject(title) {
	  var _this = this;
		var requestData = {};
		requestData.projectID = this.projectID;
		requestData.text = " "; // can not be empty
		requestData.title = title;

		gapi.client.qdacity.documents.insertTextDocument(requestData).execute(function(resp) {
			if (!resp.code) {
				_this.view.addDocument(resp.id, resp.title, resp.text.value);
			}
		});

	}
  
  uploadDocuments(files) {
		var _this = this;
		for (var i = 0; i < files.length; i++) {
			var file = files[i];

			var reader = new FileReader();

			reader.onload = function(e) {
				_this.uploadFile(reader.result, file.name);

			}

			reader.readAsDataURL(file);
		}
	}

	uploadFile(fileData, fileName) {
		var _this = this;
		var requestData = {};
		requestData.fileName = fileName;
		requestData.fileSize = "0";
		requestData.project = this.projectID;
		requestData.fileData = fileData.split(',')[1];
		gapi.client.qdacity.upload.insertUpload(requestData).execute(function(resp) {
			if (!resp.code) {
				_this.view.addDocument(resp.id, resp.title, resp.text.value);
			} else {
				console.log(resp.code + resp.message);
			}
		});
	}

	//TODO: Currently not used, as long as files are sent directly through the endpoint. This is limited to 1MB and when uploading to cloud storage we need to send blobs
	dataURItoBlob(dataURI) {
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that
		// does this
		var byteString = atob(dataURI.split(',')[1]);

		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

		// write the bytes of the string to an ArrayBuffer
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		// write the ArrayBuffer to a blob, and you're done
		var blob = new Blob([ ab ], {
			type : mimeString
		});
		window.alert("bytestring : " + byteString);
		return byteString;
	}
  
}

 