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
  getNodes(nodeTypes: number[], filter?: (node: Node) => boolean): Node[];

  highlight(className?: string, options?: {}): void;
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

  /**
   * 在控制台中检阅当前node节点.
   *
   * 破碎的节点输出: [Broken node].
   *
   * 文本节点输出: "文本".
   *
   * 元素节点输出: <nodeName id>[index: 节点在容器中的位置, length: 节点的长度, 通过子节点得到][node.innerHTML].
   *
   * 其余节点输出: node.nodeName
   * @param node 当前节点
   */
  inspectNode(node: Node): string;

  /**
   * 返回节点是否是一个破碎的节点.
   *
   * 破碎的节点是指 运行node.parent会抛出异常的节点.
   * @param node
   */
  isBrokenNode(node: Node): boolean;

  /**
   * 获取当前节点在当前容器中的位置.
   * @param node
   */
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

  /**
   * 返回节点自身的长度
   *
   * 文本节点: 返回自身文本的长度
   *
   * 元素节点: 返回子节点的长度
   * @param node
   */
  getNodeLength(node: Node): number;
  gEBI(id: string): Node;
}

interface Window {
  RangeIterator: RangeIterator;
  dom: dom;
}

declare var dom: dom

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
