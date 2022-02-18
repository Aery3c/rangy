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

  function log() {
    console.log(...arguments);
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
        if (deep && o !== null && typeof o == 'object' && p !== null && typeof p == 'object') {
          extend(o, p, true);
        }
        obj[i] = p;
      }
    }
    if (props.hasOwnProperty('toString')) {
      obj.toString = props.toString;
    }
    return obj;
  }

  /** util */
  const util = {}

  /**
   * 创建一个获取着色元素相邻的可合并节点
   *
   * forward 如果为true 获取后面的相邻节点 false获取前面的相邻节点
   * @param {boolean} forward
   * @return {(function(node: Text, checkParentElement: boolean))|Text|null}
   */
  function createAdjacentMergeableTextNodeGetter(forward) {
    const siblingPropName = forward ? 'nextSibling' : 'previousSibling';
    /**
     * 获取文本节点相邻的文本节点.
     *
     * 如果checkParentElement为true 那么在相邻节点没有的情况下去获取父节点的相邻元素
     * @return {Text|null}
     */
    return function(textNode, checkParentElement) {
      let adjacentNode = textNode[siblingPropName], textNodeParent
      if (adjacentNode) {
        if (adjacentNode.nodeType === Node.TEXT_NODE) {
          return adjacentNode;
        }
      } else if (checkParentElement) {
        textNodeParent = textNode.parentNode;
        adjacentNode = textNodeParent[siblingPropName];
        if (adjacentNode && adjacentNode.nodeType === 1) {
          console.log(adjacentNode);
        }
      }
      return null
    }
  }

  const getPreviousMergeableTextNode = createAdjacentMergeableTextNodeGetter(false),
    getNextMergeableTextNode = createAdjacentMergeableTextNodeGetter(true);

  /**
   *
   * @param {string} str
   * @return {string}
   */
  function ellipsis(str) {
    let first, last;
    if (str.length > 25) {
      first = str.slice(0, 10);
      last = str.slice(str.length - 10);
      str = `${first}......${last}`;
    }
    return str;
  }

  /**
   *
   * @param {Range} range
   */
  function assertRangeValid(range) {
    if(!range.isRangeValid()) {
      throw new Error(`Range error: This is not a healthy range, This usually happens after dom changes Range: ${range.inspect()}`);
    }
  }

  /**
   * 在视窗中测试range
   *
   * 将range添加到Selection中,
   * @param {Range} range
   */
  function inspectOnSelection(range) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      sel.removeAllRanges();
    }
    sel.addRange(range);
  }

  /**
   *
   * @param {Node} node
   * @param {number} offset
   * @return
   */
  function isValidOffset(node, offset) {
    return offset <= (isCharacterDataNode(node) ? node.length : node.childNodes.length);
  }

  /**
   * 这是否是一个健康的range
   * @param {Range} range
   * @return {boolean}
   */
  function isRangeValid(range) {
    return (!!range.startContainer && !!range.startContainer) &&
      (isValidOffset(range.startContainer, range.startOffset) && isValidOffset(range.endContainer, range.endOffset));
  }
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
      const t = node.nodeType;

      if (regex && regex.test(t)) {
        nodes.push(node);
      }
    });

    return nodes;
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
    return `[${range.commonAncestorContainer.inspect()}]` +
      `(${range.startContainer.inspect()}: ${range.startOffset},${range.endContainer.inspect()}: ${range.endOffset})`;
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
   * 如果两个HTMLElment具有相同的属性key, class除外,
   * @param {HTMLElement} el1
   * @param {HTMLElement} el2
   * @return {boolean}
   */
  function elementsHaveSameNonClassAttributes(el1, el2) {
    if (el1.attributes.length !== el2.attributes.length) return false;
    for (let i = 0, len = el1.attributes.length, attr1, attr2, name; i < len; ++i) {
      attr1 = el1.attributes[i];
      name = attr1.name;
      if (name !== 'class') {
        attr2 = el2.attributes.getNamedItem(name);
        if ((attr1 === null) !== (attr2 === null)) return false;
        if (attr1.specified != attr2.specified) return false;
      }
    }
    return true;
  }

  /**
   *
   * @param {Node} parentNode
   * @param {Node} insertNode
   * @param {Node} precedingNode
   * @return {insertNode}
   */
  function insertAfter(parentNode, insertNode, precedingNode) {
    const nextNode = precedingNode.nextSibling;
    if (nextNode) {
      parentNode.insertBefore(insertNode, nextNode);
    } else {
      parentNode.appendChild(insertNode);
    }
  }

  /**
   *
   * @param {number} offset
   * @return {Text}
   */
  function splitText(offset) {
    /** @type {Text} */
    const newTextNode = this.cloneNode();
    newTextNode.deleteData(0, offset);
    this.deleteData(offset, this.length);
    this.parentNode.insertAfter(newTextNode, this);
    return newTextNode;
  }

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
   * @param {HTMLElement} el
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

  /**
   *
   * @param {HTMLElement} el
   * @param {string} className
   */
  function addClass(el, className) {
    if (typeof el.classList === 'object') {
      el.classList.add(className);
    } else {
      const classNameSupprted = (typeof el.className === 'string');
      let elClass = classNameSupprted ? el.className : el.getAttribute('class');
      if (elClass) {
        elClass += (' ' + className);
      } else {
        elClass = className;
      }

      if (classNameSupprted) {
        el.className = elClass;
      } else {
        el.setAttribute('class', elClass);
      }
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
      return `<${node.nodeName} ${idAttr}>[index: ${getNodeIndex(node)}, length: ${node.childNodes.length}][${ellipsis(node.innerHTML)}]`;
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
    /** @lends Range.prototype */
    splitRangeBoundaries: function() {
      /** @this {Range} */
      let sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset, textNode;
      const startSameEnd = (sc === ec);
      if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
        ec.splitText(eo);
      }

      if (isCharacterDataNode(sc) && so > 0 && so < sc.length) {
        sc = sc.splitText(so);
        if (startSameEnd) {
          eo -= so;
          ec = sc;
        } else if (ec === sc.parentNode && eo < getNodeIndex(ec)) {
          eo++;
        }
      }
      so = 0;
      this.setStartAndEnd(sc, so, ec, eo);
      assertRangeValid(this);
    },
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
    },
    isRangeValid: function() {
      /** @this {Range} */
      return isRangeValid(this);
    }
  }

  const nodeProto = {
    inspect: function() {
      return inspectNode(this);
    },
    insertAfter: function(insertNode, precedingNode) {
      insertAfter(this, insertNode, precedingNode);
    }
  }

  extend(Range.prototype, rangeProto);

  extend(Node.prototype, nodeProto);

  if (!Text.prototype.splitText) {
    /**
     * @override
     */
    Text.prototype.splitText = splitText
  }

  /** Highlighter 荧光笔 */
  function Highlighter() {}

  Highlighter.prototype = {

  }

  /** Tinter 着色器 */
  function Tinter(className, options) {
    this.className = className;
  }

  Tinter.prototype = {
    elementTagName: 'span',
    /**
     *
     * @param {ParentNode} parentNode
     * @return {HTMLElement}
     */
    createWrapperContainer: function(parentNode) {
      const el = document.createElement(this.elementTagName);
      addClass(el, this.className);
      return el;
    },
    /**
     *
     * @param {Text} textNode
     */
    applyToTextNode: function(textNode) {
      const textNodeParent = textNode.parentNode;
      if (textNodeParent) {
        const el = this.createWrapperContainer(textNodeParent);
        textNodeParent.insertBefore(el, textNode);
        el.appendChild(textNode);
      }
    },

    /**
     *
     * @param {Range} range
     */
    applyToRange: function(range) {
      const tinter = this;
      // 分割边界
      range.splitRangeBoundaries();

      // 获取范围中包含的所有文本节点
      const textNodes = range.getNodes([Node.TEXT_NODE]);

      if (textNodes.length) {
        textNodes.forEach(function(textNode) {
          if (!tinter.getSelfOrAncestorWithClass(textNode)) {
            tinter.applyToTextNode(textNode);
          }
        });

        const lastTextNode = textNodes[textNodes.length - 1];
        range.setStartAndEnd(textNodes[0], 0, lastTextNode, lastTextNode.length);

        tinter.postApply(textNodes, range, false);
      }
    },

    /**
     * 如果range左右边界被着色, 那么吸收他们
     * @param {Text[]} textNodes
     * @param {Range} range
     * @param {boolean} isUndo
     */
    postApply: function(textNodes, range, isUndo) {
      if (textNodes.length) {
        const firstTextNode = textNodes[0], lastTextNode = textNodes[textNodes.length - 1];
        const precedingNode = getPreviousMergeableTextNode(firstTextNode, !isUndo);
      }
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
        const textNodes = range.getNodes([Node.TEXT_NODE]);
        console.log(textNodes);
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
