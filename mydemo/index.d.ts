import type { Highlighter } from './highlighter';
import type { dom } from './dom';

interface Range {

  /**
   * 从range首尾(sc, ec)选择的边界开始分割文本节点, 如果sc,ec是元素节点则忽略不处理, 如果是文本节点 则分割
   *
   * 首尾具有相同节点 范围中的文本节点将会是一个新的节点并分离.
   *
   * 首尾是不同节点 首尾范围中的文本节点将会是一个新的节点并分离.
   * @return [sc, ec] 分离出的新的首尾文本节点
   */
  splitRangeBoundaries(): Node[];

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
  getNodes<T>(nodeTypes: number[], filter?: (node: Node) => boolean): T[];

  /**
   * 高亮当前选中的范围
   */
  highlight(className?: string): Highlighter;

  /**
   * 放入一支荧光笔到笔盒中
   * @param highlighter
   */
  addHighlighter(highlighter: Highlighter): void;

  /**
   * 从笔盒中拿出想要的荧光笔 如果没找到 拿出默认的那支
   * @param highlighterName
   */
  pickHighlighter(highlighterName?: string): Highlighter;

  /**
   * 荧光笔盒
   */
  highlighterBox: {
    [highlighterName: string]: Highlighter
  }

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
}

interface RangeIterator {
  /**
   * 将指针移到下一个节点 返回当前这个节点 直到null为止.
   */
  next(): Node | null,

  /**
   * 判断节点是否被部分选中.
   *
   * 部分选中概念: 部分选中的节点只会出现在范围跨标签且节点必须肯定是首尾任意节点的父元素节点.
   */
  isPartiallySelectedSubtree(): boolean;

  /**
   *
   */
  getSubtreeIterator(): RangeIterator;
}

interface RangeIteratorCallback {
  (currentNode: Node): void;
}

interface Window {
  RangeIterator: RangeIterator;
  dom: dom;
}

declare var RangeIterator: {
  prototype: RangeIterator;
  /**
   * 创建RangeIterator实例
   *
   * 在构造函数中 我们会去初始化迭代对象分配好迭代的起始(_first, _last)位置
   * @param range
   * @param clonePartiallySelectedTextNodes
   */
  new(range: Range, clonePartiallySelectedTextNodes: boolean): RangeIterator
}