// Kabul testleri (Playwright + Chromium). Çalıştırma: NODE_PATH=... node pron.test.js
const {chromium}=require('playwright');
const APP=process.env.APP||'file:///home/claude/out/liuxi_cince.html';
const results=[];
function ok(name,cond,extra){results.push({name,pass:!!cond,extra:extra||''});console.log((cond?'PASS ':'FAIL ')+name+(extra?'  → '+extra:''))}
const INIT=()=>{
 window.__streams=[];
 const md=navigator.mediaDevices||{};
 const gum=async()=>{
  window.__gumCalls=(window.__gumCalls||0)+1;
  if(window.__micMode==='deny')throw new DOMException('denied','NotAllowedError');
  if(window.__micMode==='notfound')throw new DOMException('no dev','NotFoundError');
  if(window.__micMode==='overconstr-once'&&window.__gumCalls===1)throw new DOMException('c','OverconstrainedError');
  const ac=new AudioContext();const dest=ac.createMediaStreamDestination();
  const o=ac.createOscillator();o.frequency.value=220;const g=ac.createGain();g.gain.value=0;o.connect(g);g.connect(dest);o.start();
  if(['tone','overconstr-once'].includes(window.__micMode||'tone')){const t=ac.currentTime;for(let i=0;i<60;i++){g.gain.setValueAtTime(.4,t+i*.5);g.gain.setValueAtTime(0,t+i*.5+.3)}}
  window.__streams.push(dest.stream);return dest.stream};
 try{Object.defineProperty(navigator,'mediaDevices',{value:window.__micMode==='nomd'?undefined:Object.assign(md,{getUserMedia:gum}),configurable:true})}catch(e){}
 if(window.__local){window.__lcount=0;window.AndroidASSESS={isReady:()=>window.__local!=='off',assessAsync:(id,ref,b64)=>{window.__lcount++;window.__llast={id,ref,len:b64.length};setTimeout(()=>{const m=window.__local;const j=m==='err'?{ok:false,error:'boom'}:m==='invalid'?{ok:true,valid:false,reason:'no_speech'}:{ok:true,valid:true,engine:'local-test',model:'m1',scoringVersion:'v1',overall:window.__lscore||77,sub:{accuracy:70},units:[{text:'你',score:90}],recognizedText:ref};window.__assessDone(id,JSON.stringify(j))},30)}}}
 if(window.__native){const wavB64=()=>{const sr=16000,n=sr*2,dv=new DataView(new ArrayBuffer(44+n*2));const w=(o,t)=>{for(let i=0;i<t.length;i++)dv.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');dv.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*2,true);for(let i=0;i<n;i++){const t=i/sr,on=(t%.5)<.3;dv.setInt16(44+i*2,on?Math.sin(2*Math.PI*220*t)*13000:0,true)}let b='';const u=new Uint8Array(dv.buffer);for(let i=0;i<u.length;i++)b+=String.fromCharCode(u[i]);return btoa(b)};window.__nat={started:0,cancelled:0};window.AndroidREC={hasPermission:()=>window.__native!=='deny',requestPermission:()=>setTimeout(()=>window.__recPerm&&window.__recPerm(window.__native!=='deny'),20),start:()=>{window.__nat.started++;return window.__native==='fail'?'init_failed':'ok'},stop:()=>wavB64(),cancel:()=>{window.__nat.cancelled++}}}
 if(window.__fakeTTS){window.__ut=[];const fake={getVoices:()=>[{lang:'zh-CN',name:'fake zh'}],speak(u){window.__ut.push({text:u.text,rate:u.rate,sub:(document.querySelector('#txt')||{}).textContent});setTimeout(()=>u.onend&&u.onend(),30)},cancel(){},onvoiceschanged:null};Object.defineProperty(window,'speechSynthesis',{value:fake,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t}}
};
async function newCtx(browser){
 const ctx=await browser.newContext({viewport:{width:390,height:800}});
 const mock={mode:'ok',overall:80,engine:'azure-speech-pa',recognized:null,count:0,ids:new Set(),sub:{accuracy:82,fluency:78,completeness:100},units:null};
 await ctx.route('https://mock.local/**',async route=>{
  const h={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
  const r=route.request();
  if(r.method()==='OPTIONS')return route.fulfill({status:204,headers:h});
  if(mock.mode==='abort')return route.abort('connectionfailed');
  const b=JSON.parse(r.postData()||'{}');mock.count++;mock.ids.add(b.attemptId);mock.last=b;
  if(mock.mode==='500')return route.fulfill({status:500,headers:h,body:'err'});
  if(mock.mode==='invalid')return route.fulfill({status:200,headers:{...h,'content-type':'application/json'},body:JSON.stringify({ok:true,valid:false,reason:'no_speech'})});
  const o=typeof mock.overall==='function'?mock.overall(mock.count):mock.overall;
  const eng=typeof mock.engine==='function'?mock.engine(mock.count):mock.engine;
  route.fulfill({status:200,headers:{...h,'content-type':'application/json'},body:JSON.stringify({ok:true,valid:true,engine:eng,model:'zh-CN',scoringVersion:'t1',overall:o,sub:mock.sub,units:mock.units||[{text:'你',score:90},{text:'好',score:55}],recognizedText:mock.recognized!=null?mock.recognized:b.referenceText})})});
 return{ctx,mock}}
async function page(ctx,{tts=false,mic='tone',native='',local=''}={}){
 const p=await ctx.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.addInitScript(`window.__micMode='${mic}';window.__native=${native?`'${native}'`:'false'};window.__local=${local?`'${local}'`:'false'};window.__fakeTTS=${tts};(${INIT.toString()})()`);
 await p.goto(APP);await p.waitForTimeout(300);return p}
async function base(p,{plv=0,srv=true}={}){await p.evaluate(([plv,srv])=>{ST.started=true;ST.plv=plv;ST.pr.micAsked=1;if(srv){ST.pr.srv={url:'https://mock.local',token:'t'};ST.pr.consent={url:'https://mock.local',ts:1}}const s=SS(0);s.v.done=1;s.g.done=1;s.e1={ok:1,v:2,best:95};s.e2={ok:1,v:2,best:90};save()},[plv,srv])}
async function rec(p,ms=1900){await p.evaluate(()=>A.prec());await p.waitForFunction(()=>REC.st==='rec'||(PS&&PS.msg));if(await p.evaluate(()=>REC.st!=='rec'))return;await p.waitForTimeout(ms);await p.evaluate(()=>A.pstop());await p.waitForFunction(()=>PS&&(PS.ph==='review'||(PS.ph==='idle'&&PS.msg)),null,{timeout:15000})}
async function send(p){await p.evaluate(()=>A.psend());await p.waitForFunction(()=>PS&&PS.ph!=='busy'&&PS.ph!=='review',null,{timeout:20000})}
const inject=`window.__inject=(scores)=>{const tasks=examTasks(0);const ex={id:'xtest',scene:0,tasks,cur:0,ans:{},rec:{},engine:'azure-speech-pa',model:'zh-CN',ver:'v1',started:Date.now(),done:false,res:null};scores.forEach((sc,k)=>{const t=tasks[k];const id='a_t'+k;ST.pr.att[id]={id,taskId:t.id,scene:0,kind:t.kind,text:t.text,ts:Date.now(),status:'assessed',audioId:id,examId:'xtest'};ST.pr.asm[id]={id:'asm_'+id,attemptId:id,engine:'azure-speech-pa',model:'zh-CN',ver:'v1',overall:sc,sub:{},units:[],recognized:'',ts:Date.now()};ex.ans[t.id]=id});ST.pr.ex[0]=ex;return ex}`;
(async()=>{
 const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 // 1 konuşma hızı kalıcı + altyazı eşzamanlı
 {const{ctx}=await newCtx(browser);let p=await page(ctx,{tts:true});await base(p);
  await p.evaluate(()=>{A.go('set');A.rate(1.1)});await p.reload();await p.waitForTimeout(300);
  ok('Konuşma hızı ayarı yeniden yüklemeden sonra kalıcı',await p.evaluate(()=>ST.cfg.rate===1.1));
  await p.evaluate(()=>{ST.started=true;A.play(0)});await p.waitForTimeout(2500);
  const ut=await p.evaluate(()=>window.__ut);
  ok('Oynatma: seslendirilen metin ile altyazı aynı anda aynı cümle',ut.length>=4&&ut.every(u=>u.sub===u.text.replace(/\s/g,'')||u.sub===u.text),`${ut.length} cümle`);
  ok('Oynatma: ses hızı = ayar (1,10) × konuşmacı katsayısı',ut.length&&ut.every(u=>[.88,.9,.92,.96,1,1.08,1.1].some(f=>Math.abs(u.rate-1.1*f)<1e-6)),JSON.stringify(ut.slice(0,3).map(u=>u.rate)));
  await ctx.close()}
 // 2 mikrofon reddi
 {const{ctx}=await newCtx(browser);const p=await page(ctx,{mic:'deny'});await base(p);
  await p.evaluate(()=>A.pronStart(0));await p.evaluate(()=>A.prec());await p.waitForTimeout(400);
  const txt=await p.evaluate(()=>document.body.innerText);
  ok('Mikrofon izni reddedilince açıklama gösterilir',/Mikrofon kullanılamıyor/.test(txt)&&/mikrofon gerektirir/.test(txt));
  await p.evaluate(()=>{A.phome();A.go('hub',0);A.ex(0,'v')});await p.waitForTimeout(300);
  ok('Mikrofon reddinden sonra diğer bölümler (kelime alıştırması) çalışır',await p.evaluate(()=>!!Q&&Q.items.length===100));
  ok('Reddedilen izin kayıt/deneme oluşturmaz',await p.evaluate(()=>Object.keys(ST.pr.att).length===0));
  await ctx.close()}
 // 3 sessizlik / servis hatası
 {const{ctx,mock}=await newCtx(browser);const p=await page(ctx,{mic:'silence'});await base(p);
  await p.evaluate(()=>A.pronStart(0));await rec(p,1500);
  ok('Sessizlik: geçersiz kayıt, deneme kaydedilmez, istek gönderilmez',await p.evaluate(()=>PS.ph==='idle'&&Object.keys(ST.pr.att).length===0)&&mock.count===0);
  ok('Sessizlik: 0 puan · kaydedilmedi açıklaması',await p.evaluate(()=>/0 puan · geçersiz kayıt/.test(document.body.innerText)&&/yazılmadı/.test(document.body.innerText)));
  ok('Sessizlik istatistiğe/ortalamaya girmez',await p.evaluate(()=>{const s=prStats();return s.n===0&&s.avg===null}));
  await p.evaluate(()=>{window.__micMode='tone'});await rec(p);mock.mode='500';await send(p);
  ok('Servis hatası: puan üretilmez, deneme “puan bekliyor”',await p.evaluate(()=>{const a=Object.values(ST.pr.att)[0];return PS.ph==='pending'&&a.status==='pending'&&Object.keys(ST.pr.asm).length===0}));
  ok('Servis hatası düşük puan sayılmaz (istatistik boş, bekleyen=1)',await p.evaluate(()=>{const s=prStats();return s.n===0&&s.avg===null&&s.pend===1}));
  mock.mode='ok';mock.overall=77;await p.evaluate(()=>retryPending());await p.waitForTimeout(500);
  ok('Bağlantı gelince bekleyen kayıt bir kez değerlendirilir',await p.evaluate(()=>prStats().n===1&&Object.keys(ST.pr.asm).length===1)&&mock.count===2);
  const id=await p.evaluate(()=>Object.keys(ST.pr.att)[0]);
  await p.evaluate(id=>Promise.all([submitAttempt(id),submitAttempt(id)]),id);
  ok('Yinelenen istek aynı cevabı iki kez puanlamaz/istatistiğe eklemez',await p.evaluate(()=>prStats().n===1&&Object.keys(ST.pr.asm).length===1)&&mock.count===2);
  await ctx.close()}
 // 4 ses tanıma metni doğru ama puan ayrı
 {const{ctx,mock}=await newCtx(browser);const p=await page(ctx);await base(p);mock.overall=55;mock.sub={};
  await p.evaluate(()=>A.pronStart(0));await rec(p);await send(p);
  const r=await p.evaluate(()=>{const a=Object.values(ST.pr.att)[0],m=ST.pr.asm[a.id],t=document.body.innerText;return{o:m.overall,rec:m.recognized,tgt:strip(a.text),ui:t}});
  ok('Tanınan metin hedefle aynı olsa da puan sağlayıcıdan (55) gelir',r.o===55&&r.rec===r.tgt&&/55,0/.test(r.ui));
  ok('Ses tanıma çıktısı “puan değildir” diye ayrı etiketlenir',/telaffuz puanı değildir/.test(r.ui));
  ok('Desteklenmeyen alt ölçümler için puan uydurulmaz',/ölçmüyor \(puan gösterilmedi\)/.test(r.ui)&&await p.evaluate(()=>Object.keys(Object.values(ST.pr.asm)[0].sub).length===0));
  ok('Telaffuz ortalaması soru başarı oranından ayrı',await p.evaluate(()=>{const s=prStats();return s.avg===55&&tally()[1]===0}));
  await ctx.close()}
 // 5-9 sınav kuralları
 {const{ctx}=await newCtx(browser);const p=await page(ctx);await p.evaluate(inject);await base(p);
  await p.evaluate(()=>{window.__inject(Array(19).fill(90))});
  await p.evaluate(()=>{finalizeExam(0)});
  ok('Sınav: 19 geçerli görevle tamamlanmaz',await p.evaluate(()=>!ST.pr.ex[0].done&&!SS(0).e3));
  await p.evaluate(()=>{const ex=ST.pr.ex[0];const t=ex.tasks[19],id='a_t19';ST.pr.att[id]={id,taskId:t.id,scene:0,kind:t.kind,text:t.text,ts:1,status:'assessed',audioId:id,examId:'xtest'};ST.pr.asm[id]={id:'asm_'+id,attemptId:id,engine:'azure-speech-pa',model:'zh-CN',ver:'v1',overall:90,sub:{},units:[],recognized:'',ts:1};ex.ans[t.id]=id;finalizeExam(0)});
  ok('Sınav: tam 20 geçerli görevle tamamlanır',await p.evaluate(()=>ST.pr.ex[0].done&&Object.keys(ST.pr.ex[0].ans).length===20));
  ok('İlk 2 aşama + aşama 3 geçilince sahne tamamlanır, sonraki açılır',await p.evaluate(()=>ST.passed[0]===true&&unlocked(1)));
  await ctx.close()}
 for(const [sc,exp] of [[59.95,false],[60,true],[59.999999,false],[60.000001,true]]){const{ctx}=await newCtx(browser);const p=await page(ctx);await p.evaluate(inject);await base(p);
  const r=await p.evaluate(sc=>{window.__inject(Array(20).fill(sc));finalizeExam(0);return{ok:ST.pr.ex[0].res.ok,passed:!!ST.passed[0],txt:fmtS(sc)}},sc);
  ok(`Ortalama ${sc} → ${exp?'başarılı':'başarısız'} (yuvarlamasız karar)`,r.ok===exp&&r.passed===exp,`gösterim=${r.txt}`);await ctx.close()}
 {const{ctx}=await newCtx(browser);const p=await page(ctx);await p.evaluate(inject);await base(p);
  await p.evaluate(()=>{const s=SS(0);s.e1={ok:1,v:2};s.e2={ok:1,v:2};ST.passed={}});
  ok('Aşama 1+2 geçilse de Aşama 3 geçilmeden sonraki sahne kilitli',await p.evaluate(()=>!ST.passed[0]&&!unlocked(1)));
  const before=await p.evaluate(()=>{window.__inject(Array(20).fill(50));finalizeExam(0);const s=SS(0);return{e1:!!(s.e1.ok),e2:!!(s.e2.ok),e3:s.e3.ok,passed:!!ST.passed[0],locked:!unlocked(1),ord:ST.pr.ex[0].tasks.map(t=>t.id).join(),id:ST.pr.ex[0].id}});
  ok('Aşama 3 başarısız: ilk iki aşama korunur, sahne kilitli kalır',before.e1&&before.e2&&!before.e3&&!before.passed&&before.locked);
  await p.evaluate(()=>A.pexNew(0));await p.waitForTimeout(300);
  const after=await p.evaluate(()=>({id:ST.pr.ex[0].id,ord:ST.pr.ex[0].tasks.map(t=>t.id).join(),e1:!!SS(0).e1.ok,e2:!!SS(0).e2.ok,n:ST.pr.ex[0].tasks.length,pv:VIEW[0]}));
  ok('Yeniden deneme yalnızca Aşama 3: yeni deneme kimliği, görevler karıştırılmış, Aşama 1-2 dokunulmamış',after.id!==before.id&&after.ord!==before.ord&&after.e1&&after.e2&&after.n===20&&after.pv==='pron');
  await ctx.close()}
 // Aşama 1 / 2 eşikleri
 for(const [st,N,need] of [[1,100,90],[2,120,102]]){for(const c of [need-1,need]){const{ctx}=await newCtx(browser);const p=await page(ctx);await base(p);
  await p.evaluate(st=>{const s=SS(0);if(st===1)s.e1={};else s.e2={}},st);
  await p.evaluate(([st,c])=>{A.exam(0,st)},[st,c]);
  const n=await p.evaluate(()=>Q&&Q.items.length);
  await p.evaluate(([c])=>{let k=0;while(Q){const q=Q.items[Q.idx];if(q.k==='mc')A.ans(k<c?q.a:(q.a+1)%q.opts.length);else{q.ans.forEach(w=>{const j=q.toks.findIndex((t,ix)=>t===w&&!QO.includes(ix));QO.push(j)});drawSlot();A.chk()}k++;A.nextQ()}},[c]);
  const r=await p.evaluate(st=>{const e=st===1?SS(0).e1:SS(0).e2;return!!e.ok},st);
  ok(`Aşama ${st}: ${N} soru, ${c}/${N} doğru → ${c>=need?'geçer':'geçemez'}`,n===N&&r===(c>=need));await ctx.close()}}
 // 10 sınav çıkış / kapanma / bağlantı kesilmesi sonrası devam
 {const{ctx,mock}=await newCtx(browser);let p=await page(ctx);await base(p);
  await p.evaluate(()=>A.pexNew(0));await p.waitForTimeout(400);
  const order=await p.evaluate(()=>ST.pr.ex[0].tasks.map(t=>t.id).join());const exid=await p.evaluate(()=>ST.pr.ex[0].id);
  mock.overall=70;await rec(p);await send(p);await p.evaluate(()=>A.pnext());await p.waitForTimeout(200);
  mock.mode='abort';await rec(p);await send(p);
  ok('Bağlantı kesilince cevap sabit ama puan bekliyor; yanlış sayılmaz',await p.evaluate(()=>{const ex=ST.pr.ex[0];const id=ex.ans[ex.tasks[1].id];return PS.ph==='locked'&&ST.pr.att[id].status==='pending'&&!ST.pr.asm[id]}));
  await p.evaluate(()=>A.pnext());await p.waitForTimeout(200);await rec(p,1900);
  ok('Gönderilmemiş kayıt yerelde saklı (inceleme aşamasında)',await p.evaluate(()=>PS.ph==='review'&&Object.keys(ST.pr.ex[0].rec).length===1));
  await p.evaluate(()=>A.prec());await p.waitForTimeout(600);
  await p.reload();await p.waitForTimeout(500);
  ok('Uygulama kapanınca yarım mikrofon kaydı sunucuya gönderilmez / saklanmaz',await p.evaluate(()=>Object.values(ST.pr.att).length===3)&&mock.count===1);
  await base(p);await p.evaluate(()=>A.pex(0));await p.waitForTimeout(600);
  const res=await p.evaluate(()=>({idx:PS.idx,ph:PS.ph,id:ST.pr.ex[0].id,ord:ST.pr.ex[0].tasks.map(t=>t.id).join()}));
  ok('Devam: aynı deneme, aynı sabit sıra, aynı görev (kayıtlı ama gönderilmemiş kayıt inceleme aşamasında)',res.id===exid&&res.ord===order&&res.idx===2&&res.ph==='review');
  mock.mode='ok';mock.overall=70;await p.evaluate(()=>retryPending());await p.waitForTimeout(600);
  ok('Bağlantı dönünce bekleyen sınav cevabı bir kez puanlanır',await p.evaluate(()=>{const ex=ST.pr.ex[0];const id=ex.ans[ex.tasks[1].id];return ST.pr.asm[id]&&ST.pr.att[id].status==='assessed'}));
  await ctx.close()}
 // motor kilidi
 {const{ctx,mock}=await newCtx(browser);const p=await page(ctx);await base(p);mock.engine=n=>n===1?'engine-A':'engine-B';
  await p.evaluate(()=>A.pexNew(0));await p.waitForTimeout(300);await rec(p);await send(p);await p.evaluate(()=>A.pnext());await rec(p);await send(p);
  ok('Sınav denemesi içinde farklı motora sessizce geçilmez',await p.evaluate(()=>{const ex=ST.pr.ex[0];const a2=ST.pr.att[ex.ans[ex.tasks[1].id]];return ex.engine==='engine-A'&&a2.status==='pending'&&a2.err==='engine_mismatch'&&Object.keys(ST.pr.asm).length===1}));
  await ctx.close()}
 // 11 arka plan
 {const{ctx}=await newCtx(browser);const p=await page(ctx);await base(p);
  await p.evaluate(()=>A.pronStart(0));await p.evaluate(()=>A.prec());await p.waitForFunction(()=>REC.st==='rec');
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(300);
  ok('Arka plana geçince mikrofon kapanır (akış durur, yarım kayıt atılır)',await p.evaluate(()=>REC.st==='idle'&&window.__streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))&&Object.keys(ST.pr.att).length===0&&PS.ph==='idle'));
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true})});
  await p.evaluate(()=>{A.prec()});await p.waitForFunction(()=>REC.st==='rec');await p.evaluate(()=>A.phome());await p.waitForTimeout(200);
  ok('Dashboard’a dönünce mikrofon kapanır',await p.evaluate(()=>REC.st==='idle'&&VIEW[0]==='home'&&window.__streams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))));
  await ctx.close()}
 // örnek ses çalarken kayıt başlamaz
 {const{ctx}=await newCtx(browser);const p=await page(ctx);await base(p);
  await p.evaluate(()=>{A.pronStart(0);TTS.busy=true});await p.evaluate(()=>A.prec());await p.waitForTimeout(200);
  ok('Örnek ses çalarken kayıt başlatılmaz',await p.evaluate(()=>REC.st==='idle'&&PS.ph==='idle'&&/Örnek ses çalarken/.test(PS.msg)));
  await ctx.close()}
 // saklama/silme
 {const{ctx,mock}=await newCtx(browser);const p=await page(ctx);await base(p);mock.overall=81;
  await p.evaluate(()=>A.pronStart(0));await rec(p);await send(p);
  ok('Analiz sonrası ham kayıt sonuç ekranında dinlenebilir (cihazda)',await p.evaluate(async()=>(await AUD.all()).length===1));
  await p.evaluate(()=>A.pnext());await p.waitForTimeout(200);
  ok('Sonuç ekranından çıkınca ham kayıt varsayılan olarak silinir; puan geçmişi korunur',await p.evaluate(async()=>(await AUD.all()).length===0&&prStats().n===1));
  await rec(p);await send(p);await p.evaluate(()=>A.pkeep(true));await p.evaluate(()=>A.pnext());await p.waitForTimeout(200);
  ok('“Kaydı sakla” seçilen kayıt kalır',await p.evaluate(async()=>(await AUD.all()).length===1));
  await p.evaluate(()=>A.audDelAll());await p.waitForTimeout(200);
  ok('Kullanıcı saklanan kaydı silebilir',await p.evaluate(async()=>(await AUD.all()).length===0));
  await p.evaluate(inject);await p.evaluate(()=>{window.__inject(Array(20).fill(75));ST.pr.ex[0].tasks.forEach((t,k)=>AUD.put('a_t'+k,new Blob([1]),{}));finalizeExam(0)});await p.waitForTimeout(300);
  ok('Sınav bitince sınav kayıtları silinir',await p.evaluate(async()=>(await AUD.all()).length===0));
  await ctx.close()}
 // mikrofon ortamı / tanılama / yerel kayıt (kullanıcı bildirimi: "kayıt başlatılamadı")
 {const{ctx,mock}=await newCtx(browser);
  let p=await page(ctx,{mic:'nomd'});await base(p);await p.evaluate(()=>A.pronStart(0));await p.evaluate(()=>A.prec());await p.waitForTimeout(300);
  ok('mediaDevices yoksa: neden ve ortam bilgisi gösterilir (genel mesaj değil)',await p.evaluate(()=>PRC.mic==='unsupported'&&PRC.why.length>20&&/Ortam:/.test(document.body.innerText)&&/mediaDevices:yok/.test(document.body.innerText)));
  p=await page(ctx,{mic:'notfound'});await base(p);await p.evaluate(()=>A.pronStart(0));await p.evaluate(()=>A.prec());await p.waitForTimeout(300);
  ok('Mikrofon aygıtı yoksa açık açıklama + teknik ayrıntı gösterilir',await p.evaluate(()=>/bulunamadı/.test(PRC.why)&&/NotFoundError/.test(document.body.innerText)));
  p=await page(ctx,{mic:'overconstr-once'});await base(p);await p.evaluate(()=>A.pronStart(0));await rec(p);
  ok('Kısıt hatasında sade ayarla ikinci deneme yapılır ve kayıt başarılı olur',await p.evaluate(()=>window.__gumCalls===2&&PS.ph==='review'));
  p=await page(ctx,{native:'ok'});await base(p);mock.overall=68;await p.evaluate(()=>A.pronStart(0));await rec(p);
  ok('APK yerel kaydı: WebView getUserMedia kullanılmadan kayıt alınır',await p.evaluate(()=>window.__nat.started===1&&!window.__gumCalls&&PS.ph==='review'&&Object.values(ST.pr.att)[0].q.voicedMs>400));
  await send(p);
  ok('APK yerel kaydı: gönderim ve puan akışı çalışır',await p.evaluate(()=>PS.ph==='result'&&prStats().n===1)&&mock.last.audioFormat==='wav-pcm16-16k');
  await p.evaluate(()=>A.pnext());await p.waitForTimeout(200);await p.evaluate(()=>A.prec());await p.waitForFunction(()=>REC.st==='rec');await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(200);
  ok('APK yerel kaydı: arka plana geçince yerel kayıt iptal edilir',await p.evaluate(()=>REC.st==='idle'&&window.__nat.cancelled>=1));
  p=await page(ctx,{native:'deny'});await base(p);await p.evaluate(()=>A.pronStart(0));await p.evaluate(()=>A.prec());await p.waitForTimeout(300);
  ok('APK: Android izni reddedilirse açıklama gösterilir, uygulama çalışır',await p.evaluate(()=>PRC.mic==='denied'&&/Android mikrofon izni/.test(document.body.innerText)));
  p=await page(ctx,{native:'fail'});await base(p);await p.evaluate(()=>A.pronStart(0));await p.evaluate(()=>A.prec());await p.waitForTimeout(300);
  ok('APK: mikrofon başlatılamazsa neden + teknik kod gösterilir',await p.evaluate(()=>PRC.mic==='error'&&/init_failed/.test(document.body.innerText)&&/[Bb]aşka bir uygulama/.test(PRC.why)));
  await ctx.close()}
 // cihaz üzerinde motor sözleşmesi (yerel motor takılınca)
 {const{ctx,mock}=await newCtx(browser);let p=await page(ctx,{local:'ok'});await base(p,{srv:false});await ctx.setOffline(true);
  await p.evaluate(()=>A.pronStart(0));await rec(p);await send(p);
  ok('Yerel motor: çevrimdışı ve sunucusuz puan alınır, sunucuya istek/onay yok',await p.evaluate(()=>PS.ph==='result'&&Object.values(ST.pr.asm)[0].where==='device'&&Object.values(ST.pr.asm)[0].engine==='local-test'&&!document.getElementById('dlg'))&&mock.count===0);
  await p.evaluate(()=>A.pexNew(0));await p.waitForTimeout(300);
  ok('Yerel motor varken sesli sınav sunucu olmadan başlar',await p.evaluate(()=>!!ST.pr.ex[0]&&PS&&PS.exam));
  await rec(p);await send(p);
  ok('Yerel motor: sınav cevabı sabitlenir, puan cihazda alınır',await p.evaluate(()=>PS.ph==='locked'&&Object.values(ST.pr.asm).length===2&&ST.pr.ex[0].engine==='local-test'));
  await ctx.close()}
 {const{ctx}=await newCtx(browser);let p=await page(ctx,{local:'err'});await base(p,{srv:false});
  await p.evaluate(()=>A.pronStart(0));await rec(p);await send(p);
  ok('Yerel motor hatası puan sayılmaz (“puan bekliyor”)',await p.evaluate(()=>PS.ph==='pending'&&Object.keys(ST.pr.asm).length===0&&Object.values(ST.pr.att)[0].err==='engine'&&prStats().n===0));
  await ctx.close();{const c2=await newCtx(browser);p=await page(c2.ctx,{local:'invalid'});}await base(p,{srv:false});await p.evaluate(()=>A.pronStart(0));await rec(p);await send(p);
  ok('Yerel motor “değerlendirilemedi” derse deneme kaydedilmez',await p.evaluate(()=>PS.ph==='idle'&&Object.keys(ST.pr.att).length===0&&/geçersiz kayıt/.test(document.body.innerText)));
  {const c3=await newCtx(browser);p=await page(c3.ctx,{local:'off'});}await base(p,{srv:false});await p.evaluate(()=>A.pexNew(0));
  ok('Motor yoksa (yerel kapalı, sunucu yok) sesli sınav başlamaz',await p.evaluate(()=>!ST.pr.ex[0]&&!hasEngine()));
  await ctx.close()}
 // içerik üretimi
 {const{ctx}=await newCtx(browser);const p=await page(ctx);
  const r=await p.evaluate(()=>{const bad=[];for(let i=0;i<SC.length;i++){const {words,sents}=mkTasks(i,3,10,10);const mx={1:16,2:18,3:20,4:22,5:24,6:26}[SC[i].lv];if(words.length!==10||sents.length!==10||sents.some(s=>strip(s.text).length>mx))bad.push(i+':'+words.length+'/'+sents.length);const v=genVocab(i,5,100,[0,1,5,2]).length,g=genGram(i,5,120,true,false).length;if(v!==100||g!==120)bad.push(i+':v'+v+'g'+g)}return bad});
  ok('115 sahnenin hepsinde 10+10 sesli görev, 100 kelime ve 120 cümle sorusu üretilir',r.length===0,r.slice(0,8).join(' '));
  await ctx.close()}
 await browser.close();
 const f=results.filter(r=>!r.pass).length;console.log(`\n${results.length-f}/${results.length} geçti`);
 require('fs').writeFileSync('/home/claude/tests/results.json',JSON.stringify(results,null,1));
 process.exit(f?1:0)})();
