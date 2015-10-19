/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Aitor Oses @aitoroses
*/
var loaderUtils = require('loader-utils');
var path = require('path');
var Vulcanize = require('vulcanize')

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
  // Generate url
  const generateUrl = (query, content) => {
    var url = loaderUtils.interpolateName(this, query.name || '[hash].[ext]', {
      context: query.context || this.options.context,
      content: content,
      regExp: query.regExp,
    });
    return url
  }

  // function for emiting file
  const emitFile = (url, content) => {
    this.emitFile(url, content);
  }

  // Async Callback
  var callback = this.async()

  this.cacheable && this.cacheable();
  if (!this.emitFile) throw new Error('emitFile is required from module system');

  // Generate the query
  var query = loaderUtils.parseQuery(this.query);

  // Generate the url of the file
  var url = generateUrl(query, content)

  // pathname
  var pathname = loaderUtils.interpolateName(this, '[path][name].[ext]', {})

  // Vulcanize the file
  vulcanize({
    inlineScripts: true,
    inlineCss: true,
  }, pathname, (err, content) => {
    if (err) {
      callback(err)
    }

    emitFile(url, content)

    // export the filename
    // var result = '__webpack_public_path__ + ' + JSON.stringify(url);
    var result = [
      '\t\t\t',
      'var link = document.createElement(\'link\');',
      'link.rel = \'import\';',
      'link.href = ' + JSON.stringify((query.base || '') + '/' + url) + ';',
      'document.head.appendChild(link)',

      // 'module.exports = __webpack_public_path__ + ' + JSON.stringify(url),
    ].join('\n\t\t\t')
    callback(err, result)
  })
}

// module.exports.raw = true;
