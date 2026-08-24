
(function(){
  const clean=t=>(t||'').replace(/Hospital\s+(Universitari\s+)?(Joan|Juan)\s+XXIII/gi,'Enferix').replace(/\bHJ23\b/gi,'Enferix');
  function sweep(root){
    const w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(n=>{const c=clean(n.nodeValue);if(c!==n.nodeValue)n.nodeValue=c;});
  }
  document.addEventListener('DOMContentLoaded',()=>{sweep(document.body);const mo=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)sweep(n);else if(n.nodeType===3)n.nodeValue=clean(n.nodeValue)})));mo.observe(document.body,{childList:true,subtree:true});});
})();
