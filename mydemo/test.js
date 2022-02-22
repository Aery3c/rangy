document.querySelector('#test').addEventListener('click', function() {
  const tinter = aery.createTinter('highlight', {});
  tinter.toggleRange(window.getSelection().getRangeAt(0));
});

document.querySelector('#function-test').addEventListener('click', function() {
  const tinter = aery.createTinter('highlight', {});
  const range = window.getSelection().getRangeAt(0);
  const textNodes = range.getNodes([Node.TEXT_NODE]);

  let ancestorWithClass;



  textNodes.forEach(function(textNode) {
    ancestorWithClass = tinter.getSelfOrAncestorWithClass(textNode);
    if (ancestorWithClass) {
    }
  });

});
