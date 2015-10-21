# Vulcanize loader for webpack

Use **html-imports** and **webcomponents** in your webpack bundle with Vulcanize (from Polymer)

## Usage

``` javascript
require("vulcanize?base=/lib!./polymer.html");
require("vulcanize?base=/lib!./hello-world.html");
// => uses polymer.html hello-world.html as the entry files for `Vulcanize` in the output directory.
// => The module will write the document.head to add the corresponding html-import.
// => returns i. e. "/public-path/0dcbbaa701328a3c262cfd45869e351f.html"
```

## ES6 goodies

To be able to use ES6 in your javascript, you'll need to add the `es6` flag. Your vulcanized file will be splitted into HTML and Javascript files.

```js
require("vulcanize?es6&base=/lib!./hello-world.html");
// => Produces "/public-path/0dcbbaa701328a3c262cfd45869e351f.html"
// => Produces "/public-path/0dcbbaa701328a3c262cfd45869e351f.js"
// => The JS file will be linked to the HTML file
```


## License

MIT (http://www.opensource.org/licenses/mit-license.php)
