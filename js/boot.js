/* Marca o <html> como "js" antes da primeira pintura (progressive enhancement).
   Se o script principal falhar, a classe "failsafe" libera todo o conteúdo escondido. */
(function () {
  var c = document.documentElement.classList;
  c.remove('no-js'); c.add('js');
  setTimeout(function () { if (!window.__fxOk) c.add('failsafe'); }, 4000);
})();
