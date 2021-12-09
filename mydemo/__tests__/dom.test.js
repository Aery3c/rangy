/**
 * @jest-environment jsdom
 */

'use strict';

var html = `<p id="container"><b>Association football</b> is a d between two teams. It is usually called<b>soccer</b>. In <a href="http://simple.wikipedia.org/wiki/Japan">Japan</a></p>`;
const { dom } = require('../dom');
const { getNodeIndex, isAncestorOf } = dom;

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