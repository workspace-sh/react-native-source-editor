/**
 * Preview HTML/JS helpers shared across the iOS and Android demo apps.
 * Pure string-building, no React/RN deps — safe to import from any
 * platform-flavoured App entry.
 */

/**
 * Tiny TS-to-JS strip — handles the common shapes we ship in samples
 * (interface/type declarations, simple `: Type` annotations, `as Type`
 * casts, `import type {...}`). Not a real type-checker; good enough for
 * the example's playground purpose.
 *
 * The annotation strip is intentionally conservative: it only removes
 * `: Type` where Type looks like an actual type (uppercase identifier or
 * known primitive, optionally with generics / array suffix / unions).
 * That keeps it from chewing through object-literal values like
 * `name: 'Alice'`.
 */
export function stripTSTypes(ts: string): string {
  let s = ts;
  // `import type { ... } from '...'`
  s = s.replace(
    /^\s*import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$/gm,
    ''
  );
  // `interface Foo (extends Bar) { ... }` — assumes closing brace at start of line.
  s = s.replace(
    /^\s*interface\s+\w+(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?^\}\s*$/gm,
    ''
  );
  // `type Foo = ...;`
  s = s.replace(/^\s*type\s+\w+\s*=\s*[^;\n]+;?\s*$/gm, '');
  // `: Type` annotations. Type = (Uppercase\w* | primitive) optionally
  // generic / array / union with same.
  const PRIM =
    'string|number|boolean|void|any|unknown|never|object|null|undefined|bigint|symbol';
  const TYPE = `(?:[A-Z]\\w*|${PRIM})(?:<[^>]*>)?(?:\\[\\])*`;
  const UNION = `${TYPE}(?:\\s*[|&]\\s*${TYPE})*`;
  s = s.replace(
    new RegExp(`(\\w+\\s*\\??)\\s*:\\s*${UNION}(?=\\s*[=,)\\{\\n;])`, 'g'),
    '$1'
  );
  // `as Type` casts
  s = s.replace(/\s+as\s+[\w<>\[\]]+/g, '');
  return s;
}

export function wrapJSConsoleHTML(
  source: string,
  topInset: number,
  bottomInset: number
): string {
  // Inject the user's source as JSON so we can parse + run it inside the
  // wrapper without escape-string gymnastics.
  const sourceJson = JSON.stringify(source);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light dark; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    line-height: 1.5;
    padding: ${topInset + 16}px 16px ${bottomInset + 16}px;
    background: light-dark(#fff, #000);
    color: light-dark(#1d1d1f, #f2f2f7);
  }
  .line { padding: 4px 8px; border-radius: 4px; white-space: pre-wrap; word-break: break-word; }
  .line + .line { margin-top: 2px; }
  .line.warn { color: light-dark(#995700, #ffd60a); background: light-dark(#fff8e1, #2a2200); }
  .line.error { color: light-dark(#c00, #ff453a); background: light-dark(#ffeaea, #2a0000); }
  .line.info { color: light-dark(#0064cc, #64d2ff); }
  .line.debug { opacity: 0.65; }
  .line .marker { opacity: 0.5; margin-right: 8px; }
  .empty { opacity: 0.5; padding: 8px; }
</style>
</head>
<body>
<div id="console"></div>
<script>
(function () {
  var out = document.getElementById('console');
  var entries = 0;

  function fmt(v) {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'string') return v;
    if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonymous');
    if (v instanceof Error) {
      var head = (v.name || 'Error') + ': ' + (v.message || '<no message>');
      return v.stack ? head + '\\n' + v.stack : head;
    }
    try { return JSON.stringify(v, null, 2); } catch (e) { return String(v); }
  }

  function append(level, args) {
    entries++;
    var line = document.createElement('div');
    line.className = 'line ' + level;
    var marker = document.createElement('span');
    marker.className = 'marker';
    marker.textContent = level === 'log' ? '›' : level.toUpperCase();
    line.appendChild(marker);
    line.appendChild(document.createTextNode(args.map(fmt).join(' ')));
    out.appendChild(line);
  }

  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (level) {
    var orig = console[level];
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments);
      append(level, args);
      if (orig) orig.apply(console, args);
    };
  });

  window.addEventListener('error', function (e) {
    append('error', [e.error || e.message]);
  });
  window.addEventListener('unhandledrejection', function (e) {
    append('error', ['Unhandled rejection:', e.reason]);
  });

  try {
    new Function(${sourceJson})();
  } catch (e) {
    append('error', [e]);
  }

  if (entries === 0) {
    var empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '(no console output)';
    out.appendChild(empty);
  }
})();
</script>
</body>
</html>`;
}

export function wrapMarkdownHTML(
  body: string,
  topInset: number,
  bottomInset: number
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light dark; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui;
    line-height: 1.55;
    padding: ${topInset + 16}px 20px ${bottomInset + 16}px;
    background: light-dark(#fff, #000);
    color: light-dark(#000, #fff);
    -webkit-text-size-adjust: 100%;
  }
  h1, h2, h3, h4 { color: light-dark(#007aff, #0a84ff); margin-top: 1.4em; }
  h1 { font-size: 1.7em; }
  h2 { font-size: 1.35em; }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: light-dark(#f0f0f3, #1c1c1e);
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: light-dark(#f5f5f7, #1c1c1e);
    padding: 14px;
    border-radius: 8px;
    overflow-x: auto;
  }
  pre code { background: transparent; padding: 0; }
  a { color: light-dark(#007aff, #0a84ff); text-decoration: none; }
  ul, ol { padding-left: 1.4em; }
  blockquote {
    border-left: 3px solid light-dark(#d1d1d6, #3a3a3c);
    padding-left: 12px;
    margin-left: 0;
    color: light-dark(#6e6e73, #a1a1a6);
  }
</style>
</head>
<body>${body}</body>
</html>`;
}
