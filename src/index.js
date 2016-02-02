/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Aitor Oses @aitoroses
*/
const loaderUtils = require('loader-utils');
const path = require('path');
const crisper = require('crisper');
const babel = require('babel-core');
require('babel-polyfill')
const UglifyJS = require('uglify-js');
const Vulcanize = require('vulcanize');

import { compose, Maybe } from 'freshman'

// vulcanize :: VulcanizerOptions -> String -> Task Error String
const vulcanize = (opts, path) => new Promise((resolve, reject) => {
  const vulcanizer = new Vulcanize(opts)
  vulcanizer.process(path, function(err, inlinedHtml) {
    if (err) {
      reject(err);
    } else {
      resolve(inlinedHtml)
    }
  })
})

module.exports = async function main(content) {

  // isProduction :: Boolean
  const isProduction = this.query.minify ? this.query.minify process.env.NODE_ENV == 'production';

  // query :: QueryString -> Query
  const query = loaderUtils.parseQuery(this.query);

  // pathname :: String -> String
  const pathname = (format = '[path][name].[ext]') => loaderUtils.interpolateName(this, format, {});

  // emitFile :: String -> String
  const emitFile = (url, content) => this.emitFile(url, content)

  // config :: IO
  const config = () => {

    // Set cacheable
    this.cacheable && this.cacheable();
    if (!this.emitFile) throw new Error('emitFile is required from module system');
  }

  // callback :: IO
  const callback = () => {
    config()

    let c = this.async();

    // Use asynchronous processing
    return (result) => c(null, result)
  }

  // Generate the final url of the file
  const url = pathname('[name].[ext]')

  // urlExt :: String -> String
  const urlExt = (ext) => url.replace(/\.html$/, ext);


  // addDependency :: String -> IO
  const addDependency = (relativePath) => this.dependency(pathname('[path]' + relativePath))

  // vulcanizedContent :: String -> Maybe String
  const vulcanizeContent = async (content) => {
    try {
      let content = await vulcanize({
        inlineScripts: true,
        inlineCss: true,
      }, pathname())
      return Maybe.fromNullable(content)
    } catch (e) {
      console.log(e)
      return Maybe.Nothing()
    }
  }

  const jsFileName = urlExt('.js')

  // crisp :: String
  const crisp = (content) => crisper({ source: content, jsFileName: jsFileName})

  // es6 :: Boolean
  const es6 = true //query.es6 != null

  // babelCode :: String -> String
  const babelCode = (content) => es6 ? babel.transform(content, {compact: false}).code : content

  // uglify :: String -> String
  const uglify = (content) => isProduction ? UglifyJS.minify(content, {fromString: true}).code : content

  // transformJS :: String -> String
  const transformJS = compose(uglify, babelCode)

  // emitFiles :: String -> String -> IO
  const emitFiles = (js, html) => {
      emitFile(urlExt('.html'), html);
      emitFile(urlExt('.js'), js);
  }

  // processContent :: String -> IO
  const processContent = async (content) => {
    let vulcanized = await vulcanizeContent(content)

    let js, html

    if (vulcanized.isJust) {
      try {
        let value = vulcanized.get()
        let crisped = crisp(value)
        js = transformJS(crisped.js)
        html = crisped.html
      } catch(e) {
        console.error(e)
      }
    } else {
      js = html = ""
      throw Error('Error while vulcanizing')
    }

    emitFiles(js, html)
  }

  // finalUrl :: String
  const finalUrl = (query.base || '') + '/' + pathname('[name].[ext]')

  // webpackModuleResult :: String -> String
  const webpackModuleResult = (url) => (
    [
      '\t\t\t',
      'var link = document.createElement(\'link\');',
      'link.rel = \'import\';',
      'link.href = ' + JSON.stringify(finalUrl) + ';',
      'document.head.appendChild(link)',
      // 'module.exports = __webpack_public_path__ + ' + JSON.stringify(url),
    ].join('\n\t\t\t')
  )

  // ---------------------
  // Run Impure code
  try {
    let resolve = callback()
    await processContent(content)
    resolve(webpackModuleResult(finalUrl))
  } catch(e) {
    console.error(e)
  }
}
