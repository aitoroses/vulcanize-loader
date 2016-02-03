'use strict';

var _freshman = require('freshman');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Aitor Oses @aitoroses
*/
var loaderUtils = require('loader-utils');
var path = require('path');
var crisper = require('crisper');
var babel = require('babel-core');
require('babel-polyfill');
var UglifyJS = require('uglify-js');
var Vulcanize = require('vulcanize');

// vulcanize :: VulcanizerOptions -> String -> Task Error String
var vulcanize = function vulcanize(opts, path) {
  return new Promise(function (resolve, reject) {
    var vulcanizer = new Vulcanize(opts);
    vulcanizer.process(path, function (err, inlinedHtml) {
      if (err) {
        reject(err);
      } else {
        resolve(inlinedHtml);
      }
    });
  });
};

module.exports = function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(content) {
    var _this = this;

    var isProduction, query, pathname, emitFile, config, callback, url, urlExt, addDependency, vulcanizeContent, jsFileName, crisp, es6, babelCode, uglify, transformJS, emitFiles, processContent, finalUrl, webpackModuleResult, resolve;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:

            // isProduction :: Boolean
            isProduction = this.query.minify ? this.query.minify : process.env.NODE_ENV == 'production';

            // query :: QueryString -> Query

            query = loaderUtils.parseQuery(this.query);

            // pathname :: String -> String

            pathname = function pathname() {
              var format = arguments.length <= 0 || arguments[0] === undefined ? '[path][name].[ext]' : arguments[0];
              return loaderUtils.interpolateName(_this, format, {});
            };

            // emitFile :: String -> String

            emitFile = function emitFile(url, content) {
              return _this.emitFile(url, content);
            };

            // config :: IO

            config = function config() {

              // Set cacheable
              _this.cacheable && _this.cacheable();
              if (!_this.emitFile) throw new Error('emitFile is required from module system');
            };

            // callback :: IO

            callback = function callback() {
              config();

              var c = _this.async();

              // Use asynchronous processing
              return function (result) {
                return c(null, result);
              };
            };

            // Generate the final url of the file

            url = pathname('[name].[ext]');

            // urlExt :: String -> String

            urlExt = function urlExt(ext) {
              return url.replace(/\.html$/, ext);
            };

            // addDependency :: String -> IO

            addDependency = function addDependency(relativePath) {
              return _this.dependency(pathname('[path]' + relativePath));
            };

            // vulcanizedContent :: String -> Maybe String

            vulcanizeContent = function () {
              var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(content) {
                var _content;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return vulcanize({
                          inlineScripts: true,
                          inlineCss: true
                        }, pathname());

                      case 3:
                        _content = _context.sent;
                        return _context.abrupt('return', _freshman.Maybe.fromNullable(_content));

                      case 7:
                        _context.prev = 7;
                        _context.t0 = _context['catch'](0);

                        console.log(_context.t0);
                        return _context.abrupt('return', _freshman.Maybe.Nothing());

                      case 11:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this, [[0, 7]]);
              })),
                  _this = _this;

              return function vulcanizeContent(_x3) {
                return ref.apply(_this, arguments);
              };
            }();

            jsFileName = urlExt('.js');

            // crisp :: String

            crisp = function crisp(content) {
              return crisper({ source: content, jsFileName: jsFileName });
            };

            // es6 :: Boolean

            es6 = true; //query.es6 != null

            // babelCode :: String -> String

            babelCode = function babelCode(content) {
              return es6 ? babel.transform(content, { compact: false }).code : content;
            };

            // uglify :: String -> String

            uglify = function uglify(content) {
              return isProduction ? UglifyJS.minify(content, { fromString: true }).code : content;
            };

            // transformJS :: String -> String

            transformJS = (0, _freshman.compose)(uglify, babelCode);

            // emitFiles :: String -> String -> IO

            emitFiles = function emitFiles(js, html) {
              emitFile(urlExt('.html'), html);
              emitFile(urlExt('.js'), js);
            };

            // processContent :: String -> IO

            processContent = function () {
              var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(content) {
                var vulcanized, js, html, value, crisped;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return vulcanizeContent(content);

                      case 2:
                        vulcanized = _context2.sent;
                        js = undefined, html = undefined;

                        if (!vulcanized.isJust) {
                          _context2.next = 8;
                          break;
                        }

                        try {
                          value = vulcanized.get();
                          crisped = crisp(value);

                          js = transformJS(crisped.js);
                          html = crisped.html;
                        } catch (e) {
                          console.error(e);
                        }
                        _context2.next = 10;
                        break;

                      case 8:
                        js = html = "";
                        throw Error('Error while vulcanizing');

                      case 10:

                        emitFiles(js, html);

                      case 11:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this);
              })),
                  _this = _this;

              return function processContent(_x4) {
                return ref.apply(_this, arguments);
              };
            }();

            // finalUrl :: String

            finalUrl = (query.base || '') + '/' + pathname('[name].[ext]');

            // webpackModuleResult :: String -> String

            webpackModuleResult = function webpackModuleResult(url) {
              return ['\t\t\t', 'var link = document.createElement(\'link\');', 'link.rel = \'import\';', 'link.href = ' + JSON.stringify(finalUrl) + ';', 'document.head.appendChild(link)'].
              // 'module.exports = __webpack_public_path__ + ' + JSON.stringify(url),
              join('\n\t\t\t');
            };

            // ---------------------
            // Run Impure code

            _context3.prev = 20;
            resolve = callback();
            _context3.next = 24;
            return processContent(content);

          case 24:
            resolve(webpackModuleResult(finalUrl));
            _context3.next = 30;
            break;

          case 27:
            _context3.prev = 27;
            _context3.t0 = _context3['catch'](20);

            console.error(_context3.t0);

          case 30:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[20, 27]]);
  }));

  return function main(_x) {
    return ref.apply(this, arguments);
  };
}();