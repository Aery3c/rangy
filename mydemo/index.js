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

  class Merge {
    /**
     *
     * @param {Node} firstNode
     */
    constructor(firstNode) {
      this.isElementMerge = firstNode.nodeType === 1;
      this.firstTextNode = this.isElementMerge ? firstNode.lastChild : firstNode;
      this.textNodes = [];
      if (this.firstTextNode) {
        this.textNodes[0] = this.firstTextNode;
      }
    }

    doMerge() {
      /** @type {CharacterData[]} */
      const textNodes = this.textNodes;
      const firstTextNode = this.firstTextNode;
      const textParts = [];
      textNodes.forEach((textNode, index) => {
        if (index > 0) {
          const parentNode = textNode.parentNode;
          parentNode.removeChild(textNode);
          if (!parentNode.hasChildNodes()) {
            parentNode.parentNode.removeChild(parentNode);
          }
        }
        textParts[index] = textNode.data;
      });

      firstTextNode.data = textParts.join('');

      return firstTextNode.data;
    }
  }

  function mergeTextNode() {
    const container = document.querySelector('#A');
    const nodeIterator = document.createNodeIterator(
      container,
      NodeFilter.SHOW_ALL,
      function(node) {
        if (node.nodeType == 3) {
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    const firstTextNode = nodeIterator.nextNode();
    const merge = new Merge(firstTextNode);
    let textNode;
    while((textNode = nodeIterator.nextNode())) {
      merge.textNodes.push(textNode);
    }

    console.log(merge.doMerge());
  }

  // mergeTextNode();

  // const empty = document.querySelector('#empty');
  //
  // /**
  //  *
  //  * @param {Node} node
  //  */
  // function isIgnorableWhiteSpaceNode(node) {
  //   console.log(node.data.length);
  //   var htmlNonWhiteSpaceRegex = /[^\r\n\t\f \u200B]/;
  //
  //   console.log(htmlNonWhiteSpaceRegex.test(node.data));
  // }
  //
  // isIgnorableWhiteSpaceNode(empty.firstChild);

});
