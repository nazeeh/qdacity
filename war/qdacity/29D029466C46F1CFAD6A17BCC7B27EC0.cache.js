qdacity.onScriptDownloaded(["var $wnd = $wnd || window.parent;var __gwtModuleFunction = $wnd.qdacity;var $sendStats = __gwtModuleFunction.__sendStats;$sendStats('moduleStartup', 'moduleEvalStart');var $gwt_version = \"2.6.0\";var $strongName = '29D029466C46F1CFAD6A17BCC7B27EC0';var $doc = $wnd.document;function __gwtStartLoadingFragment(frag) {var fragFile = 'deferredjs/' + $strongName + '/' + frag + '.cache.js';return __gwtModuleFunction.__startLoadingFragment(fragFile);}function __gwtInstallCode(code) {return __gwtModuleFunction.__installRunAsyncCode(code);}var $stats = $wnd.__gwtStatsEvent ? function(a) {return $wnd.__gwtStatsEvent(a);} : null;var $sessionId = $wnd.__gwtStatsSessionId ? $wnd.__gwtStatsSessionId : null;function k(){}\nfunction U(){}\nfunction hc(){}\nfunction bb(){}\nfunction eb(){}\nfunction Tb(){}\nfunction F(a){}\nfunction cc(a){}\nfunction q(){ab()}\nfunction K(){return H}\nfunction s(){s=hc;r=new k}\nfunction R(){R=hc;Q=new U}\nfunction $b(){q.call(this)}\nfunction ac(){q.call(this)}\nfunction Ob(){return !!$stats}\nfunction Nb(a){return new Lb[a]}\nfunction fc(b,a){return b.indexOf(a)}\nfunction M(a,b){return db(a,b,null)}\nfunction D(a,b,c){return a.apply(b,c);var d}\nfunction ob(a,b){return a!=null&&a.cM&&!!a.cM[b]}\nfunction Xb(a){return typeof a=='number'&&a>0}\nfunction N(a){$wnd.clearTimeout(a)}\nfunction t(a){s();q.call(this);this.a=a;$()}\nfunction Wb(a){var b=Lb[a.a];a=null;return b}\nfunction V(a,b){!a&&(a=[]);a[a.length]=b;return a}\nfunction Vb(a,b,c){var d;d=new Tb;Xb(c)&&Yb(c,d);return d}\nfunction gb(a,b,c,d,e){var f;f=fb(e,d);hb(a,b,c,f);return f}\nfunction hb(a,b,c,d){kb();mb(d,ib,jb);d.cZ=a;d.cM=b;return d}\nfunction kb(){kb=hc;ib=[];jb=[];lb(new eb,ib,jb)}\nfunction L(a){$wnd.setTimeout(function(){throw a},0)}\nfunction O(){return M(function(){A!=0&&(A=0);C=-1},10)}\nfunction J(a){a&&T((R(),Q));--A;if(a){if(C!=-1){N(C);C=-1}}}\nfunction ec(a,b){if(b==null){return false}return String(a)==b}\nfunction Jb(a){if(ob(a,3)){return a}return a==null?new t(null):Hb(a)}\nfunction I(a,b,c){var d;d=G();try{return D(a,b,c)}finally{J(d)}}\nfunction lb(a,b,c){var d=0,e;for(var f in a){if(e=a[f]){b[d]=f;c[d]=e;++d}}}\nfunction mb(a,b,c){kb();for(var d=0,e=b.length;d<e;++d){a[b[d]]=c[d]}}\nfunction nb(a,b){if(a!=null&&!(a.cM&&a.cM[b])){throw new $b}return a}\nfunction Ub(a,b,c){var d;d=new Tb;Xb(c!=0?-c:0)&&Yb(c!=0?-c:0,d);return d}\nfunction db(a,b,c){var d=$wnd.setTimeout(function(){a();c!=null&&F(c)},b);return d}\nfunction T(a){var b,c;if(a.b){c=null;do{b=a.b;a.b=null;c=W(b,c)}while(a.b);a.b=c}}\nfunction S(a){var b,c;if(a.a){c=null;do{b=a.a;a.a=null;c=W(b,c)}while(a.a);a.a=c}}\nfunction H(b){return function(){try{return I(b,this,arguments)}catch(a){throw a}}}\nfunction Hb(b){var c=b.__gwt$exception;if(!c){c=new t(b);try{b.__gwt$exception=c}catch(a){}}return c}\nfunction Ib(a){var b;if(ob(a,2)){b=nb(a,2);if(b.a!==(s(),r)){return b.a===r?null:b.a}}return a}\nfunction p(a){var b,c,d;c=gb(Eb,ic,0,a.length,0);for(d=0,b=a.length;d<b;++d){if(!a[d]){throw new ac}c[d]=a[d]}}\nfunction $(){var a,b,c,d;c=[];d=gb(Eb,ic,0,c.length,0);for(a=0,b=d.length;a<b;a++){d[a]=new cc(c[a])}p(d)}\nfunction ab(){var a,b,c,d;c=Z(new bb);d=gb(Eb,ic,0,c.length,0);for(a=0,b=d.length;a<b;a++){d[a]=new cc(c[a])}p(d)}\nfunction gwtOnLoad(b,c,d,e){$moduleName=c;$moduleBase=d;if(b)try{kc(Gb)()}catch(a){b(c)}else{kc(Gb)()}}\nfunction G(){var a;if(A!=0){a=(new Date).getTime();if(a-B>2000){B=a;C=O()}}if(A++==0){S((R(),Q));return true}return false}\nfunction gc(c){if(c.length==0||c[0]>pc&&c[c.length-1]>pc){return c}var a=c.replace(/^(\\s*)/,lc);var b=a.replace(/\\s*$/,lc);return b}\nfunction fb(a,b){var c=new Array(b);if(a==3){for(var d=0;d<b;++d){c[d]={l:0,m:0,h:0}}}else if(a>0&&a<3){var e=a==1?0:false;for(var d=0;d<b;++d){c[d]=e}}return c}\nfunction Yb(a,b){var c;b.a=a;if(a==2){c=String.prototype}else{if(a>0){var d=Wb(b);if(d){c=d.prototype}else{d=Lb[a]=function(){};d.cZ=b;return}}else{return}}c.cZ=b}\nfunction Pb(a){return $stats({moduleName:$moduleName,sessionId:$sessionId,subSystem:'startup',evtGroup:'moduleStartup',millis:(new Date).getTime(),type:'onModuleLoadStart',className:a})}\nfunction W(b,c){var d,e,f,g;for(e=0,f=b.length;e<f;e++){g=b[e];try{g[1]?g[0].e()&&(c=V(c,g)):g[0].e()}catch(a){a=Jb(a);if(ob(a,3)){d=a;L(ob(d,2)?nb(d,2).c():d)}else throw Ib(a)}}return c}\nfunction Mb(a,b,c){var d=Lb[a];if(d&&!d.cZ){_=d.prototype}else{!d&&(d=Lb[a]=function(){});_=d.prototype=b<0?{}:Nb(b);_.cM=c}for(var e=3;e<arguments.length;++e){arguments[e].prototype=_}if(d.cZ){_.cZ=d.cZ;d.cZ=null}}\nfunction X(a){var b,c,d;d=lc;a=gc(a);b=a.indexOf('(');c=a.indexOf('function')==0?8:0;if(b==-1){b=fc(a,String.fromCharCode(64));c=a.indexOf('function ')==0?9:0}b!=-1&&(d=gc(a.substr(c,b-c)));return d.length>0?d:'anonymous'}\nfunction Z(i){var a={};var b=[];var c=arguments.callee.caller.caller;while(c){var d=i.d(c.toString());b.push(d);var e=':'+d;var f=a[e];if(f){var g,h;for(g=0,h=f.length;g<h;g++){if(f[g]===c){return b}}}(f||(a[e]=[])).push(c);c=c.caller}return b}\nfunction Gb(){var a;Ob()&&Pb('com.google.gwt.useragent.client.UserAgentAsserter');a=Rb();ec(mc,a)||($wnd.alert('ERROR: Possible problem with your *.gwt.xml module file.\\nThe compile time user.agent value (ie8) does not match the runtime user.agent value ('+a+'). Expect more errors.\\n'),undefined);Ob()&&Pb('com.google.gwt.user.client.DocumentModeAsserter');Qb();Ob()&&Pb('com.qdacity.client.Qdacity')}\nfunction Rb(){var b=navigator.userAgent.toLowerCase();var c=function(a){return parseInt(a[1])*1000+parseInt(a[2])};if(function(){return b.indexOf('webkit')!=-1}())return 'safari';if(function(){return b.indexOf(oc)!=-1&&$doc.documentMode>=10}())return 'ie10';if(function(){return b.indexOf(oc)!=-1&&$doc.documentMode>=9}())return 'ie9';if(function(){return b.indexOf(oc)!=-1&&$doc.documentMode>=8}())return mc;if(function(){return b.indexOf('gecko')!=-1}())return 'gecko1_8';return 'unknown'}\nfunction Qb(){var a,b,c;b=$doc.compatMode;a=hb(Fb,ic,1,[nc]);for(c=0;c<a.length;c++){if(ec(a[c],b)){return}}a.length==1&&ec(nc,a[0])&&ec('BackCompat',b)?\"GWT no longer supports Quirks Mode (document.compatMode=' BackCompat').<br>Make sure your application's host HTML page has a Standards Mode (document.compatMode=' CSS1Compat') doctype,<br>e.g. by using &lt;!doctype html&gt; at the start of your application's HTML page.<br><br>To continue using this unsupported rendering mode and risk layout problems, suppress this message by adding<br>the following line to your*.gwt.xml module file:<br>&nbsp;&nbsp;&lt;extend-configuration-property name=\\\"document.compatMode\\\" value=\\\"\"+b+'\"/&gt;':\"Your *.gwt.xml module configuration prohibits the use of the current doucment rendering mode (document.compatMode=' \"+b+\"').<br>Modify your application's host HTML page doctype, or update your custom 'document.compatMode' configuration property settings.\"}\nvar lc='',pc=' ',nc='CSS1Compat',sc='[Ljava.lang.',rc='com.google.gwt.core.client.',tc='com.google.gwt.core.client.impl.',mc='ie8',qc='java.lang.',oc='msie';var _,Lb={},ic={},jc={3:1};Mb(1,-1,ic,k);Mb(8,1,jc);Mb(7,8,jc);Mb(6,7,jc);Mb(5,6,{2:1,3:1},t);_.c=function u(){return this.a===r?null:this.a};var r;Mb(12,1,{});var A=0,B=0,C=-1;Mb(14,12,{},U);var Q;Mb(17,1,{},bb);_.d=function cb(a){return X(a)};Mb(21,1,{},eb);var ib,jb;Mb(33,1,{},Tb);_.a=0;Mb(34,6,jc,$b);Mb(35,6,jc,ac);Mb(36,1,{},cc);_=String.prototype;_.cM={1:1};var kc=K();var zb=Vb(qc,'Object',1),rb=Vb(rc,'Scheduler',12),qb=Vb(rc,'JavaScriptObject$',9),Db=Vb(qc,'Throwable',8),xb=Vb(qc,'Exception',7),Ab=Vb(qc,'RuntimeException',6),Bb=Vb(qc,'StackTraceElement',36),Eb=Ub(sc,'StackTraceElement;',37),ub=Vb('com.google.gwt.lang.','SeedUtil',27),wb=Vb(qc,'Class',33),Cb=Vb(qc,'String',2),Fb=Ub(sc,'String;',38),vb=Vb(qc,'ClassCastException',34),pb=Vb(rc,'JavaScriptException',5),yb=Vb(qc,'NullPointerException',35),tb=Vb(tc,'StackTraceCreator$Collector',17),sb=Vb(tc,'SchedulerImpl',14);$sendStats('moduleStartup', 'moduleEvalEnd');gwtOnLoad(__gwtModuleFunction.__errFn, __gwtModuleFunction.__moduleName, __gwtModuleFunction.__moduleBase, __gwtModuleFunction.__softPermutationId,__gwtModuleFunction.__computePropValue);$sendStats('moduleStartup', 'end');\n//# sourceURL=qdacity-0.js\n"]);
