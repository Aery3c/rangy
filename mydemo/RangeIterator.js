(function(root) {

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
        var root = range.commonAncestorContainer;
      }
      // 初始化遍历对象
      if (this.sc == this.ec && dom.isCharacterDataNode(this.sc)) {
        // 文本节点 且不跨标签
        this._first = this._last = this._next = this.sc;
        this.isSingleCharacterDataNode = true;
      } else {
        this._first = this.next = (this.sc == root && !dom.isCharacterDataNode(this.sc)) 
          ? this.sc.childNodes[this.so] : this.sc;
        this._last = (this.ec == root && !dom.isCharacterDataNode(this.ec))
          ? this.ec.childNodes[this.eo - 1] : this.ec;

        console.log(this._first, '_first');
        console.log(this._last, '_last');
      }
    }

    next() {
      const current = this._current = this._next;
      if (current) {
        this._next = current != this._last ? current.nextSibling : null;
        debugger;
      }

      return current;
    }
  }
  
  root.RangeIterator = RangeIterator;

})(this);
