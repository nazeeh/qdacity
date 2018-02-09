var through = require("through2");
var prettierEslint = require("prettier-eslint");

const options = {
  eslintConfig: {
    parserOptions: {
      ecmaVersion: 7
    },
    rules: {
      semi: ["error", "never"]
    }
  },
  prettierOptions: {
    bracketSpacing: true
  }
};

module.exports = function() {
  return through.obj(format);

  function format(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(
        new utils.PluginError("prettier-eslint", "doesn't support Streams")
      );
    }

    const sourceCode = file.contents.toString();
    const formatted = prettierEslint({
      filePath: file.path,
      text: sourceCode
    });

    file.contents = new Buffer(formatted, encoding);

    return callback(null, file);
  }
};
