const isCharacterDataNode = dom.isCharacterDataNode;
const splitDataNode = dom.splitDataNode;
const insertAfert = dom.insertAfert;
const iterateSubtree = dom.iterateSubtree;

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
  var filterNodeTypes = !!(nodeTypes && nodeTypes.length), regex;
  const filterExists = !!filter;

  const nodes = [];

  iterateSubtree(new RangeIterator(this), function(node) {
    console.log(node);
  });
}




/** 操作 */
document.querySelector('#myself').addEventListener('click', function() {
  
  const range = window.getSelection().getRangeAt(0);
  // 分割首尾边界
  range.splitRangeBoundaries();
  range.getNodes([3]);

}, false);

// 测试迭代对象
document.querySelector('#test-rangeIterator').addEventListener('click', function() {
  var range = document.createRange();
  const startNode = document.querySelector('#A');
  const endNode = startNode.getElementsByTagName('a')[0]
  const p = document.getElementsByTagName('p')[1];
  // console.log(p);
  // range.selectNodeContents(p);
  range.setStart(startNode, 0);
  range.setEnd(endNode, 1);
  console.log(range)
  window.getSelection().addRange(range);

  var rangeIterator = new RangeIterator(range, false);
  console.log(rangeIterator);
});