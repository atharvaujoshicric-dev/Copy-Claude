import { useState } from 'react'
import { TONES, AUDIENCES, LANGUAGES } from '../utils/tasks.js'

const EMAIL_STAGES  = ['Incoming', 'Prospect', 'Opportunity', 'Site Visit Scheduled', 'Site Visit Conducted', 'Booked']
const VIDEO_TYPES   = ['Ad – 15 sec', 'Ad – 30 sec', 'Ad – 60 sec', 'Walkthrough', 'Influencer', 'Explainer', 'Social Reel']
const VIDEO_STYLES  = ['Text on screen + Voiceover', 'Text on screen only', 'Voiceover only']
const AD_TYPES      = ['Google Search', 'Meta Leadgen', 'Meta Newsfeed', 'Google + Meta both']
const WA_FORMATS    = ['No Caption', 'With Caption']
const WA_BUCKETS    = ['Overview', 'Location', 'Amenities', 'Residences', 'Developer', 'Offer', 'Appreciation']

function Chip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all
        ${active ? 'bg-ink-900 text-parchment-50 border-ink-900' : 'bg-white text-ink-600 border-parchment-200 hover:border-ink-600'}`}>
      {label}
    </button>
  )
}

function GoldChip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all
        ${active ? 'bg-gold-500 text-white border-gold-500' : 'bg-white text-ink-600 border-parchment-200 hover:border-ink-600'}`}>
      {label}
    </button>
  )
}

export default function CopyForm({ taskType, projects, onSubmit, loading }) {
  const [f, setF] = useState({
    // Common
    projectId: '', projectName: '', location: '', configuration: '',
    price: '', targetAudience: '', keyUSPs: '', tone: 'Premium & Aspirational',
    language: 'English', concept: '', additionalNotes: '', phoneNumber: '',
    // Concepts + CTB
    problemStatement: '', objectives: '',
    // Emailers
    emailStages: [],
    // WA
    waFormat: 'No Caption', waBuckets: [], occasion: '',
    // Videos
    videoType: '', videoStyle: 'Text on screen + Voiceover', platform: '', videoDuration: '',
    // Ad Comm
    adType: '',
    // Site Branding
    externalPanels: '', internalPanels: '',
  })

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const toggleArr = (key, val) => setF(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val]
  }))

  function submit(e) {
    e.preventDefault()
    const proj = projects.find(p => p.id === f.projectId)
    const extras = [
      f.price            && `Price: ${f.price}`,
      f.concept          && `Project Concept/Tagline: ${f.concept}`,
      f.phoneNumber      && `Contact Number: ${f.phoneNumber}`,
      f.occasion         && `Occasion/Campaign: ${f.occasion}`,
      f.adType           && `Ad Type: ${f.adType}`,
      f.videoType        && `Video Type: ${f.videoType}`,
      f.videoDuration    && `Video Duration: ${f.videoDuration}`,
      f.videoStyle       && `Video Style: ${f.videoStyle}`,
      f.platform         && `Platform: ${f.platform}`,
      f.waFormat         && `WA Format: ${f.waFormat}`,
      f.waBuckets.length && `WA Buckets: ${f.waBuckets.join(', ')}`,
      f.emailStages.length && `Email Stages: ${f.emailStages.join(', ')}`,
      f.externalPanels   && `External Panels: ${f.externalPanels}`,
      f.internalPanels   && `Internal Panels: ${f.internalPanels}`,
      f.problemStatement && `Problem Statement: ${f.problemStatement}`,
      f.objectives       && `Objectives: ${f.objectives}`,
      f.additionalNotes  && `Additional Notes: ${f.additionalNotes}`,
    ].filter(Boolean).join('\n')
    onSubmit({ ...f, additionalNotes: extras, ctbContext: proj?.ctbContent || '' })
  }

  const linked = projects.find(p => p.id === f.projectId)
  const T = taskType

  return (
    <div className="card p-4">
      <p className="label mb-4">Step 2 — Brief</p>
      <form onSubmit={submit} className="space-y-4">

        {/* Link project */}
        {projects.length > 0 && (
          <div>
            <label className="label">Link Project (optional)</label>
            <select className="input-field" value={f.projectId} onChange={e => {
              set('projectId', e.target.value)
              const p = projects.find(p => p.id === e.target.value)
              if (p) set('projectName', p.name)
            }}>
              <option value="">— No project linked —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {linked?.ctbContent && <p className="text-[11px] text-sage-500 mt-1">✓ CTB brief will be included as context</p>}
          </div>
        )}

        {/* Project name — always */}
        <div>
          <label className="label">Project / Developer Name *</label>
          <input className="input-field" placeholder="e.g. GK ARIA by XYZ Developers"
            value={f.projectName} onChange={e => set('projectName', e.target.value)} required />
        </div>

        {/* Location + Config — always */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Location</label>
            <input className="input-field" placeholder="e.g. Tathawade, Pune"
              value={f.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Configuration</label>
            <input className="input-field" placeholder="e.g. 2 & 3 BHK"
              value={f.configuration} onChange={e => set('configuration', e.target.value)} />
          </div>
        </div>

        {/* Price — all except Headlines */}
        {T !== 'Headlines/Image Lines' && (
          <div>
            <label className="label">Price / Starting Price</label>
            <input className="input-field" placeholder="e.g. ₹71.1 Lacs* / ₹1.2 Cr All Incl."
              value={f.price} onChange={e => set('price', e.target.value)} />
          </div>
        )}

        {/* ── AD COMM specific ── */}
        {T === 'Ad Communication' && (
          <div>
            <label className="label">Ad Type</label>
            <div className="flex flex-wrap gap-1.5">
              {AD_TYPES.map(t => <Chip key={t} label={t} active={f.adType === t} onClick={() => set('adType', t)} />)}
            </div>
          </div>
        )}

        {/* ── WA CREATIVES specific ── */}
        {T === 'WA Creatives' && (
          <>
            <div>
              <label className="label">Format</label>
              <div className="flex gap-2">
                {WA_FORMATS.map(fmt => <Chip key={fmt} label={fmt} active={f.waFormat === fmt} onClick={() => set('waFormat', fmt)} />)}
              </div>
              <p className="text-[10px] text-ink-600/40 mt-1">With Caption = creative + separate WA caption/hook</p>
            </div>
            <div>
              <label className="label">Buckets / Topics</label>
              <div className="flex flex-wrap gap-1.5">
                {WA_BUCKETS.map(b => <Chip key={b} label={b} active={f.waBuckets.includes(b)} onClick={() => toggleArr('waBuckets', b)} />)}
              </div>
            </div>
            <div>
              <label className="label">Occasion / Campaign (optional)</label>
              <input className="input-field" placeholder="e.g. Gudi Padwa, Diwali, New Launch"
                value={f.occasion} onChange={e => set('occasion', e.target.value)} />
            </div>
          </>
        )}

        {/* ── AD COMM occasion ── */}
        {T === 'Ad Communication' && (
          <div>
            <label className="label">Occasion / Campaign (optional)</label>
            <input className="input-field" placeholder="e.g. Gudi Padwa, New Launch, Offer"
              value={f.occasion} onChange={e => set('occasion', e.target.value)} />
          </div>
        )}

        {/* ── EMAILERS specific ── */}
        {T === 'Nurturing Emailers' && (
          <div>
            <label className="label">Stages Required</label>
            <div className="flex flex-wrap gap-1.5">
              {EMAIL_STAGES.map(s => <Chip key={s} label={s} active={f.emailStages.includes(s)} onClick={() => toggleArr('emailStages', s)} />)}
            </div>
            <p className="text-[10px] text-ink-600/40 mt-1">Leave empty to generate all 6 stages</p>
          </div>
        )}

        {/* ── VIDEOS specific ── */}
        {T === 'Videos' && (
          <>
            <div>
              <label className="label">Video Type</label>
              <div className="flex flex-wrap gap-1.5">
                {VIDEO_TYPES.map(t => <Chip key={t} label={t} active={f.videoType === t} onClick={() => set('videoType', t)} />)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Platform</label>
                <input className="input-field" placeholder="e.g. Instagram, YouTube"
                  value={f.platform} onChange={e => set('platform', e.target.value)} />
              </div>
              <div>
                <label className="label">Duration</label>
                <input className="input-field" placeholder="e.g. 30 sec, 60 sec"
                  value={f.videoDuration} onChange={e => set('videoDuration', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Style</label>
              <div className="flex flex-wrap gap-1.5">
                {VIDEO_STYLES.map(s => <Chip key={s} label={s} active={f.videoStyle === s} onClick={() => set('videoStyle', s)} />)}
              </div>
            </div>
          </>
        )}

        {/* ── SITE BRANDING specific ── */}
        {T === 'Site Branding' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">External Panels</label>
              <input className="input-field" placeholder="e.g. 8" type="number"
                value={f.externalPanels} onChange={e => set('externalPanels', e.target.value)} />
            </div>
            <div>
              <label className="label">Internal Panels</label>
              <input className="input-field" placeholder="e.g. 12" type="number"
                value={f.internalPanels} onChange={e => set('internalPanels', e.target.value)} />
            </div>
          </div>
        )}

        {/* ── CONCEPTS + CTB — problem statement + objectives ── */}
        {(T === 'Concepts' || T === 'Coffee Table Book') && (
          <>
            <div>
              <label className="label">Problem Statement</label>
              <textarea className="input-field resize-none" rows={2}
                placeholder="Current market challenge — location sentiment, config issues, why a revamp, etc."
                value={f.problemStatement} onChange={e => set('problemStatement', e.target.value)} />
            </div>
            <div>
              <label className="label">Objectives</label>
              <textarea className="input-field resize-none" rows={2}
                placeholder="What needs to be highlighted, communication goals, strengths to show"
                value={f.objectives} onChange={e => set('objectives', e.target.value)} />
            </div>
          </>
        )}

        {/* Existing concept — for execution tasks */}
        {['WA Creatives', 'Ad Communication', 'Nurturing Emailers', 'Site Branding', 'Videos', 'Headlines/Image Lines', 'Coffee Table Book'].includes(T) && (
          <div>
            <label className="label">Project Concept / Tagline (if finalised)</label>
            <input className="input-field" placeholder="e.g. Rise Above | Where Life Elevates"
              value={f.concept} onChange={e => set('concept', e.target.value)} />
          </div>
        )}

        {/* Phone — for tasks that show it */}
        {['WA Creatives', 'Ad Communication', 'Communication Doc', 'Nurturing Emailers'].includes(T) && (
          <div>
            <label className="label">Contact Number</label>
            <input className="input-field" placeholder="e.g. 080-65918500"
              value={f.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} />
          </div>
        )}

        {/* Target audience — always */}
        <div>
          <label className="label">Target Audience</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {AUDIENCES.map(a => <Chip key={a} label={a} active={f.targetAudience === a} onClick={() => set('targetAudience', a)} />)}
          </div>
          <input className="input-field" placeholder="or describe your audience in more detail"
            value={f.targetAudience} onChange={e => set('targetAudience', e.target.value)} />
        </div>

        {/* Key USPs — always */}
        <div>
          <label className="label">Key USPs / Features</label>
          <textarea className="input-field resize-none" rows={3}
            placeholder="e.g. 0 Dead Space Layouts, Prime Highstreet Location, 50-50 Payment Scheme, Fixed Pre-EMI ₹21,000*, RERA approved, 5-acre landscape"
            value={f.keyUSPs} onChange={e => set('keyUSPs', e.target.value)} />
          <p className="text-[10px] text-ink-600/40 mt-1">More specific USPs = better output. Include numbers wherever possible.</p>
        </div>

        {/* Tone — always */}
        <div>
          <label className="label">Tone & Style</label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => <GoldChip key={t} label={t} active={f.tone === t} onClick={() => set('tone', t)} />)}
          </div>
        </div>

        {/* Language — always */}
        <div>
          <label className="label">Language</label>
          <select className="input-field" value={f.language} onChange={e => set('language', e.target.value)}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Additional notes — always */}
        <div>
          <label className="label">Additional Notes / Brief</label>
          <textarea className="input-field resize-none" rows={2}
            placeholder="RERA number, specific do's & don'ts, reference projects, developer background, anything else from the brief"
            value={f.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} />
        </div>

        <button type="submit" disabled={loading || !f.projectName}
          className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
          {loading
            ? <><span className="spinner text-white" style={{ width: 15, height: 15 }}></span> Generating…</>
            : '✦ Generate Copy'}
        </button>
      </form>
    </div>
  )
}
