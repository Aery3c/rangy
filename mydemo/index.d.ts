interface Range {
  splitRangeBoundaries(): void;
  setStartAndEnd(): void;
  updateBoundaries(sc: Node, so: number, ec: Node, eo: number): void;
  getNodes(nodeTypes: number[], filter: (node: Node) => boolean): Node[];
}