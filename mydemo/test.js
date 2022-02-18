// document.addEventListener('mouseup', function () {
//   const tinter = aery.createTinter('highlight', {});
//
//   tinter.isTinterToRange(window.getSelection().getRangeAt(0));
// });

document.querySelector('#test').addEventListener('click', function() {
  const tinter = aery.createTinter('highlight', {});

  tinter.applyToRange(window.getSelection().getRangeAt(0));
});

document.querySelector('#function-test').addEventListener('click', function() {

  var span1 = document.createElement('span');
  span1.classList.add('highlight');

  var span2 = document.createElement('p');
  span2.classList.add('highlight');

  /**
   *
   * @example str = 'c b a' sortClassName(str) -> a b c
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
   * 元素是否可合并
   *
   *
   * @param {HTMLElement} el1
   * @param {HTMLElement} el2
   */
  function areElementMergeable(el1, el2) {
    return el1.tagName.toLowerCase() === el2.tagName.toLowerCase() &&
      haveSameClasses(el1, el2) &&
      ((el1.getAttribute('display') === 'inline') === (el2.getAttribute('display') === 'inline'));
  }

  console.log(areElementMergeable(span1, span2) && '元素可合并');

});
