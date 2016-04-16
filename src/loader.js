/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Aitor Oses @aitoroses
*/

import loaderUtils from 'loader-utils'
import path from 'path'
import crisper from 'crisper'
import * as babel from 'babel-core'
import UglifyJS from 'uglify-js'
import Vulcanize from 'vulcanize'
import {minify as minifyHTML} from 'html-minifier'

import { compose, prop, Maybe } from 'freshman'

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
  const isProduction = this.query.minify ? JSON.parse(this.query.minify) : process.env.NODE_ENV == 'production';

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
    let resolve = (result) => c(null, result)
    let reject = (err) => c(err)
    return {resolve, reject}
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
  const babelCode = (content) => es6
    ? babel.transform(content, {compact: false, presets: ['es2015']}).code 
    : content

  // uglify :: String -> String
  const uglify = (content) => isProduction ? UglifyJS.minify(content, {fromString: true}).code : content

  // transformJS :: String -> String
  const transformJS = compose(uglify, babelCode)

  // htmlCode :: String -> String
  const htmlCode = (content) => false /*isProduction*/ ? minifyHTML(content, {}) : content

  // emitFiles :: String -> String -> IO
  const emitFiles = (js, html) => {
      emitFile(urlExt('.html'), html);
      emitFile(urlExt('.js'), js);
  }

  // processContent :: String -> IO
  const processContent = async (content) => {
    try {
      let vulcanized = await vulcanizeContent(content)
      let crisped = vulcanized.map(crisp)
      let html = crisped.map(compose(htmlCode, prop('html')))
      let js = crisped.map(compose(transformJS, prop('js')))
      emitFiles(js.get(), html.get())
      return {js, html}
    } catch(e) {
      console.error(e)
      throw e
    }
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
    const {resolve, reject} = callback()
    await processContent(content)
    let result = webpackModuleResult(finalUrl)
    resolve(result)
  } catch(e) {
    reject(e)
    console.error(e)
  }
}
