export interface Highlighter {
  /**
   * 用荧光笔在文本节点上涂抹
   * @param textNode
   */
  applyToTextNode(textNode: CharacterData): void;

  /**
   * 用荧光笔涂抹range.
   *
   * @param range
   */
  apply(range: Range): Highlighter;
}

interface Options {

}

declare var Highlighter: {
  prototype: Highlighter;
  new(className: string, options: Options): Highlighter;
}
