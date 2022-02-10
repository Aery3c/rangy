'use strict';

(function(factory, root) {
  if (typeof define == 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof module != 'undefined' && typeof exports == 'object') {
    // Node/CommonJS style
    module.exports = factory();
  } else {
    // No AMD or CommonJS support so we place Rangy in (probably) the global variable
    root.dom = factory();
  }
})(function() {
  /**
   *
   * @param {Node} node
   * @param {Node} ancestor
   * @param {boolean} selfIsAncestor
   * @return {boolean | null}
   */
  function getClosestAncestorIn(node, ancestor, selfIsAncestor) {
    var p, n = selfIsAncestor ? node : node.parentNode;
    while (n) {
      p = n.parentNode;
      if (p == ancestor) {
        return n;
      }
      n = p;
    }

    return null;
  }

  /**
   *
   * @param {Node} node
   * @param {number} index
   * @returns {Node} - newNode
   */
  function splitDataNode(node, index) {
    /** @type {CharacterData} */
    const newNode = node.cloneNode(false);
    newNode.deleteData(0, index);
    node.deleteData(index, node.length - 1);
    insertAfert(newNode, node);

    return newNode;
  }

  /**
   *
   * @param {Node} node
   * @returns {boolean}
   */
  function isCharacterDataNode(node) {
    var t = node.nodeType;
    return t == 3 || t == 4 || t == 8; // Text, CDataSection or Comment
  }

  /**
   *
   * @param {Node} insertNode
   * @param {Node} precedingNode
   * @returns {Node} insertNode
   */
  function insertAfert(insertNode, precedingNode) {
    const nextNode = precedingNode.nextSibling, parentNode = precedingNode.parentNode;
    if (nextNode) {
      parentNode.insertBefore(insertNode, nextNode);
    } else {
      parentNode.appendChild(insertNode);
    }

    return insertNode;
  }

  /**
   *
   * @param {Node} node
   * @returns {boolean}
   */
  function isBrokenNode(node) {
    var n;
    try {
      n = node.parentNode;
      return false;
    } catch (e) {
      return true;
    }
  }

  /**
   *
   * @param {Node} node
   * @return {string} - nodeName
   */
  function inspectNode(node) {
    if (!node) {
      return '[No node]';
    }
    if (isBrokenNode(node)) {
      return "[Broken node]";
    }
    if (isCharacterDataNode(node)) {
      return '"' + node.data + '"';
    }
    if (node.nodeType == 1) {
      var idAttr = node.id ? ' id="' + node.id + '"' : '';
      return '<' + node.nodeName + idAttr + ">[index:" + getNodeIndex(node) + ",length:" + node.childNodes.length + "][" + (node.innerHTML || "[innerHTML not supported]").slice(0, 25) + "]";
    }
    return node.nodeName;
  }

  /**
   *
   * @param {RangeIterator} iterator
   * @param {(node: Node) => void} callback
   */
  function iterateSubtree(iterator, callback) {
    for (var node, subRangeIterator; node = iterator.next();) {
      if (iterator.isPartiallySelectedSubtree()) {
        // 该节点被Range部分选中，因此可以在的部分上使用一个新的Range迭代器
        // Range所选择的节点。
        console.log('部分覆盖: ', dom.inspectNode(node));
        subRangeIterator /** @type {RangeIterator} */ = iterator.getSubtreeIterator();
        iterateSubtree(subRangeIterator, callback);
      } else {
        // 选择了整个节点，因此我们可以使用高效的DOM迭代遍历节点及其节点
        console.log('整个覆盖: ', dom.inspectNode(node));
        var it, n;
        it = document.createNodeIterator(node, NodeFilter.SHOW_ALL, { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },);
        while (n = it.nextNode()) {
          callback(n);
        }
      }
    }
  }

  /**
   *
   * @param {Node} node
   * @return {number}
   */
  function getNodeIndex(node) {
    var index = 0;
    while(( node = node.previousSibling )) {
      ++index
    }
    return index;
  }

  /**
   *
   * @param {Node} ancestor
   * @param {Node} descendant
   * @return {boolean}
   */
  function isOrIsAncestorOf(ancestor, descendant) {
    return isAncestorOf(ancestor, descendant, true);
  }

  /**
   *
   * @param ancestor
   * @param descendant
   * @param selfIsAncestor
   * @returns {boolean}
   */
  function isAncestorOf(ancestor, descendant, selfIsAncestor) {
    var p = selfIsAncestor ? descendant : descendant.parentNode;
    while (p) {
      if (p == ancestor) {
        return true;
      } else {
        p = p.parentNode;
      }
    }
    return false;
  }

  /**
   *
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
   * @param {string} id
   * @return {Node}
   */
  function gEBI(id) {
    return document.getElementById(id);
  }

  /**
   *
   * @param nodeA
   * @param offsetA
   * @param nodeB
   * @param offsetB
   * @return {number|number}
   */
  function comparePoints(nodeA, offsetA, nodeB, offsetB) {
    // See http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Comparing
    var nodeC, root, childA, childB, n;
    if (nodeA == nodeB) {
      // Case 1: nodes are the same
      return offsetA === offsetB ? 0 : (offsetA < offsetB) ? -1 : 1;
    } else if ( (nodeC = getClosestAncestorIn(nodeB, nodeA, true)) ) {
      // Case 2: node C (container B or an ancestor) is a child node of A
      return offsetA <= getNodeIndex(nodeC) ? -1 : 1;
    } else if ( (nodeC = getClosestAncestorIn(nodeA, nodeB, true)) ) {
      // Case 3: node C (container A or an ancestor) is a child node of B
      return getNodeIndex(nodeC) < offsetB  ? -1 : 1;
    } else {
      root = getCommonAncestor(nodeA, nodeB);
      if (!root) {
        throw new Error("comparePoints error: nodes have no common ancestor");
      }

      // Case 4: containers are siblings or descendants of siblings
      childA = (nodeA === root) ? root : getClosestAncestorIn(nodeA, root, true);
      childB = (nodeB === root) ? root : getClosestAncestorIn(nodeB, root, true);

      if (childA === childB) {
        // This shouldn't be possible
        throw module.createError("comparePoints got to case 4 and childA and childB are the same!");
      } else {
        n = root.firstChild;
        while (n) {
          if (n === childA) {
            return -1;
          } else if (n === childB) {
            return 1;
          }
          n = n.nextSibling;
        }
      }
    }
  }

  /**
   *
   * @param {Node} node
   * @param {string} className
   * @return {null}
   */
  function getSelfOrAncestorWithClass(node, className) {
    while(node) {
      if (node.nodeType === Node.ELEMENT_NODE && hasClass(node, className)) {
        return node;
      }
      node = node.parentNode;
    }

    return null
  }

  /**
   *
   * @param {Element} el
   * @param {string} className
   * @return {boolean}
   */
  function hasClass(el, className) {
    return el.classList.contains(className);
  }

  /**
   *
   * @param {string} fullClassName - 完整的
   * @param {string} className
   * @return {boolean}
   */
  function classNameContainsClass(fullClassName, className) {
    return !!fullClassName && new RegExp('(?:^|\\s)' + className + '(?:\\s|$)');
  }

  /**
   *
   * @param {Element} el
   * @param {string} className
   */
  function addClass(el, className) {
    if (typeof el.classList === 'object') {
      el.classList.add(className)
    } else {
      const classNameSupported = (typeof el.className === 'string');
      let elClass = classNameSupported ? el.className : el.getAttribute('class');

      if (elClass) {
        if (!classNameContainsClass(elClass, className)) {
          elClass += ' ' + className
        }
      } else {
        elClass = className;
      }

      if (classNameSupported) {
        el.className = elClass;
      } else {
        el.setAttribute('class', elClass);
      }

    }
  }

  /**
   *
   * @param {Element} el
   * @return {string | null}
   */
  function getClass(el) {
    const classNameSupported = (typeof el.className === 'string');
    return classNameSupported ? el.className : el.getAttribute('class');
  }

  /**
   *
   * @param {Element} el1
   * @param {Element} el2
   * @return {boolean}
   */
  function haveSameClasses(el1, el2) {
    return sortClassName(getClass(el1)) === sortClassName(getClass(el2));
  }

  /**
   *
   * @param {string} className
   * @return {string}
   */
  function sortClassName(className) {
    return className && className.split(/\s+/).sort().join(" ");
  }

  /**
   *
   * @param {Element} el
   * @param {string} propName
   */
  function getComputedStyleProperty(el, propName) {
    return window.getComputedStyle(el, null).getPropertyValue(propName);
  }

  function elementsHaveSameNonClassAttributes(el1, el2) {
    // console.log(el1.attributes);
    if (el1.attributes.length !== el2.attributes.length) return false;
    for (let i = 0, len = el1.attributes.length, attr1, attr2, name; i < len; ++i) {
      attr1 = /** @type {Attr} */ el1.attributes[i];
      name = attr1.name;
      if (name !== 'class') {
        attr2 = el2.attributes.getNamedItem(name);
        if (attr2 === null) return false;
        if (attr1.specified !== attr2.specified) return false;
        if (attr1.specified && attr1.nodeValue !== attr2.nodeValue) return false;
      }
    }
    return true;
  }

  /**
   *
   * @param {Node} node
   */
  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

  return {
    splitDataNode,
    isCharacterDataNode,
    insertAfert,
    inspectNode,
    iterateSubtree,
    getClosestAncestorIn,
    getNodeIndex,
    isOrIsAncestorOf,
    isAncestorOf,
    getNodeLength,
    gEBI,
    comparePoints,
    getSelfOrAncestorWithClass,
    hasClass,
    addClass,
    classNameContainsClass,
    haveSameClasses,
    getClass,
    getComputedStyleProperty,
    elementsHaveSameNonClassAttributes,
    removeNode
  }

}, this);
