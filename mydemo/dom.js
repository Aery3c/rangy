(function(root) { 

  /**
   * 
   * @param {Node} node 
   * @param {number} index
   * @returns {Node} - newNode
   */
  function splitDataNode(node, index) {
    /** @type {CharacterData} */
    const newNode = node.cloneNode(false);
    newNode.deleteData(0, index);
    node.deleteData(index, node.length - 1);
    insertAfert(newNode, node);

    return newNode;
  }

  /**
   * 
   * @param {Node} node
   * @returns {boolean}
   */
  function isCharacterDataNode(node) {
    var t = node.nodeType;
    return t == 3 || t == 4 || t == 8; // Text, CDataSection or Comment
  }

  /**
   * 
   * @param {Node} insertNode 
   * @param {Node} precedingNode
   * @returns {Node} insertNode
   */
  function insertAfert(insertNode, precedingNode) {
    const nextNode = precedingNode.nextSibling, parentNode = precedingNode.parentNode;
    if (nextNode) {
      parentNode.insertBefore(insertNode, nextNode);
    } else {
      parentNode.appendChild(insertNode);
    }

    return insertNode;
  }

  /**
   * 
   * @param {Node} node 
   * @returns {boolean}
   */
  function isBrokenNode(node) {
    var n;
    try {
        n = node.parentNode;
        return false;
    } catch (e) {
        return true;
    }
  }

  /**
   * 
   * @param {Node} node
   * @return {string} - nodeName
   */
   function inspectNode(node) {
    if (!node) {
      return '[No node]';
    }
    if (isBrokenNode(node)) {
      return "[Broken node]";
    }
    if (isCharacterDataNode(node)) {
      return '"' + node.data + '"';
    }
    if (node.nodeType == 1) {
      var idAttr = node.id ? ' id="' + node.id + '"' : '';
      return '<' + node.nodeName + idAttr + ">[index:" + getNodeIndex(node) + ",length:" + node.childNodes.length + "][" + (node.innerHTML || "[innerHTML not supported]").slice(0, 25) + "]";
    }
    return node.nodeName;
  }

  root.dom = Object.assign({}, {
    splitDataNode,
    isCharacterDataNode,
    insertAfert,
    inspectNode
  });

})(this)
