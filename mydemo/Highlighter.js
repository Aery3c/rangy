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
       * @param {CharacterData[]} textNodes
       * @param {Range} range
       * @param {boolean} isUndo
       */
      postApply(textNodes, range, isUndo) {
        const firstNode = textNodes[0], lastNode = textNodes[textNodes.length - 1];

        const merges = [];
        let currentMerge;

        let rangeStartNode = firstNode, rangeEndNode = lastNode;

        let rangeStartOffset = 0, rangeEndOffset = lastNode.length;

        let textNode, precedingTextNode;

        // 检查每个必需的合并，并为每个合并创建一个merge对象
        textNodes.forEach(textNode => {
          precedingTextNode = getPreviousMergeableTextNode(textNode, !isUndo);
          if (precedingTextNode) {
            if (!currentMerge) {
              currentMerge = new Merge(precedingTextNode);
              merges.push(currentMerge);
            }

            currentMerge.textNodes.push(textNode);
            if (textNode === firstNode) {
              rangeStartNode = currentMerge.textNodes[0];
              rangeStartOffset = rangeStartNode.length;
            }

            if (textNode === lastNode) {
              rangeEndNode = currentMerge.textNodes[0];
              rangeEndOffset = currentMerge.getLength();
            }
          } else {
            currentMerge = null;
          }
        });

        // 测试范围后的第一个节点是否需要合并
        const nextTextNode = getNextMergeableTextNode(lastNode, !isUndo);

        if (nextTextNode) {
          if (!currentMerge) {
            currentMerge = new Merge(lastNode);
            merges.push(currentMerge);
          }
          currentMerge.textNodes.push(nextTextNode);
        }

        // Apply to merges
        merges.forEach(merge => {
          merge.doMerge();
        });

        range.setStartAndEnd(rangeStartNode, rangeStartOffset, rangeEndNode, rangeEndOffset);
      }



    }

    class Merge {
      /**
       *
       * @param {Node} firstNode
       */
      constructor(firstNode) {
        this.isElementMerge = (firstNode.nodeType === 1);
        this.textNodes = [];
        const firstTextNode = (this.isElementMerge ? firstNode.lastChild : firstNode);
        if (firstNode) {
          this.textNodes[0] = firstTextNode;
        }
      }

      getLength() {
        let i = this.textNodes.length, len = 0;
        while (i--) {
          len += this.textNodes[i].length
        }

        return len;
      }

      doMerge() {
        const textNodes = this.textNodes;
        const firstTextNode = textNodes[0];
        if (textNodes.length > 1) {
          const firstTextNodeIndex = dom.getNodeIndex(firstTextNode);
          let textParts = [], combinedTextLength = 0, textNode, parent;
          textNodes.forEach((textNode, index) => {
            parent = textNode.parentNode;
            if (index > 0) {
              parent.removeChild(textNode);
              if (!parent.hasChildNodes()) {
                dom.removeNode(parent);
              }
            }

            textParts[index] = textNode.data;
          });
          firstTextNode.data = textParts.join('');
        }

        return firstTextNode.data;
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
          const range = sel.getRangeAt(sel.rangeCount - 1);
          const mark = new Mark(this.name);
          // 分割边界
          range.splitRangeBoundaries();

          const textNodes = range.getNodes([3]);

          textNodes.forEach(textNode => {
            if (!dom.getSelfOrAncestorWithClass(textNode, this.name)) {
              mark.applyToTextNode(textNode);
            }
          });

          const lastTextNode = textNodes[textNodes.length - 1];
          range.setStartAndEnd(textNodes[0], 0, lastTextNode, lastTextNode.length);

          mark.postApply(textNodes, range, false);



        }
      }

      unapply() {
        const sel = window.getSelection();
        if (sel.rangeCount) {

        }
      }

    }

    return Highlighter;
}, this);
