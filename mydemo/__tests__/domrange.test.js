/**
 * @jest-environment jsdom
 */

'use strict';

const html = `<p id="container"><b>Association football</b> is a d between two teams. It is usually called<b>soccer</b>. In <a href="http://simple.wikipedia.org/wiki/Japan">Japan</a></p>`;
const domrange = require('../domrange');
const dom = require('../dom');
const { RangeIterator ,util, util: { isNonTextPartiallySelected } } = domrange;
const { gEBI } = dom;

test('isNonTextPartiallySelected', () => {
  document.body.innerHTML = html;
  const range = document.createRange();
  const textNode = document.querySelector('#container').childNodes[1];
  const start = document.querySelector('#container').firstChild;
  const end = document.querySelector('#container').lastChild;
  range.setStart(start, 0);
  range.setEnd(end, 1);

  expect(isNonTextPartiallySelected(textNode, range)).toBe(false);
});

test('RangeIterator.isPartiallySelectedSubtree', () => {
  document.body.innerHTML = html;
  const range = document.createRange();
  const ancestor = gEBI('container');
  range.setStart(ancestor.childNodes[0].firstChild, 3);
  range.setEnd(ancestor.childNodes[3], 2);
  const rangeIterator = new RangeIterator(range, false);
  rangeIterator.next();
  rangeIterator.next();
  rangeIterator.next();
  expect(rangeIterator.isPartiallySelectedSubtree()).toBe(false);
});

test('RangeIterator.getSubtreeIterator', () => {
  document.body.innerHTML = html;
  const range = document.createRange();
  const ancestor = gEBI('container');
  range.setStart(ancestor.childNodes[0].firstChild, 0);
  range.setEnd(ancestor.childNodes[0].firstChild, ancestor.childNodes[0].firstChild.length);
  const rangeIterator = new RangeIterator(range, false);
  rangeIterator.next();
  const subRangeIterator = rangeIterator.getSubtreeIterator();
  console.log(subRangeIterator.next());
});