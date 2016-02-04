'use strict';

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /*
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
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(content) {
    var _this = this;

    var isProduction, query, pathname, emitFile, config, callback, url, urlExt, addDependency, vulcanizeContent, jsFileName, crisp, es6, babelCode, uglify, transformJS, htmlCode, emitFiles, processContent, finalUrl, webpackModuleResult, _callback,

    // ---------------------
    // Run Impure code
    resolve, _reject, result;

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
              var format = arguments.length <= 0 || arguments[0] === undefined ? '[path][name].[ext]' : arguments[0];
              return _loaderUtils2.default.interpolateName(_this, format, {});
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
              return (0, _crisper2.default)({ source: content, jsFileName: jsFileName });
            };

            // es6 :: Boolean

            es6 = true; //query.es6 != null

            // babelCode :: String -> String

            babelCode = function babelCode(content) {
              return es6 ? babel.transform(content, { compact: false }).code : content;
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
              var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(content) {
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

                        emitFiles(js.get(), html.get());
                        return _context2.abrupt('return', { js: js, html: html });

                      case 11:
                        _context2.prev = 11;
                        _context2.t0 = _context2['catch'](0);

                        console.error(_context2.t0);
                        throw _context2.t0;

                      case 15:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this, [[0, 11]]);
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

            _context3.prev = 21;
            _callback = callback();
            resolve = _callback.resolve;
            _reject = _callback.reject;
            _context3.next = 27;
            return processContent(content);

          case 27:
            result = webpackModuleResult(finalUrl);

            resolve(result);
            _context3.next = 35;
            break;

          case 31:
            _context3.prev = 31;
            _context3.t0 = _context3['catch'](21);

            reject(_context3.t0);
            console.error(_context3.t0);

          case 35:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[21, 31]]);
  }));

  return function main(_x) {
    return ref.apply(this, arguments);
  };
}();