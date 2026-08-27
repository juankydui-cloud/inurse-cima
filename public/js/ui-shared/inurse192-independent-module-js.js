
(function(){
'use strict';
const $=s=>document.querySelector(s);

function setActive(view){
  document.querySelectorAll('#in192PrimaryNav [data-in192-view]').forEach(b=>{
    b.classList.toggle('on',b.dataset.in192View===view);
  });
}
function hideLibraryLanding(){
  document.body.classList.remove('in192-library-view');
  $('#in192LibraryHome')?.classList.remove('on');
}
function showHomeView(){
  hideLibraryLanding();setActive('home');
  const home=$('#in50HomeDock');
  if(home){home.click();return}
  $('#in50Home')?.style.setProperty('display','block');
}
function showGuidesView(){
  hideLibraryLanding();setActive('guides');
  $('#in50HomeDock')?.click();
  setTimeout(()=>$('#v29MenuBtn')?.click(),120);
}
function showLibraryView(){
  setActive('library');
  document.body.classList.add('in192-library-view');
  $('#in192LibraryHome')?.classList.add('on');
  $('#in50Settings')?.style.setProperty('display','none');
  window.scrollTo({top:0,behavior:'smooth'});
}
function showJavnyView(){
  hideLibraryLanding();setActive('javny');
  const btn=$('#ccFab')||$('#javnyFab')||$('#in54JavnyDock')||$('#in50JavnyDock');
  if(btn)btn.click();
}
function showSearchView(){
  hideLibraryLanding();setActive('search');
  const fab=$('#nxSearchFab');
  if(fab){fab.click();return;}
  const inp=$('#search');
  if(inp){inp.value='';inp.focus();}
}
function showToolsView(){
  hideLibraryLanding();setActive('tools');
  if(typeof window.openCalcs==='function'){window.openCalcs();return;}
  const btn=$('#calcFab');if(btn)btn.click();
}
function showEscalasView(){
  hideLibraryLanding();setActive('escalas');
  if(window.EnferixEscalas&&window.EnferixEscalas.open){window.EnferixEscalas.open();return;}
  $('#escalasBtn')?.click();
}
function openLibrary(mode='all'){
  if(window.Enferix21&&typeof window.Enferix21.organize==='function'&&mode!=='all'){
    window.Enferix21.organize(mode,'all');return;
  }
  if(window.Enferix21&&typeof window.Enferix21.open==='function'){
    window.Enferix21.open('all');return;
  }
  $('#library21Btn')?.click();
}
function install(){
  const nav=$('#in192PrimaryNav');
  if(nav){
    nav.addEventListener('click',e=>{
      const b=e.target.closest('[data-in192-view]');if(!b)return;
      const view=b.dataset.in192View;
      if(view==='turno'){setActive('turno');if(window.EnferixTurno&&window.EnferixTurno.open)window.EnferixTurno.open();}
      else if(view==='home')showHomeView();
      else if(view==='search')showSearchView();
      else if(view==='tools')showToolsView();
      else if(view==='escalas')showEscalasView();
      else if(view==='guides')showGuidesView();
      else if(view==='library')showLibraryView();
      else if(view==='javny')showJavnyView();
    });
  }
  $('#in192LibraryHome')?.addEventListener('click',e=>{
    const card=e.target.closest('[data-in192-organize]');
    if(card){openLibrary(card.dataset.in192Organize);return}
  });
  $('#in192OpenFullLibrary')?.addEventListener('click',()=>openLibrary('all'));
  $('#in192LibrarySearch')?.addEventListener('click',()=>openLibrary('all'));

  // Preserve active state when the dedicated header shortcut opens the Library.
  $('#library21Btn')?.addEventListener('click',()=>setActive('library'),true);

  // The old Home library injector is intentionally disabled in v19.2.
  const oldSection=$('#in17VirtualLibrarySection');
  if(oldSection){
    const oldGrid=$('#in17VirtualLibraryGrid');
    oldSection.remove();oldGrid?.remove();
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();

window.EnferixMainNavigation={
  home:showHomeView,guides:showGuidesView,library:showLibraryView,javny:showJavnyView,
  escalas:showEscalasView
};
})();
