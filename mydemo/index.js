const isCharacterDataNode = dom.isCharacterDataNode;
const splitDataNode = dom.splitDataNode;
const insertAfert = dom.insertAfert;
const iterateSubtree = dom.iterateSubtree;
const RangeIterator = domrange.RangeIterator;
/** Range */
Range.prototype.splitRangeBoundaries = function() {
  var sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset;
  const startEndSame = (sc == ec);

  // 即使折叠的range也是一个range
  if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
    splitDataNode(ec, eo);
    console.log('Split end', dom.inspectNode(ec), eo);
  }

  if (isCharacterDataNode(sc) && so > 0 && so < sc.length) {
    sc = splitDataNode(sc, so);
    if (startEndSame) {
      eo -= so;
      ec = sc;
    } else if (ec == sc.parentNode) {
      // 这是不可能的
      debugger;
    }
    so = 0;
    console.log('Split start', dom.inspectNode(sc), so);
  }

  this.setStartAndEnd(sc, so, ec, eo);
}

Range.prototype.setStartAndEnd = function() {
  var args = arguments;
  var sc = args[0], so = args[1], ec = sc, eo = so;

  switch (args.length) {
    case 3:
      eo = args[2];
      break;
    case 4:
      ec = args[2];
      eo = args[3];
      break;
  }
  this.updateBoundaries(sc, so, ec, eo);
}

Range.prototype.updateBoundaries = function(sc, so, ec, eo) {
  this.setStart(sc, so);
  this.setEnd(ec, eo);
}


Range.prototype.getNodes = function(nodeTypes, filter) {
  var filterNodeTypes /** @type {boolean} */ = !!(nodeTypes && nodeTypes.length),
      /** @type {RegExp | undefiend} */
      regex
  if (filterNodeTypes) {
    regex = new RegExp(`^(${nodeTypes.join('|')})$`);
  }
  const nodes = [];

  iterateSubtree(new RangeIterator(this), function(node) {
    if (regex && !regex.test(node.nodeType.toString())) {
      return;
    }

    if (typeof filter == 'function' && !filter(node)) {
      return;
    }

    nodes.push(node);
  });

  return nodes;
}

/** 操作 */
document.querySelector('#myself').addEventListener('click', function() {
  
  const range = window.getSelection().getRangeAt(0);
  // 分割首尾边界
  range.splitRangeBoundaries();
  textNodes = range.getNodes([3]);
  console.table(textNodes);
}, false);

// 测试
document.querySelector('#test-rangeIterator').addEventListener('click', function() {
  var range = window.getSelection().getRangeAt(0);
  var rangeIterator = new RangeIterator(range, false);
  for (let n; n = rangeIterator.next();) {
    console.log(n);
  }
});