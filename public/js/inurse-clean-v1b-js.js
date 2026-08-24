
(function(){
  try{if(typeof activeCat==='undefined')window.activeCat='all'}catch(e){window.activeCat='all'}
  try{if(typeof query==='undefined')window.query=''}catch(e){window.query=''}
  function homeMode(){document.body.classList.remove('in60-content-mode');window.scrollTo({top:0,behavior:'smooth'});if(window.EnferixCleanV1)window.EnferixCleanV1.home()}
  function contentMode(){document.body.classList.add('in60-content-mode')}
  function bind(){
    document.body.classList.remove('in60-content-mode');
    var hb=document.getElementById('v29HomeBtn');if(hb&&!hb.dataset.in60){hb.dataset.in60='1';hb.addEventListener('click',homeMode,true)}
    var panel=document.getElementById('v29Panel');if(panel&&!panel.dataset.in60){panel.dataset.in60='1';panel.addEventListener('click',function(e){
      var t=e.target.closest('.v29-doc,.v29-seeall,#v29Pato');if(t)contentMode();
    },true)}
    var search=document.getElementById('search');if(search&&!search.dataset.in60){search.dataset.in60='1';search.addEventListener('input',function(){if(search.value.trim())contentMode()},true)}
  }
  if(document.readyState!=='loading')bind();else document.addEventListener('DOMContentLoaded',bind);
  [100,700,1800,3000].forEach(function(t){setTimeout(bind,t)});
  window.EnferixHome=homeMode;window.EnferixContent=contentMode;
})();
