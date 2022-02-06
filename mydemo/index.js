// 得到一支荧光笔
const highlighter = new Highlighter('highlight', {});

/** 操作 */
document.querySelector('#myself').addEventListener('click', function() {
  highlighter.apply();
}, false);

// 测试
document.querySelector('#test-rangeIterator').addEventListener('click', function() {
  // var range = window.getSelection().getRangeAt(0);
  // var rangeIterator = new RangeIterator(range, false);
  // for (let n; n = rangeIterator.next();) {
  //   console.log(n);
  // }
});
