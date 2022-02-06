'use strict';

(function(factory, root) {
  if (typeof define == 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof module != 'undefined' && typeof exports == 'object') {
    // Node/CommonJS style
    module.exports = factory(require('./dom'), require('./RangeIterator'));
  } else {
    // No AMD or CommonJS support so we place Range in (probably) the global variable
    root.Range = factory(window.dom, window.RangeIterator);
  }
})(
  /**
   *
   * @param {dom} dom
   * @param RangeIterator
   * @return {{prototype: Range, new(): Range, readonly END_TO_END: number, readonly END_TO_START: number, readonly START_TO_END: number, readonly START_TO_START: number, toString(): string}}
   */
  function(dom, RangeIterator) {
    const isCharacterDataNode = dom.isCharacterDataNode;
    const splitDataNode = dom.splitDataNode;
    const iterateSubtree = dom.iterateSubtree;

    /**
     *
     * @param {Range} rangeA
     * @param {Range} rangeB
     * @param {boolean} touchingIsIntersecting
     */
    function rangesIntersect(rangeA, rangeB, touchingIsIntersecting) {

      const startComparison = rangeA.compareBoundaryPoints(Range.END_TO_START, rangeB);
      const endComparison = rangeB.compareBoundaryPoints(Range.START_TO_END, rangeB);

      return startComparison < 0 && endComparison > 0;
    }

    /**
     *
     * @param {Range} range
     * @param {CharacterData} textNode
     * @return boolean
     */
    function rangeSelectsAnyText(range, textNode) {
      const textNodeRange = range.cloneRange();
      textNodeRange.selectNodeContents(textNode);
      textNodeRange.intersection(range);
      return false;
    }

    /**
     * 从range获取有效的文本节点.
     *
     * 有效的文本节点: 补充
     * @param {Range} range
     * @return CharacterData[]
     */
    function getEffectiveTextNodes(range) {
      const textNodes = range.getNodes([3]);
      let start = 0, node;
      while((node = textNodes[start]) && !rangeSelectsAnyText(range, node)) {
        console.log('rangeSelectsAnyText dispatch success');
        ++start;
      }

      return textNodes;
    }

    Range.prototype.splitRangeBoundaries = function() {
      var sc = this.startContainer, so = this.startOffset, ec = this.endContainer, eo = this.endOffset;
      const startEndSame = (sc == ec);

      // 即使折叠的range也是一个range
      if (isCharacterDataNode(ec) && eo > 0 && eo < ec.length) {
        splitDataNode(ec, eo);
        console.log('Split end', dom.inspectNode(ec), 'offset = ', eo);
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
        console.log('Split start', dom.inspectNode(sc), 'offset = ', so);
      }

      this.setStartAndEnd(sc, so, ec, eo);
      return [sc, ec];
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

    Range.prototype.addHighlighter = function(highlighter) {
      this.highlighterBox[highlighter.className] = highlighter;
    }

    Range.prototype.pickHighlighter = function(highlighterName) {
      if (highlighterName && highlighterName in this.highlighterBox) {
        return this.highlighterBox[highlighterName];
      }

      return this.highlighterBox['highlight'];
    }

    Range.prototype.highlight = function(className) {
      const highlighter = this.pickHighlighter(className);
      // 分割首尾边界.
      this.splitRangeBoundaries();
      // 返回范围包裹的所有文本节点.
      const textNodes = getEffectiveTextNodes(this);
      // 用span把每个文本节点包裹起来
      textNodes.forEach(function(textNode) {
        if (!dom.getSelfOrAncestorWithClass(textNode, highlighter.className)) {
          highlighter.applyToTextNode(textNode);
        }
      });
    }

    Range.prototype.intersection = function (sourceRange) {
      if (this.intersectsRange(sourceRange)) {

      }
    }

    Range.prototype.intersectsRange = function(sourceRange) {
      return rangesIntersect(this, sourceRange, false);
    }

    Range.prototype.highlighterBox = {
      'highlight': new Highlighter('highlight', {})
    }

    return Range;
  }, this);