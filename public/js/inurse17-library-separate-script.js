
(function(){
  'use strict';
  function openVirtualLibrary(){
    if(window.Enferix21 && typeof window.Enferix21.open === 'function'){
      window.Enferix21.open('all');
      return;
    }
    var shortcut=document.getElementById('library21Btn');
    if(shortcut) shortcut.click();
  }
  function renameShortcut(){
    var btn=document.getElementById('library21Btn');
    if(btn){
      btn.title='Biblioteca virtual Enferix';
      btn.setAttribute('aria-label','Abrir Biblioteca virtual Enferix');
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',renameShortcut);
  else renameShortcut();
  window.EnferixVirtualLibrary={open:openVirtualLibrary};
})();
