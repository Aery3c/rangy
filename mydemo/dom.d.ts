import {RangeIterator, RangeIteratorCallback} from "./index";

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

  /**
   * 比较范围的边界点.
   * @param nodeA
   * @param offsetA
   * @param nodeB
   * @param offsetB
   */
  comparePoints(nodeA: Node, offsetA: number, nodeB: Node, offsetB: number): number;

  /**
   * 如果node的祖先节点包含className, 返回ancestor, 否则返回null.
   * @param node
   * @param className
   */
  getSelfOrAncestorWithClass(node: Node, className: string): Node | null;

  /**
   * 如果node包含class, 返回true, 否则false.
   * @param el
   * @param className
   */
  hasClass(el: Element, className: string): boolean;

  /**
   * el add className.
   * @param el
   * @param className
   */
  addClass(el: Element, className: string): void;

  /**
   * fullClassName 是否包含 className
   * @param fullClassName
   * @param className
   */
  classNameContainsClass(fullClassName: string, className: string): boolean;

  /**
   * 两个元素是否具有相同的class.
   * @param el1
   * @param el2
   */
  haveSameClasses(el1: Element, el2: Element): boolean;

  /**
   * 将元素的class排序后返回
   * @param className
   */
  sortClassName(className: string): string;

  /**
   * 获取元素的class
   * @param el
   */
  getClass(el: Element): string;

  getComputedStyleProperty(el: Element, propName: string): string;

  /**
   * 检查el1 和 el2 的Attr.
   *
   * attributes的长度不同 返回false
   *
   * Attr.specified不同 返回false
   *
   * Attr.nodeValue不同 返回false
   * @param el1
   * @param el2
   */
  elementsHaveSameNonClassAttributes(el1: Element, el2: Element): boolean;
}

declare var dom: dom
