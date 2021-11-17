function DomPositon(node, offset) {
  this.node = node;
  this.offset = offset;
}

/**
 * 
 * @param {Range[]} ranges 
 */
function getRangeBoundaries(ranges) {
  var positions = [], i, range;
  for (i = 0; range = ranges[i++];) {
    positions.push(
      new DomPositon(range.startContainer, range.startOffset),
      new DomPositon(range.endContainer, range.endOffset)
    )
  }
  
  return positions;
}

function print(thing) {
  console.log(thing);
}

function init() {
  var sel = window.getSelection();
  var range = document.createRange();
  var container = document.querySelector('#intro').firstChild;
  range.setStart(container, 9);
  range.setEnd(container, 30);
  sel.addRange(range);
  return range;
}

/**
 * 
 * @param {CharacterData} node 
 * @param {CharacterData} precedingNode 
 */
function insertAfter(node, precedingNode) {
  const nextNode = precedingNode.nextSibling, parentNode = precedingNode.parentNode;
  if (nextNode) {
    parentNode.insertBefore(node, nextNode);
  } else {
    parentNode.appendChild(node);
  }
  return node;
}

function setStartAndEnd() {
  var args = arguments;

}

/**
 * 
 * @param {CharacterData} node 
 * @param {Number} index 
 * @param {DomPositon[]} positionsToPreserve
 */
function splitDataNode(node, index, positionsToPreserve) {
  var newNode = /** @type {CharacterData} */ node.cloneNode(false);
  newNode.deleteData(0, index);
  node.deleteData(index, node.length - index);
  insertAfter(newNode, node);

  // if (positionsToPreserve) {
  //   for (var i = 0, position; position = positionsToPreserve[i++];) {
  //     if (position.node == node && position.offset > index) {
  //       position.node = newNode;
  //       position.offset -= index;
  //     }
  //   }
  // }
  return newNode;
}

/**
 * 
 * @param {Range} range 
 */
function getEffectiveTextNodes(range) {
  var nodes = getNodes(range, [3]);
}

/**
 * 
 * @param {Range} range 
 * @param {Number[]} nodeTypes 
 * @param {*} filter 
 * @returns {Node[]}
 */
function getNodes(range, nodeTypes, filter) {
  return getNodesInRange(range, nodeTypes, filter);
}

/**
 * 
 * @param {Range} range 
 * @param {Number[]} nodeTypes 
 * @param {() => void} filter 
 */
function getNodesInRange(range, nodeTypes, filter) {
  var filterNodeTypes = !!(nodeTypes && nodeTypes.length), regex;
  var filterExists = !!filter;
  
  if (filterNodeTypes) {
    regex = new RegExp(`^(${nodeTypes.join('|')})$`);
  }

  var nodes = [];

  iterateSubtree(new RangeIterator(range, false), function(node) {
    if (filterNodeTypes && !regex.test(node.nodeType)) {
      return;
    }

    nodes.push(node);
  });

  console.log(nodes);

}

function start(range) {
  var range = init();
  const positionsToPreserve = getRangeBoundaries([range]);
  var sc = range.startContainer, so = range.startOffset, ec = range.endContainer, eo = range.endOffset;
  const startEndSame = (sc === ec);
  splitDataNode(ec, eo, positionsToPreserve);
  sc = splitDataNode(sc, so, positionsToPreserve);
  if (startEndSame) {
    eo -= so;
    ec = sc;
  } else {
    console.log('other case');
    debugger;
  }
  so = 0;
  updateNativeRange(range, sc, so, ec, eo);
  // getEffectiveTextNodes(range);
  const textNodes = [sc];
  if (textNodes.length) {
    textNodes.forEach(function(textNode) {
      applyToTextNode(textNode);
    });
  }

  updateNativeRange(range, sc, so, ec, eo);

}


function addClass(el, className) {
  if (typeof el.classList == "object") {
    el.classList.add(className);
  } else {
    var classNameSupported = (typeof el.className == "string");
    var elClass = classNameSupported ? el.className : el.getAttribute("class");
    if (elClass) {
      if (!classNameContainsClass(elClass, className)) {
        elClass += " " + className;
      }
    } else {
      elClass = className;
    }
    if (classNameSupported) {
      el.className = elClass;
    } else {
      el.setAttribute("class", elClass);
    }
  }
}

/**
 * 
 * @param {Node} parentNode 
 */
function createContainer(parentNode) {
  var doc = document, namespace;
  var el = doc.createElement('span');
  addClass(el, 'boldRed')
  return el;
  
}

/**
 * 
 * @param {CharacterData} textNode 
 */
function applyToTextNode(textNode) {
  const parent = textNode.parentNode;
  const el = createContainer(parent);
  parent.insertBefore(el, textNode);
  el.appendChild(textNode);
}

/**
 * 
 * @param {Range} range 
 * @param {Node} startContainer 
 * @param {Number} startOffset 
 * @param {Node} endContainer 
 * @param {Number} endOffset 
 */
function updateNativeRange(range, startContainer, startOffset, endContainer, endOffset) {
  const startMoved = (range.startContainer != startContainer || range.startOffset !== startOffset);
  const endMoved = (range.endContainer != endContainer || range.endOffset !== endOffset);
  if (startMoved || endMoved) {
    range.setEnd(endContainer, endOffset);
    range.setStart(startContainer, startOffset);
  }
}

// document.querySelector('#myself').addEventListener('click', function() {
//   const range = window.getSelection().getRangeAt(0);
//   start(range);
//   console.log(range);
// }, false);
start();




/** RangeIterator */

document.querySelector('#myself').addEventListener('click', function() {
  /** test RangeIterator */
  const range = window.getSelection().getRangeAt(0);
  getEffectiveTextNodes(range);
}, false);

/**
 * @constructor
 * @param {Range} range 
 * @param {Boolean} clonePartiallySelectedTextNodes 
 */
function RangeIterator(range, clonePartiallySelectedTextNodes) {
  this.range = range;
  this.clonePartiallySelectedTextNodes = clonePartiallySelectedTextNodes;

  if (!range.collapsed) {
    this.sc = range.startContainer;
    this.so = range.startOffset;
    this.ec = range.endContainer;
    this.eo = range.endOffset;

    var root = range.commonAncestorContainer;

    if (this.sc === this.ec && isCharacterDataNode(this.sc)) {
      this.isSingleCharacterDataNode = true;
      this._first = this._last = this._next = this.sc;
    } else {
      this._first = this._next = (this.sc == root && !isCharacterDataNode(this.sc)) 
        ? this.sc.childNodes[this.so] : getClosestAncestorIn(this.sc, root, true);
      this._last = (this.ec == root && !isCharacterDataNode(this.ec)) 
        ? this.ec.childNodes[this.eo - 1] : getClosestAncestorIn(this.ec, root, true);
    }

  }
}


RangeIterator.prototype = {
  _current: null,
  _next: null,
  _first: null,
  _last: null,
  isSingleCharacterDataNode: false,

  /**
   * 
   * @returns {Node | null}
   */
  next: function() {
    // move to next node
    var current = this._current = this._next;
    if (current) {
      this._next = (current !== this._last) ? current.nextSibling : null;
      
      // check for partially selected text nodes
    }

    return current;
  },

  /**
   * Checks if the current node is partially selected
   * @returns 
   */
  isPartiallySelectedSubtree: function() {
    var current = this._current;
    return isNonTextPartiallySelected(current, this.range);
  },

  getSubtreeIterator: function() {
    var subRange;
    if (this.isSingleCharacterDataNode) {
      subRange = this.range.cloneRange;
      subRange.collapse(false);
    } else {
      // So let's start here
      subRange = document.createRange();
    }
  }

}

/**
 * 
 * @param {Node} node 
 * @param {Range} range 
 * @returns {boolean}
 */
function isNonTextPartiallySelected(node, range) {
  return (node.nodeType != 3) &&
    (isOrIsAncestorOf(node, range.startContainer) || isOrIsAncestorOf(node, range.endContainer));
}

/**
 * 
 * @callback handleNodeCallback
 * @param {Node} node
 */

/**
 * 
 * @param {RangeIterator} rangeIterator 
 * @param {handleNodeCallback} func 
 * @param {{ stop: Boolean }} iteratorState 
 */
function iterateSubtree(rangeIterator, func, iteratorState) {
  var it, n;
  iteratorState = iteratorState || { stop: false };
  
  for (var node, subRangeIterator; node = rangeIterator.next();) {
    if (rangeIterator.isPartiallySelectedSubtree()) {
      if (func(node) === false) {
        iteratorState.stop = true;
        return;
      } else {
        subRangeIterator = rangeIterator.getSubtreeIterator();
        debugger;
      }
    } else {
      it = createIterator(node);
      while ((n = it.next())) {
        if (func(n) === false) {
          iteratorState.stop = true;
          return;
        }
      }
    }
  }
}

/**
 * 
 * @param {Node} node
 * @returns {Boolean}
 */
function isCharacterDataNode(node) {
  var t = node.nodeType;
  return t == 3 || t == 4 || t == 8;
}

/**
 * 返回距離ancestor最近的子元素且是node的父元素
 * @param {Node} node 
 * @param {Node} ancestor 
 * @param {Boolean} selfIsAncestor
 * @returns {Node | null} 
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

  return null
}

/**
 * ancestor 是否是 descendant 的祖先元素
 * @param {Node} ancestor 
 * @param {Node} descendant 
 * @param {boolean} selfIsAncestor 
 * @returns 
 */
function isAncestorOf(ancestor, descendant, selfIsAncestor) {
  var n = selfIsAncestor ? descendant : descendant.parentNode;
  while (n) {
    if (n == ancestor) {
      return true;
    } else {
      n = n.parentNode;
    }
  }

  return false
}

function isOrIsAncestorOf(ancestor, descendant) {
  return isAncestorOf(ancestor, descendant, true);
}

function createIterator(root) {
  return new NodeIterator(root);
}

/**
 * @constructor
 * @param {Node} root 
 */
function NodeIterator(root) {
  this.root = root;
  this._next = root;
}

NodeIterator.prototype = {
  _current: null,
  next: function() {
    var n = this._current = this._next;
    var child, next;
    if (this._current) {
      child = n.firstChild;
      if (child) {
        this._next = child;
      } else {
        next = null;
        while((n != this.root) && !(next = n.nextSibling)) {
          n = n.parentNode;
        }

        this._next = next;
      }
    } 

    return this._current;
  }
}