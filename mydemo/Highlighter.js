'use strict';

(function(factory, root) {
  if (typeof define == 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof module != 'undefined' && typeof exports == 'object') {
    // Node/CommonJS style
    module.exports = factory(require('./dom'));
  } else {
    // No AMD or CommonJS support so we place Highlighter in (probably) the global variable
    root.Highlighter = factory(window.dom);
  }
})(
  /**
   *
   * @param {dom} dom
   */
  function(dom) {

    /**
     *
     * @param {Element} el1
     * @param {Element} el2
     */
    function areElementsMergeable(el1, el2) {
      return el1.namespaceURI === el2.namespaceURI &&
        el1.tagName.toLowerCase() === el2.tagName.toLowerCase() &&
        dom.haveSameClasses(el1, el2) &&
        dom.elementsHaveSameNonClassAttributes(el1, el2) &&
        dom.getComputedStyleProperty(el1, 'display') === 'inline' &&
        dom.getComputedStyleProperty(el2, 'display') === 'inline'
    }

    /**
     *
     * @param forward
     * @return {function(Node, boolean): Node | null}
     */
    function createAdjacentMergeableTextNodeGetter(forward) {
      const siblingPropName = forward ? "nextSibling" : "previousSibling";

      return function (textNode, checkParentElement) {
        const el = textNode.parentNode;
        let adjacentNode = textNode[siblingPropName];
        if (adjacentNode && adjacentNode.nodeType === 3) {
          return adjacentNode
        } else if (checkParentElement) {
          adjacentNode = el[siblingPropName];
          if (adjacentNode && adjacentNode.nodeType === 1 && areElementsMergeable(el, adjacentNode)) {
            const adjacentNodeChild = adjacentNode[forward ? 'firstChild' : 'lastChild'];
            if (adjacentNodeChild && adjacentNodeChild.nodeType === 3) {
              return adjacentNodeChild;
            }
          }
        }

        return null;
      }
    }
    const getPreviousMergeableTextNode = createAdjacentMergeableTextNodeGetter(false),
      getNextMergeableTextNode = createAdjacentMergeableTextNodeGetter(true);

    class Mark {
      constructor(className, markOptions = {}) {
        this.className = className;
        this.elementTagName = markOptions.elementTagName || 'span'
      }

      /**
       * 标记附身到文本节点上
       * @param {Node} textNode
       */
      applyToTextNode(textNode) {
        if (this.canTextBeStyled(textNode)) {
          const parent = textNode.parentNode;
          if (parent.childNodes.length === 1) {
            dom.addClass(parent, this.className);
          } else {
            const span = document.createElement(this.elementTagName);
            span.className = this.className;
            parent.insertBefore(span, textNode);
            span.appendChild(textNode);
          }
        } else {
          console.log('not be styled => ' + dom.inspectNode(textNode.parentNode));
        }
      }

      /**
       * 如果是[textarea|style|script|select|iframe] 那么标记不可应用上去
       * @param {Node} textNode
       */
      canTextBeStyled(textNode) {
        const parent = textNode.parentNode;
        return !!parent && parent.nodeType === 1 && !/^(textarea|style|script|select|iframe)$/i.test(parent.nodeName)
      }

      /**
       *
       * @param {Node[]} textNodes
       * @param {Range} range
       * @param {boolean} isUndo
       */
      postApply(textNodes, range, isUndo) {
        const firstNode = textNodes[0], lastNode = textNodes[textNodes.length - 1];

        const merges = [];
        let currentMerge;

        const rangeStartNode = firstNode, rangeEndNode = lastNode;

        const rangeStartOffset = 0, rangeEndOffset = lastNode.length;

        let textNode, precedingTextNode;

        // 检查每个必需的合并，并为每个合并创建一个merge对象
        textNodes.forEach(textNode => {
          precedingTextNode = getPreviousMergeableTextNode(textNode, !isUndo);
          if (precedingTextNode) {

          }
        });
      }

    }

    class Highlighter {
      constructor(name) {
        this.name = name;
      }

      apply() {
        // 如何涂抹 生成Mark对象
        const sel = window.getSelection();
        if (sel.rangeCount) {
          const mark = new Mark(this.name);
          const range = sel.getRangeAt(sel.rangeCount - 1);
          // 分割边界
          range.splitRangeBoundaries();

          const textNodes = range.getNodes([3]);

          textNodes.forEach(textNode => {
            mark.applyToTextNode(textNode);
          });

          const lastTextNode = textNodes[textNodes.length - 1];
          range.setStartAndEnd(textNodes[0], 0, lastTextNode, lastTextNode.length);

          mark.postApply(textNodes, range, false);

        }
      }

    }

    return Highlighter;
}, this);
