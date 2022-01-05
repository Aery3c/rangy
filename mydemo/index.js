/** 操作 */
document.querySelector('#myself').addEventListener('click', function() {
  let range;
  // 从select上获取Range
  range = window.getSelection().getRangeAt(0);
  // 自定义Range
  // range = document.createRange();
  // let startNode = document.querySelector('.pinkLink').childNodes[0];
  // let endNode = document.querySelector('.pinkLink');
  // range.setStart(startNode, 0);
  // range.setEnd(endNode, 0);
  // console.log(range);
  // 分割首尾边界
  range.splitRangeBoundaries();
  // textNodes = range.getNodes([3]);
  // console.table(textNodes);
}, false);

// 测试
document.querySelector('#test-rangeIterator').addEventListener('click', function() {
  // var range = window.getSelection().getRangeAt(0);
  // var rangeIterator = new RangeIterator(range, false);
  // for (let n; n = rangeIterator.next();) {
  //   console.log(n);
  // }
});