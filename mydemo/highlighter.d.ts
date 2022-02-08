export interface Highlighter {
  /**
   * 用荧光笔涂抹range.
   *
   * @param range
   */
  apply(range: Range): Highlighter;
}

interface Mark {
  /**
   * 用荧光笔在文本节点上涂抹
   * @param textNode
   */
  applyToTextNode(textNode: CharacterData): void;
}

interface Options {

}

declare var Mark: {
  prototype: Mark;
  new(className: string): Mark;
}

declare var Highlighter: {
  prototype: Highlighter;
  new(name: string, options: Options): Highlighter;
}
