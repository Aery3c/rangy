/**
 *
 * @param range {Range}
 * @param textNode {CharacterData}
 * @return {boolean}
 */
function rangeSelectsAnyText(range, textNode) {
  const textNodeRange = range.cloneRange();
  textNodeRange.selectNodeContents(textNode);
  console.log(textNodeRange);
}

/**
 *
 * @param range {Range}
 * @return CharacterData[];
 */
function getEffectiveTextNodes(range) {
  const textNodes = /** @type {CharacterData[]} */ range.getNodes([3]);
  let start = 0, node;
  while ((node = textNodes[start]) && !rangeSelectsAnyText(range, node)) {
    ++start;
  }
  return []
}

/**
 *
 * @param textNode {CharacterData}
 */
function applyToTextNode(textNode) {
  const parent = textNode.parentNode;
  console.log(parent.childNodes.length === 1, 'parent.childNodes.length === 1');
  const span = document.createElement('span');
  span.className = 'italicYellowBg';
  parent.insertBefore(span, textNode);
  span.appendChild(textNode);
}
