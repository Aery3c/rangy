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
  setStartAndEnd(): void;

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
  getNodes<T>(nodeTypes?: number[], filter?: (node: T) => boolean): T[];

  /**
   *
   * @param sourceRange
   */
  intersection(sourceRange: Range): void;

  /**
   *
   * @param sourceRange
   */
  intersectsRange(sourceRange: Range): boolean;

  /**
   * 检阅range
   */
  inspect(console?: boolean): string;

}

interface Tinter {
  /**
   * 将class应用到此范围.
   */
  applyToRange(range: Range): void;

  /**
   * 如果此范围已被class着色, 那么返回true, 否则fasle.
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
}

interface RangeIterator {}

interface Util {
  isRangeValid(): boolean;
  getNodesInRange<T extends Node>(range: Range, nodeTypes?: number[], filter?: (node: T) => boolean): T[];
}

interface Aery {
  createTinter(className: string, options: {}): Tinter;
  createRangeIterator(range: Range): RangeIterator;
  util: Util
}

declare var aery: Aery;
