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

  /** positionsToPreserve operate */

  /**
   *
   * @param {Node | HTMLElement} element
   * @param {DomPosition[]} positionsToPreserve
   * @return {ChildNode[]}
   */
  function replaceWithOwnChildrenPreservingPositions(element, positionsToPreserve) {
    return moveChildrenPreservingPositions(element, element.parentNode, element.getIndex(), true, positionsToPreserve);
  }

  function moveChildrenPreservingPositions(node, parentNode, index, isRemoveSelf, positionsToPreserve) {
    let child, children = [];

    while ((child = node.firstChild)) {
      movePreservingPositions(child, parentNode, index++, positionsToPreserve);
      children.push(child)
    }

    if (isRemoveSelf) {
      node.remove();
    }

    return children;
  }

  function movePreservingPositions(node, newParent, newIndex, positionsToPreserve) {
    if (newIndex === -1) {
      newIndex = newParent.childNodes.length;
    }

    const oldParent = node.parentNode;
    const oldIndex = node.getIndex();

    positionsToPreserve.forEach(function(position) {
      movePosition(position, oldParent, oldIndex, newParent, newIndex);
    });

    if (newIndex === newParent.childNodes.length) {
      newParent.appendChild(node);
    } else {
      newParent.insertBefore(node, newParent.childNodes[newIndex]);
    }

  }

  function movePosition(position, oldParent, oldIndex, newParent, newIndex) {
    let posNode = position.node, posOffset = position.offset;
    let newNode = posNode, newOffset = posOffset;

    if (posNode === newParent && posOffset > newIndex) {
      ++newOffset;
    }

    if (posNode === oldParent && (posOffset === oldIndex  || posOffset === oldIndex + 1)) {
      newNode = newParent;
      newOffset += newIndex - oldIndex;
    }

    if (posNode === oldParent && posOffset > oldIndex + 1) {
      --newOffset;
    }

    position.node = newNode;
    position.offset = newOffset;
  }

  /**
   *
   * @param {Text} textNode
   * @param {number} offset
   * @param {DomPosition[]} positionsToPreserve
   * @return {Text}
   */
  function splitTextPositionsPreserve(textNode, offset, positionsToPreserve) {
    const newTextNode = textNode.splitText(offset);

    positionsToPreserve && positionsToPreserve.forEach(function(position) {
      if (position.node === textNode && position.offset > offset) {
        position.node = newTextNode;
        position.offset -= offset;
      } else if (position.node === textNode.parentNode && position.offset > getNodeIndex(textNode)) {
        ++position.offset;
      }
    });

    return newTextNode
  }

  /**
   *
   * @param {Node} node
   * @param {DomPosition[]} positionsToPreserve
   */
  function removePreservingPositions(node, positionsToPreserve) {

    const oldParent = node.parentNode;
    const oldIndex = getNodeIndex(node);

    positionsToPreserve.forEach(function(position) {
      movePositionWhenRemovingNode(position, oldParent, oldIndex);
    });

    removeNode(node);
  }

  /**
   *
   * @param {DomPosition} position
   * @param {ParentNode} parentNode
   * @param {number} index
   */
  function movePositionWhenRemovingNode(position, parentNode, index) {
    if (position.node === parentNode && position.offset > index) {
      --position.offset;
    }
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
   *
   * @param {Range} range
   * @param {Text} textNode
   * @return {boolean}
   */
  function rangeSelectsAnyText(range, textNode) {
    const textNodeRange = document.createRange();
    textNodeRange.selectNodeContents(textNode);
    const intersectionRange = textNodeRange.intersection(range);
    const text = intersectionRange ? intersectionRange.toString() : '';
    return text !== '';
  }

  /**
   *
   * @param {Range} rangeA
   * @param {Range} rangeB
   * @param {boolean} touchingIsIntersection
   * @return {boolean}
   */
  function rangesIntersect(rangeA, rangeB, touchingIsIntersection) {

    const startComparison = rangeA.compareBoundaryPoints(rangeB.END_TO_START, rangeB);
    const endComparison = rangeA.compareBoundaryPoints(rangeB.START_TO_END, rangeB);
    /**
     * union
     * A.e >= B.s
     * A.s <= B.e
     */
    if (touchingIsIntersection) {
      return startComparison <= 0 && endComparison >= 0;
    }
    /**
     * intersect
     * A.e > B.s
     * A.s < B.e
     */
    return startComparison < 0 && endComparison > 0;
  }

  function createOptions(optionsParam, defaults) {
    const options = {};
    extend(options, defaults);

    if (typeof optionsParam === 'object') {
      extend(options, optionsParam);
    }

    return options;
  }

  /**
   *
   * @example str = 'c b a' sortClassName(str) -> 'a b c'
   * class排序
   * @param {string} className
   */
  function sortClassName(className) {
    return className.split(/\s+/).sort().join(' ');
  }

  /**
   * 获取元素的class
   * @param {HTMLElement} el
   * @return {string}
   */
  function getClass(el) {
    const classNameSupperted = (typeof el.className === 'string');
    return classNameSupperted ? el.className : el.getAttribute('class');
  }

  /**
   * 判断两个元素是否具有相同的class
   * @param {HTMLElement} el1
   * @param {HTMLElement} el2
   * @return {boolean}
   */
  function haveSameClasses(el1, el2) {
    return sortClassName(getClass(el1)) === sortClassName(getClass(el2));
  }

  /**
   * 两个元素是否可以进行合并.
   *
   * 具有相同的tagName.
   *
   * 具有相同的class.
   *
   * 都必须是内联元素.
   * @param {HTMLElement} el1
   * @param {HTMLElement} el2
   */
  function areElementMergeable(el1, el2) {
    return el1.tagName.toLowerCase() === el2.tagName.toLowerCase() &&
      haveSameClasses(el1, el2) &&
      ((el1.getAttribute('display') === 'inline') === (el2.getAttribute('display') === 'inline'));
  }

  /**
   * 创建一个获取着色节点相邻的可合并节点.
   *
   * forward 如果为true 获取后面的相邻节点 false获取前面的相邻节点.
   * @param {boolean} forward
   * @return {(function(node: Text, checkParentElement: boolean))|Text|null}
   */
  function createAdjacentMergeableTextNodeGetter(forward) {
    const siblingPropName = forward ? 'nextSibling' : 'previousSibling';
    const firstAndLastPropName = forward ? 'firstChild' : 'lastChild';
    /**
     * 获取着色节点相邻的可合并节点.
     *
     * 如果checkParentElement为true 那么在相邻节点没有的情况下去获取父节点的相邻元素.
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
        if (adjacentNode && adjacentNode.nodeType === 1 && areElementMergeable(textNodeParent, adjacentNode)) {
          const adjacentNodeChild = adjacentNode[firstAndLastPropName];
          if (adjacentNodeChild && adjacentNodeChild.nodeType === 3) {
            return adjacentNodeChild;
          }
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

      if (regex && !regex.test(t)) {
        return;
      }

      if (typeof filter === 'function' && !filter(node)) {
        return;
      }

      nodes.push(node);
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
   *
   * @param {string} id
   * @return {HTMLElement}
   */
  function getContainerElement(id) {
    return id ? gEBI(id) : document.body;
  }

  /**
   *
   * @param {Node} nodeA
   * @param {number} offsetA
   * @param {Node} nodeB
   * @param {number} offsetB
   * @return {number}
   */
  function comparePoints(nodeA, offsetA, nodeB, offsetB) {
    let nodeC, root, childA, childB;
    if (nodeA === nodeB) {
      // case 1: nodes same
      return offsetA === offsetB ? 0 : offsetA < offsetB ? -1 : 1;
    } else if ((nodeC = getClosestAncestorIn(nodeA, nodeB, true))) {
      // case 2: container B is the ancestor node of A
      return nodeC.getIndex() < offsetB ? -1 : 1;
    } else if ((nodeC = getClosestAncestorIn(nodeB, nodeA, true))) {
      // case 3: container A is the ancestor node of B
      return nodeC.getIndex() >= offsetA ? -1 : 1;
    } else {
      if (!(root = getCommonAncestor(nodeA, nodeB))) {
        // nodes is not same
        throw new Error('comparePoints error: nodes have no common ancestor')
      }
      // case 4: containers are siblings or descendants of siblings
      childA = (nodeA === root) ? root : getClosestAncestorIn(nodeA, root, true);
      childB = (nodeB === root) ? root : getClosestAncestorIn(nodeB, root, true);

      return childA.compareDocumentPosition(childB) & document.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

    }
  }

  function gEBI(id) {
    return document.getElementById(id);
  }

  /**
   * @param {Object} attrObj
   * @param {HTMLElement} el
   */
  function copyAttributesToElement(attrObj, el) {
    each(attrObj, function(attrName, attrValue) {
      if (attrObj.hasOwnProperty(attrName) && !/^class(?:Name)?$/i.test(attrName)) {
        el.setAttribute(attrName, attrValue);
      }
    });
  }

  /**
   *
   * @param {Node} node
   * @param {ParentNode} newParent
   * @param {number} newIndex
   * @param {boolean} isRemoveSelf
   * @return {ChildNode[]}
   */
  function moveChildren(node, newParent, newIndex, isRemoveSelf) {
    let child, children = [];
    while ((child = node.firstChild)) {
      moveNode(child, newParent, newIndex++);
      children.push(child);
    }

    if (isRemoveSelf) {
      removeNode(node);
    }

    return children;
  }

  /**
   *
   * @param {Node} node
   * @param {ParentNode} parentNode
   * @param {number} index
   */
  function moveNode(node, parentNode, index) {

    if (index === -1) {
      index = parentNode.childNodes.length;
    }

    if (index === parentNode.childNodes.length) {
      parentNode.appendChild(node);
    } else {
      parentNode.insertBefore(node, parentNode.childNodes[index]);
    }

    return node;
  }

  /**
   *
   * @param {Node} node
   */
  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

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
   * @param {Node} nodeA
   * @param {Node} nodeB
   * @return {Node} CommonAncestor
   */
  function getCommonAncestor(nodeA, nodeB) {
    let ancestors = [], n, index;
    for (n = nodeA; n; n = n.parentNode) {
      ancestors.push(n);
    }

    for (n = nodeB; n; n = n.parentNode) {
      if ((index = ancestors.indexOf(n)) !== -1) {
        return ancestors[index];
      }
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
    /**
     *
     * @param {DomPosition[]} positionsToPreserve
     */
    splitBoundariesPreservingPositions: function(positionsToPreserve) {
      /** @this {Range} */
      let sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset, textNode;
      const startSameEnd = (sc === ec);
      if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
        splitTextPositionsPreserve(ec, eo, positionsToPreserve);
      }

      if (isCharacterDataNode(sc) && so > 0 && so < sc.length) {
        sc = splitTextPositionsPreserve(sc, so, positionsToPreserve);
        if (startSameEnd) {
          eo -= so;
          ec = sc;
        } else if (ec === sc.parentNode && eo < getNodeIndex(ec)) {
          eo++;
        }
        so = 0;
      }
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
     * @param {Function} [filter]
     */
    getNodes: function(nodeTypes, filter) {
      return getNodesInRange(this, nodeTypes, filter);
    },

    /** @typedef {{ start: number, end: number, containerNode: Node | Document }} BookMark */

    /**
     *
     * @param {Node} [containerNode]
     * @return {BookMark}
     */
    getBookMark: function(containerNode) {
      containerNode = containerNode || document;
      const allSelectRange = document.createRange();
      allSelectRange.selectNodeContents(containerNode);
      const range = this.intersection(allSelectRange);
      let start = 0, end = 0;
      if (range) {
        allSelectRange.setEnd(range.startContainer, range.startOffset);
        start = allSelectRange.toString().length;
        end = start + range.toString().length;
      }
      return {
        start,
        end,
        containerNode
      }
    },

    /**
     *
     * @param {BookMark} bookmark
     */
    moveToBookMark: function(bookmark) {
      const containerNode = bookmark.containerNode;
      this.setStart(containerNode, 0);
      this.collapse(true); // 折叠到开头
      let foundEnd = false, foundStart = false, nodeStack = [containerNode], node;

      let nextCharIndex, charIndex = 0;

      while (!foundEnd && (node = nodeStack.pop())) {
        if (node.nodeType === Node.TEXT_NODE) {
          nextCharIndex = charIndex + node.length;
          if (!foundStart && bookmark.start >= charIndex && bookmark.start <= nextCharIndex) {
            this.setStart(node, bookmark.start - charIndex);
            foundStart = true;
          }

          if (foundStart && bookmark.end >= charIndex && bookmark.end <= nextCharIndex) {
            this.setEnd(node, bookmark.end - charIndex);
            foundEnd = true;
          }

          charIndex = nextCharIndex;
        } else {
          let childNodes = node.childNodes, i = childNodes.length;
          while (i--) {
            nodeStack.push(childNodes[i]);
          }
        }
      }
    },

    inspect: function() {
      return inspect(this);
    },
    inspectOnSelection: function() {
      return inspectOnSelection(this);
    },
    isRangeValid: function() {
      /** @this {Range} */
      return isRangeValid(this);
    },
    /**
     *
     * @param {Range} sourceRange
     * @return {Range | null}
     */
    intersection: function(sourceRange) {
      if (rangesIntersect(this, sourceRange, false)) {
        const intersectionRange = this.cloneRange();
        if (intersectionRange.compareBoundaryPoints(sourceRange.START_TO_START,sourceRange) === -1) {
          intersectionRange.setStart(sourceRange.startContainer, sourceRange.startOffset);
        }

        if (intersectionRange.compareBoundaryPoints(sourceRange.END_TO_END, sourceRange) === 1) {
          intersectionRange.setEnd(sourceRange.endContainer, sourceRange.endOffset);
        }
        return intersectionRange;
      }

      return null;
    },
    /**
     * @return {Text[]|Node[]}
     */
    getEffectiveTextNodes: function() {
      const range = this;
      const textNodes = this.getNodes([ Node.TEXT_NODE ]);

      // Remove non-intersecting text nodes from the start of the range
      var start = 0, node;
      while ( (node = textNodes[start]) && !rangeSelectsAnyText(range, node) ) {
        ++start;
      }

      // Remove non-intersecting text nodes from the start of the range
      var end = textNodes.length - 1;
      while ( (node = textNodes[end]) && !rangeSelectsAnyText(range, node) ) {
        --end;
      }
      return textNodes.slice(start, end + 1);
    },

    /**
     *
     * @param {Range} sourceRange
     * @return {Range | null}
     */
    union: function(sourceRange) {
      if (rangesIntersect(this, sourceRange, true)) {
        const unionRange = this.cloneRange();
        if (unionRange.compareBoundaryPoints(sourceRange.START_TO_START, sourceRange) === 1) {
          unionRange.setStart(sourceRange.startContainer, sourceRange.startOffset);
        }

        if (unionRange.compareBoundaryPoints(sourceRange.END_TO_END, sourceRange) === -1) {
          unionRange.setEnd(sourceRange.endContainer, sourceRange.endOffset);
        }

        return unionRange;
      }

      return null;
    },

  }

  const nodeProto = {
    inspect: function() {
      return inspectNode(this);
    },
    insertAfter: function(insertNode, precedingNode) {
      insertAfter(this, insertNode, precedingNode);
    },
    getIndex: function() {
      return getNodeIndex(this);
    },
    remove: function() {
      return removeNode(this);
    }
  }

  const selProto = {
    /** @lends Selection.prototype */
    highlight: function(className, options) {

    },

    eachRange: function(func) {
      for (let i = 0; i < this.rangeCount; ++i) {
        if (func(this.getRangeAt(i)) === false) {
          return false;
        }
      }
      return true;
    },
    /**
     *
     * @return {Range[]}
     */
    getAllRanges: function() {
      const ranges = [];
      this.eachRange(function(range) {
        ranges.push(range);
      });
      return ranges;
    },
    /** @this {Selection} */
    isBackward: function() {
      let backward = false;
      if (this.anchorNode && comparePoints(this.anchorNode, this.anchorOffset, this.focusNode, this.focusOffset) === 1) {
        backward = true;
      }
      return backward;
    }
  }

  extend(Range.prototype, rangeProto);

  extend(Node.prototype, nodeProto);

  extend(Selection.prototype, selProto);

  if (!Text.prototype.splitText) {
    Text.prototype.splitText = function(offset) {
      const newTextNode = this.cloneNode();
      newTextNode.deleteData(0, offset);
      this.deleteData(offset, this.length);
      this.parentNode.insertAfter(newTextNode, this);
      /** @type {Text} */
      return newTextNode;
    }
  }

  /**
   *
   * @param {Range} range
   * @param {Node} containerNode
   * @return {CharacterRange}
   *
   */
  function rangeToCharacterRange(range, containerNode) {
    const bookmark = range.getBookMark(containerNode);
    return new CharacterRange(bookmark.start, bookmark.end);
  }

  /**
   *
   * @param {CharacterRange} characterRange
   * @param {Node} containerNode
   * @return {Range}
   */
  function characterRangeToRange(characterRange, containerNode) {
    const range = document.createRange();
    range.moveToBookMark({
      start: characterRange.start,
      end: characterRange.end,
      containerNode: containerNode
    });
    return range;
  }

  /**
   * @typedef {{ characterRange: CharacterRange, backward: boolean }} SerializeSelection
   */

  /**
   *
   * @param {Selection} selection
   * @param {Node} containerNode
   * @return SerializeSelection[]
   */
  function serializeSelection(selection, containerNode) {
    const ranges = selection.getAllRanges(), rangeCount = ranges.length;
    const rangeInfos = [];

    const backward = rangeCount === 1 && selection.isBackward();
    for (let i = 0; i < ranges.length; ++i) {
      rangeInfos[i] = {
        characterRange: rangeToCharacterRange(ranges[i], containerNode),
        backward: backward
      }
    }

    return rangeInfos;
  }

  /**
   *
   * @param {Selection} selection
   * @param {SerializeSelection[]} savedSelection
   * @param {Node} containerNode
   */
  function restoreSelection(selection, savedSelection, containerNode) {
    selection.removeAllRanges();
    for (let i = 0, len = savedSelection.length, range, rangeInfo, characterRange; i < len; ++i) {
      rangeInfo = savedSelection[i];
      characterRange = rangeInfo.characterRange;
      range = characterRangeToRange(rangeInfo.characterRange, containerNode);
      selection.addRange(range);
    }
  }

  /**
   * @typedef {{ containerElementId?: string; selection?: Selection; }} HighlightOptions
   */

  /** Highlighter 荧光笔 */
  function Highlighter() {
    this.tinters = [];
    /**
     * @name Highlighter#highlights
     * @type {Highlight[]}
     */
    this.highlights = [];
  }

  Highlighter.prototype = {
    /**
     *
     * @param {Tinter} tinter
     */
    addTinter: function(tinter) {
      this.tinters[tinter.className] = tinter;
    },
    /**
     *
     * @param {string} className
     * @param {HighlightOptions} options
     * @return {Highlight[]}
     */
    highlightSelection: function(className, options) {
      const tinter = this.tinters[className];
      options = createOptions(options, {});
      const containerElementId = options.containerElementId;
      const containerElement = getContainerElement(containerElementId);

      const selection = options.selection || api.getSelection();

      if (!tinter && className) {
        throw new Error(`highlightSelection error: No tinter found for class "${className}"`);
      }

      const serializedSelection = serializeSelection(selection, containerElement);

      const characterRanges = [];
      serializedSelection.forEach(function(serialize) {
        characterRanges.push(serialize.characterRange);
      });

      const highlights = this.highlightCharacterRanges(className, characterRanges, options);

      restoreSelection(selection, serializedSelection, containerElement);

      return highlights;
    },

    /**
     *
     * @param {string} className
     * @param {CharacterRange[]} characterRanges
     * @param {HighlightOptions} options
     * @return {Highlight[]}
     */
    highlightCharacterRanges: function(className, characterRanges, options) {
      const tinter = this.tinters[className];
      const highlighter = this;
      let highlights = this.highlights;

      options = createOptions(options, {});
      const containerElementId = options.containerElementId;
      const containerElement = getContainerElement(containerElementId);

      if (!tinter && className) {
        throw new Error(`highlightCharacterRanges error: No tinter found for class "${className}"`);
      }

      let highlightsToKeep;
      // forEach current all characterRange
      characterRanges.forEach(function(characterRange) {
        highlightsToKeep = [];
        if (characterRange.start === characterRange.end) {
          // Igone empty characterRange
          return false;
        }

        // characterRange diff highlights.item
        highlights.forEach(function(highlight, index) {
          let removeHighlight = false;
          let highlightCharacterRange = highlight.characterRange;

          if (highlightCharacterRange.intersects(characterRange) || highlightCharacterRange.isContiguousWith(characterRange)) {
            characterRange = highlightCharacterRange.union(characterRange);
            removeHighlight = true;
          }

          if (removeHighlight) {
            highlights[index] = new Highlight(tinter, highlightCharacterRange.union(characterRange), containerElementId);
          } else {
            highlightsToKeep.push(highlight);
          }
        });

        highlightsToKeep.push(new Highlight(tinter, characterRange, containerElementId));

        highlighter.highlights = highlights = highlightsToKeep;
      });

      const newHighlights = [];
      highlights.forEach(function(highlight) {
        if (!highlight.applied) {
          newHighlights.push(highlight.apply());
        }
      });

      return newHighlights;
    },
    unhighlightSelection: function() {

    }
  }

  /**
   * Highlight 高亮
   * @param {Tinter} tinter
   * @param {CharacterRange} characterRange
   * @param {string} containerElementId
   * @constructor
   */
  function Highlight(tinter, characterRange, containerElementId) {
    this.tinter = tinter;
    this.characterRange = characterRange;
    this.containerElementId = containerElementId;
    this.applied = false;
  }

  Highlight.prototype = {
    apply: function() {
      this.tinter.applyToRange(this.getRange());
      this.applied = true;
      return this;
    },
    unapply: function() {
      this.tinter.undoToRange(this.getRange());
      this.applied = false;
      return this;
    },
    getRange: function() {
      return characterRangeToRange(this.characterRange, this.getContainerElement());
    },
    getContainerElement: function() {
      return getContainerElement(this.containerElementId);
    },
    toString: function() {
      return this.getRange().toString();
    }
  }

  /** CharacterRange 字符范围 */
  function CharacterRange(start, end) {
    this.start = start;
    this.end = end;
  }

  CharacterRange.prototype = {
    /**
     *
     * @param {CharacterRange} otherCharRange
     * @return {boolean}
     */
    intersects: function(otherCharRange) {
      return this.start < otherCharRange.end && this.end > otherCharRange.start;
    },
    /**
     *
     * @param {CharacterRange} otherCharRange
     * @return {boolean}
     */
    isContiguousWith: function(otherCharRange) {
      return this.start === otherCharRange.end || this.end === otherCharRange.start
    },
    /**
     *
     * @param {CharacterRange} otherCharRange
     * @return {CharacterRange}
     *
     */
    union: function(otherCharRange) {
      return new CharacterRange(Math.min(this.start, otherCharRange.start), Math.max(this.end, otherCharRange.end));
    },
    /**
     *
     * @param {CharacterRange} otherCharRange
     * @return {CharacterRange}
     */
    intersection: function(otherCharRange) {
      return new CharacterRange(Math.max(this.start, otherCharRange.start), Math.min(this.end, otherCharRange.end));
    }
  }

  CharacterRange.fromCharacterRange = function(charRange) {
    return new CharacterRange(charRange.start, charRange.end);
  }

  function each(obj, func) {
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        if(func(i, obj[i]) === false) {
          return false;
        }
      }
    }

    return true;
  }

  const optionProperties = ['elementTagName', 'elementProperties', 'elementAttributes', 'removeEmptyElements'];

  /** Tinter 着色器 */
  function Tinter(className, options) {
    const tinter = this, elementAttributes = options.elementAttributes || {};
    tinter.className = className;
    if (typeof options === 'object' && options !== null) {
      if (typeof options.elementTagName === 'string') {
        options.elementTagName = options.elementTagName.toLowerCase();
      }

      optionProperties.forEach(function(propName) {
        if (options.hasOwnProperty(propName)) {
          tinter[propName] = options[propName];
        }
      });
    }

    each(elementAttributes, function(attrName, attrValue) {
      // 确保每个值都是string
      elementAttributes[attrName] = '' + attrValue;
    });

  }

  Tinter.prototype = {
    elementTagName: 'span',
    elementProperties: {},
    elementAttributes: {},
    removeEmptyElements: true,
    /**
     *
     * @param {HTMLElement} el
     */
    copyAttributesToElement: function(el) {
      copyAttributesToElement(this.elementAttributes, el);
    },
    /**
     *
     * @param {ParentNode} parentNode
     * @return {HTMLElement}
     */
    createWrapperContainer: function(parentNode) {
      const el = document.createElement(this.elementTagName);

      this.copyAttributesToElement(el);
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
    toggleRange: function(range) {
      if (this.isTinterToRange(range)) {
        this.undoToRange(range);
      } else {
        this.applyToRange(range);
      }
    },

    /**
     *
     * @param {Range} range
     * @param {Range[]} [rangesToPreserve]
     */
    undoToRange: function(range, rangesToPreserve) {
      const tinter = this;
      rangesToPreserve = rangesToPreserve || [];
      const positionsToPreserve = this.getRangeBoundaries(rangesToPreserve);

      range.splitBoundariesPreservingPositions(positionsToPreserve);

      if (this.removeEmptyElements) {
        tinter.removeEmptyContainers(range, positionsToPreserve);
      }

      const textNodes = range.getNodes([Node.TEXT_NODE]);

      textNodes.forEach(function(textNode) {
        const ancestorWithClass = tinter.getSelfOrAncestorWithClass(textNode);
        if (ancestorWithClass) {
          tinter.undoToAncestor(ancestorWithClass, positionsToPreserve);
        }
      });

      // tinter.infectApply(textNodes, range, true, positionsToPreserve);

      updateRangesFromBoundaries(rangesToPreserve, positionsToPreserve);
    },

    /**
     *
     * @param {Node} ancestorWithClass
     * @param {DomPosition[]} positionsToPreserve
     */
    undoToAncestor: function(ancestorWithClass, positionsToPreserve) {
      if (this.isRemovable(ancestorWithClass)) {
        replaceWithOwnChildrenPreservingPositions(ancestorWithClass, positionsToPreserve);
      }
    },

    isRemovable: function() {
      return true;
    },

    /**
     *
     * @param {Range} range
     * @param {Range[]} [rangesToPreserve]
     */
    applyToRange: function(range, rangesToPreserve) {
      const tinter = this;
      rangesToPreserve = rangesToPreserve || [];
      const positionsToPreserve = getRangeBoundaries(rangesToPreserve);
      // 分割边界
      range.splitBoundariesPreservingPositions(positionsToPreserve);

      if (this.removeEmptyElements) {
        tinter.removeEmptyContainers(range, positionsToPreserve);
      }

      // 获取范围中包含的所有文本节点
      const textNodes = range.getEffectiveTextNodes();

      if (textNodes.length) {
        textNodes.forEach(function(textNode) {
          if (!tinter.getSelfOrAncestorWithClass(textNode)) {
            tinter.applyToTextNode(textNode);
          }
        });

        const lastTextNode = textNodes[textNodes.length - 1];
        range.setStartAndEnd(textNodes[0], 0, lastTextNode, lastTextNode.length);

        tinter.infectApply(textNodes, range, false, positionsToPreserve);

        // 从保留的边界位置更新范围
        updateRangesFromBoundaries(rangesToPreserve, positionsToPreserve);
      }
    },

    /**
     *
     * @param {Range[]} ranges
     */
    undoToRanges: function(ranges) {
      let i = ranges.length;
      while(i--) {
        this.undoToRange(ranges[i], ranges);
      }
    },

    /**
     *
     * @param {Range[]} ranges
     */
    applyToRanges: function(ranges) {
      let i = ranges.length;
      while(i--) {
        this.applyToRange(ranges[i], ranges);
      }
    },
    /**
     *
     * @param {Range} range
     * @param {DomPosition[]} positionsToPreserve
     */
    removeEmptyContainers: function(range, positionsToPreserve) {
      const tinter = this;
      const nodesToRemove  = range.getNodes([Node.ELEMENT_NODE], function(el) {
        return tinter.isEmptyContainer(el);
      });

      const rangesToPreserve = [range];
      positionsToPreserve = positionsToPreserve.length ? positionsToPreserve : getRangeBoundaries(rangesToPreserve);

      nodesToRemove.forEach(function(node) {
        removePreservingPositions(node, positionsToPreserve);
      });

      updateRangesFromBoundaries(rangesToPreserve, positionsToPreserve);

    },

    /**
     *
     * @param {HTMLElement|ChildNode} el
     * @return {boolean}
     */
    isEmptyContainer: function(el) {
      const childNodeLen = el.childNodes.length;
      return el.nodeType === 1
        && (childNodeLen === 0 || (childNodeLen === 1 && this.isEmptyContainer(el.firstChild)));
    },

    /**
     *
     * @param {Text[]} textNodes
     * @param {Range} range
     * @param {boolean} isUndo
     * @param {DomPosition[]} positionsToPreserve
     */
    infectApply: function(textNodes, range, isUndo, positionsToPreserve) {
      const firstTextNode = textNodes[0], lastTextNode = textNodes[textNodes.length - 1];
      let currentMerge = null, merges = [];

      let rangeStartNode = firstTextNode,
        rangeEndNode = lastTextNode,
        rangeStartOffset = 0,
        rangeEndOffset = lastTextNode.length;

      textNodes.forEach(function(textNode) {
        // 检查每个必需的合并，并为每个合并创建一个merge对象
        const precedingNode = getPreviousMergeableTextNode(textNode, !isUndo);
        if (precedingNode) {
          if (!currentMerge) {
            currentMerge = new Merge(precedingNode);
            merges.push(currentMerge);
          }
          currentMerge.textNodes.push(textNode);
          if (textNode === firstTextNode) {
            rangeStartNode = currentMerge.textNodes[0];
            rangeStartOffset = rangeStartNode.length;
          }

          if (textNode === lastTextNode) {
            rangeEndNode = currentMerge.textNodes[0];
            rangeEndOffset = currentMerge.getLength();
          }

        } else {
          currentMerge = null;
        }
      });

      // 范围后面的节点是否可合并
      const nextTextNode = getNextMergeableTextNode(lastTextNode, !isUndo);
      if (nextTextNode) {
        if (!currentMerge) {
          currentMerge = new Merge(lastTextNode);
          merges.push(currentMerge);
        }
        currentMerge.textNodes.push(nextTextNode);
      }

      if (merges.length) {
        merges.forEach(function(merge) {
          merge.doMerge(positionsToPreserve);
        });

        range.setStartAndEnd(rangeStartNode, rangeStartOffset, rangeEndNode, rangeEndOffset);
      }
    },

    /**
     *
     * @param {Range} range
     * @return {boolean}
     */
    isTinterToRange: function(range) {
      if (range.collapsed || range.toString() === '') {
        return !!this.getSelfOrAncestorWithClass(range.commonAncestorContainer);
      } else {
        const textNodes = range.getEffectiveTextNodes();
        for (let i = 0, textNode; i < textNodes.length; ++i) {
          textNode = textNodes[i];
          if (!this.getSelfOrAncestorWithClass(textNode)) {
            return false;
          }
        }
      }

      return true;
    },

    isTinterToRanges: function(ranges) {
      let i = ranges.length;
      while(i--) {
        if (!this.isTinterToRange(ranges[i])) {
          return false;
        }
      }

      return true;
    },

    undoToSelection: function() {
      const sel = api.getSelection();
      this.undoToRanges(sel.getAllRanges());
    },

    applyToSelection: function() {
      const sel = api.getSelection();
      this.applyToRanges(sel.getAllRanges());
    },

    /**
     * @return {boolean}
     */
    isTinterToSelection: function() {
      const sel = api.getSelection();
      return this.isTinterToRanges(sel.getAllRanges())
    },

    toggleSelection: function() {
      if (this.isTinterToSelection()) {
        this.undoToSelection();
      } else {
        this.applyToSelection();
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
    },
    /**
     *
     * @param {Range[]} ranges
     * @return {DomPosition[]}
     */
    getRangeBoundaries: function(ranges) {
      ranges = ranges || [];
      return getRangeBoundaries(ranges);
    }
  }

  /**
   *
   * @param {Range[]} ranges
   * @param {DomPosition[]} positionsToPreserve
   */
  function updateRangesFromBoundaries(ranges, positionsToPreserve) {
    for (let i = 0, start, end, range; (range = ranges[i]); ++i) {
      start = positionsToPreserve[i * 2];
      end = positionsToPreserve[i * 2 + 1];
      range.setStartAndEnd(start.node, start.offset, end.node, end.offset);
    }
  }

  /**
   *
   * @param {Range[]} ranges
   * @return {DomPosition[]}
   */
  function getRangeBoundaries(ranges) {
    let position = [], i, range;
    for (i = 0; (range = ranges[i++]);) {
      position.push(
        new DomPosition(range.startContainer, range.startOffset),
        new DomPosition(range.endContainer, range.endOffset)
      )
    }

    return position;
  }

  /**
   *
   * @param {Node|Text} node
   * @param {number} offset
   * @constructor
   */
  function DomPosition(node, offset) {
    this.node = node;
    this.offset = offset;
  }

  /**
   * Merge
   * @param {Node | Text} firstNode;
   * @constructor
   */
  function Merge(firstNode) {
    const isElement = (firstNode.nodeType === 1);
    /**
     * @name Merge#textNodes
     * @type {Text[]}
     */
    this.textNodes = [];
    this.firstTextNode = isElement ? firstNode.lastChild : firstNode;
    if (this.firstTextNode) {
      this.textNodes[0] = this.firstTextNode;
    }
  }
  /** @lends {Merge} */
  Merge.prototype = {
    /**
     *
     * @param {DomPosition[]} positionsToPreserve
     * @return {string}
     */
    doMerge: function(positionsToPreserve) {
      let firstTextNode = this.textNodes[0], firstTextNodeIndex = firstTextNode.getIndex(), combinedTextLength = 0, textParts = [];
      this.textNodes.forEach(function(textNode, i) {
        if (i > 0) {
          let parentNode = textNode.parentNode, oldParentNode;
          removeNode(textNode)
          if (!parentNode.hasChildNodes()) {
            oldParentNode = parentNode.parentNode;
            removeNode(parentNode);
          }
          positionsToPreserve && positionsToPreserve.forEach(function(position) {
            if (textNode === position.node) {
              position.node = firstTextNode;
              position.offset += combinedTextLength;
            } else if (oldParentNode === position.node && position.offset > firstTextNodeIndex) {
              --position.offset;
            }
          });
        }
        textParts[i] = textNode.data;
        combinedTextLength += textNode.data.length;
      });

      firstTextNode.data = textParts.join('');

      return firstTextNode.data;
    },
    getLength: function() {
      let i = this.textNodes.length, len = 0;
      while(i--) {
        len += this.textNodes[i].length;
      }

      return len;
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

  function createMerge(firstNode) {
    return new Merge(firstNode);
  }

  function getSelection() {
    return window.getSelection();
  }

  extend(util, {
    rangesIntersect: rangesIntersect
  });

  extend(dom, {
    getCommonAncestor: getCommonAncestor,
    getClosestAncestorIn: getClosestAncestorIn,
    getNodeIndex: getNodeIndex,
    removeNode: removeNode,
    moveChildren: moveChildren,
    moveNode: moveNode
  });

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
  api.createMerge = createMerge;
  api.getSelection = getSelection;

  return api;
}, window);
