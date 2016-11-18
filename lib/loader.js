'use strict';

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _crisper = require('crisper');

var _crisper2 = _interopRequireDefault(_crisper);

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _vulcanize = require('vulcanize');

var _vulcanize2 = _interopRequireDefault(_vulcanize);

var _htmlMinifier = require('html-minifier');

var _freshman = require('freshman');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                           	MIT License http://www.opensource.org/licenses/mit-license.php
                                                                                                                                                                                                                                                                                                                                                                                                                                                                           	Author Aitor Oses @aitoroses
                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */

// vulcanize :: VulcanizerOptions -> String -> Task Error String
var vulcanize = function vulcanize(opts, path) {
  return new Promise(function (resolve, reject) {
    var vulcanizer = new _vulcanize2.default(opts);
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
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(content) {
    var _this = this;

    var isProduction, query, pathname, emitFile, config, callback, url, urlExt, addDependency, addContextDependency, watchFiles, watchFolders, vulcanizeContent, jsFileName, crisp, es6, babelRc, babelCode, uglify, transformJS, htmlCode, emitFiles, processContent, finalUrl, webpackModuleResult, _callback, resolve, _reject, result;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:

            // isProduction :: Boolean
            isProduction = this.query.minify ? JSON.parse(this.query.minify) : process.env.NODE_ENV == 'production';

            // query :: QueryString -> Query

            query = _loaderUtils2.default.parseQuery(this.query);

            // pathname :: String -> String

            pathname = function pathname() {
              var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[path][name].[ext]';
              return _path2.default.normalize(_loaderUtils2.default.interpolateName(_this, format, {}));
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
              var resolve = function resolve(result) {
                return c(null, result);
              };
              var reject = function reject(err) {
                return c(err);
              };
              return { resolve: resolve, reject: reject };
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

            // addContextDependency :: String -> IO


            addContextDependency = function addContextDependency(relativePath) {
              return _this.addContextDependency(pathname('[path]' + relativePath));
            };

            // watchFiles :: IO


            watchFiles = function watchFiles() {
              if (query.watchFiles) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = query.watchFiles.split("|")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var f = _step.value;

                    addDependency(f);
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                      _iterator.return();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }
              }
            };

            // watchFolders :: IO


            watchFolders = function watchFolders() {
              if (query.watchFolders) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = query.watchFolders.split("|")[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var f = _step2.value;

                    addContextDependency(f);
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                      _iterator2.return();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }
              }
            };

            // vulcanizedContent :: String -> Maybe String


            vulcanizeContent = function () {
              var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(content) {
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
              }));

              return function vulcanizeContent(_x3) {
                return _ref2.apply(this, arguments);
              };
            }();

            jsFileName = urlExt('.js');

            // crisp :: String

            crisp = function crisp(content) {
              return (0, _crisper2.default)({ source: content, jsFileName: jsFileName });
            };

            // es6 :: Boolean


            es6 = query.es6 != false && query.es6 != "false" ? true : false;

            // babelRc :: Object

            babelRc = function () {
              var options = void 0;
              try {
                options = JSON.parse(_fs2.default.readFileSync(_path2.default.resolve(process.cwd(), '.babelrc'), 'utf-8'));
              } catch (e) {
                options = { compact: false };
              }
              console.log("Using options for babel " + JSON.stringify(options));
              return options;
            }();

            console.log(es6);

            // babelCode :: String -> String

            babelCode = function babelCode(content) {
              return es6 ? babel.transform(content, babelRc).code : content;
            };

            // uglify :: String -> String


            uglify = function uglify(content) {
              return isProduction ? _uglifyJs2.default.minify(content, { fromString: true }).code : content;
            };

            // transformJS :: String -> String


            transformJS = (0, _freshman.compose)(uglify, babelCode);

            // htmlCode :: String -> String

            htmlCode = function htmlCode(content) {
              return false /*isProduction*/ ? (0, _htmlMinifier.minify)(content, {}) : content;
            };

            // emitFiles :: String -> String -> IO


            emitFiles = function emitFiles(js, html) {
              emitFile(urlExt('.html'), html);
              emitFile(urlExt('.js'), js);
            };

            // processContent :: String -> IO


            processContent = function () {
              var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(content) {
                var vulcanized, crisped, html, js;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return vulcanizeContent(content);

                      case 3:
                        vulcanized = _context2.sent;
                        crisped = vulcanized.map(crisp);
                        html = crisped.map((0, _freshman.compose)(htmlCode, (0, _freshman.prop)('html')));
                        js = crisped.map((0, _freshman.compose)(transformJS, (0, _freshman.prop)('js')));

                        watchFiles();
                        watchFolders();
                        emitFiles(js.get(), html.get());
                        return _context2.abrupt('return', { js: js, html: html });

                      case 13:
                        _context2.prev = 13;
                        _context2.t0 = _context2['catch'](0);

                        console.error(_context2.t0);
                        throw _context2.t0;

                      case 17:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this, [[0, 13]]);
              }));

              return function processContent(_x4) {
                return _ref3.apply(this, arguments);
              };
            }();

            // finalUrl :: String


            finalUrl = (query.base || '') + '/' + pathname('[name].[ext]');

            // webpackModuleResult :: String -> String

            webpackModuleResult = function webpackModuleResult(url) {
              return ['\t\t\t', 'var link = document.createElement(\'link\');', 'link.rel = \'import\';', 'link.href = ' + JSON.stringify(finalUrl) + ';', 'document.head.appendChild(link)'].join('\n\t\t\t');
            };

            // ---------------------
            // Run Impure code


            _context3.prev = 26;
            _callback = callback(), resolve = _callback.resolve, _reject = _callback.reject;
            _context3.next = 30;
            return processContent(content);

          case 30:
            result = webpackModuleResult(finalUrl);

            resolve(result);
            _context3.next = 38;
            break;

          case 34:
            _context3.prev = 34;
            _context3.t0 = _context3['catch'](26);

            reject(_context3.t0);
            console.error(_context3.t0);

          case 38:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[26, 34]]);
  }));

  function main(_x) {
    return _ref.apply(this, arguments);
  }

  return main;
}();