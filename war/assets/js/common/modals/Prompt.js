import VexModal from "./VexModal";

export default class Prompt extends VexModal {
  constructor(message, placeholder) {
    super();
    this.message = message;
    this.placeholder = placeholder;
  }

  showModal() {
    var _this = this;
    var promise = new Promise(function(resolve, reject) {
      vex.dialog.prompt({
        message: _this.message,
        placeholder: _this.placeholder,
        callback: function(value) {
          if (value != false) {
            resolve(value);
          } else reject(value);
        }
      });
    });

    return promise;
  }
}
