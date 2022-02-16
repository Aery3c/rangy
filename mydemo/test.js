document.addEventListener('mouseup', function () {
  const tinter = aery.createTinter('highlight', {});

  tinter.isTinterToRange(window.getSelection().getRangeAt(0));
});