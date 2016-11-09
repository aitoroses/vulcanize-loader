# Vulcanize loader for webpack

Use **html-imports** and **webcomponents** in your webpack bundle with Vulcanize (from Polymer)

> With ES6 support via babel.

## Usage

* Specify root path with **base**
* Minify javascript with `NODE_ENV=production` or query parameter **compress**.
* The module will vulcanize the file and write write the document.head to add the corresponding html-import.

``` javascript
require("vulcanize?compress=true&base=/lib!./imports.html");
// => returns i. e. "/lib/imports.html"
```

* To watch files for changes, use a `|` separated list of relative filenames
* To watch folders for changes, use a `|` separated list of relative directories

``` javascript
require("vulcanize?compress=true&base=/lib&watchFolders=./elements|./elements2&watchFiles=./elements3/a.html|./elements3/b.html!./imports.html");
// => returns i. e. "/lib/imports.html"
//    rebuilds when any file in ./elements or ./elements2 changes
//    rebuilds when ./elements3/a.html or ./elements3/b.html changes
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
