'use strict';

(function(factory, root) {
  if (typeof define == 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof module != 'undefined' && typeof exports == 'object') {
    // Node/CommonJS style
    module.exports = factory();
  } else {
    // No AMD or CommonJS support so we place Highlighter in (probably) the global variable
    root.aery = factory();
  }
})(function() {
  /** @typedef {(node: Node) => {}} IterateNextCallBack */
  const api = {
    version: '1.0'
  }

  function log(thing) {
    console.log(thing);
  }

  /**
   *
   * @param {object} obj
   * @param {object} props
   * @param {boolean} [deep]
   */
  function extend(obj, props, deep) {
    let o, p;
    for (let i in props) {
      if (props.hasOwnProperty(i)) {
        o = obj[i];
        p = props[i];
        if (deep && o !== null && typeof o == "object" && p !== null && typeof p == "object") {
          extend(o, p, true);
        }
        obj[i] = p;
      }
    }
    if (props.hasOwnProperty("toString")) {
      obj.toString = props.toString;
    }
    return obj;
  }

  /** util */
  const util = {}

  /**
   *
   * @param {Range} range
   */
  function inspectOnSelection(range) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      sel.removeAllRanges();
    }
    sel.addRange(range);
  }
  function isRangeValid(range) {}
  /**
   * 根据nodeTypes的指示, 获取range中的所有节点
   * @example getNodesInRange(range, [3], function() {}) // 获取range中的所有文本节点
   * @param {Range} range
   * @param {number[]} nodeTypes
   * @param {Function} filter
   */
  function getNodesInRange(range, nodeTypes, filter) {
    let regex;
    if (nodeTypes && nodeTypes.length) {
      regex = new RegExp(`^(${nodeTypes.join('|')})$`);
    }
    const nodes = [];
    iterateSubtree(createRangeIterator(range), function(node) {
      console.log(node);
    });
  }
  /**
   * 执行RangeIterator 将每一次迭代的结果通过回调函数透出
   * @param {RangeIterator} rit
   * @param {IterateNextCallBack} iterateNextCallBack
   */
  function iterateSubtree(rit, iterateNextCallBack) {
    let node, subRit;
    while (node = rit.next()) {
      if (rit.isPartiallySelectedSubtree()) {
        subRit = rit.getSubtreeIterator();
        iterateSubtree(subRit, iterateNextCallBack);
      } else {
        // 执行这里 说明节点是range中间部分的节点 那么采用更高效的NodeIterator
        let n, it = document.createNodeIterator(node, NodeFilter.SHOW_ALL);
        while(n = it.nextNode()) {
          iterateNextCallBack(n);
        }
      }
    }
  }
  /**
   *
   * @param {Range} range
   * @return {string}
   */
  function inspect(range) {
    return "[" + inspectNode(range.commonAncestorContainer) + "(" + inspectNode(range.startContainer) + ":" + range.startOffset + ", " +
      inspectNode(range.endContainer) + ":" + range.endOffset + ")]";
  }
  /**
   *
   * @param {Node} node
   * @param {Range} range
   * @return {boolean}
   */
  function isNonTextPartiallySelected(node, range) {
    return node.nodeType !== 3
      && (
        isOrIsAncestorOf(node, range.startContainer)
        || isOrIsAncestorOf(node, range.endContainer)
      );
  }
  util.extend = extend;

  /** dom */
  const dom = {}

  /**
   * 返回节点自身的长度.
   *
   * 文本节点: 返回自身文本的长度.
   *
   * 元素节点: 返回子节点的长度.
   * @param {Node} node
   * @return {number}
   */
  function getNodeLength(node) {
    switch (node.nodeType) {
      case Node.PROCESSING_INSTRUCTION_NODE:
      case Node.DOCUMENT_TYPE_NODE:
        return 0;
      case Node.TEXT_NODE:
      case Node.COMMENT_NODE:
        return node.length;
      default:
        return node.childNodes.length;
    }
  }
  /**
   *
   * @param {Element} el
   * @param {string} className
   * @return boolean;
   */
  function hasClass(el, className) {
    if (typeof el.classList === 'object') {
      return el.classList.contains(className);
    } else {
      const classNameSupprted = (typeof el.className === 'string');
      const elClass = classNameSupprted ? el.className : el.getAttribute('class');
      return classNameContainsClass(elClass, className);
    }
  }

  function classNameContainsClass(fullClassName, className) {
    return !!fullClassName && new RegExp(`(?:^|\\s)${className}(?:\\s|$)`).test(fullClassName);
  }
  function isCharacterDataNode(node) {
    const t = node.nodeType;
    return t === Node.TEXT_NODE || t === Node.COMMENT_NODE || t === Node.CDATA_SECTION_NODE;
  }
  /**
   *
   * @param {Node} node
   * @return {string}
   */
  function inspectNode(node) {
    if (!node) {
      return '[No node]';
    }
    if (isCharacterDataNode(node)) {
      return `'${node.data}'`;
    }
    if (node.nodeType === 1) {
      let idAttr = node.id ? `'id=${node.id}'` : '';
      return `<${node.nodeName} ${idAttr}>[index: ${getNodeIndex(node)}, length: ${node.childNodes.length}][${node.innerHTML}]`;
    }
    return node.nodeName;
  }

  function getNodeIndex(node) {
    let i = 0;
    while( (node = node.previousSibling) ) {
      ++i;
    }
    return i;
  }
  /**
   * 获取于祖先节点最接近的子节点
   * @param {Node} node - 当前节点
   * @param {Node} node - 当前节点
   * @param {Node} ancestor - 祖先节点
   * @param {boolean} selfIsAncestor
   * @return {Node}
   */
  function getClosestAncestorIn(node, ancestor, selfIsAncestor) {
    let p, n = selfIsAncestor ? node : node.parentNode;
    while (n) {
      p = n.parentNode;
      if (p === ancestor) {
        return n;
      }
      n = p;
    }
    return null;
  }

  /**
   *
   * @param {Node} ancestor - 祖先节点
   * @param {Node} descendant - 后代节点
   * @return {boolean}
   */
  function isOrIsAncestorOf(ancestor, descendant) {
    return isAncestorOf(ancestor, descendant, true);
  }

  /**
   *
   * @param ancestor - 祖先节点
   * @param descendant - 后代节点
   * @param selfIsAncestor - 从自己开始
   */
  function isAncestorOf(ancestor, descendant, selfIsAncestor) {
    let n = selfIsAncestor ? descendant : descendant.parentNode;
    while (n) {
      if (n === ancestor) {
        return true;
      } else {
        n = n.parentNode;
      }
    }

    return false;
  }

  const rangeProto = {
    splitRangeBoundaries: function() {},
    setStartAndEnd: function() {
      const args = arguments;
      let sc = args[0], so = args[1], ec = sc, eo = so;
      switch (args.length) {
        case 3:
          ec = args[2];
          eo = so;
          break;
        case 4:
          ec = args[2];
          eo = args[3];
          break;
      }

      this.updateBoundaries(sc, so, ec, eo);
    },
    /**
     *
     * @param {Node} sc
     * @param {number} so
     * @param {Node} ec
     * @param {number} eo
     */
    updateBoundaries: function(sc, so, ec, eo) {
      /** @this {Range} */
      this.setStart(sc, so);
      this.setEnd(ec, eo);
    },
    /**
     *
     * @param {number[]} nodeTypes
     * @param {Function} filter
     */
    getNodes: function(nodeTypes, filter) {
      return getNodesInRange(this, nodeTypes, filter);
    },
    getBookMark: function() {},

    inspect: function() {
      return inspect(this);
    },
    inspectOnSelection: function() {
      return inspectOnSelection(this);
    }
  }

  extend(Range.prototype, rangeProto);

  extend(Node.prototype, {
    inspect: function(console = false) {
      const msg = inspectNode(this);
      if (console) log(msg)
      return msg;
    }
  });

  /** Highlighter 荧光笔 */
  function Highlighter() {}

  Highlighter.prototype = {

  }

  /** Tinter 着色器 */
  function Tinter(className, options) {
    this.className = className;
  }

  Tinter.prototype = {

    /**
     *
     * @param {Range} range
     */
    applyToRange: function(range) {
      log(range);
    },
    /**
     *
     * @param {Range} range
     * @return boolean
     */
    isTinterToRange: function(range) {
      if (range.collapsed || range.toString() === '') {
        return !!this.getSelfOrAncestorWithClass(range.commonAncestorContainer);
      } else {
        const textNodes = range.getNodes([3]);
      }
    },
    /**
     *
     * @param {Node} node
     * @return {null | Node}
     */
    getSelfOrAncestorWithClass: function(node) {
      while(node) {
        if (this.hasClass(node)) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    },
    /**
     *
     * @param {Node} node
     * @return boolean
     */
    hasClass: function(node) {
      return node.nodeType === 1 && hasClass(node, this.className);
    }
  }

  /**
   * RangeIterator
   * @param {Range} range
   * @constructor
   */
  function RangeIterator(range) {
    this.range = range;
    this._current = null;
    this._first = null;
    this._next = null;
    this._last = null;
    this.isSingleCharacterDataNode = null;

    if (!range.collapsed) {
      this.sc = range.startContainer;
      this.so = range.startOffset;
      this.ec = range.endContainer;
      this.eo = range.endOffset;
      const root = range.commonAncestorContainer;

      // 初始化迭代
      if (this.sc === this.ec && isCharacterDataNode(this.sc)) {
        // 文本节点 且不跨标签
        this.isSingleCharacterDataNode = true;
        this._first = this._last = this._next = this.sc;
      } else {
        this._first = this._next = (this.sc === root && !isCharacterDataNode(this.sc))
          ? root.childNodes[this.so] : getClosestAncestorIn(this.sc, root, true);

        this._last = (this.sc === root && !isCharacterDataNode(this.ec))
          ? root.childNodes[this.eo] : getClosestAncestorIn(this.ec, root, true);
      }
    }
  }
  RangeIterator.prototype = {
    /**
     * 将指针移到下一个节点, 返回当前这个节点, 直到null为止.
     * @return {null | Node}
     */
    next: function() {
      const current = this._current = this._next;
      if (current) {
        this._next = current !== this._last ? current.nextSibling : null;
      }
      return current;
    },
    /**
     * 处理当前节点.
     *
     * 如果当前节点是range首或尾边界节点的祖先元素, 返回true, 否则返回false.
     * @return {boolean}
     */
    isPartiallySelectedSubtree: function() {
      const current = this._current;
      return isNonTextPartiallySelected(current, this.range);
    },
    /**
     * 处理当前节点.
     *
     * 内部创建一个新的range对象并包裹当前节点, 在用此节点返回一个新的RangeIterator对象.
     * @return {RangeIterator}
     */
    getSubtreeIterator: function() {
      const subRange = document.createRange();
      const current = this._current;
      let sc = current, so = 0, ec = current, eo = getNodeLength(current);

      if (isOrIsAncestorOf(current, this.sc)) {
        sc = this.sc;
        so = this.so;
      }

      if (isOrIsAncestorOf(current, this.ec)) {
        ec = this.ec;
        eo = this.eo;
      }

      subRange.setStartAndEnd(sc, so, ec, eo);
      return createRangeIterator(subRange);
    }
  }

  function createRangeIterator(range) {
    return new RangeIterator(range);
  }

  function createHighlighter() {
    return new Highlighter();
  }

  function createTinter(className, options) {
    return new Tinter(className, options);
  }

  api.util = util;
  api.dom = dom;
  /**
   *
   * @param {Range} range
   * @return RangeIterator
   */
  api.createRangeIterator = createRangeIterator;
  api.createHighlighter = createHighlighter;
  api.createTinter = createTinter;
  return api;
}, window);
