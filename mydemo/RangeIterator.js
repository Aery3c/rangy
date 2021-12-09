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
      console.log(range);
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
        this._first = this._next = (this.sc == root && !dom.isCharacterDataNode(this.sc))
          ? root.childNodes[this.so] : dom.getClosestAncestorIn(this.sc, root, false);
        this._last = (this.ec == root && !dom.isCharacterDataNode(this.ec))
          ? root.childNodes[this.eo - 1] : dom.getClosestAncestorIn(this.ec, root, false);

        console.log('_first and _last: ', dom.inspectNode(this._first), dom.inspectNode(this._last));
      }
    }

    next() {
      const current = this._current = this._next;
      if (current) {
        this._next = current != this._last ? current.nextSibling : null;
      }
      return current;
    }
    // 检查当前节点是否有部分被选中
    isPartiallySelectedSubtree() {
      const current = this._current;

    }
  }
  
  root.RangeIterator = RangeIterator;

})(this);
