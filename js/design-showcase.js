(function(){
              var fired=false;
              var obs=new IntersectionObserver(function(entries){
                if(fired||!entries[0].isIntersecting)return;
                fired=true;obs.disconnect();
                // csillagok staggerelt pop-in
                var stars=document.querySelectorAll('#gr-stars .gr-star');
                stars.forEach(function(s,i){setTimeout(function(){s.classList.add('on');},80+i*130);});
                // count-up 4.0 → 4.9
                var el=document.getElementById('gr-num');
                var v=40,target=49;
                var t=setInterval(function(){
                  v=Math.min(v+1,target);
                  el.textContent=(v/10).toFixed(1);
                  if(v>=target)clearInterval(t);
                },70);
              },{threshold:0.25});
              obs.observe(document.getElementById('gr-band'));
            })();
          

new WOW().init();


    // ── Tab underline (#tab-underline) ──
    document.querySelectorAll('#tabUl .ds-tab-ul-item').forEach(function(tab){
      tab.addEventListener('click',function(){
        document.querySelectorAll('#tabUl .ds-tab-ul-item').forEach(function(t){t.classList.remove('active')});
        document.querySelectorAll('.ds-tab-panel').forEach(function(p){p.classList.remove('active')});
        tab.classList.add('active');
        var t=document.getElementById(tab.dataset.tab);
        if(t)t.classList.add('active');
      });
    });
    // ── Card tabbed (#card-tabbed) ──
    document.querySelectorAll('.ct-tab').forEach(function(tab){
      tab.addEventListener('click',function(){
        var header=tab.closest('.ct-header');
        var body=header.nextElementSibling;
        header.querySelectorAll('.ct-tab').forEach(function(t){t.classList.remove('active')});
        body.querySelectorAll('.ct-panel').forEach(function(p){p.classList.remove('active')});
        tab.classList.add('active');
        var t=document.getElementById(tab.dataset.cttab);
        if(t)t.classList.add('active');
      });
    });
    // ── Bootstrap popovers ──
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function(el){
      new bootstrap.Popover(el,{trigger:'click'});
    });
  


            var mCorrect=[false,false,false,false,false];
            var mAnswered=[false,false,false,false,false];
            var mRightAns=['false','false','true','false','false'];
            var mTotal=0;
            function mAnswer(i,ans,correct){
              if(mAnswered[i])return;
              mAnswered[i]=true;
              var isRight=(ans===mRightAns[i]);
              var q=document.getElementById('mq'+i);
              q.classList.add(isRight?'correct':'wrong');
              document.getElementById('me'+i).classList.add('show');
              q.querySelectorAll('.myth-btn').forEach(function(b){b.disabled=true});
              if(isRight){mTotal++;mCorrect[i]=true;}
              document.getElementById('mScore').textContent=mTotal;
              document.getElementById('mFill').style.width=(mTotal/5*100)+'%';
              if(mAnswered.every(function(a){return a;})){
                setTimeout(function(){
                  document.getElementById('mFinal').style.display='block';
                  document.getElementById('mFinalScore').textContent=mTotal+'/5';
                  var msgs=['Van még mit tanulni – kérj ingyenes tanácsot!','Jó alap! Alkuszunk segít a részletekben.','Biztosítási haladó vagy!','Szinte guru! 1 kérdés csúszott el.','Biztosítási GURU! 🏆'];
                  document.getElementById('mFinalMsg').textContent=msgs[mTotal]||msgs[0];
                },400);
              }
            }
            function mReset(){
              mTotal=0;mAnswered=[false,false,false,false,false];mCorrect=[false,false,false,false,false];
              for(var i=0;i<5;i++){var q=document.getElementById('mq'+i);q.classList.remove('correct','wrong');document.getElementById('me'+i).classList.remove('show');q.querySelectorAll('.myth-btn').forEach(function(b){b.disabled=false;b.classList.remove('selected')});}
              document.getElementById('mScore').textContent='0';
              document.getElementById('mFill').style.width='0%';
              document.getElementById('mFinal').style.display='none';
            }
          


            var dtData={};
            function dtGo(next,data){
              Object.assign(dtData,data);
              document.querySelectorAll('.dtree-step').forEach(function(s){s.classList.remove('active')});
              document.getElementById('dt'+next).classList.add('active');
              document.getElementById('dtStep').textContent=next+1;
              document.getElementById('dtFill').style.width=((next/4)*100)+'%';
            }
            function dtFinish(dep){
              dtData.dep=dep;
              var cards=[];
              if(dtData.car)cards.push({icon:'🚗',label:'KGFB – kötelező biztosítás',badge:'Kötelező',color:'var(--primary)'});
              if(dtData.car)cards.push({icon:'🛡️',label:'Casco – jármű-casco',badge:'Ajánlott',color:'#1565c0'});
              if(dtData.home==='own')cards.push({icon:'🏠',label:'Lakásbiztosítás',badge:'Kötelező hitelnél',color:'#2e7d32'});
              if(dtData.home==='rent')cards.push({icon:'📦',label:'Bérlői felelősségbiztosítás',badge:'Érdemes',color:'#6a1b9a'});
              if(dtData.travel)cards.push({icon:'✈️',label:'Utasbiztosítás',badge:'Ajánlott',color:'#00897b'});
              if(dtData.dep)cards.push({icon:'❤️',label:'Életbiztosítás',badge:'Fontos',color:'#c62828'});
              var html=cards.map(function(c){return '<div style="display:flex;align-items:center;gap:.75rem;padding:.6rem .9rem;background:#f8f9fa;border-radius:10px"><span style="font-size:1.3rem">'+c.icon+'</span><div style="flex:1;font-size:.84rem;font-weight:700;color:#15233C">'+c.label+'</div><span style="font-size:.68rem;font-weight:800;padding:.2rem .55rem;border-radius:20px;background:'+c.color+';color:#fff">'+c.badge+'</span></div>';}).join('');
              document.getElementById('dtCards').innerHTML=html||'<div style="color:#888;font-size:.85rem">Úgy tűnik, az alapbiztosítások megvannak – kérj tanácsot!</div>';
              document.querySelectorAll('.dtree-step').forEach(function(s){s.classList.remove('active')});
              document.getElementById('dtResult').classList.add('active');
              document.getElementById('dtFill').style.width='100%';
              document.getElementById('dtStep').textContent='✓';
            }
            function dtReset(){
              dtData={};
              document.querySelectorAll('.dtree-step').forEach(function(s){s.classList.remove('active')});
              document.getElementById('dt0').classList.add('active');
              document.getElementById('dtStep').textContent='1';
              document.getElementById('dtFill').style.width='0%';
            }
          


            function savCalc(){
              var v=parseInt(document.getElementById('savRange').value);
              var mn=Math.round(v*0.7/100)*100;
              var sv=v-mn;
              document.getElementById('savNow').textContent=v.toLocaleString('hu-HU')+' Ft/év';
              document.getElementById('savNowD').textContent=v.toLocaleString('hu-HU')+' Ft';
              document.getElementById('savMinD').textContent=mn.toLocaleString('hu-HU')+' Ft';
              document.getElementById('savSave').textContent=sv.toLocaleString('hu-HU')+' Ft/év';
            }
          


            var riskMap={
              'kgfb':   {icon:'🚗',title:'KGFB – Kötelező biztosítás', desc:'Törvényi előírás minden gépjárműre.', color:'var(--primary)', link:'./ajanlatok/kgfb.html'},
              'casco':  {icon:'🛡️',title:'Casco biztosítás',           desc:'Saját kár esetén védi a járművedet.',  color:'#1565c0',        link:'./casco.html'},
              'home':   {icon:'🏠',title:'Lakásbiztosítás',            desc:'Ingatlan és ingóság védelme.',          color:'#2e7d32',        link:'./lakas.html'},
              'rent':   {icon:'📦',title:'Bérlői felelősség',          desc:'Bérlőként okozott kár fedezete.',        color:'#6a1b9a',        link:'./kapcsolat.html'},
              'travel': {icon:'✈️',title:'Utasbiztosítás',             desc:'Külföldi egészségügyi és poggyász.',     color:'#00897b',        link:'./utas.html'},
              'life':   {icon:'❤️',title:'Életbiztosítás',             desc:'Szeretteid anyagi biztonsága.',          color:'#c62828',        link:'./elet.html'},
              'health': {icon:'💊',title:'Egészségbiztosítás',         desc:'Gyorsabb ellátás, extra szolgáltatások.', color:'#e65100',      link:'./egeszseg.html'},
              'biz':    {icon:'💼',title:'Vállalkozói felelősség',     desc:'Üzleti kockázatok kezelése.',            color:'#455a64',        link:'./vallalkozas.html'}
            };
            function riskToggle(el){el.classList.toggle('active');}
            function riskScan(){
              var active=Array.from(document.querySelectorAll('.risk-chip.active')).map(function(c){return c.dataset.risk;});
              var out=document.getElementById('riskResult');
              if(!active.length){out.innerHTML='<div style="color:#888;font-size:.84rem">Válassz legalább egy élethelyzetet!</div>';return;}
              var html='<div style="font-size:.78rem;font-weight:700;color:#6c757d;margin-bottom:.5rem">'+active.length+' biztosítás releváns számodra:</div>';
              active.forEach(function(r){
                var d=riskMap[r];if(!d)return;
                html+='<div class="risk-result-card"><div style="display:flex;align-items:center;gap:.6rem"><span style="font-size:1.2rem">'+d.icon+'</span><div style="flex:1"><div style="font-size:.85rem;font-weight:800;color:#15233C">'+d.title+'</div><div style="font-size:.76rem;color:#6c757d">'+d.desc+'</div></div><a href="'+d.link+'" class="btn btn-sm rounded-pill" style="font-size:.68rem;background:'+d.color+';color:#fff;border:none;white-space:nowrap">Megnézem</a></div></div>';
              });
              out.innerHTML=html;
            }
          


            function dailyCalc(){
              var v=parseInt(document.getElementById('dailyInput').value)||0;
              var res=document.getElementById('dailyResult');
              if(v<1000){res.style.display='none';return;}
              var daily=Math.round(v/365);
              res.style.display='block';
              document.getElementById('dailyVal').textContent=daily;
              var comps=[[500,'Ez kevesebb mint egy kávé naponta!'],[200,'Ez kb. egy csoki naponta.'],[100,'Ez kb. egy fogósugár naponta.'],[50,'Ez kb. egy szelet rágó naponta.'],[10,'Ez szó szerint filléres védelmed.']];
              var comp='Napi szintű biztonság.';
              for(var i=0;i<comps.length;i++){if(daily>=comps[i][0]){comp=comps[i][1];break;}}
              document.getElementById('dailyComp').textContent=comp;
              document.getElementById('dailyBreak').textContent='= '+Math.round(v/12).toLocaleString('hu-HU')+' Ft/hó · '+Math.round(v/52).toLocaleString('hu-HU')+' Ft/hét';
            }
          


            function penCalc(){
              var d=document.getElementById('penDate').value;
              var rate=parseInt(document.getElementById('penKw').value)||1200;
              if(!d){document.getElementById('penResult').style.display='none';return;}
              var start=new Date(d),now=new Date();
              var days=Math.max(0,Math.floor((now-start)/(1000*60*60*24)));
              var total=days*rate;
              document.getElementById('penResult').style.display='block';
              document.getElementById('penAmt').textContent=total.toLocaleString('hu-HU')+' Ft';
              document.getElementById('penDays').textContent=days+' nap × '+rate.toLocaleString('hu-HU')+' Ft/nap';
            }
          


            (function(){
              var amounts=[8200,12800,15600,9400,21000,7800,18300,11200];
              document.getElementById('scratchAmt').textContent=(amounts[Math.floor(Math.random()*amounts.length)]).toLocaleString('hu-HU')+' Ft';
              var canvas=document.getElementById('scratchCanvas');
              var ctx=canvas.getContext('2d');
              var painting=false;
              function initScratch(){
                ctx.fillStyle='#b0bec5';
                ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.fillStyle='#78909c';
                ctx.font='bold 13px Nunito,sans-serif';
                ctx.textAlign='center';
                ctx.fillText('✦ KAPARJON IDE ✦',canvas.width/2,canvas.height/2-8);
                ctx.fillText('és lássa megtakarítását!',canvas.width/2,canvas.height/2+12);
              }
              initScratch();
              function getPos(e){
                var r=canvas.getBoundingClientRect();
                var scaleX=canvas.width/r.width, scaleY=canvas.height/r.height;
                if(e.touches){return{x:(e.touches[0].clientX-r.left)*scaleX,y:(e.touches[0].clientY-r.top)*scaleY};}
                return{x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleY};
              }
              function scratch(e){e.preventDefault();if(!painting)return;var p=getPos(e);ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(p.x,p.y,18,0,Math.PI*2);ctx.fill();}
              canvas.addEventListener('mousedown',function(e){painting=true;scratch(e);});
              canvas.addEventListener('mousemove',scratch);
              canvas.addEventListener('mouseup',function(){painting=false;});
              canvas.addEventListener('touchstart',function(e){painting=true;scratch(e);},{passive:false});
              canvas.addEventListener('touchmove',scratch,{passive:false});
              canvas.addEventListener('touchend',function(){painting=false;});
              window.scratchReset=function(){
                ctx.globalCompositeOperation='source-over';
                document.getElementById('scratchAmt').textContent=(amounts[Math.floor(Math.random()*amounts.length)]).toLocaleString('hu-HU')+' Ft';
                initScratch();
              };
            })();
          


            var ktScore=0,ktCurrent=0,ktDone=false;
            var ktRight=[2,1,2,1,1];
            function ktAnswer(q,chosen,correct){
              if(ktDone)return;
              ktDone=true;
              var opts=document.querySelectorAll('#ktq'+q+' .ktest-opt');
              opts[correct].classList.add('correct');
              if(chosen!==correct){opts[chosen].classList.add('wrong');}else{ktScore++;}
              opts.forEach(function(o){o.style.pointerEvents='none';});
              document.getElementById('ktScore').textContent=ktScore;
              setTimeout(function(){
                document.getElementById('ktq'+q).classList.remove('active');
                ktCurrent++;
                if(ktCurrent<5){
                  document.getElementById('ktq'+ktCurrent).classList.add('active');
                  document.getElementById('ktQ').textContent=ktCurrent+1;
                  document.getElementById('ktFill').style.width=(ktCurrent/5*100)+'%';
                  ktDone=false;
                } else {
                  document.getElementById('ktFill').style.width='100%';
                  document.getElementById('ktFinal').classList.add('active');
                  document.getElementById('ktFinalScore').textContent=ktScore+'/5';
                  var titles=['Kezdő','Haladó','Haladó','Szakértő','Guru','Biztosítási GURU! 🏆'];
                  var msgs=['Olvasd el az infók oldalt – sokat segít!','Jó alap, de van mit csiszolni.','Szinte profi – csak egy pont hiányzott.','Maximális pontszám! Te biztosítási gurunk vagy.'];
                  document.getElementById('ktFinalTitle').textContent=titles[Math.min(ktScore,5)];
                  document.getElementById('ktFinalMsg').textContent=msgs[Math.min(ktScore,3)];
                }
              },900);
            }
            function ktReset(){
              ktScore=0;ktCurrent=0;ktDone=false;
              document.querySelectorAll('.ktest-q').forEach(function(q){q.classList.remove('active');});
              document.querySelectorAll('.ktest-opt').forEach(function(o){o.classList.remove('correct','wrong');o.style.pointerEvents='';});
              document.getElementById('ktq0').classList.add('active');
              document.getElementById('ktQ').textContent='1';
              document.getElementById('ktScore').textContent='0';
              document.getElementById('ktFill').style.width='0%';
            }
          


            var pgXP=0,pgMax=100;
            var pgXPs=[20,30,20,15,15];
            var pgDone=[false,false,false,false,false];
            function pgToggle(i,xp){
              pgDone[i]=!pgDone[i];
              var el=document.getElementById('pg'+i);
              el.classList.toggle('done',pgDone[i]);
              pgXP=pgDone.reduce(function(s,v,j){return s+(v?pgXPs[j]:0);},0);
              document.getElementById('pgXP').textContent=pgXP+' XP';
              document.getElementById('pgFill').style.width=(pgXP/pgMax*100)+'%';
              document.getElementById('pgReward').style.display=(pgXP>=pgMax?'block':'none');
            }
          


    document.querySelectorAll('.ds-collapse-btn').forEach(btn => {
      const target = document.querySelector(btn.dataset.bsTarget);
      if (target) {
        target.addEventListener('show.bs.collapse', () => btn.setAttribute('aria-expanded','true'));
        target.addEventListener('hide.bs.collapse', () => btn.setAttribute('aria-expanded','false'));
      }
    });

    // Chip toggle
    document.querySelectorAll('#chipBar .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#chipBar .chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Toast bezárás
    document.querySelectorAll('.t-close').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.ds-toast').style.display = 'none');
    });