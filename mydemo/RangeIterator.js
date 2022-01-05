'use strict';

(function(factory, root) {
  if (typeof define == 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof module != 'undefined' && typeof exports == 'object') {
    // Node/CommonJS style
    module.exports = factory(require('./dom'));
  } else {
    // No AMD or CommonJS support so we place Rangy in (probably) the global variable
    root.RangeIterator = factory(root.dom);
  }

})(
  /**
   *
   * @param dom {dom}
   * @return {{RangeIterator: RangeIterator, util: {isNonTextPartiallySelected: (function(Node, Range))}}}
   */
  function(dom) {
    /**
     *
     * @param {Node} node
     * @param {Range} range
     */
    function isNonTextPartiallySelected(node, range) {
      return node.nodeType != 3
        && (
          dom.isOrIsAncestorOf(node, range.startContainer)
          || dom.isOrIsAncestorOf(node, range.endContainer)
        );
    }

    class RangeIterator {
      /** @type {Node | null} */
      _current = null;
      /** @type {Node | null} */
      _next = null;
      /** @type {Node | null} */
      _first = null;
      /** @type {Node | null} */
      _last = null;
      isSingleCharacterDataNode = false;
      /**
       *
       * @param {Range} range
       * @param {boolean} clonePartiallySelectedTextNodes
       */
      constructor(range, clonePartiallySelectedTextNodes) {
        this.range = range;
        this.clonePartiallySelectedTextNodes = clonePartiallySelectedTextNodes;

        if (!range.collapsed) {
          this.sc = range.startContainer;
          this.so = range.startOffset;
          this.ec = range.endContainer;
          this.eo = range.endOffset;
          const root = range.commonAncestorContainer;

          // 初始化遍历对象
          if (this.sc == this.ec && dom.isCharacterDataNode(this.sc)) {
            // 文本节点 且不跨标签
            this._first = this._last = this._next = this.sc;
            this.isSingleCharacterDataNode = true;
          } else {
            this._first = this._next = (this.sc == root && !dom.isCharacterDataNode(this.sc))
              ? root.childNodes[this.so] : dom.getClosestAncestorIn(this.sc, root, true);
            this._last = (this.ec == root && !dom.isCharacterDataNode(this.ec))
              ? root.childNodes[this.eo - 1] : dom.getClosestAncestorIn(this.ec, root, true);

            console.log('_first -> ', dom.inspectNode(this._first), '\n_last -> ', dom.inspectNode(this._last));
          }
        }
      }

      next() {
        const current = this._current = this._next;
        if (current) {
          this._next = current != this._last ? current.nextSibling : null;
        }
        return current;
      }

      isPartiallySelectedSubtree() {
        const current = this._current;
        return isNonTextPartiallySelected(current, this.range);
      }

      getSubtreeIterator() {
        const subRange = this.range.cloneRange();
        const current = this._current;
        if (this.isSingleCharacterDataNode) {
          subRange.collapse(false); // 折叠到end
        } else {
          let startContainer = current, endContainer = current;
          let startOffset = 0, endOffset = dom.getNodeLength(current);

          if (dom.isOrIsAncestorOf(current, this.sc)) {
            startContainer = this.sc;
            startOffset = this.so;
          }

          if (dom.isOrIsAncestorOf(current, this.ec)) {
            endContainer = this.ec;
            endOffset = this.eo;
          }

          subRange.setStartAndEnd(startContainer, startOffset, endContainer, endOffset);
        }

        return new RangeIterator(subRange, this.clonePartiallySelectedTextNodes);
      }
    }

    return RangeIterator;
  }, this);