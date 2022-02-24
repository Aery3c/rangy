interface Range {

  /**
   * 从range首尾(sc, ec)选择的边界开始分割文本节点, 如果sc,ec是元素节点则忽略不处理, 如果是文本节点 则分割
   *
   * 首尾具有相同节点 范围中的文本节点将会是一个新的节点并分离.
   *
   * 首尾是不同节点 首尾范围中的文本节点将会是一个新的节点并分离.
   */
  splitRangeBoundaries(): void;

  /**
   * 设置range的边界(start和end).
   *
   * 函数内部获取arguments对象. 至少传3个参数 sc = args[0] ec = args[1].
   *
   * case args.lengh = 3, so = args[2], eo = args[2].
   *
   * case args.length = 4, so = args[2], eo = args[3].
   */
  setStartAndEnd<T extends Node>(sc?: T, so?: number, ec?: T, eo?: number): void;

  /**
   * 更新range的边界, 内部使用setStart和setEnd.
   * @param sc
   * @param so
   * @param ec
   * @param eo
   */
  updateBoundaries(sc: Node, so: number, ec: Node, eo: number): void;

  /**
   * 从范围上获取node节点.
   * @param nodeTypes 获取的节点类型 一个数组 数组外的类型将全部被过滤掉.
   * @param filter 过滤函数 返回一个布尔值 如果为false则过滤掉.
   */
  getNodes<T extends Node | Text | HTMLElement>(nodeTypes?: number[], filter?: (node: T) => boolean): T[];

  /**
   * 取出range与另一个range产生交集的部分
   *
   * @param sourceRange - 参与比较的range
   *
   * @returns 返回产生交集的部分, 如果没有则返回null
   */
  intersection(sourceRange: Range): Range | null;

  /**
   *
   * @param sourceRange
   */
  intersectsRange(sourceRange: Range): boolean;

  /**
   *
   * 显示当前range对象的信息, 用于内部调试.
   */
  inspect(): string;

  /**
   * 在当前视窗中查看range
   */
  inspectOnSelection(): void;

  /**
   * range是否健康
   */
  isRangeValid(): boolean;
}

interface Tinter {
  elementTagName: string;
  createWrapperContainer(parentNode: ParentNode): HTMLElement;
  applyToTextNode(textNode: Text): void;
  /**
   * 将class应用到range.
   */
  applyToRange(range: Range): void;

  /**
   * 从range上移除class
   * @param range
   */
  undoToRange(range: Range): void;

  /**
   * 如果range已被class上色, 那么返回true, 否则fasle.
   */
  isTinterToRange(range: Range): boolean;

  /**
   * 从node开始, 遍历向上查询包含这个class的父节点并返回, 完成时没有找到返回null.
   */
  getSelfOrAncestorWithClass<T extends Node>(node: T): T | null;

  /**
   * 如果node包含class返回true, 否则返回false.
   */
  hasClass<T extends Node>(node: T): boolean;

  /**
   *
   * 如果边界相邻的元素被涂抹, 那么合并到一起
   */
  infectApply(textNodes: Text[], range: Range, isUndo: boolean): void;

  /**
   * 删除range路线上存在的空元素
   * @param range
   */
  removeEmptyContainers(range: Range): void;
  /**
   * 如果range被class上色, 将颜色移除, 否则上色
   * @param range
   */
  toggleRange(range: Range): void;
}

interface RangeIterator {}

interface Util {
  isRangeValid(): boolean;
  getNodesInRange<T extends Node>(range: Range, nodeTypes?: number[], filter?: (node: T) => boolean): T[];
  rangesIntersect(rangeA: Range, rangeB: Range): boolean;
}

interface Dom {
  getNodeIndex<T extends Node>(node: T): number;
  removeNode<T extends Node>(node: T): T;
  moveChildren<T extends Node>(node: Node, newParent: ParentNode, newIndex: number, isRemoveSelf: boolean): ChildNode[];
  moveNode<T extends Node>(node: T, parentNode: ParentNode, index: number): T;
}

interface Node {
  insertAfter<T extends Node>(insertNode: T, precedingNode: T): T;
}

interface TinterOptions {
  elementTagName?: string;
  elementAttributes?: {
    [key: string]: string;
  };
}

interface Aery {
  createTinter(className: string, options?: TinterOptions): Tinter;
  createRangeIterator(range: Range): RangeIterator;
  util: Util
  dom: Dom
}

declare var aery: Aery;
