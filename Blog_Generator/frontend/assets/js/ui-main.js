const $ = id => document.getElementById(id);

// Config
const BACKEND_URL = 'http://127.0.0.1:5000/generate';
const USE_MOCK = false;

// UI Elements
const topic = $('topic'), audience = $('audience'), tone = $('tone'), keywords = $('keywords');
const lengthSel = $('length'), modeSel = $('mode'), btnGenerate = $('btnGenerate');
const editor = $('editor'), preview = $('preview'), wordCount = $('wordCount'), seoScore = $('seoScore');
const btnCopy = $('btnCopy'), btnDownload = $('downloadTxt'), themeToggle = $('themeToggle');
const btnEdit = $('btnEdit'), btnPreview = $('btnPreview');
const toolbar = $('toolbar');
const language = $('language'); // new: language selector

// Markdown toolbar
const actions = [
  {label:'B', fn:()=>wrapSelection('**','**')},
  {label:'I', fn:()=>wrapSelection('*','*')},
  {label:'H1', fn:()=>wrapSelection('# ','')},
  {label:'H2', fn:()=>wrapSelection('## ','')},
  {label:'H3', fn:()=>wrapSelection('### ','')},
  {label:'UL', fn:()=>wrapSelection('- ','')},
  {label:'Code', fn:()=>wrapSelection('```','```')},
];
actions.forEach(a=>{
  const b = document.createElement('button');
  b.textContent = a.label; b.className='btn ghost';
  b.onclick = a.fn; toolbar.appendChild(b);
});
function wrapSelection(pre,suf){
  const start = editor.selectionStart, end = editor.selectionEnd;
  const selected = editor.value.slice(start,end);
  editor.setRangeText(pre+selected+suf,start,end,'end');
  editor.focus(); updatePreview();
}

// Toast
function toast(msg){
  const t = $('toast');
  t.textContent=msg;
  t.style.opacity=1; t.style.transform='translateY(0)';
  setTimeout(()=>{t.style.opacity=0; t.style.transform='translateY(-20px)';},2500);
}

// Markdown -> HTML
function markdownToHTML(md){
  if(!md) return '';
  let html = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  html = html
    .replace(/```([\s\S]*?)```/g, (m,p)=>`<pre><code>${p}</code></pre>`)
    .replace(/^###\s*(.+)$/gm,'<h3>$1</h3>')
    .replace(/^##\s*(.+)$/gm,'<h2>$1</h2>')
    .replace(/^#\s*(.+)$/gm,'<h1>$1</h1>')
    .replace(/^\-\s+(.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g,m=>`<ul>${m}</ul>`)
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\n{2,}/g,'</p><p>')
    .replace(/^(?!<h|<ul|<pre|<p)(.+)$/gm,'<p>$1</p>');
  return html;
}

// Update preview + stats
function updatePreview(){
  const md = editor.value;
  preview.innerHTML = markdownToHTML(md);
  const words = (md.match(/\b\w+\b/g)||[]).length;
  wordCount.textContent = words;
  seoScore.textContent = Math.min(100,Math.max(10,Math.round(words/10)));
}

// Editor input
editor.addEventListener('input',()=>{ updatePreview(); localStorage.setItem('ryzexDraft',editor.value); });
if(localStorage.getItem('ryzexDraft')){ editor.value = localStorage.getItem('ryzexDraft'); }
updatePreview();

// Toggle edit/preview
btnEdit.addEventListener('click',()=>{ editor.style.display='block'; preview.style.display='none'; btnEdit.classList.add('active'); btnPreview.classList.remove('active'); });
btnPreview.addEventListener('click',()=>{ editor.style.display='none'; preview.style.display='block'; btnPreview.classList.add('active'); btnEdit.classList.remove('active'); });

// Generate button
btnGenerate.addEventListener('click', async ()=>{
  const t = topic.value.trim();
  if(!t){ toast('Enter a topic'); return; }

  editor.value=''; updatePreview();
  toast('Generating…');

  if(USE_MOCK){
    setTimeout(()=>{
      editor.value=`# Mock blog for: ${t}\n\nThis is a test.`;
      updatePreview(); btnPreview.click(); toast('Blog generated!');
    },500);
    return;
  }

  try{
    const payload = {
      topic: t,
      audience: audience.value,
      tone: tone.value,
      length: lengthSel.value,
      keywords: keywords.value,
      mode: modeSel.value==='pro'?'gemini':'draft',
      lang: language.value // <-- added language
    };
    const res = await fetch(BACKEND_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!res.ok){ const txt=await res.text(); throw new Error(txt);}
    const j = await res.json();
    const text = j.blog||j.text||j.output||JSON.stringify(j);
    editor.value = text; updatePreview(); btnPreview.click(); toast('Blog generated!');
  }catch(err){ console.error(err); editor.value=''; updatePreview(); toast('Error generating blog'); }
});

// Copy & Download
btnCopy.addEventListener('click',()=>{ 
  if(!editor.value){toast('Nothing to copy'); return;}
  navigator.clipboard.writeText(editor.value).then(()=>toast('Copied!')).catch(()=>toast('Copy failed'));
});
btnDownload.addEventListener('click',()=>{
  if(!editor.value){toast('Nothing to download'); return;}
  const blob = new Blob([editor.value],{type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=((topic.value||'post').replace(/\s+/g,'_').toLowerCase())+'.md';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href);
});

// Theme toggle
themeToggle.addEventListener('click',()=>{
  const isLight = document.body.classList.toggle('light');
  themeToggle.textContent = isLight?'🌙 Dark':'☀️ Light';
});

// Init view
btnEdit.click();
