(function(){
'use strict';
/* Version der Spiel-Skripte (bei Änderung an spiel-*.js oder qr.js erhöhen, passend zu sw.js) */
var APPV='2026-10-25-2';
var app=document.getElementById('app'), titleEl=document.getElementById('title'), backBtn=document.getElementById('back'), statEl=document.getElementById('stat'), whoBtn=document.getElementById('who');
var TN={verkehr:'Verkehr 🚲',wald:'Wald 🌲',alle:'Alles'};
var history=[];

/* ---------- Helfer ---------- */
function h(tag,a){var e=document.createElement(tag);if(a)for(var k in a){var v=a[k];if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;else if(k.indexOf('on')===0)e.addEventListener(k.slice(2),v);else if(v===true)e.setAttribute(k,'');else if(v!==false&&v!=null)e.setAttribute(k,v);}
  for(var i=2;i<arguments.length;i++)add(e,arguments[i]);return e;}
function add(e,x){if(x==null||x===false)return;if(Array.isArray(x))x.forEach(function(y){add(e,y);});else e.append(x.nodeType?x:document.createTextNode(String(x)));}
var keepY=null;
function stay(fn){keepY=window.scrollY;try{fn();}finally{keepY=null;}}
function mount(){app.replaceChildren();for(var i=0;i<arguments.length;i++)add(app,arguments[i]);if(keepY!==null)window.scrollTo(0,keepY);else window.scrollTo(0,0);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function pageById(id){for(var i=0;i<SEITEN.length;i++)if(SEITEN[i].id===id)return i;return -1}
function cid(k){return k.t+'|'+k.f}
function pad2(n){return String(n).padStart(2,'0');}
function ymd(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function todayStr(){return ymd(new Date());}
function mondayOf(off){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7)+off*7);return d;}
function shake(el){el.classList.add('shake');setTimeout(function(){el.classList.remove('shake');},400);}
function medal(p){return p===1?'🥇':p===2?'🥈':p===3?'🥉':'';}
function fmtT(sec){return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
function fmtDay(ts){var d=new Date(ts);return pad2(d.getDate())+'.'+pad2(d.getMonth()+1)+'.';}

/* ---------- Speicher (Präfix sk:) ---------- */
function lj(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
function sj(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lset(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function ldel(k){try{localStorage.removeItem(k);}catch(e){}}

/* ---------- Profile (feste Familie: Ellena, Merle, Eltern) ---------- */
var KIDS=[
  {id:'sk-ellena',name:'Ellena',color:'#8B6FC4',avatar:'profil-ellena'},
  {id:'sk-merle',name:'Merle',color:'#3D6BD6',avatar:'profil-merle'},
  {id:'sk-eltern',name:'Eltern',color:'#4A4750',role:'parent',avatar:'profil-eltern'}
];
var kid=null,P=null,view='',busy=false,inGame=false,dirty=false,pt=null;
function isParent(){return !!kid&&kid.role==='parent';}
/* P.k: Karte -> {v:1|0,t}; P.q: Thema -> Quiz; P.pr: Probe-Arbeit; P.log: Tageslog; P.g/gz: Spiele; P.cfg (nur Eltern); P.rc: Durchläufe heute */
function normP(p){p=p&&typeof p==='object'?p:{};p.k=p.k||{};p.q=p.q||{};p.pr=p.pr||{};p.log=p.log||{};p.g=p.g||{};p.gz=p.gz||{};return p;}
function profileData(k){return normP(lj('sk:'+k.id,null));}
function loadP(){P=profileData(kid);}
function saveP(){sj('sk:'+kid.id,P);schedulePush();}
function dayLog(){var d=todayStr();return P.log[d]||(P.log[d]={s:0,n:0,ok:0,g:0,l:0,qz:0});}
function isKnown(c){var r=P.k[cid(c)];return !!(r&&r.v);}
function setKnown(c,v){var was=isKnown(c);P.k[cid(c)]={v:v?1:0,t:Date.now()};var L=dayLog();if(v&&!was)L.g++;if(!v&&was)L.l++;saveP();}
function logAns(ok){var L=dayLog();L.n++;if(ok)L.ok++;}

/* ---------- Lernzeit (nur Kinder, nicht in Spielen) ---------- */
var lastAct=0,lastSave=0;
function activity(){
  if(!kid||!P||isParent()||inGame)return;
  var n=Date.now();
  if(lastAct){var gap=(n-lastAct)/1000;dayLog().s+=Math.min(gap,60);if(n-lastSave>15000){saveP();lastSave=n;}}
  lastAct=n;
}
document.addEventListener('pointerdown',activity,true);
document.addEventListener('keydown',activity,true);
document.addEventListener('visibilitychange',function(){lastAct=0;if(document.hidden&&P&&kid){saveP();flush();}});
window.addEventListener('pagehide',function(){if(P&&kid){saveP();flush();}});

/* ---------- Familie & Abgleich (Firebase Firestore per REST, gleiches Projekt wie die Vokabel-App) ---------- */
/* Eigene Dokumente: families/{Familiencode}/profiles/sk-ellena, sk-merle, sk-eltern (Präfix sk-) – die Vokabel-App liest nur kid-*. */
var FB={project:'vokabeln-ca1d7',key:'AIzaSyBaTPUOPWeMjD0K3FXxBPJsF3Z047VDl8I'};
function fam(){var c=ls('sk:fam');if(c==='off')return '';return c||ls('vt:fam')||'';}
function fsBase(){return 'https://firestore.googleapis.com/v1/projects/'+FB.project+'/databases/(default)/documents/families/'+fam()+'/profiles';}
function setSync(ok,msg){if(ok){lset('sk:syncAt',String(Date.now()));ldel('sk:syncErr');}else lset('sk:syncErr',msg||'Fehler');}
function mergeMap(a,b,pick){var o={},s={};Object.keys(a||{}).concat(Object.keys(b||{})).forEach(function(k){s[k]=1;});Object.keys(s).forEach(function(k){var x=(a||{})[k],y=(b||{})[k];o[k]=!x?y:!y?x:pick(x,y);});return o;}
function mergeHist(x,y){var m={};(x||[]).concat(y||[]).forEach(function(e){m[e[0]]=e;});return Object.keys(m).map(function(k){return m[k];}).sort(function(p,q){return p[0]-q[0];}).slice(-10);}
function mergeRes(x,y){var l=(y.t||0)>(x.t||0)?y:x;return {best:Math.max(x.best||0,y.best||0),last:l.last,n:Math.max(x.n||0,y.n||0),t:Math.max(x.t||0,y.t||0),h:mergeHist(x.h,y.h)};}
function mergeP(a,b){
  if(!a)return normP(b);if(!b)return normP(a);
  a=normP(a);b=normP(b);
  var o={k:{},q:{},pr:{},log:{},g:{},gz:{}};
  o.k=mergeMap(a.k,b.k,function(x,y){return (y.t||0)>(x.t||0)?y:x;});
  o.q=mergeMap(a.q,b.q,mergeRes);
  if(a.pr.n||b.pr.n)o.pr=mergeRes(a.pr.n?a.pr:{},b.pr.n?b.pr:{});
  o.log=mergeMap(a.log,b.log,function(x,y){var m={};['s','n','ok','g','l','qz'].forEach(function(f){m[f]=Math.max(x[f]||0,y[f]||0);});return m;});
  o.gz=mergeMap(a.gz,b.gz,function(x,y){return Math.max(x||0,y||0);});
  o.g=mergeMap(a.g,b.g,function(ga,gb){
    var m={};
    Object.keys(ga).concat(Object.keys(gb)).forEach(function(f){
      var va=ga[f]||0,vb=gb[f]||0;
      m[f]=f==='fast'?((va&&vb)?Math.min(va,vb):(va||vb)):Math.max(va,vb);
    });
    return m;
  });
  Object.keys(o.g).forEach(function(x){if(o.g[x]&&(o.g[x].t||0)<=(o.gz[x]||0))delete o.g[x];});
  if(a.cfg||b.cfg){var ca=a.cfg,cb=b.cfg;o.cfg=!ca?cb:!cb?ca:((cb.t||0)>(ca.t||0)?cb:ca);}
  if(a.rc||b.rc){var ra=a.rc||{d:'',n:0},rb=b.rc||{d:'',n:0};o.rc=ra.d>rb.d?ra:rb.d>ra.d?rb:{d:ra.d,n:Math.max(ra.n||0,rb.n||0)};}
  return o;
}
function pushProfile(k,keep){
  if(!fam())return Promise.resolve(false);
  var body=JSON.stringify({fields:{name:{stringValue:k.name},role:{stringValue:k.role||'kid'},avatar:{stringValue:k.avatar||''},p:{stringValue:JSON.stringify(profileData(k))},u:{integerValue:'0'}}});
  return fetch(fsBase()+'/'+k.id+'?key='+FB.key,{method:'PATCH',headers:{'Content-Type':'application/json'},body:body,keepalive:!!keep&&body.length<60000})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);setSync(true);return true;})
    .catch(function(e){setSync(false,e.message);return false;});
}
function schedulePush(){
  dirty=true;
  if(!fam()||!kid||pt)return;
  pt=setTimeout(function(){pt=null;if(dirty&&kid){dirty=false;pushProfile(kid);}},20000);
}
function flush(){if(dirty&&fam()&&kid){dirty=false;pushProfile(kid,true);}}
function pullAll(){
  if(!fam())return Promise.resolve(false);
  return fetch(fsBase()+'?pageSize=100&key='+FB.key).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(j){
    var remote={},changed=false,pushes=[];
    (j.documents||[]).forEach(function(d){var id=d.name.split('/').pop(),f=d.fields||{};remote[id]=(f.p||{}).stringValue||'';});
    KIDS.forEach(function(k){
      var rs=remote[k.id];
      if(rs===undefined){pushes.push(k);return;}
      var rp=null;try{rp=JSON.parse(rs);}catch(e){}
      var lp=lj('sk:'+k.id,null),mp=mergeP(lp,rp);
      if(JSON.stringify(mp)!==JSON.stringify(lp)){sj('sk:'+k.id,mp);changed=true;if(kid&&kid.id===k.id&&!busy)P=mp;}
      if(JSON.stringify(mp)!==JSON.stringify(normP(rp)))pushes.push(k);
    });
    return Promise.all(pushes.map(function(k){return pushProfile(k);})).then(function(){setSync(true);return changed;});
  }).catch(function(e){setSync(false,e.message);return false;});
}
function initSync(){
  if(!fam())return;
  pullAll().then(function(ch){if(!ch||busy||inGame)return;
    stay(function(){if(view==='select')selectKid();else if(view==='home'){if(kid)home(true);else selectKid();}});});
}
window.addEventListener('online',function(){pullAll();});
function genCode(){var a='abcdefghijkmnpqrstuvwxyz23456789',b=new Uint8Array(24),s='',i;crypto.getRandomValues(b);for(i=0;i<24;i++)s+=a[b[i]%a.length];return s;}
function parseCode(t){var m=(t||'').trim().match(/([a-z0-9]{20,})$/i);return m?m[1].toLowerCase():'';}
function setFam(c){lset('sk:fam',c);pullAll().then(function(){if(view==='select')selectKid();else settings(true);});}
function copyText(t,el){
  function fallback(){prompt('Zum Kopieren:',t);}
  try{navigator.clipboard.writeText(t).then(function(){el.textContent='Kopiert ✔';el.className='msg ok';},fallback);}catch(e){fallback();}
}
function famLink(){return location.origin+location.pathname+'#fam='+fam();}
var FAM_TXT='Hallo! Das ist unser Sachkunde-Trainer, nur für unsere Familie. Einmal öffnen, dann ist dein Gerät verbunden und du kannst losüben:';
function shareFam(msgEl){
  if(navigator.share){navigator.share({title:'Sachkunde-Trainer',text:FAM_TXT,url:famLink()}).catch(function(){});}
  else copyText(FAM_TXT+'\n'+famLink(),msgEl);
}
function showQR(box){
  if(box.firstChild){box.replaceChildren();return;}
  function draw(){
    var q=qrcode(0,'M');q.addData(famLink());q.make();
    box.innerHTML=q.createSvgTag({cellSize:5,margin:3,scalable:true});
    var svg=box.firstChild;if(svg&&svg.style)svg.style.cssText='width:240px;max-width:100%;height:auto;background:#fff;border-radius:12px';
    box.append(h('p',{class:'soft',style:'margin:6px 0 0'},'Mit der Kamera des anderen Geräts scannen und den Link öffnen.'));
  }
  if(window.qrcode)draw();
  else{var sc=document.createElement('script');sc.src='qr.js?v='+APPV;sc.onload=draw;sc.onerror=function(){box.textContent='Der QR-Code konnte nicht geladen werden.';};document.head.append(sc);}
}
function familyCard(){
  var msg=h('div',{class:'msg'}),code=fam();
  if(!code){
    var inp=h('input',{class:'plain',type:'text',placeholder:'Familiencode oder Link einfügen',autocapitalize:'off',spellcheck:'false'});
    return h('div',{class:'card'},h('h2',{style:'margin-top:0'},'👨‍👩‍👧 Familie & Geräte'),
      h('p',null,'Verbinde die Geräte, damit du hier den Fortschritt aller Kinder siehst. Am besten nimmst du denselben Familiencode wie in der Vokabel-App, dann sind beide Apps in einer Familie (die Daten bleiben getrennt). Gespeichert werden nur Profilname, Häschen und Lernstand (Server in Berlin).'),
      h('div',{class:'row'},inp,h('button',{class:'btn primary',onclick:function(){var c=parseCode(inp.value);if(!c){msg.textContent='Das sieht nicht wie ein Familiencode aus.';msg.className='msg bad';return;}setFam(c);}},'Verbinden')),
      h('p',{class:'soft',style:'margin:12px 0 4px'},'Oder ganz neu anfangen (nur, wenn es noch keine Familie gibt):'),
      h('button',{class:'btn',onclick:function(){if(confirm('Wirklich eine NEUE Familie anlegen? Wenn ihr schon die Vokabel-App verbunden habt, nehmt lieber deren Code.'))setFam(genCode());}},'Neue Familie anlegen'),msg);
  }
  var qrBox=h('div',{class:'center',style:'margin:8px 0'});
  var at=+(ls('sk:syncAt')||0),err=ls('sk:syncErr');
  return h('div',{class:'card'},h('h2',{style:'margin-top:0'},'👨‍👩‍👧 Familie & Geräte'),
    h('p',null,err?'⚠️ Abgleich fehlgeschlagen ('+err+')':at?'✓ Verbunden · zuletzt abgeglichen '+new Date(at).toLocaleString('de-DE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'Verbunden'),
    h('div',{class:'row'},
      h('button',{class:'btn',onclick:function(){msg.textContent='Gleiche ab …';pullAll().then(function(){stay(function(){settings(true);});});}},'🔄 Jetzt abgleichen'),
      h('button',{class:'btn primary',onclick:function(){shareFam(msg);}},'📤 Link teilen'),
      h('button',{class:'btn',onclick:function(){copyText(FAM_TXT+'\n'+famLink(),msg);}},'📋 Nachricht kopieren'),
      h('button',{class:'btn',onclick:function(){showQR(qrBox);}},'▣ QR-Code zeigen')),
    qrBox,
    h('p',{class:'soft',style:'margin:6px 0'},'Öffnet ein Kind diesen Link einmal auf seinem Gerät, ist es mit der Familie verbunden. Bitte nicht weitergeben, wer den Link hat, kann den Lernstand sehen.'),
    h('p',{class:'soft',style:'margin:6px 0;word-break:break-all'},'Familiencode: '+code),msg,
    h('button',{class:'btn small',onclick:function(){if(confirm('Dieses Gerät von der Familie trennen? Der Lernstand bleibt auf dem Gerät, wird aber nicht mehr abgeglichen.')){lset('sk:fam','off');settings(true);}}},'Verbindung trennen'));
}
function connectScreen(){
  var inp=h('input',{class:'plain',type:'text',placeholder:'Familiencode oder Link einfügen',autocapitalize:'off',spellcheck:'false'}),msg=h('div',{class:'msg'});
  setTitle('🔗 Mit Familie verbinden');
  mount(h('p',null,'Frag deine Eltern nach dem Familien-Link oder dem Code.'),h('div',{class:'row'},inp,h('button',{class:'btn primary',onclick:function(){var c=parseCode(inp.value);if(!c){msg.textContent='Das sieht nicht wie ein Familiencode aus.';msg.className='msg bad';return;}setFam(c);}},'Verbinden')),msg,
    h('div',{class:'row'},h('button',{class:'btn',onclick:selectKid},'Zurück')));
}

/* ---------- Navigation ---------- */
function setTitle(t){titleEl.textContent=t||'Sachkunde-Trainer';}
function updHeader(){
  statEl.textContent='';
  if(kid){whoBtn.style.display='';whoBtn.textContent='👤 '+kid.name;}else whoBtn.style.display='none';
}
function go(fn,title,noPush){
  if(!noPush&&app._cur)history.push(app._cur);
  app._cur={fn:fn,title:title};
  setTitle(title);updHeader();
  backBtn.style.display=history.length||title?'':'none';
  fn();window.scrollTo(0,0);
}
backBtn.onclick=function(){if(inGame)return;var p=history.pop();if(p){app._cur=p;setTitle(p.title);backBtn.style.display=history.length?'':'none';p.fn();window.scrollTo(0,0)}else home()};
whoBtn.onclick=function(){if(inGame)return;if(P&&kid){saveP();flush();}kid=null;P=null;ldel('sk:currentKid');selectKid();};
function home(noPull){history=[];app._cur=null;if(!kid){selectKid();return;}go(function(){renderHome(noPull);},'',true);backBtn.style.display='none';}

/* ---------- Lightbox ---------- */
var lbList=[],lbPos=0,lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg');
function openLb(ids,start){
  lbList=ids.map(pageById).filter(function(i){return i>=0});
  if(!lbList.length)return;
  lbPos=Math.max(0,Math.min(start||0,lbList.length-1));lb.classList.add('on');lb.classList.remove('zoom');showLb();
}
function showLb(){var p=SEITEN[lbList[lbPos]];lbImg.src='seiten/'+p.id+'.jpg';lbImg.alt=p.titel;document.getElementById('lbTitle').textContent=p.seite+' · '+p.titel+(lbList.length>1?'  ('+(lbPos+1)+'/'+lbList.length+')':'')}
document.getElementById('lbClose').onclick=function(){lb.classList.remove('on')};
document.getElementById('lbPrev').onclick=function(){lbPos=(lbPos+lbList.length-1)%lbList.length;showLb()};
document.getElementById('lbNext').onclick=function(){lbPos=(lbPos+1)%lbList.length;showLb()};
document.getElementById('lbZoom').onclick=function(){lb.classList.toggle('zoom')};
document.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')lb.classList.remove('on');if(e.key==='ArrowRight')document.getElementById('lbNext').click();if(e.key==='ArrowLeft')document.getElementById('lbPrev').click()});
function nachschlagen(ids){
  if(!ids||!ids.length)return '';
  var hh='<div class="row noprint" style="margin-top:14px">';
  ids.forEach(function(id,i){var k=pageById(id);if(k<0)return;hh+='<button data-pg="'+id+'" data-all="'+ids.join(',')+'">📖 '+esc(SEITEN[k].seite)+'</button>'});
  return hh+'</div>';
}
document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-pg]');if(!b)return;
  var all=(b.getAttribute('data-all')||b.getAttribute('data-pg')).split(',');openLb(all,all.indexOf(b.getAttribute('data-pg')));
});

/* ---------- Bilder ---------- */
function avImg(name,cls){
  var i=h('img',{src:'bilder/'+name+'.webp',class:'avatar '+(cls||''),alt:''});
  i.onerror=function(){var s=h('span',{class:'avatar ph '+(cls||'')},'🐰');if(i.parentNode)i.replaceWith(s);};
  return i;
}
function avatar(k,cls){return avImg(k.avatar,(cls||'')+(k.role==='parent'?' wide':''));}
function pic(name,cls){return h('img',{src:'bilder/'+name+'.webp',class:cls||'',alt:'',onerror:function(){this.style.display='none';}});}

/* ---------- Wochenübersicht (Lernzeit) ---------- */
var GOAL_S=1200,GOAL_DAYS=4,wkOff=0;
function weekStats(p,off){
  var log=p.log||{},m=mondayOf(off),days=[],tot={s:0,n:0,ok:0,g:0,l:0,qz:0},pts=0,gd=0,active=0,maxS=GOAL_S,i;
  for(i=0;i<7;i++){
    var d=new Date(m);d.setDate(m.getDate()+i);
    var L=log[ymd(d)]||{s:0,n:0,ok:0,g:0,l:0,qz:0};
    days.push({d:d,L:L});tot.s+=L.s;tot.n+=L.n;tot.ok+=L.ok;tot.g+=L.g||0;tot.l+=L.l||0;tot.qz+=L.qz||0;
    pts+=Math.min(1,L.s/GOAL_S);if(L.s>=GOAL_S)gd++;if(L.n>0||L.s>=30)active++;if(L.s>maxS)maxS=L.s;
  }
  return {days:days,tot:tot,pts:pts,gd:gd,active:active,maxS:maxS};
}
/* Einschätzung ohne Zahlen für die Kinder; ein langer Tag ersetzt keinen anderen Tag (je Tag höchstens 1 Punkt) */
function rating(pts,totalSec){
  var min=totalSec/60;
  if(pts>=4&&(pts>=5||min>=100))return {e:'🏆',t:'Überflieger! Du bist bestens für die Arbeit vorbereitet!'};
  if(pts>=4)return {e:'🎉',t:'Wochenziel geschafft – das war richtig stark!'};
  if(pts>=3)return {e:'🚀',t:'Fast geschafft! Noch ein Übungstag und es ist perfekt.'};
  if(pts>=2)return {e:'🌟',t:'Richtig stark – du bist toll dabei!'};
  if(pts>=1)return {e:'🌲',t:'Du bist gut unterwegs!'};
  if(pts>=0.25)return {e:'🐣',t:'Ein Anfang ist gemacht. Weiter so!'};
  return {e:'🌱',t:'Diese Woche geht es gleich los – heute ist ein guter Tag zum Üben!'};
}
function weekStatus(p){
  var st=weekStats(p,0),eff=Math.round(st.pts*20),wd=(new Date().getDay()+6)%7,expected=GOAL_DAYS*(wd+1)/7,deficit=expected-st.pts;
  return {min:eff,active:st.active,c:(st.pts>=GOAL_DAYS||deficit<=0.5)?'g':deficit<=1.5?'o':'r'};
}
function weekKidCard(){
  var st=weekStats(P,0),r=rating(st.pts,st.tot.s),pc=Math.min(100,Math.round(100*st.pts/GOAL_DAYS));
  return h('div',{class:'card'},
    h('div',{class:'row',style:'align-items:center;margin:0;flex-wrap:nowrap'},h('div',{style:'font-size:42px;line-height:1;flex:none'},r.e),h('div',{style:'flex:1 1 auto'},h('b',null,'Deine Woche'),h('div',null,r.t))),
    h('div',{class:'track'},h('i',{style:'width:'+pc+'%'}),h('span',{class:'rk',style:'left:'+Math.max(4,pc)+'%'},'🚀')));
}

/* ---------- Karten-Stand ---------- */
function stats(p){
  p=p||P;var s={n:KARTEN.length,k:0,t:{verkehr:{n:0,k:0},wald:{n:0,k:0}}};
  KARTEN.forEach(function(c){var kn=!!(p.k[cid(c)]&&p.k[cid(c)].v);s.t[c.t].n++;if(kn){s.k++;s.t[c.t].k++;}});
  return s;
}
function pctKnown(s){return s.n?Math.round(100*s.k/s.n):0;}
function barEl(p,cls){return h('div',{class:'progress '+(cls||'')},h('i',{style:'width:'+p+'%'}));}
function bestOf(p,t){var q=p.q[t];return q&&q.best!=null?q.best:null;}
function starCount(pct){return pct>=90?3:pct>=70?2:pct>=50?1:0;}
function starStr(pct){var n=starCount(pct);return '⭐'.repeat(n)+'☆'.repeat(3-n);}
function phrase(p){return p>=95?'Du kannst fast alles – super!':p>=60?'Schon richtig viel gekonnt!':p>=30?'Gut dabei, die Sammlung wächst!':p>0?'Die ersten Karten sitzen.':'Hier geht es los!';}

/* ---------- PIN (Eltern-Code) ---------- */
function pinCode(){return ls('sk:pin')||ls('vt:pin')||'4444';}
function pinWait(){return Math.max(0,Math.ceil((+(ls('sk:pinlock')||0)-Date.now())/1000));}
function pinFail(){var n=(+(ls('sk:pinfail')||0))+1;lset('sk:pinfail',String(n));if(n>=3){var sec=Math.min(900,60*Math.pow(2,n-3));lset('sk:pinlock',String(Date.now()+sec*1000));}return n;}
function pinOk(){ldel('sk:pinfail');ldel('sk:pinlock');}
function pinScreen(onOk){
  var val='',dots=h('div',{class:'pindots'}),msg=h('div',{class:'msg'});
  function draw(){dots.replaceChildren();for(var i=0;i<4;i++)dots.append(h('span',{class:i<val.length?'on':''}));}
  function off(){document.removeEventListener('keydown',key);}
  function press(d){
    var w=pinWait();
    if(w>0){msg.textContent='Zu viele Versuche. Bitte warte noch '+w+' Sekunden.';msg.className='msg bad';return;}
    if(val.length>=4)return;val+=d;draw();
    if(val.length===4){
      if(val===pinCode()){pinOk();off();onOk();}
      else{pinFail();var w2=pinWait();msg.textContent=w2>0?'Falscher Code. Bitte warte '+w2+' Sekunden.':'Falscher Code';msg.className='msg bad';shake(dots);setTimeout(function(){val='';draw();},300);}
    }
  }
  function key(e){if(e.key>='0'&&e.key<='9')press(e.key);else if(e.key==='Backspace'){val=val.slice(0,-1);draw();}}
  document.addEventListener('keydown',key);
  var pad=h('div',{class:'pinpad'});
  ['1','2','3','4','5','6','7','8','9','','0','⌫'].forEach(function(d){
    pad.append(d===''?h('span'):h('button',{class:'btn',onclick:function(){if(d==='⌫'){val=val.slice(0,-1);draw();}else press(d);}},d));
  });
  setTitle('🔒 Eltern-Code');
  mount(h('p',{class:'soft'},'Bitte den vierstelligen Code eingeben.'),dots,msg,pad,h('div',{class:'row',style:'justify-content:center'},h('button',{class:'btn small',style:'flex:none',onclick:function(){off();selectKid();}},'Abbrechen')));
  draw();
}
function pickKid(k){
  function enter(){kid=k;if(k.role!=='parent')lset('sk:currentKid',k.id);loadP();home();}
  if(k.role==='parent')pinScreen(enter);else enter();
}

/* ---------- Spielstände und Podeste ---------- */
function gameVal(p,kind){
  var g=(p&&p.g)||{};
  if(kind==='run')return (g.run&&g.run.bm)||null;
  if(kind==='block')return (g.block&&g.block.best)||null;
  if(kind==='sd6')return (g.sd6&&g.sd6.fast)||null;
  if(kind==='sd9')return (g.sd9&&g.sd9.fast)||null;
  return null;
}
function pOf(k){return (kid&&k.id===kid.id&&P)?P:profileData(k);}
function gameRows(kind){return KIDS.map(function(k){return {k:k,val:gameVal(pOf(k),kind)};});}
function rankRows(rows,better){
  var w=rows.filter(function(r){return r.val!=null;}).sort(function(a,b){return better==='low'?a.val-b.val:b.val-a.val;});
  var n=rows.filter(function(r){return r.val==null;});
  w.forEach(function(r,i){r.place=i>0&&r.val===w[i-1].val?w[i-1].place:i+1;});
  n.forEach(function(r){r.place=0;});
  return w.concat(n);
}
function podiumCard(title,kind,better,fmt,extra){
  var ord=rankRows(gameRows(kind),better),slots=ord.length>=3?[ord[1],ord[0],ord[2]].concat(ord.slice(3)):ord;
  return h('div',{class:'card'},h('b',null,title),extra||null,
    h('div',{class:'podium'},slots.map(function(r){
      var pl=r.place,hgt=pl===1?84:pl===2?62:pl===3?44:28,col=pl===1?'#E8A33D':pl===2?'#A9AEC4':pl===3?'#C98A5A':'#CFC9BC';
      return h('div',{class:'pod'},avatar(r.k,'pod'),h('div',{class:'pname'},r.k.name),h('div',{class:'ppts'},r.val==null?'noch nichts':fmt(r.val)),
        h('div',{class:'step',style:'height:'+hgt+'px;background:'+col},pl?medal(pl):'–'));
    })));
}
var sdSize='sd6';
function podia(){
  var chips=h('div',{class:'chips',style:'margin:8px 0 0'},[['sd6','Klein 6×6'],['sd9','Groß 9×9']].map(function(x){
    return h('button',{class:'chip'+(sdSize===x[0]?' on':''),onclick:function(){stay(function(){sdSize=x[0];if(view==='select')selectKid();});}},x[1]);}));
  return h('div',null,h('h2',null,'🏆 Spiele-Podeste'),
    podiumCard('🏃 Jump-and-Run – wer ist am weitesten gekommen?','run','high',function(v){return v+' m';}),
    podiumCard('🧱 Hoppel-Blöcke – wer hat die meisten Punkte?','block','high',function(v){return v+' Punkte';}),
    podiumCard('🧩 Sudoku – wer war am schnellsten?',sdSize,'low',fmtT,chips));
}
function recordCard(){
  var items=[['run','🏃 Jump-and-Run','high',function(v){return v+' m';}],['block','🧱 Hoppel-Blöcke','high',function(v){return v+' Punkte';}],['sd6','🧩 Sudoku klein','low',fmtT],['sd9','🧩 Sudoku groß','low',fmtT]];
  return h('div',{class:'card'},h('b',null,'🎮 Deine Rekorde'),items.map(function(it){
    var me=rankRows(gameRows(it[0]),it[2]).filter(function(r){return r.k.id===kid.id;})[0];
    return h('div',{class:'row',style:'justify-content:space-between;margin:4px 0 0;flex-wrap:nowrap'},h('span',null,it[1]),
      h('span',null,me.val==null?'–':it[3](me.val)+(me.place?'  '+medal(me.place)+' Platz '+me.place:'')));
  }));
}

/* ---------- Profilwahl ---------- */
function ptile(k){
  var parent=k.role==='parent',st=parent?null:weekStatus(profileData(k));
  return h('button',{class:'ptile',style:'background:'+(k.color||'#8B6FC4'),onclick:function(){pickKid(k);}},
    avatar(k,'pt'),
    h('div',{class:'ptxt'},h('div',{class:'pnm'},k.name+(parent?' 🔒':'')),
      parent?h('div',{class:'psub'},'Eltern-Bereich mit Code'):h('div',null,
        h('div',{class:'psub'},h('span',{class:'dot '+st.c}),'An '+st.active+' Tagen gelernt · '+st.min+' von '+(GOAL_DAYS*20)+' Min'),
        h('div',{class:'mbar'},h('i',{style:'width:'+Math.min(100,Math.round(100*st.min/(GOAL_DAYS*20)))+'%'})))));
}
function selectKid(){
  busy=false;inGame=false;view='select';history=[];app._cur=null;
  setTitle('');backBtn.style.display='none';updHeader();
  mount(h('h2',{style:'margin-top:0'},'Wer übt heute?'),h('p',{class:'soft'},'Tippe auf dein Häschen. Klassenarbeit Sachkunde am 10.11.: Verkehr und Wald.'),
    KIDS.map(ptile),

    fam()?null:h('p',{class:'center'},h('button',{class:'btn small',onclick:connectScreen},'🔗 Mit Familie verbinden')));
}

/* ---------- Spiele als Belohnung ---------- */
function cfg(){
  var par=KIDS.filter(function(k){return k.role==='parent';})[0],p=par?((kid&&kid.id===par.id&&P)?P:profileData(par)):null,c=(p&&p.cfg)||{};
  return {ev:c.ev===2?2:1,n:c.n>=1&&c.n<=5?c.n:3};
}
function gamesOn(){return false;}
function loadScript(src,ok,fail){
  window.__ls=window.__ls||{};
  if(window.__ls[src]){ok();return;}
  var sc=document.createElement('script');sc.src=src+'?v='+APPV;
  sc.onload=function(){window.__ls[src]=1;ok();};
  sc.onerror=function(){if(fail)fail();};
  document.head.append(sc);
}
function gameStats(){if(!P.g)P.g={};return P.g;}
function recordsLine(){return '🏆 Weitester Lauf – '+KIDS.map(function(k){return k.name+': '+(gameVal(pOf(k),'run')||0)+' m';}).join(' · ');}
function sdLine(size){return '🏆 Schnellste Zeit '+(size===9?'groß':'klein')+' – '+KIDS.map(function(k){var t=gameVal(pOf(k),'sd'+size);return k.name+': '+(t?fmtT(t):'–');}).join(' · ');}
function blockLine(){return '🏆 Meiste Punkte – '+KIDS.map(function(k){return k.name+': '+(gameVal(pOf(k),'block')||0);}).join(' · ');}
var fsEl=null,fsOff=null;
function closeFS(){
  if(!fsEl)return;
  if(fsOff)fsOff();
  fsEl.remove();fsEl=null;fsOff=null;
  document.documentElement.style.overflow='';document.body.style.overflow='';
}
function enterFS(){
  closeFS();
  var o=h('div',{class:'gamefs'});document.body.append(o);fsEl=o;
  document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
  return o;
}
function gamePage(title,inner){inGame=true;setTitle(title);backBtn.style.display='none';whoBtn.style.display='none';mount(inner);}
function playRun(done,opts){
  inGame=true;lastAct=0;
  var o=enterFS(),box=h('div',{class:'gamebox'}),R0=(P.g||{}).run||{},best=R0.bm||0,startT=(opts&&opts.startT)||0,run=null,ignore=false;
  function end(){inGame=false;lastAct=0;updHeader();}
  var hint=h('div',{class:'rothint'},h('div',{class:'rotico'},'📱'),h('h2',{style:'margin:0'},'Bitte dreh dein Gerät ins Querformat'),
    h('p',{style:'margin:0'},'Dann hat Hoppel mehr Platz zum Rennen.'),
    h('button',{class:'btn',onclick:function(){ignore=true;upd();}},'Lieber hochkant spielen'));
  function upd(){hint.style.display=(!ignore&&window.innerHeight>window.innerWidth)?'flex':'none';}
  window.addEventListener('resize',upd);fsOff=function(){window.removeEventListener('resize',upd);};
  var quit=h('button',{class:'gamequit','aria-label':'Spiel beenden',title:'Beenden',onclick:function(){if(run&&run.stop)run.stop();closeFS();end();done();}},'✕');
  o.append(box,hint,quit);upd();
  function page(inner){gamePage('🏃 Jump-and-Run',inner);}
  loadScript('spiel-run.js',function(){
    run=window.HoppelRun.start(box,{best:best,startT:startT,fit:true,onEnd:function(r){
      var G=gameStats(),R=G.run||(G.run={bm:0,best:0,plays:0});
      R.plays=(R.plays||0)+1;R.t=Date.now();if(r.meters>(R.bm||0))R.bm=r.meters;if(r.score>(R.best||0))R.best=r.score;saveP();
      closeFS();
      page(h('div',{class:'card center'},
        pic(r.newRecord&&best>0?'ergebnis-5':'kaninchen-winkt','hero'),
        h('h2',null,r.newRecord&&best>0?'Neuer Rekord! 🏆':'Geschafft!'),
        h('p',null,h('b',null,r.meters+' m weit'),' · '+r.score+' Punkte · '+r.carrots+' Karotten'+(r.pulls?' · '+r.pulls+' Möhre(n) gezogen':'')),
        h('p',{class:'soft'},recordsLine()),
        h('button',{class:'btn primary big',onclick:function(){end();done();}},'Weiter')));
    }});
  },function(){closeFS();page(h('div',{class:'card center'},h('p',null,'Das Spiel konnte nicht geladen werden.')));setTimeout(function(){end();done();},1500);});
}
function playBlock(done,opts){
  inGame=true;lastAct=0;
  var o=enterFS(),box=h('div',{class:'gamebox'}),B0=(P.g||{}).block||{},best=B0.best||0,blk=null;
  function end(){inGame=false;lastAct=0;updHeader();}
  var quit=h('button',{class:'gamequit','aria-label':'Spiel beenden',title:'Beenden',onclick:function(){if(blk&&blk.stop)blk.stop();closeFS();end();done();}},'✕');
  o.append(box,quit);
  function page(inner){gamePage('🧱 Hoppel-Blöcke',inner);}
  loadScript('spiel-block.js',function(){
    blk=window.HoppelBlock.start(box,{onEnd:function(r){
      var G=gameStats(),R=G.block||(G.block={best:0,plays:0});
      var neu=r.score>(R.best||0);
      R.plays=(R.plays||0)+1;R.t=Date.now();if(neu)R.best=r.score;if(r.level>(R.lv||0))R.lv=r.level;saveP();
      closeFS();
      page(h('div',{class:'card center'},
        pic(neu&&best>0?'ergebnis-5':'kaninchen-winkt','hero'),
        h('h2',null,neu&&best>0?'Neuer Rekord! 🏆':'Geschafft!'),
        h('p',null,h('b',null,r.score+' Punkte'),' · Level '+r.level+' · '+r.lines+' Reihe(n)'+(r.trios?' · '+r.trios+'× Hoppel-Bonus 🐰':'')),
        h('p',{class:'soft'},blockLine()),
        h('button',{class:'btn primary big',onclick:function(){end();done();}},'Weiter')));
    }});
  },function(){closeFS();page(h('div',{class:'card center'},h('p',null,'Das Spiel konnte nicht geladen werden.')));setTimeout(function(){end();done();},1500);});
}
function playSudoku(done,opts){
  var g=P.g||{};
  function info(sz){var t=(g['sd'+sz]||{}).fast;return t?'Bestzeit '+fmtT(t):'noch keine Bestzeit';}
  var back=(opts&&opts.back)||done;
  inGame=true;setTitle('🧩 Sudoku');backBtn.style.display='none';
  mount(h('div',{class:'card center'},h('p',null,'Wie groß soll dein Sudoku sein?'),
      h('div',{class:'row',style:'justify-content:center'},
        h('button',{class:'btn primary',onclick:function(){startSudoku(6,done);}},'Klein 6×6 – ca. 3 Minuten',h('br'),h('small',null,info(6))),
        h('button',{class:'btn primary',onclick:function(){startSudoku(9,done);}},'Groß 9×9 – ca. 8 Minuten',h('br'),h('small',null,info(9)))),
      h('p',{class:'soft'},'Die Zeit zählt für das Sudoku-Podest. Jeder Tipp kostet 30 Sekunden Strafzeit.'),
      h('button',{class:'btn small',onclick:function(){inGame=false;updHeader();back();}},'Zurück')));
}
function startSudoku(size,done){
  inGame=true;lastAct=0;
  var box=h('div'),key='sd'+size;
  function end(){inGame=false;lastAct=0;updHeader();}
  setTitle('🧩 Sudoku '+(size===9?'groß':'klein'));
  mount(h('p',{class:'soft',style:'margin:0 0 8px'},'Jede Zahl kommt in jeder Zeile, jeder Spalte und jedem Kästchen genau einmal.'),box);
  loadScript('spiel-sudoku.js',function(){
    window.HoppelSudoku.start(box,{size:size,onEnd:function(r){
      if(!r.solved){end();done();return;}
      var G=gameStats(),S2=G[key]||(G[key]={solved:0,fast:0}),had=S2.fast;
      S2.t=Date.now();S2.solved=(S2.solved||0)+1;var neu=!had||r.total<had;if(neu)S2.fast=r.total;saveP();
      box.replaceChildren(h('div',{class:'card center'},pic(neu&&had?'ergebnis-5':'kaninchen-winkt','hero'),
        h('h2',null,neu&&had?'Neue Bestzeit! 🏆':'Gelöst! 🎉'),
        h('p',null,h('b',null,fmtT(r.total)+' Minuten'),r.hints?' (mit '+r.hints*30+' Sekunden Strafzeit für Tipps)':' · ohne Tipp'),
        h('p',{class:'soft'},sdLine(size)),
        h('button',{class:'btn primary big',onclick:function(){end();done();}},'Weiter')));
    }});
  },function(){end();box.textContent='Das Spiel konnte nicht geladen werden.';setTimeout(done,1500);});
}
var GAMES=[{id:'run',emoji:'🏃',name:'Jump-and-Run',text:'ein bisschen Action (3 Leben)',play:playRun},{id:'sudoku',emoji:'🧩',name:'Sudoku',text:'ein bisschen Denken',play:playSudoku},{id:'block',emoji:'🧱',name:'Hoppel-Blöcke',text:'stapeln und Hasen sammeln',play:playBlock}];
function gameMenu(title,text,done,extra){
  inGame=false;updHeader();setTitle('🎮 Spielzeit');backBtn.style.display='none';
  mount(h('div',{class:'card center'},pic('kaninchen-winkt','hero'),h('h2',null,title),h('p',null,text),
    h('div',{class:'row',style:'justify-content:center'},
      GAMES.map(function(gm){return h('button',{class:'btn primary',onclick:function(){gm.play(done,{back:function(){gameMenu(title,text,done,extra);}});}},gm.emoji+' '+gm.name+' – '+gm.text);}),
      extra||null)));
}
var plays=0;
function playsMenu(){
  if(plays<=0){home();return;}
  gameMenu('Was möchtest du spielen?','Noch '+plays+' '+(plays===1?'Spiel':'Spiele')+'. Heute lieber ein bisschen Action oder ein bisschen Denken?',
    function(){plays--;playsMenu();},
    h('button',{class:'btn',onclick:function(){plays=0;home();}},'Fertig, weiter lernen'));
}
/* Ein Durchlauf ist geschafft (nur Kinder): zählt pro Tag, nach der Einstellung gibt es Spielzeit */
function countRun(){
  if(!kid||isParent())return 0;
  var dd=todayStr();if(!P.rc||P.rc.d!==dd)P.rc={d:dd,n:0};P.rc.n++;saveP();return P.rc.n;
}
function rewardEl(rn){
  if(!rn||!gamesOn())return null;
  var c=cfg();
  if(rn%c.ev!==0)return h('p',{class:'soft',style:'text-align:center'},'🎮 Nach dem nächsten Durchlauf darfst du spielen!');
  return h('div',{class:'fb ok'},h('h2',{style:'margin-top:0'},'🎮 Spielzeit verdient!'),
    h('p',null,(c.ev===1?'Durchlauf geschafft':'Zwei Durchläufe geschafft')+' – das war richtig fleißig. Jetzt darfst du '+c.n+' '+(c.n===1?'Spiel':'Spiele')+' spielen (beim Jump-and-Run mit je 3 Leben).'),
    h('button',{class:'btn primary',onclick:function(){plays=c.n;playsMenu();}},'🎮 Jetzt aussuchen'));
}
function addReward(rn){var r=rewardEl(rn);if(!r)return;var row=app.querySelector('.row');if(row)app.insertBefore(r,row);else app.append(r);}

/* ---------- Start ---------- */
function renderHome(noPull){
  busy=false;inGame=false;view='home';
  if(!kid){selectKid();return;}
  if(isParent()){renderParentHome(noPull);return;}
  var s=stats(),pc=pctKnown(s);
  app.replaceChildren();
  mount(h('div',{class:'center'},pic('kaninchen-winkt','hero')),
    h('h2',{style:'margin:4px 0'},'Hallo '+kid.name+'!'),
    weekKidCard(),
    h('div',{class:'card'},h('b',null,'🃏 Deine Karten-Sammlung'),barEl(pc,'big'),h('p',{class:'soft',style:'margin:4px 0 0'},phrase(pc))),

    homeTiles(false));
}
function homeTiles(parent){
  return h('div',null,
    h('p',null,'Klassenarbeit Sachkunde am ',h('b',null,'10.11.'),' – Thema ',h('b',null,'Verkehrserziehung (Fahrrad)'),' und ',h('b',null,'Lebensraum Wald'),'. Such dir etwas aus:'),
    h('div',{class:'grid',html:
  '<button class="tile w" data-go="karten"><b>🃏 Lernkarten</b><span>Frage lesen, überlegen, umdrehen.</span></button>'+
  '<button class="tile v" data-go="quiz"><b>❓ Quiz</b><span>Üben mit Fragen. Mit Erklärung.</span></button>'+
  '<button class="tile g" data-go="probe"><b>📝 Probe-Arbeit</b><span>20 gemischte Fragen wie in der Arbeit.</span></button>'+
  '<button class="tile" data-go="zettel"><b>📄 Lernzettel</b><span>Das Wichtigste auf einen Blick. Zum Ausdrucken.</span></button>'+
  '<button class="tile" data-go="bib"><b>📚 Bibliothek</b><span>Alle Seiten aus Buch und Arbeitsheft.</span></button>'}),
    h('p',{class:'small',style:'margin-top:20px'},'Tipp: Jeden Tag 15 Minuten üben ist besser als einmal ganz lange. Bei „Lernkarten“ markierst du, was du schon kannst.'));
}
app.addEventListener('click',function(e){
  var b=e.target.closest('[data-go]');if(!b)return;
  var g=b.getAttribute('data-go'),t=b.getAttribute('data-t');
  if(g==='karten')go(function(){renderKartenWahl()},'Lernkarten');
  else if(g==='quiz')go(function(){renderQuizWahl()},'Quiz');
  else if(g==='probe')go(function(){startQuiz('alle',20,true)},'Probe-Arbeit');
  else if(g==='zettel')go(renderZettel,'Lernzettel');
  else if(g==='bib')go(function(){renderBib('alle','alle')},'Bibliothek');
  else if(g==='kstart')go(function(){startKarten(t,b.getAttribute('data-m'))},'Lernkarten: '+TN[t]);
  else if(g==='qstart')go(function(){startQuiz(t,10,false)},'Quiz: '+TN[t]);
});

/* ---------- Eltern-Bereich ---------- */
function barsEl(st){
  var names=['Mo','Di','Mi','Do','Fr','Sa','So'],goalPx=Math.round(60*GOAL_S/st.maxS);
  return h('div',{class:'wbars'},h('div',{class:'goal',style:'bottom:'+(18+goalPx)+'px'},h('small',null,'20 Min')),st.days.map(function(x,ix){
    var sec=x.L.s,mi=Math.round(sec/60),base=sec>0?Math.max(6,Math.round(60*Math.min(sec,GOAL_S)/st.maxS)):2,ex=sec>GOAL_S?Math.round(60*(sec-GOAL_S)/st.maxS):0;
    return h('div',{class:'wb'},h('small',null,mi?mi+' min':'–'),
      h('div',{class:'stack'},ex?h('i',{class:'xtra',style:'height:'+ex+'px'}):null,h('i',{style:'height:'+base+'px',class:sec>=GOAL_S?'ok':(sec>0||x.L.n>0?'on':'')})),
      h('small',null,names[ix]));}));
}
function quizRows(p){
  var rows=[];
  [['verkehr','Verkehr 🚲'],['wald','Wald 🌲'],['alle','Alles gemischt']].forEach(function(x){
    var q=p.q[x[0]];
    rows.push(h('tr',null,h('td',null,x[1]),
      h('td',null,q&&q.n?'Bestwert '+q.best+' % · zuletzt '+q.last+' % · '+q.n+'× geübt':'noch nicht geübt'),
      h('td',null,q&&q.h&&q.h.length?q.h.slice(-4).map(function(e){return fmtDay(e[0])+' '+e[1]+' %';}).join(' · '):'–')));
  });
  return h('table',{class:'t'},h('tr',null,h('th',null,'Quiz'),h('th',null,'Ergebnis'),h('th',null,'Letzte Versuche')),rows);
}
function probeBlock(p){
  var pr=p.pr||{};
  if(!pr.n)return h('p',{class:'soft'},'Probe-Arbeit: noch nicht gemacht.');
  return h('div',null,h('p',{style:'margin:6px 0 2px'},h('b',null,'📝 Probe-Arbeit: '),'bester Wert '+pr.best+' % · zuletzt '+pr.last+' % · '+pr.n+'× gemacht'),
    h('p',{class:'soft',style:'margin:0 0 6px'},(pr.h||[]).slice(-5).map(function(e){return fmtDay(e[0])+' '+e[1]+' % (Note '+e[2]+')';}).join(' · ')));
}
function weekCard(k){
  var p=profileData(k),st=weekStats(p,wkOff),tot=st.tot,s=stats(p);
  var mins=Math.round(tot.s/60),acc=tot.n?Math.round(100*tot.ok/tot.n):0,r=rating(st.pts,tot.s);
  var over=st.days.filter(function(x){return x.L.s>GOAL_S;}).map(function(x){return ['Mo','Di','Mi','Do','Fr','Sa','So'][st.days.indexOf(x)]+' '+Math.round(x.L.s/60)+' min';});
  return h('div',{class:'card'},
    h('div',{class:'row',style:'align-items:center;margin:0 0 6px;flex-wrap:nowrap'},avatar(k),h('h2',{style:'margin:0;flex:1'},k.name),h('b',null,pctKnown(s)+' % gekonnt')),
    barEl(pctKnown(s),'big'),
    h('p',{class:'soft',style:'margin:4px 0 8px'},'⭐ '+s.k+' von '+s.n+' Karten gekonnt · Verkehr 🚲 '+s.t.verkehr.k+'/'+s.t.verkehr.n+' · Wald 🌲 '+s.t.wald.k+'/'+s.t.wald.n),

    h('p',{style:'margin:14px 0 4px'},h('b',null,'🗓 Lernzeit: '+mins+' min'),', '+st.active+' von 7 Tagen'),
    barsEl(st),
    h('p',{class:'soft',style:'margin:0 0 6px'},'Ziel: '+GOAL_DAYS+' Tage mit je etwa 20 Minuten. Jeder Tag zählt höchstens einmal, ein langer Tag ersetzt keinen anderen. Spielzeit zählt nicht als Lernzeit.'),
    over.length?h('p',{style:'margin:0 0 6px'},'💪 Mehr als 20 Minuten: ',h('b',null,over.join(', ')),' – das zählt als Zusatz, ersetzt aber keinen anderen Lerntag.'):null,
    h('p',null,r.e+' ',h('b',null,st.gd+' von '+GOAL_DAYS+' Zieltagen'),(wkOff===0?' bisher: ':': '),r.t),
    tot.n||tot.s>=30?h('div',{class:'stats'},h('div',null,h('b',null,String(tot.n)),'Antworten'),h('div',null,h('b',null,acc+' %'),'richtig'),h('div',null,h('b',null,'+'+tot.g),'Sterne (neue Karten)'),h('div',null,h('b',null,String(tot.qz)),'Quiz/Probe'))
      :h('p',{class:'soft'},'In dieser Woche wurde noch nicht geübt.'),
    tot.l?h('p',{class:'soft',style:'margin:6px 0 0'},'(−'+tot.l+' Sterne, wenn eine Karte wieder auf „Nochmal üben“ gesetzt wurde)'):null,
    h('h3',{style:'margin:14px 0 4px'},'❓ Quiz-Ergebnisse'),quizRows(p),
    probeBlock(p));
}
function weekBlock(){
  var m=mondayOf(wkOff),e=new Date(m);e.setDate(m.getDate()+6);
  var lab=m.toLocaleDateString('de-DE',{day:'numeric',month:'short'})+' – '+e.toLocaleDateString('de-DE',{day:'numeric',month:'short',year:'numeric'});
  return h('div',null,
    h('div',{class:'row',style:'align-items:center;justify-content:space-between;flex-wrap:nowrap'},
      h('button',{class:'btn small',style:'flex:none',onclick:function(){stay(function(){wkOff--;renderHome(true);});}},'◀'),
      h('b',{style:'flex:none'},wkOff===0?'Diese Woche · '+lab:lab),
      h('button',{class:'btn small',style:'flex:none',disabled:wkOff>=0,onclick:function(){stay(function(){wkOff++;renderHome(true);});}},'▶')),
    KIDS.filter(function(k){return k.role!=='parent';}).map(weekCard));
}
function renderParentHome(noPull){
  if(noPull!==true&&fam())pullAll().then(function(ch){if(ch&&view==='home'&&kid&&isParent()&&!busy&&!inGame)stay(function(){renderHome(true);});});
  var startSel=h('select',{class:'plain',style:'flex:none;font:inherit'},h('option',{value:'0'},'ganz am Anfang'),h('option',{value:'28'},'gleich mit Tunnel und Gruben'),h('option',{value:'60'},'alles, auch Möhren und lange Gruben'));
  mount(h('div',{class:'row',style:'align-items:center;justify-content:space-between'},h('h2',{style:'margin:0;flex:1'},'📈 So lernen die Kinder'),
      h('button',{class:'btn small',style:'flex:none',onclick:function(){go(function(){settings();},'⚙️ Einstellungen');}},'⚙️ Einstellungen')),
    fam()?null:h('div',{class:'note'},'Hier steht nur, was auf diesem Gerät geübt wurde. Unter ⚙️ Einstellungen verbindest du die Geräte der Kinder mit der Familie, dann siehst du alles an einer Stelle.'),
    weekBlock(),
    h('h2',null,'🌲 Selbst üben und testen'),
    h('p',{class:'soft',style:'margin-top:0'},'Euer eigener Übungsbereich. Euer Fortschritt zählt hier nicht in die Wochenübersicht der Kinder.'),


    homeTiles(true));
}

/* ---------- Einstellungen (Eltern) ---------- */
function resetRecords(k,msg){
  if(!confirm('Alle Spiel-Rekorde von '+k.name+' (Jump-and-Run, Hoppel-Blöcke und Sudoku) wirklich zurücksetzen? Das gilt auch auf den anderen Geräten.'))return;
  var now=Date.now(),me=kid&&k.id===kid.id,p=normP(me?P:profileData(k));
  p.g={};p.gz={run:now,block:now,sd6:now,sd9:now};
  if(me)P=p;
  sj('sk:'+k.id,p);
  msg.textContent='Wird gespeichert …';msg.className='msg';
  pushProfile(k).then(function(ok){
    msg.textContent=ok||!fam()?'Rekorde von '+k.name+' zurückgesetzt ✔':'Zurückgesetzt, aber der Abgleich hat nicht geklappt. Bitte später „Jetzt abgleichen“ drücken.';
    msg.className=ok||!fam()?'msg ok':'msg bad';
  });
}
function resetCard(){
  var msg=h('div',{class:'msg'});
  return h('div',{class:'card'},h('h2',{style:'margin-top:0'},'🏆 Rekorde zurücksetzen'),
    h('p',{class:'soft'},'Setzt die Jump-and-Run-Weite, die Block-Punkte und die Sudoku-Bestzeiten eines Profils auf null zurück, auch auf den anderen Geräten. Der Lernstand der Karten und Quiz bleibt unberührt.'),
    KIDS.map(function(k){return h('div',{class:'row',style:'align-items:center;flex-wrap:nowrap'},avatar(k),h('b',{style:'flex:1'},k.name),h('button',{class:'btn small',style:'flex:none',onclick:function(){resetRecords(k,msg);}},'Zurücksetzen'));}),msg);
}
function pinCard(){
  var a=h('input',{class:'plain',type:'password',inputmode:'numeric',maxlength:'4',placeholder:'Neuer Code (4 Ziffern)',autocomplete:'off'}),msg=h('div',{class:'msg'});
  return h('div',{class:'card'},h('h2',{style:'margin-top:0'},'🔒 Eltern-Code'),
    h('p',{class:'soft'},'Der Code schützt das Eltern-Profil. Standard ist 4444 (oder der Code der Vokabel-App auf diesem Gerät), bitte ändere ihn. Nach drei falschen Eingaben ist der Code kurz gesperrt. Er gilt nur für dieses Gerät.'),
    h('div',{class:'row'},a,h('button',{class:'btn primary',onclick:function(){
      if(!/^\d{4}$/.test(a.value)){msg.textContent='Bitte genau 4 Ziffern.';msg.className='msg bad';return;}
      lset('sk:pin',a.value);
      a.value='';msg.textContent='Code geändert ✔';msg.className='msg ok';
    }},'Speichern')),msg);
}
function settings(noPull){
  view='settings';
  if(!noPull&&fam())pullAll().then(function(ch){if(ch&&view==='settings')stay(function(){settings(true);});});
  var cf=cfg(),evSel=h('select',{class:'plain',style:'flex:none;font:inherit'},h('option',{value:'1',selected:cf.ev===1},'nach jedem Durchlauf'),h('option',{value:'2',selected:cf.ev===2},'nach jedem zweiten Durchlauf'));
  var nSel=h('select',{class:'plain',style:'flex:none;font:inherit'},[1,2,3,4,5].map(function(n){return h('option',{value:String(n),selected:cf.n===n},n+(n===1?' Spiel':' Spiele'));}));
  function saveCfg(){P.cfg={ev:+evSel.value,n:+nSel.value,t:Date.now()};saveP();}
  evSel.addEventListener('change',saveCfg);nSel.addEventListener('change',saveCfg);
  var gmBox=h('input',{type:'checkbox',style:'width:24px;height:24px'});gmBox.checked=gamesOn();gmBox.addEventListener('change',function(){lset('sk:games',gmBox.checked?'1':'0');});
  mount(familyCard(),pinCard());



}

/* ---------- Themenwahl ---------- */
function renderKartenWahl(){
  var par=isParent(),s=stats(),hh='<p>Welches Thema?</p><div class="grid">';
  ['verkehr','wald','alle'].forEach(function(t){
    var tot=t==='alle'?s.n:s.t[t].n,k=t==='alle'?s.k:s.t[t].k,pc=tot?Math.round(100*k/tot):0;
    hh+='<div class="tile '+(t==='wald'?'w':t==='verkehr'?'v':'')+'"><b>'+TN[t]+'</b>'+(par?'<span>'+k+' von '+tot+' gekonnt</span>':'<div class="progress"><i style="width:'+pc+'%"></i></div><span>'+phrase(pc)+'</span>')+
       '<div class="row"><button class="btn-main" data-go="kstart" data-t="'+t+'" data-m="neu">Los geht’s</button>'+
       (k?'<button data-go="kstart" data-t="'+t+'" data-m="alle">Alle nochmal</button>':'')+'</div></div>';
  });
  app.innerHTML=hh+'</div>';
}
function renderQuizWahl(){
  var par=isParent(),hh='<p>Welches Thema?</p><div class="grid">';
  ['verkehr','wald','alle'].forEach(function(t){
    var b=bestOf(P,t);
    hh+='<button class="tile '+(t==='wald'?'w':t==='verkehr'?'v':'')+'" data-go="qstart" data-t="'+t+'"><b>'+TN[t]+'</b><span>10 Fragen'+(b!=null?(par?' · Bestwert '+b+' %':' · '+starStr(b)):'')+'</span></button>';
  });
  app.innerHTML=hh+'</div>';
}

/* ---------- Lernkarten ---------- */
function startKarten(t,mode){
  var list=KARTEN.filter(function(c){return t==='alle'||c.t===t});
  if(mode==='neu'){var open=list.filter(function(c){return !isKnown(c)});if(open.length)list=open}
  var deck=shuffle(list),i=0,flipped=false,answered=0;
  function draw(){
    if(i>=deck.length){
      var rn=answered>=8?countRun():0;
      app.innerHTML='<div class="ok-box"><b>Geschafft! 🎉</b><br>Du hast alle Karten dieses Stapels durch.</div><div class="row"><button class="btn-main" id="again">Nochmal (nur offene)</button><button id="toHome">Zum Start</button></div>';
      addReward(rn);
      document.getElementById('again').onclick=function(){go(function(){startKarten(t,'neu')},'Lernkarten: '+TN[t],true)};
      document.getElementById('toHome').onclick=home;return;
    }
    var c=deck[i];
    app.innerHTML='<div class="progress"><i style="width:'+Math.round(i/deck.length*100)+'%"></i></div><div class="small">Karte '+(i+1)+' von '+deck.length+'</div>'+
      '<div class="card3d"><div class="kcard '+(flipped?'a':'q')+'"><small>'+esc(c.g)+'</small>'+esc(flipped?c.a:c.f)+'</div></div>'+
      (flipped
        ? '<div class="row"><button id="bad">🤔 Nochmal üben</button><button class="btn-main" id="good">✅ Konnte ich</button></div>'+nachschlagen(c.s)
        : '<div class="row"><button class="btn-main" id="flip">Antwort zeigen</button></div>');
    if(!flipped){document.getElementById('flip').onclick=function(){flipped=true;draw()}}
    else{
      document.getElementById('good').onclick=function(){answered++;logAns(true);setKnown(c,true);flipped=false;i++;draw()};
      document.getElementById('bad').onclick=function(){answered++;logAns(false);setKnown(c,false);deck.push(c);flipped=false;i++;draw()};
    }
  }
  draw();
}

/* ---------- Quiz ---------- */
function startQuiz(t,n,probe){
  var pool=FRAGEN.filter(function(f){return t==='alle'||f.t===t});
  var qs=shuffle(pool).slice(0,n),i=0,punkte=0,max=0,fehler=[];
  function next(){
    if(i>=qs.length)return fin();
    var q=qs[i];
    var head='<div class="progress"><i style="width:'+Math.round(i/qs.length*100)+'%"></i></div><div class="small">Frage '+(i+1)+' von '+qs.length+' · '+(q.t==='wald'?'Wald 🌲':'Verkehr 🚲')+'</div><h2 style="margin:6px 0 10px;font-size:20px">'+esc(q.f)+'</h2>';
    if(q.typ==='mc')mc(q,head);else if(q.typ==='order')order(q,head);else match(q,head);
  }
  function result(q,got,total,detail){
    punkte+=got;max+=total;if(got<total)fehler.push(q);
    logAns(got===total);
    var good=got===total;
    var hh='<div class="'+(good?'ok-box':'bad-box')+'"><b>'+(good?'Richtig! ✅':got>0?'Fast: '+got+' von '+total+' richtig':'Leider falsch')+'</b>'+(detail||'')+(q.e?'<br>'+esc(q.e):'')+'</div>'+nachschlagen(q.s)+
      '<div class="row"><button class="btn-main" id="nx">'+(i+1>=qs.length?'Ergebnis ansehen':'Weiter')+'</button></div>';
    return hh;
  }
  function mc(q,head){
    var order=shuffle(q.o.map(function(_,k){return k}));
    var hh=head;order.forEach(function(k,p){hh+='<button class="opt" data-k="'+k+'">'+esc(q.o[k])+'</button>'});
    app.innerHTML=hh+'<div id="fb"></div>';
    var done=false;
    app.querySelectorAll('.opt').forEach(function(b){b.onclick=function(){
      if(done)return;done=true;var k=+b.getAttribute('data-k');
      app.querySelectorAll('.opt').forEach(function(o){var kk=+o.getAttribute('data-k');if(kk===q.r)o.classList.add('ok');else if(kk===k)o.classList.add('bad')});
      document.getElementById('fb').innerHTML=result(q,k===q.r?1:0,1);
      document.getElementById('nx').onclick=function(){i++;next()};
    }});
  }
  function order(q,head){
    var pool=shuffle(q.items.map(function(_,k){return k})),picked=[];
    function draw(checked){
      var hh=head+'<div class="small">Tippe die Schritte in der richtigen Reihenfolge an.</div>';
      hh+='<ol style="padding-left:24px">';
      picked.forEach(function(k,p){
        var cls='';if(checked)cls=k===p?'ok':'bad';
        hh+='<li><div class="opt '+cls+'" style="margin:4px 0">'+esc(q.items[k])+'</div></li>';
      });
      hh+='</ol>';
      if(!checked){
        pool.forEach(function(k){if(picked.indexOf(k)<0)hh+='<button class="opt" data-k="'+k+'">'+esc(q.items[k])+'</button>'});
        hh+='<div class="row">'+(picked.length?'<button id="undo">↩︎ Zurück</button>':'')+(picked.length===q.items.length?'<button class="btn-main" id="chk">Prüfen</button>':'')+'</div>';
      }
      app.innerHTML=hh+'<div id="fb"></div>';
      if(checked){
        var got=0;picked.forEach(function(k,p){if(k===p)got++});
        var sol='<br><span class="small">Richtige Reihenfolge:</span><ol>'+q.items.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>';
        document.getElementById('fb').innerHTML=result(q,got,q.items.length,got<q.items.length?sol:'');
        document.getElementById('nx').onclick=function(){i++;next()};return;
      }
      app.querySelectorAll('.opt[data-k]').forEach(function(b){b.onclick=function(){picked.push(+b.getAttribute('data-k'));draw(false)}});
      var u=document.getElementById('undo');if(u)u.onclick=function(){picked.pop();draw(false)};
      var c=document.getElementById('chk');if(c)c.onclick=function(){draw(true)};
    }
    draw(false);
  }
  function match(q,head){
    var rights=shuffle(q.paare.map(function(p){return p[1]}).filter(function(v,k,a){return a.indexOf(v)===k}));
    var hh=head+'<div class="small">Wähle bei jeder Zeile die passende Antwort.</div>';
    q.paare.forEach(function(p,k){
      hh+='<div class="matchrow"><div>'+esc(p[0])+'</div><select data-k="'+k+'"><option value="">– auswählen –</option>'+rights.map(function(r){return '<option>'+esc(r)+'</option>'}).join('')+'</select></div>';
    });
    hh+='<div class="row"><button class="btn-main" id="chk">Prüfen</button></div><div id="fb"></div>';
    app.innerHTML=hh;
    document.getElementById('chk').onclick=function(){
      var got=0;
      app.querySelectorAll('select').forEach(function(s){
        var k=+s.getAttribute('data-k'),ok=s.value===q.paare[k][1];if(ok)got++;
        s.disabled=true;s.style.borderColor=ok?'var(--ok)':'var(--bad)';
        if(!ok){s.insertAdjacentHTML('afterend','<div class="small">Richtig: '+esc(q.paare[k][1])+'</div>')}
      });
      document.getElementById('chk').remove();
      document.getElementById('fb').innerHTML=result(q,got,q.paare.length);
      document.getElementById('nx').onclick=function(){i++;next()};
    };
  }
  function fin(){
    var pct=max?Math.round(punkte/max*100):0;
    var star=pct>=90?3:pct>=70?2:pct>=50?1:0;
    var note=pct>=92?'1':pct>=81?'2':pct>=67?'3':pct>=50?'4':pct>=30?'5':'6';
    var now=Date.now(),rn=0;
    if(kid&&P){
      dayLog().qz++;
      if(probe){
        var pr=P.pr;pr.best=Math.max(pr.best||0,pct);pr.last=pct;pr.n=(pr.n||0)+1;pr.t=now;pr.h=(pr.h||[]).concat([[now,pct,+note]]).slice(-10);
      }else{
        var q=P.q[t]||(P.q[t]={best:0,last:0,n:0,t:0,h:[]});
        q.best=Math.max(q.best||0,pct);q.last=pct;q.n=(q.n||0)+1;q.t=now;q.h=(q.h||[]).concat([[now,pct]]).slice(-10);
      }
      saveP();
      if(qs.length>=8)rn=countRun();
    }
    var hh='<div class="ok-box" style="text-align:center"><div class="stars">'+'⭐'.repeat(star)+'☆'.repeat(3-star)+'</div><b style="font-size:22px">'+pct+' %</b><br>'+punkte+' von '+max+' Punkten'+(probe?'<br>Das wäre ungefähr eine <b>'+note+'</b>':'')+'</div>';
    if(fehler.length){
      hh+='<h3>Das solltest du nochmal ansehen:</h3>';
      fehler.forEach(function(q){hh+='<div class="note"><b>'+esc(q.f)+'</b>'+nachschlagen(q.s)+'</div>'});
    }else hh+='<p>Alles richtig – super! 🎉</p>';
    hh+='<div class="row"><button class="btn-main" id="again">Nochmal</button><button id="toHome">Zum Start</button></div>';
    app.innerHTML=hh;
    var rw=rewardEl(rn);if(rw)app.insertBefore(rw,document.getElementById('again').parentNode);
    document.getElementById('again').onclick=function(){go(function(){startQuiz(t,n,probe)},titleEl.textContent,true)};
    document.getElementById('toHome').onclick=home;
  }
  next();
}

/* ---------- Bibliothek ---------- */
function renderBib(tf,qf){
  var hh='<div class="pills">';
  [['alle','Alle'],['verkehr','Verkehr 🚲'],['wald','Wald 🌲']].forEach(function(x){hh+='<button class="pill'+(tf===x[0]?' on':'')+'" data-f="t" data-v="'+x[0]+'">'+x[1]+'</button>'});
  hh+='</div><div class="pills">';
  [['alle','Alle'],['buch','Schulbuch'],['ah','Arbeitsheft'],['kv','Kopiervorlagen'],['pruef','Prüfbogen']].forEach(function(x){hh+='<button class="pill'+(qf===x[0]?' on':'')+'" data-f="q" data-v="'+x[0]+'">'+x[1]+'</button>'});
  hh+='</div>';
  var list=SEITEN.filter(function(p){return (tf==='alle'||p.bereich===tf)&&(qf==='alle'||p.quelle===qf)});
  hh+='<p class="small">'+list.length+' Seiten · Tippe auf ein Bild, dann kannst du blättern und zoomen.</p><div class="thumbs">';
  list.forEach(function(p,k){hh+='<div class="thumb '+(p.bereich==='wald'?'w':'v')+'" data-pg="'+p.id+'" data-all="'+list.map(function(x){return x.id}).join(',')+'"><img loading="lazy" src="seiten/klein/'+p.id+'.jpg" alt="'+esc(p.titel)+'"><b>'+esc(p.seite)+'</b><br>'+esc(p.titel)+'</div>'});
  app.innerHTML=hh+'</div>';
  app.querySelectorAll('.pill').forEach(function(b){b.onclick=function(){var f=b.getAttribute('data-f'),v=b.getAttribute('data-v');renderBib(f==='t'?v:tf,f==='q'?v:qf)}});
}

/* ---------- Lernzettel ---------- */
function renderZettel(){
  var out='<div class="noprint row"><button class="btn-main" onclick="window.print()">🖨️ Drucken</button></div>';
  function sect(t,cls){
    var last='';var hh='<div class="sheet '+cls+'"><h2>'+(t==='wald'?'Wald 🌲':'Verkehr 🚲')+'</h2>';
    KARTEN.filter(function(c){return c.t===t}).forEach(function(c){
      if(c.g!==last){hh+='<h3>'+esc(c.g)+'</h3>';last=c.g}
      hh+='<p><b>'+esc(c.f)+'</b><br>'+esc(c.a).replace(/\n/g,'<br>')+'<br><span class="pg">'+c.s.map(function(id){var k=pageById(id);return k>=0?SEITEN[k].seite:''}).filter(Boolean).join(' · ')+'</span></p>';
    });
    return hh+'</div>';
  }
  app.innerHTML=out+sect('verkehr','v')+sect('wald','w');
}

/* ---------- Start ---------- */
(function(){var m=(location.hash||'').match(/fam=([a-z0-9]{20,})/i);if(m){lset('sk:fam',m[1].toLowerCase());window.history.replaceState(null,'',location.pathname+location.search);}})();
(function(){var cur=ls('sk:currentKid');KIDS.forEach(function(k){if(k.id===cur&&k.role!=='parent')kid=k;});})();
if(kid)loadP();
home();
initSync();
if('serviceWorker' in navigator&&location.protocol!=='file:'){try{navigator.serviceWorker.register('sw.js')}catch(e){}}
})();
