/**
 * @jest-environment jsdom
 */

'use strict';

var html = `<p id="container"><b>Association football</b> is a d between two teams. It is usually called<b>soccer</b>. In <a href="http://simple.wikipedia.org/wiki/Japan">Japan</a></p>`;
const dom = require('../dom');
const { getNodeIndex, isAncestorOf, getNodeLength } = dom;

test('getNodeIndex', () => {
  document.body.innerHTML = html;
  const node = document.getElementsByTagName('a')[0];
  expect(getNodeIndex(node)).toBe(4);
});

test('isAncestorOf', () => {
  document.body.innerHTML = html;
  const ancestor = document.getElementsByTagName('p')[0];
  const child = ancestor.childNodes[2];
  expect(isAncestorOf(ancestor, child, false)).toBe(true);
});
var html2 = `<p id="container"><b>Association football</b><!-- 一段注释 -->is a d between two teams. It is usually called</p>`;
test('getNodeLenth', () => {
  document.body.innerHTML = html2;
  const ancestor = document.getElementById('container');
  ancestor.childNodes.forEach(node => {
    if (node.nodeType == Node.COMMENT_NODE) {
      console.log(node.length);
    }
  });
});