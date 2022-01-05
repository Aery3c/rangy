/**
 * @jest-environment jsdom
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const dom = require('../../dom');
const { getClosestAncestorIn } = dom;
const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf-8');

test('test dom tool function', function() {
  const $ = cheerio.load(html);
  document.body.innerHTML = $.html();
  const ancerstor = document.querySelector('#content');
  const node = ancerstor.querySelector('.pinkLink');
  const p = ancerstor.getElementsByTagName('p')[2];
  expect(getClosestAncestorIn(node, ancerstor, true)).toEqual(p);

});

