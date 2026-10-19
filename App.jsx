import { useEffect, useMemo, useState } from 'react'
import {
  Aperture, ArrowDown, ArrowLeft, ArrowRight, Check, CircleHelp, Code2, Download,
  Eye, FileText, Image as ImageIcon, Layers, LayoutDashboard, Monitor, MousePointer2,
  Palette, Plus, Search, Settings2, Smartphone, Sparkles, Trash2, Type, Undo2, Redo2,
  WandSparkles, X, CheckCircle2,
} from 'lucide-react'

const STORAGE = 'vexorai-studio'
const starterBlocks = [
  { id: 'hero-start', type: 'hero', title: 'Hero section', text: 'Make room for your next big idea.', subtitle: 'A beautiful website starts with a clear vision. Build something that feels unmistakably you.', button: 'Explore the studio', bg: '#11101d', color: '#f6f3ff', accent: '#b49aff' },
  { id: 'features-start', type: 'features', title: 'Features section', text: 'Good ideas deserve a great home.', subtitle: 'Thoughtful details, flexible sections, and a little room to experiment.', button: 'See what is possible', bg: '#f7f5ff', color: '#201b35', accent: '#7c5cff' },
]
const templates = [
  { name: 'Afterglow', category: 'Portfolio', desc: 'Editorial, expressive, creative', tint: 'violet', headline: 'A little more room to be you.', sub: 'A portfolio for work that deserves to be seen.' },
  { name: 'Sunday Goods', category: 'Store', desc: 'Warm, minimal, product-led', tint: 'peach', headline: 'Everyday things, thoughtfully made.', sub: 'Meet the pieces that make the everyday feel special.' },
  { name: 'Northstar', category: 'Business', desc: 'Confident, clean, considered', tint: 'blue', headline: 'Make your next move matter.', sub: 'Clear thinking and bold ideas for what comes next.' },
  { name: 'Quiet Notes', category: 'Blog', desc: 'Calm, readable, personal', tint: 'green', headline: 'Notes from the in-between.', sub: 'Stories, thoughts, and small things worth keeping.' },
]
const defaultState = { siteName: 'My first website', blocks: starterBlocks, projects: [] }

function readSaved() {
  try { const value = JSON.parse(localStorage.getItem(STORAGE)); return value && Array.isArray(value.blocks) ? value : defaultState }
  catch { return defaultState }
}
function Logo() {
  return <div className="brand"><span className="brand-symbol"><img src="/vexorai-energy-orb.png" alt="" /></span><span>VEXORAI</span><span className="beta">STUDIO</span></div>
}
function IconButton({ children, label, onClick, className = '', disabled = false }) {
  return <button type="button" className={`icon-btn ${className}`} aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</button>
}
function Thumb({ tint }) {
  return <div className={`template-art ${tint}`}><div className="art-nav"><i /><i /><i /></div><div className="art-sun" /><div className="art-title-line one" /><div className="art-title-line two" /><div className="art-button" /><div className="art-orbit" /></div>
}
function App() {
  const saved = useMemo(readSaved, [])
  const [page, setPage] = useState('dashboard')
  const [siteName, setSiteName] = useState(saved.siteName || defaultState.siteName)
  const [blocks, setBlocks] = useState(saved.blocks?.length ? saved.blocks : starterBlocks)
  const [projects, setProjects] = useState(saved.projects || [])
  const [selectedId, setSelectedId] = useState((saved.blocks?.[0] || starterBlocks[0]).id)
  const [device, setDevice] = useState('desktop')
  const [panel, setPanel] = useState('elements')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [prompt, setPrompt] = useState('')
  const [toast, setToast] = useState('')
  const [mobilePanel, setMobilePanel] = useState('')
  const [history, setHistory] = useState([])
  const [future, setFuture] = useState([])
  const selected = blocks.find(block => block.id === selectedId) || null
  const filteredTemplates = templates.filter(t => `${t.name} ${t.category} ${t.desc}`.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify({ siteName, blocks, projects })) } catch { /* storage may be unavailable */ }
  }, [siteName, blocks, projects])
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])
  const notify = message => setToast(message)
  const commitBlocks = next => { setHistory(old => [...old.slice(-19), blocks]); setFuture([]); setBlocks(next) }
  const updateSelected = (key, value) => commitBlocks(blocks.map(b => b.id === selectedId ? { ...b, [key]: value } : b))
  const addBlock = type => {
    const presets = {
      hero: { title: 'Hero section', text: 'A headline that tells your story.', subtitle: 'Add a short sentence that makes people want to know more.', button: 'Learn more', bg: '#11101d', color: '#f6f3ff', accent: '#b49aff' },
      text: { title: 'Text section', text: 'A little about us.', subtitle: 'Use this space to explain your idea, share your story, or tell visitors what makes you different.', button: '', bg: '#ffffff', color: '#28233b', accent: '#7c5cff' },
      features: { title: 'Features section', text: 'The details make the difference.', subtitle: 'Highlight what you offer with a few clear, helpful details.', button: 'Discover more', bg: '#f7f5ff', color: '#201b35', accent: '#7c5cff' },
      cta: { title: 'Call to action', text: 'Ready to make it happen?', subtitle: 'Your next chapter starts here.', button: 'Let’s talk', bg: '#201b35', color: '#ffffff', accent: '#b49aff' },
      image: { title: 'Image section', text: 'A visual worth remembering.', subtitle: 'A space for a favourite image or visual.', button: '', bg: '#f4e8e2', color: '#28233b', accent: '#7c5cff' },
    }
    const block = { id: `${type}-${Date.now()}`, type, ...presets[type] }
    commitBlocks([...blocks, block]); setSelectedId(block.id); setPanel('settings'); setMobilePanel('settings'); notify('Section added to your page')
  }
  const moveBlock = (id, delta) => {
    const index = blocks.findIndex(b => b.id === id), target = index + delta
    if (index < 0 || target < 0 || target >= blocks.length) return
    const next = [...blocks]; [next[index], next[target]] = [next[target], next[index]]; commitBlocks(next)
  }
  const removeBlock = id => {
    const next = blocks.filter(b => b.id !== id); commitBlocks(next); setSelectedId(next[0]?.id || ''); notify('Section removed')
  }
  const chooseTemplate = template => {
    const now = Date.now()
    const tint = { violet: ['#11101d', '#f6f3ff', '#b49aff'], peach: ['#fff0e7', '#34241f', '#db805d'], blue: ['#101b30', '#f3f7ff', '#7db8ff'], green: ['#10251f', '#f0fff7', '#8de0b9'] }[template.tint]
    const next = [
      { id: `hero-${now}`, type: 'hero', title: 'Hero section', text: template.headline, subtitle: template.sub, button: 'Discover more', bg: tint[0], color: tint[1], accent: tint[2] },
      { id: `features-${now + 1}`, type: 'features', title: 'Features section', text: 'Made with intention.', subtitle: template.desc + '. Tell your visitors what makes your work different.', button: 'Learn more', bg: '#f7f5ff', color: '#201b35', accent: '#7c5cff' },
    ]
    setSiteName(template.name); commitBlocks(next); setSelectedId(next[0].id); setPage('editor'); setModal(''); notify(`${template.name} template is ready to edit`)
  }
  const startNew = () => { const fresh = starterBlocks.map(b => ({ ...b, id: `${b.type}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}` })); setSiteName('Untitled website'); commitBlocks(fresh); setSelectedId(fresh[0].id); setPanel('elements'); setPage('editor'); setModal('') }
  const saveProject = () => {
    const name = siteName.trim() || 'Untitled website'; setSiteName(name)
    setProjects(prev => [{ id: `${name}-${Date.now()}`, name, kind: 'Website', updated: 'Saved just now', blocks: blocks.length, content: blocks }, ...prev.filter(p => p.name !== name)])
    notify('Saved on this device')
  }
  const undo = () => { if (!history.length) return notify('Nothing to undo yet'); setFuture(old => [...old, blocks]); setBlocks(history[history.length - 1]); setHistory(old => old.slice(0, -1)); notify('Last change undone') }
  const redo = () => { if (!future.length) return notify('Nothing to redo'); setHistory(old => [...old, blocks]); setBlocks(future[future.length - 1]); setFuture(old => old.slice(0, -1)); notify('Change restored') }
  const generateDraft = () => {
    const brief = prompt.trim(); if (!brief) return notify('Write a short website idea first')
    const shop = /shop|store|fashion|product|clothing|beauty|cosmetic/i.test(brief)
    const now = Date.now()
    const next = [
      { id: `hero-${now}`, type: 'hero', title: 'Hero section', text: brief.length > 88 ? `${brief.slice(0, 85).trim()}…` : brief, subtitle: 'A first concept built from your brief. Fine-tune the story, sections, and colours in the visual editor.', button: shop ? 'Explore collection' : 'Get started', bg: '#11101d', color: '#f6f3ff', accent: '#b49aff' },
      { id: `features-${now + 1}`, type: 'features', title: 'Features section', text: shop ? 'Thoughtfully picked. Made to love.' : 'Big ideas, thoughtfully brought to life.', subtitle: 'Use this space to explain your value, share key details, and help visitors take the next step.', button: 'Discover more', bg: '#f7f5ff', color: '#201b35', accent: '#7c5cff' },
    ]
    setSiteName(shop ? 'Nova Atelier' : 'New concept'); commitBlocks(next); setSelectedId(next[0].id); setPage('editor'); setModal(''); setPrompt(''); notify('Local concept created — no external AI connection is needed')
  }
  const exportHtml = () => {
    const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
    const content = blocks.map(b => `<section style="padding:clamp(44px,8vw,100px) max(7vw,24px);background:${b.bg};color:${b.color};font-family:Arial,sans-serif"><div style="max-width:1080px;margin:auto"><p style="letter-spacing:.18em;text-transform:uppercase;font-size:11px;opacity:.7">${esc(b.title)}</p><h1 style="font-size:clamp(32px,6vw,68px);line-height:1.06;letter-spacing:-.04em;max-width:850px">${esc(b.text)}</h1><p style="font-size:17px;line-height:1.8;max-width:660px">${esc(b.subtitle)}</p>${b.button ? `<a href="#contact" style="display:inline-block;margin-top:14px;padding:14px 20px;border-radius:999px;background:${b.accent || '#7c5cff'};color:#fff;text-decoration:none">${esc(b.button)} →</a>` : ''}</div></section>`).join('')
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(siteName)}</title></head><body style="margin:0">${content}<footer id="contact" style="padding:30px;text-align:center;font:13px Arial;color:#777">Made with VEXORAI</footer></body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${(siteName || 'vexorai-site').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); notify('HTML file exported')
  }

  if (page === 'dashboard') return <div className="app-shell dashboard-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="dashboard-topbar"><Logo /><div className="topbar-right"><span className="online-dot" /> All changes stay on this device <button className="avatar" aria-label="Profile">L</button></div></header>
    <main className="dashboard-main">
      <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-spark"><Sparkles size={13} /></span> YOUR CREATIVE SPACE</div><h1>Ideas into <span>something real.</span></h1><p>A calmer, more considered way to shape your next website.</p></div><button className="button primary" onClick={() => setModal('ai')}><WandSparkles size={16} /> Start with an idea <ArrowRight size={15} /></button></section>
      <section className="hero-card"><div className="hero-card-copy"><span className="pill"><Sparkles size={12} /> YOUR NEXT CHAPTER</span><h2>Make a little<br />internet magic.</h2><p>Start with a blank canvas, pick a starting point, and make it yours. No code required to explore.</p><div className="hero-card-actions"><button className="button light" onClick={startNew}><Plus size={16} /> Blank canvas</button><button className="button ghost-light" onClick={() => setModal('templates')}>Explore templates <ArrowRight size={15} /></button></div></div><div className="hero-visual" aria-hidden="true"><div className="visual-grid" /><div className="visual-ring ring-one" /><div className="visual-ring ring-two" /><div className="visual-orb" /><div className="float-card float-card-top"><Sparkles size={14} /><span>Little details, big feeling</span></div><div className="float-card float-card-bottom"><span className="mini-check"><Check size={12} /></span><span>Made by you</span></div><div className="visual-caption">DESIGN / EXPLORE / CREATE</div></div></section>
      <section className="section-heading"><div><span className="eyebrow muted">A PLACE TO BEGIN</span><h2>Choose your starting point</h2></div><button className="text-button" onClick={() => setModal('templates')}>All templates <ArrowRight size={15} /></button></section>
      <div className="template-grid">{templates.slice(0, 3).map(t => <button className="template-card" key={t.name} onClick={() => chooseTemplate(t)}><Thumb tint={t.tint} /><span className="template-meta"><span><b>{t.name}</b><small>{t.category} · {t.desc}</small></span><span className="template-arrow"><ArrowUpRightIcon /></span></span></button>)}</div>
      <section className="section-heading projects-heading"><div><span className="eyebrow muted">PICK UP WHERE YOU LEFT OFF</span><h2>Your recent projects</h2></div><span className="project-count">{projects.length} saved</span></section>
      {projects.length ? <div className="project-list">{projects.map(p => <button className="project-row" key={p.id} onClick={() => { setSiteName(p.name); if (Array.isArray(p.content)) { setBlocks(p.content); setSelectedId(p.content[0]?.id || '') } setPage('editor'); notify(`Opened ${p.name}`) }}><span className="project-icon"><LayoutDashboard size={17} /></span><span className="project-info"><b>{p.name}</b><small>{p.kind || 'Website'} · {p.blocks ?? 2} sections</small></span><span className="project-updated">{p.updated}</span><ArrowRight size={16} /></button>)}</div> : <div className="empty-projects"><span className="empty-project-icon"><Layers size={18} /></span><span><b>Your next great thing goes here.</b><small>Save a project from the editor and it will appear here.</small></span><button className="text-button" onClick={() => setModal('templates')}>Browse templates <ArrowRight size={14} /></button></div>}
      <footer className="dashboard-footer"><Logo /><span>Made for curious minds. <span className="footer-star">✳</span></span><span>LOCAL-FIRST · 2026</span></footer>
    </main>
    {modal === 'templates' && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal('') }}><section className="modal template-modal"><div className="modal-head"><div><span className="eyebrow muted">START WITH A LITTLE INSPIRATION</span><h2>Find your first draft.</h2><p>Pick a direction. You can change everything later.</p></div><IconButton label="Close" onClick={() => setModal('')}><X size={18} /></IconButton></div><div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates or styles…" autoFocus /></div><div className="modal-template-grid">{filteredTemplates.map(t => <button key={t.name} className="modal-template" onClick={() => chooseTemplate(t)}><Thumb tint={t.tint} /><b>{t.name}</b><small>{t.category} · {t.desc}</small></button>)}</div>{!filteredTemplates.length && <div className="no-results">No templates match that search yet.</div>}</section></div>}
    {modal === 'ai' && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal('') }}><section className="modal ai-modal"><div className="modal-head"><div><span className="eyebrow"><Sparkles size={13} /> IDEA TO FIRST DRAFT</span><h2>What are we imagining?</h2><p>Describe the website you want to make. VEXORAI prototype will shape a local starter concept you can edit.</p></div><IconButton label="Close" onClick={() => setModal('')}><X size={18} /></IconButton></div><label className="prompt-label" htmlFor="idea-prompt">YOUR IDEA</label><textarea id="idea-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A dreamy portfolio for a photographer, with a bold headline, a gallery feel, and warm colours…" rows={4} /><div className="prompt-hint"><Sparkles size={13} /> Prototype mode: this creates a starter draft locally. Live AI generation is not connected yet.</div><button className="button primary full" onClick={generateDraft}><WandSparkles size={16} /> Create my first draft <ArrowRight size={15} /></button></section></div>}
    {toast && <div className="toast"><CheckCircle2 size={16} /> {toast}</div>}
  </div>

  return <div className="app-shell editor-shell">
    <header className="editor-topbar"><div className="editor-brand"><IconButton label="Back to dashboard" onClick={() => setPage('dashboard')}><ArrowLeft size={17} /></IconButton><Logo /><span className="topbar-divider" /><input className="site-name-input" value={siteName} onChange={e => setSiteName(e.target.value)} aria-label="Website name" /><span className="saved-indicator"><span className="save-dot" /> Saved locally</span></div><div className="editor-actions"><IconButton label="Undo" onClick={undo} disabled={!history.length}><Undo2 size={16} /></IconButton><IconButton label="Redo" onClick={redo} disabled={!future.length}><Redo2 size={16} /></IconButton><span className="topbar-divider" /><div className="device-switch"><button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview"><Monitor size={15} /></button><button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview"><Smartphone size={15} /></button></div><button className="button subtle preview-button" onClick={() => { setMobilePanel(''); notify('You are viewing the editor preview') }}><Eye size={15} /> Preview</button><button className="button subtle save-button" onClick={saveProject}><Check size={15} /> Save</button><button className="button primary export-button" onClick={exportHtml}><Download size={15} /> Export</button></div></header>
    <div className="editor-mobile-tabs"><button className={mobilePanel === 'elements' || (!mobilePanel && panel === 'elements') ? 'active' : ''} onClick={() => { setMobilePanel('elements'); setPanel('elements') }}><Layers size={15} /> Elements</button><button className={mobilePanel === 'canvas' ? 'active' : ''} onClick={() => setMobilePanel('canvas')}><Monitor size={15} /> Canvas</button><button className={mobilePanel === 'settings' || (!mobilePanel && panel === 'settings') ? 'active' : ''} onClick={() => { setMobilePanel('settings'); setPanel('settings') }}><Settings2 size={15} /> Style</button></div>
    <div className={`editor-workspace ${mobilePanel ? `mobile-${mobilePanel}` : ''}`}>
      <aside className="left-panel"><div className="panel-tabs"><button className={panel === 'elements' ? 'active' : ''} onClick={() => { setPanel('elements'); setMobilePanel('elements') }}><Layers size={15} /> Elements</button><button className={panel === 'pages' ? 'active' : ''} onClick={() => { setPanel('pages'); setMobilePanel('elements') }}><FileText size={15} /> Pages</button></div>
        {panel === 'elements' ? <div className="panel-content"><div className="panel-heading"><div><h3>Build your page</h3><p>Add sections to your canvas.</p></div><Sparkles size={17} className="violet-icon" /></div><div className="element-grid"><button onClick={() => addBlock('hero')}><span className="element-icon lilac"><LayoutDashboard size={17} /></span><b>Hero</b><small>Headline + button</small></button><button onClick={() => addBlock('text')}><span className="element-icon peachy"><Type size={17} /></span><b>Text</b><small>Story + details</small></button><button onClick={() => addBlock('image')}><span className="element-icon bluey"><ImageIcon size={17} /></span><b>Image</b><small>Visual section</small></button><button onClick={() => addBlock('features')}><span className="element-icon greeny"><Layers size={17} /></span><b>Features</b><small>Cards + highlights</small></button><button onClick={() => addBlock('cta')}><span className="element-icon pinky"><MousePointer2 size={17} /></span><b>CTA</b><small>Action section</small></button></div><div className="panel-subhead"><span>PAGE STRUCTURE</span><button onClick={() => addBlock('text')}><Plus size={13} /> Add</button></div><div className="layer-list">{blocks.map((b, i) => <div key={b.id} className={`layer-row ${selectedId === b.id ? 'selected' : ''}`}><button className="layer-select" onClick={() => { setSelectedId(b.id); setPanel('settings'); setMobilePanel('settings') }}><span className="layer-index">{String(i + 1).padStart(2, '0')}</span><span>{b.title}</span></button><div className="layer-actions"><IconButton label="Move up" onClick={() => moveBlock(b.id, -1)} disabled={i === 0}><ArrowDown size={13} className="flip" /></IconButton><IconButton label="Delete section" onClick={() => removeBlock(b.id)}><Trash2 size={13} /></IconButton></div></div>)}</div><button className="ai-side-button" onClick={() => { setPage('dashboard'); setModal('ai') }}><WandSparkles size={15} /><span><b>Start with an idea</b><small>Make a fresh concept</small></span><ArrowRight size={14} /></button></div> : <div className="panel-content"><div className="panel-heading"><div><h3>Pages</h3><p>One page, ready to shape.</p></div></div><div className="page-row active"><FileText size={15} /> Home <span>●</span></div><button className="page-row" onClick={() => notify('Multi-page support is on the roadmap')}><Plus size={15} /> Add a page</button></div>}</aside>
      <main className="canvas-area"><div className="canvas-toolbar"><span><span className="status-dot" /> HOME PAGE</span><span className="canvas-size">{device === 'desktop' ? '1440 px · Desktop' : '390 px · Mobile'}</span><IconButton label="Canvas help" onClick={() => notify('Select a section to edit its content and colours')}><CircleHelp size={16} /></IconButton></div><div className="canvas-scroll"><div className={`website-canvas ${device === 'mobile' ? 'mobile-canvas' : ''}`}><div className="site-preview-nav"><div className="preview-logo"><span className="preview-logo-dot" />{siteName || 'Your brand'}</div><div className="preview-links"><span>Home</span><span>About</span><span>Contact</span></div><button className="preview-nav-button" onClick={() => notify('Navigation link selected')}>Let’s talk <ArrowRight size={13} /></button></div>
        {!blocks.length && <div className="empty-canvas"><div className="empty-icon"><Plus size={22} /></div><h3>Your canvas is ready.</h3><p>Add a section from the Elements panel to start building.</p><button className="button primary" onClick={() => addBlock('hero')}><Plus size={14} /> Add hero section</button></div>}
        {blocks.map((b, i) => <section key={b.id} className={`site-section ${selectedId === b.id ? 'section-selected' : ''} ${b.type === 'hero' ? 'hero-section' : ''} ${b.type === 'features' ? 'features-section' : ''}`} style={{ background: b.bg, color: b.color, '--accent': b.accent || '#7c5cff' }} onClick={() => { setSelectedId(b.id); setPanel('settings'); setMobilePanel('settings') }}><div className="section-topline"><span>{String(i + 1).padStart(2, '0')} / {b.title}</span>{selectedId === b.id && <span className="selected-chip"><span /> SELECTED</span>}</div>{b.type === 'hero' ? <div className="hero-inner"><div className="preview-eyebrow"><span /> A LITTLE SOMETHING DIFFERENT</div><h1>{b.text}</h1><p>{b.subtitle}</p>{b.button && <button className="hero-cta" onClick={e => { e.stopPropagation(); notify('This button is part of your exported website preview') }}>{b.button}<ArrowRight size={15} /></button>}<div className="hero-art"><div className="hero-art-glow" /><div className="art-sun" /><div className="art-arch" /><div className="art-plant plant-one" /><div className="art-plant plant-two" /><span className="art-caption">MAKE IT YOURS · MAKE IT MATTER</span></div></div> : b.type === 'features' ? <div className="features-inner"><span className="section-kicker">THE GOOD STUFF</span><h2>{b.text}</h2><p>{b.subtitle}</p><div className="feature-cards"><div><span className="feature-num">01</span><b>Made for you</b><p>Make it yours with flexible design choices.</p></div><div><span className="feature-num">02</span><b>Simple by design</b><p>Everything has a place and purpose.</p></div><div><span className="feature-num">03</span><b>Ready to grow</b><p>Start small and build your next big thing.</p></div></div>{b.button && <button className="feature-link" onClick={e => { e.stopPropagation(); notify('Button label can be edited in Style settings') }}>{b.button}<ArrowRight size={14} /></button>}</div> : b.type === 'image' ? <div className="image-placeholder"><div className="image-placeholder-icon"><ImageIcon size={26} /></div><h2>{b.text}</h2><p>{b.subtitle}</p><span className="image-placeholder-note">IMAGE PLACEHOLDER</span></div> : b.type === 'cta' ? <div className="cta-inner"><span className="section-kicker">YOUR NEXT CHAPTER</span><h2>{b.text}</h2><p>{b.subtitle}</p>{b.button && <button className="hero-cta" onClick={e => { e.stopPropagation(); notify('Button label can be edited in Style settings') }}>{b.button}<ArrowRight size={14} /></button>}</div> : <div className="text-inner"><span className="section-kicker">A NOTE FROM US</span><h2>{b.text}</h2><p>{b.subtitle}</p></div>}</section>)}<footer className="site-preview-footer"><span>Made with a little imagination.</span><span>© 2026 {siteName || 'Your brand'}</span></footer></div></div></main>
      <aside className="right-panel"><div className="right-panel-header"><div><h3>Style settings</h3><p>Small details, your signature.</p></div><Palette size={17} /></div>{!selected ? <div className="no-selection"><MousePointer2 size={22} /><b>Select a section</b><p>Tap any section on the canvas to edit its content and style.</p></div> : <div className="settings-content"><div className="setting-group"><label>SECTION NAME</label><div className="input-with-icon"><Layers size={14} /><input value={selected.title} onChange={e => updateSelected('title', e.target.value)} /></div></div><div className="setting-group"><label>CONTENT</label><span className="field-label">Headline / title</span><textarea rows={3} value={selected.text} onChange={e => updateSelected('text', e.target.value)} /><span className="field-label">Supporting text</span><textarea rows={3} value={selected.subtitle} onChange={e => updateSelected('subtitle', e.target.value)} />{!['text', 'image'].includes(selected.type) && <><span className="field-label">Button label</span><input value={selected.button} onChange={e => updateSelected('button', e.target.value)} /></>}</div><div className="setting-group"><label><Palette size={13} /> COLOURS</label><div className="color-field"><div><span>Background</span><div className="color-input"><input aria-label="Background colour" type="color" value={selected.bg} onChange={e => updateSelected('bg', e.target.value)} /><code>{selected.bg.toUpperCase()}</code></div></div><div><span>Text</span><div className="color-input"><input aria-label="Text colour" type="color" value={selected.color} onChange={e => updateSelected('color', e.target.value)} /><code>{selected.color.toUpperCase()}</code></div></div></div><span className="field-label">Accent colour</span><div className="accent-swatches">{['#b49aff', '#7c5cff', '#22d3ee', '#f472b6', '#f59e0b', '#8de0b9'].map(c => <button key={c} className={selected.accent === c ? 'active' : ''} style={{ background: c }} aria-label={`Set accent ${c}`} onClick={() => updateSelected('accent', c)} />)}</div></div><div className="setting-group"><label>SECTION ORDER</label><div className="order-buttons"><button onClick={() => moveBlock(selected.id, -1)} disabled={blocks[0]?.id === selected.id}><ArrowLeft size={14} /> Move up</button><button onClick={() => moveBlock(selected.id, 1)} disabled={blocks[blocks.length - 1]?.id === selected.id}><ArrowRight size={14} /> Move down</button></div></div><button className="delete-section" onClick={() => removeBlock(selected.id)}><Trash2 size={14} /> Delete this section</button></div>}</aside>
    </div>
    <footer className="editor-footer"><span><span className="status-dot" /> Changes save locally in this browser</span><button onClick={() => setPage('dashboard')}><LayoutDashboard size={14} /> Dashboard</button><button onClick={exportHtml}><Code2 size={14} /> Export HTML</button></footer>
    {toast && <div className="toast"><CheckCircle2 size={16} /> {toast}</div>}
  </div>
}
function ArrowUpRightIcon() { return <ArrowRight size={16} /> }
export default App
