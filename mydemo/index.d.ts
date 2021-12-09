interface Range {
  splitRangeBoundaries(): void;
  setStartAndEnd(): void;
  updateBoundaries(sc: Node, so: number, ec: Node, eo: number): void;
  getNodes(nodeTypes: number[], filter: (node: Node) => boolean): Node[];
}

interface RangeIteratorCallback {
  (currentNode: Node): void;
}

interface dom {
  isCharacterDataNode(node: Node): boolean;
  splitDataNode(node: Node, index: number): Node;
  insertAfert(insertNode: Node, precedingNode: Node): Node;
  iterateSubtree(iterator: RangeIterator, callbackfn: RangeIteratorCallback): void;
  getClosestAncestorIn(node: Node, ancestor: Node, selfIsAncestor: boolean): Node | null;
  inspectNode(node: Node): string;
  getNodeIndex(node: Node): number;
  isOrIsAncestorOf(ancestor: Node, descendant: Node): boolean;
  isAncestorOf(ancestor: Node, descendant: Node): boolean;
}

declare var dom: dom

interface RangeIterator {
  next(): Node | null,
  isPartiallySelectedSubtree(): boolean;
}

declare var RangeIterator: {
  prototype: RangeIterator;
  new(range: Range, clonePartiallySelectedTextNodes: boolean): RangeIterator
}

interface Window {
  RangeIterator: RangeIterator;
  dom: dom;
}