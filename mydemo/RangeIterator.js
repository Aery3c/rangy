(function(root) {

  class RangeIterator {
    /** @type {Node | null} */
    _current;
    _next;
    _first;
    _last;
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
      
      
    }
  }
  
  root.RangeIterator = RangeIterator;

})(this);
