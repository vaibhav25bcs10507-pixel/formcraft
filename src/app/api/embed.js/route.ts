export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id") || "";
  const label = u.searchParams.get("text") || "Open form";
  const color = /^#[0-9a-fA-F]{6}$/.test(u.searchParams.get("color") || "") ? u.searchParams.get("color")! : "#6366f1";
  const side = u.searchParams.get("side") === "left" ? "left" : "right";
  const origin = u.origin;

  const js = `(function(){
  if (window.__formcraftEmbed) return; window.__formcraftEmbed = true;
  var ID=${JSON.stringify(id)}, COLOR=${JSON.stringify(color)}, SIDE=${JSON.stringify(side)}, LABEL=${JSON.stringify(label)}, ORIGIN=${JSON.stringify(origin)};
  var btn = document.createElement('button');
  btn.innerHTML = LABEL;
  btn.setAttribute('aria-label', LABEL);
  btn.style.cssText = 'position:fixed;bottom:24px;'+SIDE+':24px;z-index:2147483000;background:'+COLOR+';color:#fff;border:0;border-radius:999px;padding:12px 20px;font:600 14px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25);';
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;background:rgba(15,15,20,.6);backdrop-filter:blur(2px);';
  var frameHolder = document.createElement('div');
  frameHolder.style.cssText = 'position:relative;width:min(680px,94vw);height:min(720px,88vh);background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.35);';
  var frame = document.createElement('iframe');
  frame.src = ORIGIN + '/embed/' + ID;
  frame.style.cssText = 'width:100%;height:100%;border:0;';
  frame.allow = 'fullscreen';
  frameHolder.appendChild(frame);
  wrap.appendChild(frameHolder);
  function open(){ wrap.style.display='flex'; document.body.style.overflow='hidden'; }
  function close(){ wrap.style.display='none'; document.body.style.overflow=''; }
  btn.onclick = open;
  wrap.onclick = function(e){ if (e.target === wrap) close(); };
  window.addEventListener('message', function(e){ if (e.data === 'formcraft:close') close(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  document.body.appendChild(btn); document.body.appendChild(wrap);
})();`;

  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
