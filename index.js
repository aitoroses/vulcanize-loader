/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Aitor Oses @aitoroses
*/
var loaderUtils = require('loader-utils');
var path = require('path');
var crisper = require('crisper');
var babel = require('babel');
var UglifyJS = require('uglify-js');
var Vulcanize = require('vulcanize');

var isProduction = process.env.NODE_ENV == 'production';

/**
 * Vulcanize a file from a path
 * @param  {Object}   opts     Vulcanize options object
 * @param  {String}   path     Path where lives the file to be vulcanized
 * @param  {Function} callback Callback for finished result
 */
function vulcanize(opts, path, callback) {
  (new Vulcanize(opts)).process(path, function(err, inlinedHtml) {
    if (err) {
      callback(err);
    } else {
      callback(err, inlinedHtml);
    }
  });
}

module.exports = function(content) {

  // Store the loader context
  var loaderContext = this;

  // Generate url
  const generateUrl = (query, content) => {
    var url = loaderUtils.interpolateName(this, query.name || '[hash].[ext]', {
      context: query.context || this.options.context,
      content: content,
      regExp: query.regExp,
    });
    return url;
  };

  // function for emiting file
  const emitFile = (url, content) => {
    this.emitFile(url, content);
  };

  // Use asynchronous processing
  var callback = this.async();

  // Set cacheable
  this.cacheable && this.cacheable();
  if (!this.emitFile) throw new Error('emitFile is required from module system');

  // Parse the query
  var query = loaderUtils.parseQuery(this.query);

  // Generate the final url of the file
  var url = generateUrl(query, content);

  // Main file pathname
  var pathname = loaderUtils.interpolateName(this, '[path][name].[ext]', {});

  // Add file dependencies to watchlist
  //var pwd = loaderUtils.interpolateName(this, '[path]', {})
  //loaderContext.dependency(pwd + 'required.html')

  // Vulcanize the file
  vulcanize({
    inlineScripts: true,
    inlineCss: true,
  }, pathname, (err, content) => {
    if (err) {
      callback(err);
    }

    // Use babel for ES6 processing?
    if (query.es6) {
      var jsFile = url.replace(/\.html$/, '.js');

      // Extract JS for procesing via Babel
      var out = crisper({
        source: content,
        jsFileName: (query.base || '') + '/' + jsFile,
      });

      //
      var es5Output = babel.transform(out.js).code;

      if (isProduction) {
        // Minify the resulting javascript
        es5Output = UglifyJS.minify(es5Output, {fromString: true}).code;
      }

      // Emit HTML and JS separatedly
      emitFile(url, out.html);
      emitFile(jsFile, es5Output);

    } else {

      // Emit vulcanized support
      emitFile(url, content);
    }

    // export the filename
    // var result = '__webpack_public_path__ + ' + JSON.stringify(url);
    var result = [
      '\t\t\t',
      'var link = document.createElement(\'link\');',
      'link.rel = \'import\';',
      'link.href = ' + JSON.stringify((query.base || '') + '/' + url) + ';',
      'document.head.appendChild(link)',

      // 'module.exports = __webpack_public_path__ + ' + JSON.stringify(url),
    ].join('\n\t\t\t');
    callback(err, result);
  });
};
