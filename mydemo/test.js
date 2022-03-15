const tinter = aery.createTinter('highlight', {});
const highlighter = aery.createHighlighter();
highlighter.addTinter(tinter);

document.querySelector('#test-tinter').addEventListener('click', function() {
  const range = window.getSelection().getRangeAt(0);
  console.log(range);
  tinter.applyToRange(range);
});

document.querySelector('#test-highlight').addEventListener('click', function() {
  const sel = window.getSelection();
  sel.highlight();

  // const highlights = highlighter.highlightSelection('highlight', { containerElementId: 'info' });
  // console.log(highlights);
});

document.querySelector('#function-test').addEventListener('click', function() {

});
