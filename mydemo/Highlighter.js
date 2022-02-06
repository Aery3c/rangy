'use strict';

(function(factory, root) {
  if (typeof define == 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof module != 'undefined' && typeof exports == 'object') {
    // Node/CommonJS style
    module.exports = factory(require('./dom'));
  } else {
    // No AMD or CommonJS support so we place Highlighter in (probably) the global variable
    root.Highlighter = factory(window.dom);
  }
})(
  /**
   *
   * @param {dom} dom
   */
  function(dom) {

    class Mark {
      constructor(className) {
        this.className = className;
      }

      applyToTextNode(textNode) {
        const parent = textNode.parentNode;
        console.log(parent.childNodes.length === 1, 'parent.childNodes.length === 1');
        const span = document.createElement('span');
        span.className = this.className;
        parent.insertBefore(span, textNode);
        span.appendChild(textNode);
      }
    }

    class Highlighter {
      constructor(name) {
        this.name = name;
      }

      apply() {
        // 如何涂抹 生成Mark对象
        const sel = window.getSelection();
        if (sel.rangeCount) {
          const mark = new Mark(this.name);
          const range = sel.getRangeAt(sel.rangeCount - 1);
          // 分割边界
          range.splitRangeBoundaries();

          const textNodes = range.getNodes([3]);

          textNodes.forEach(textNode => {
            mark.applyToTextNode(textNode);
          });

          const lastTextNode = textNodes[textNodes.length - 1];
          range.setStartAndEnd(textNodes[0], 0, lastTextNode, lastTextNode.length);

        }
      }

    }

    return Highlighter;
}, this);