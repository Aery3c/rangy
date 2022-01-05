interface Range {
  splitRangeBoundaries(): void;
  setStartAndEnd(): void;
  updateBoundaries(sc: Node, so: number, ec: Node, eo: number): void;
  getNodes(nodeTypes: number[], filter?: (node: Node) => boolean): Node[];
}

interface RangeIterator {
  next(): Node | null,
  isPartiallySelectedSubtree(): boolean;
  getSubtreeIterator(): RangeIterator;
}

interface RangeIteratorCallback {
  (currentNode: Node): void;
}

interface dom {
  /**
   * 返回一个布尔值, 如果node是文本节点 返回true 否则false
   * @param node
   * @return {boolean}
   */
  isCharacterDataNode(node: Node): boolean;
  /**
   * 根据index分割文本节点.
   *
   * clone 这个文本节点 remove cloneNode 前半部分(0 - index), remove souceNode 后半部分(index - sourceNode.length - 1).
   *
   * insertAfert(cloneNode, sourceNode).
   * @param node source node.
   * @param index 分割参考的边界点.
   * @return cloneNode
   */
  splitDataNode(node: Node, index: number): Node;

  /**
   * 在precedingNode的后面插入insertNode.
   * @param insertNode 被插入的节点.
   * @param precedingNode 前面的那个节点.
   */
  insertAfert(insertNode: Node, precedingNode: Node): Node;

  /**
   * 迭代RangeIterator对象, 每一次迭代的结果将通过回调函数透出.
   *
   * 在每一次的迭代返回的结果中. 如果node是一个被部分选中的节点, 创建一个子RangeIterator对象, 重新递归iterateSubtree.
   *
   * 子RangeIterator对象: cloneRange当前range,
   *
   * 部分选中概念: node是一个元素节点并且它是range.startContainer或者range.endContainer的祖先元素, 因为在开头我们采用了splitDataNode的做法, 因此节点内的文本节点被一分为二.
   * @param iterator RangeIterator的实例对象.
   * @param callbackfn 每一次迭代完成后执行的回调函数.
   */
  iterateSubtree(iterator: RangeIterator, callbackfn: RangeIteratorCallback): void;

  /**
   * 返回node最接近ancestor的祖先元素.
   * @param node 当前节点
   * @param ancestor 祖先节点
   * @param selfIsAncestor 如果是true 那么从node开始 false则从node.parent开始
   */
  getClosestAncestorIn(node: Node, ancestor: Node, selfIsAncestor: boolean): Node | null;
  inspectNode(node: Node): string;
  getNodeIndex(node: Node): number;

  /**
   * 返回布尔值, 如果ancestor是descendant是祖先节点, 返回true, 否则返回false.
   * @param ancestor 祖先节点.
   * @param descendant 后代节点.
   */
  isOrIsAncestorOf(ancestor: Node, descendant: Node): boolean;

  /**
   * 跟isOrIsAncestorOf相同 但多了第三个参数是一个布尔值 指示是从descendant还是descendant.parent开始
   * @param ancestor 祖先节点
   * @param descendant 后代节点
   * @param selfIsAncestor 如果true 从descendant开始 否则从descendant.parent开始
   */
  isAncestorOf(ancestor: Node, descendant: Node, selfIsAncestor: boolean): boolean;
  getNodeLength(node: Node): number;
  gEBI(id: string): Node;
}

interface Window {
  domrange: domrange;
  dom: dom;
}

interface domrange {
  RangeIterator: RangeIterator;
  util: {
    isNonTextPartiallySelected(node: Node, range: Range): boolean;
  }
}

declare var domrange: domrange;

declare var dom: dom

declare var RangeIterator: {
  prototype: RangeIterator;
  new(range: Range, clonePartiallySelectedTextNodes: boolean): RangeIterator
}
