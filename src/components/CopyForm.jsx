import { useState } from 'react'
import { TONES, AUDIENCES, LANGUAGES } from '../utils/tasks.js'

const PLATFORM_TASKS  = new Set(['Ad Communication', 'Videos', 'WA Creatives'])
const PHONE_TASKS     = new Set(['WA Creatives', 'Ad Communication', 'Communication Doc', 'Nurturing Emailers'])
const OCCASION_TASKS  = new Set(['WA Creatives', 'Ad Communication'])

export default function CopyForm({ taskType, projects, onSubmit, loading }) {
  const [f, setF] = useState({
    projectId: '', projectName: '', location: '', configuration: '',
    targetAudience: '', keyUSPs: '', tone: 'Premium & Aspirational',
    platform: '', language: 'English', additionalNotes: '',
    phoneNumber: '', occasion: '', price: '',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  function pickProject(id) {
    set('projectId', id)
    if (id) {
      const p = projects.find(p => p.id === id)
      if (p) set('projectName', p.name)
    }
  }

  function submit(e) {
    e.preventDefault()
    const proj = projects.find(p => p.id === f.projectId)
    // Build enriched notes with phone, occasion, price
    const extras = [
      f.phoneNumber && `Phone Number: ${f.phoneNumber}`,
      f.occasion    && `Occasion/Campaign: ${f.occasion}`,
      f.price       && `Price: ${f.price}`,
      f.additionalNotes && `Notes: ${f.additionalNotes}`,
    ].filter(Boolean).join('\n')
    onSubmit({ ...f, additionalNotes: extras, ctbContext: proj?.ctbContent || '' })
  }

  const linked = projects.find(p => p.id === f.projectId)

  return (
    <div className="card p-4">
      <p className="label mb-4">Step 2 — Project Details</p>
      <form onSubmit={submit} className="space-y-4">

        {/* Project link */}
        {projects.length > 0 && (
          <div>
            <label className="label">Link Project (optional)</label>
            <select className="input-field" value={f.projectId} onChange={e => pickProject(e.target.value)}>
              <option value="">— No project linked —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {linked?.ctbContent && (
              <p className="text-[11px] text-sage-500 mt-1">✓ CTB brief will be included</p>
            )}
          </div>
        )}

        {/* Project name */}
        <div>
          <label className="label">Project / Developer Name *</label>
          <input className="input-field" placeholder="e.g. GK ARIA, Tathawade Highstreet"
            value={f.projectName} onChange={e => set('projectName', e.target.value)} required />
        </div>

        {/* Location + Config */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Location</label>
            <input className="input-field" placeholder="e.g. Tathawade, Pune"
              value={f.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Configuration</label>
            <input className="input-field" placeholder="e.g. 2 BHK"
              value={f.configuration} onChange={e => set('configuration', e.target.value)} />
          </div>
        </div>

        {/* Price — always show */}
        <div>
          <label className="label">Price / Starting Price</label>
          <input className="input-field" placeholder="e.g. ₹71.1 Lacs* / ₹1.2 Cr*"
            value={f.price} onChange={e => set('price', e.target.value)} />
        </div>

        {/* Occasion — for WA / Ad */}
        {OCCASION_TASKS.has(taskType) && (
          <div>
            <label className="label">Occasion / Campaign (optional)</label>
            <input className="input-field" placeholder="e.g. Gudi Padwa, Diwali, New Launch"
              value={f.occasion} onChange={e => set('occasion', e.target.value)} />
          </div>
        )}

        {/* Phone number */}
        {PHONE_TASKS.has(taskType) && (
          <div>
            <label className="label">Contact Number</label>
            <input className="input-field" placeholder="e.g. 080-65918500"
              value={f.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
          </div>
        )}

        {/* Target Audience */}
        <div>
          <label className="label">Target Audience</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {AUDIENCES.map(a => (
              <button type="button" key={a} onClick={() => set('targetAudience', a)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all
                  ${f.targetAudience === a ? 'bg-ink-900 text-parchment-50 border-ink-900' : 'bg-white text-ink-600 border-parchment-200 hover:border-ink-600'}`}>
                {a}
              </button>
            ))}
          </div>
          <input className="input-field" placeholder="or describe your audience"
            value={f.targetAudience} onChange={e => set('targetAudience', e.target.value)} />
        </div>

        {/* USPs */}
        <div>
          <label className="label">Key USPs / Highlights</label>
          <textarea className="input-field resize-none" rows={3}
            placeholder="e.g. 0 Dead Space Layouts, Prime Highstreet Location, 50-50 Payment Scheme, Fixed Pre-EMI ₹21,000*"
            value={f.keyUSPs} onChange={e => set('keyUSPs', e.target.value)} />
        </div>

        {/* Tone */}
        <div>
          <label className="label">Tone & Style</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button type="button" key={t} onClick={() => set('tone', t)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all
                  ${f.tone === t ? 'bg-gold-500 text-white border-gold-500' : 'bg-white text-ink-600 border-parchment-200 hover:border-ink-600'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Language + Platform */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Language</label>
            <select className="input-field" value={f.language} onChange={e => set('language', e.target.value)}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          {PLATFORM_TASKS.has(taskType) && (
            <div>
              <label className="label">Platform / Format</label>
              <input className="input-field" placeholder="e.g. WhatsApp, Instagram"
                value={f.platform} onChange={e => set('platform', e.target.value)} />
            </div>
          )}
        </div>

        {/* Additional notes */}
        <div>
          <label className="label">Additional Notes</label>
          <textarea className="input-field resize-none" rows={2}
            placeholder="Any specific requirements, do's & don'ts, RERA number…"
            value={f.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} />
        </div>

        <button type="submit" disabled={loading || !f.projectName}
          className="btn-gold w-full flex items-center justify-center gap-2">
          {loading
            ? <><span className="spinner text-white" style={{ width: 15, height: 15 }}></span> Generating…</>
            : '✦ Generate Copy'}
        </button>
      </form>
    </div>
  )
}
