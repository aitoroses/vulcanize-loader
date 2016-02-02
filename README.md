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

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
