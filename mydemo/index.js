/** 操作 */
document.querySelector('#myself').addEventListener('click', function() {
  let range;
  // 从select上获取Range
  range = window.getSelection().getRangeAt(0);
  // 自定义Range
  // range = document.createRange();
  // let startNode = document.querySelector('.pinkLink').childNodes[0];
  // let endNode = document.querySelector('.pinkLink').parentNode.querySelector('a');
  // console.log(endNode);
  // range.setStart(startNode, 0);
  // range.setEnd(endNode, 0);
  // console.log(range);
  range.highlight();

}, false);

// 测试
document.querySelector('#test-rangeIterator').addEventListener('click', function() {
  // var range = window.getSelection().getRangeAt(0);
  // var rangeIterator = new RangeIterator(range, false);
  // for (let n; n = rangeIterator.next();) {
  //   console.log(n);
  // }
});
