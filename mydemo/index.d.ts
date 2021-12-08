interface Range {
  splitRangeBoundaries(): void;
  setStartAndEnd(): void;
  updateBoundaries(sc: Node, so: number, ec: Node, eo: number): void;
  getNodes(nodeTypes: number[], filter: (node: Node) => boolean): Node[];
}

interface RangeIteratorCallback {
  (currentNode: Node): void;
}

declare var dom: {
  /**
   * 
   * node is text node
   */
  isCharacterDataNode(node: Node): boolean;
  /**
   * split node
   */
  splitDataNode(node: Node, index: number): Node;
  /**
   * insertNode insert to precedingNode after
   */
  insertAfert(insertNode, precedingNode): Node;
  iterateSubtree(iterator: RangeIterator, callbackfn: RangeIteratorCallback): void;
}

interface RangeIterator {
  next(): Node | null
}

declare var RangeIterator: {
  prototype: RangeIterator;
  new(range: Range, clonePartiallySelectedTextNodes: boolean): RangeIterator
}

interface Window {
  RangeIterator: RangeIterator;
  dom: dom;
}