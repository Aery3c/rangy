document.querySelector('#test').addEventListener('click', function() {
  const tinter = aery.createTinter('highlight', {});
  tinter.toggleRange(window.getSelection().getRangeAt(0));
});

document.querySelector('#function-test').addEventListener('click', function() {

});
