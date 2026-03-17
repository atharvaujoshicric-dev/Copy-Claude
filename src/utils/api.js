import { getApiKey } from './store.js'

// ─── Model selection ──────────────────────────────────────────────
// llama-3.3-70b-versatile: best for English
// llama3-groq-70b-8192-tool-use-preview: handles Indic scripts better
// mixtral-8x7b-32768: fallback with large context (good for PDF text)
const MODEL_DEFAULT  = 'llama-3.3-70b-versatile'
const MODEL_INDIC    = 'llama-3.1-8b-instant'   // faster for Indic
const MODEL_LARGE_CTX = 'mixtral-8x7b-32768'    // for large PDF contexts

function pickModel(language, hasPdf) {
  if (language === 'Hindi' || language === 'Marathi') return MODEL_INDIC
  if (language === 'Hinglish') return MODEL_DEFAULT // English model handles Hinglish fine
  if (hasPdf) return MODEL_LARGE_CTX
  return MODEL_DEFAULT
}

// ─── Language instruction ─────────────────────────────────────────
function langInstruction(language) {
  if (language === 'Hindi')
    return `\n\nIMPORTANT: Write the ENTIRE output in Hindi using Devanagari script (हिंदी में लिखें). All headings, body copy, pointers, CTAs — everything in Hindi.`
  if (language === 'Marathi')
    return `\n\nIMPORTANT: Write the ENTIRE output in Marathi using Devanagari script (मराठीत लिहा). All headings, body copy, pointers, CTAs — everything in Marathi.`
  if (language === 'Hinglish')
    return `\n\nIMPORTANT: Write the ENTIRE output in Hinglish — a natural mix of Hindi and English as spoken in urban India. Use Roman script (not Devanagari). Example: "Apna ghar, apni life. Yahan har cheez aapke paas hai." Keep it conversational and relatable.`
  return '' // English — no special instruction
}

// ─── Build the prompt (fill-in-the-blank format per task) ─────────
function buildPrompt(taskType, data) {
  const {
    projectName, location, configuration, price,
    targetAudience, keyUSPs, tone, language,
    additionalNotes, ctbContext, ctbFile,
  } = data

  const get = (key) => {
    const match = (additionalNotes || '').match(new RegExp(`${key}:\\s*(.+)`))
    return match ? match[1].trim() : ''
  }

  const concept      = get('Project Concept/Tagline')
  const phone        = get('Contact Number')
  const occasion     = get('Occasion/Campaign')
  const adType       = get('Ad Type')
  const videoType    = get('Video Type')
  const videoDur     = get('Video Duration')
  const videoStyle   = get('Video Style')
  const platform     = get('Platform')
  const waFormat     = get('WA Format')
  const waBuckets    = get('WA Buckets')
  const emailStages  = get('Email Stages')
  const extPanels    = get('External Panels')
  const intPanels    = get('Internal Panels')
  const problem      = get('Problem Statement')
  const objectives   = get('Objectives')

  const langNote = langInstruction(language)
  const proj = `${projectName}${location ? ', ' + location : ''}`

  // CTB context — use text if available, PDF handled separately via messages
  const ctb = ctbContext
    ? `\nCTB/BRIEF CONTEXT:\n${ctbContext.slice(0, 3000)}`
    : ctbFile ? `\n(Project PDF brief has been attached and should inform all copy decisions.)` : ''

  const SYSTEM = `You are a senior real estate copywriter with decades of experience. You know exactly what makes buyers tick. You write copy that is specific, benefit-driven, and never generic. You ALWAYS follow the exact output format given — no deviations, no preamble, no "Here is your..." introductions. Start directly with the first line of output.${langNote}`

  // ── WA CREATIVES ──────────────────────────────────────────────
  if (taskType === 'WA Creatives') {
    const buckets = waBuckets || 'Overview, Location, Offer'
    const fmt = waFormat || 'No Caption'
    const occ = occasion ? `Occasion: ${occasion}` : ''

    const noCapTemplate = `Creative 1 — [BUCKET 1 from: ${buckets}]

Heading: [${occasion ? occasion + ' offer angle.' : 'Benefit or occasion-driven headline.'}]
Subline: [Own/Discover/Experience + adjective + Home/Homes + at + ${projectName}, ${location}]
Body: [2–3 sentences. Paint the BENEFIT/LIFESTYLE — do NOT repeat the pointers below. Conversational.]
✔ [USP from brief]   ✔ [USP from brief]   ✔ [USP from brief]   ✔ [USP from brief]
Price: ${configuration} @ ${price}*
[One closing line — occasion hook or aspiration or investment angle]
${occasion ? 'Limited Period Offer' : ''}
T&C Apply
Call Now: ${phone || 'XXXXXXXXXX'}

---

Creative 2 — [BUCKET 2 from: ${buckets}]

Heading: [Different angle from Creative 1.]
Subline: [Own/Discover/Experience + adjective + Home/Homes + at + ${projectName}, ${location}]
Body: [2–3 sentences — different angle. Does NOT repeat the pointers below.]
✔ [USP]   ✔ [USP]   ✔ [USP]   ✔ [USP]
Price: ${configuration} @ ${price}*
[Closing line]
T&C Apply
Call Now: ${phone || 'XXXXXXXXXX'}

---

Creative 3 — [BUCKET 3 from: ${buckets}]

Heading: [Investment or value angle.]
Subline: [Own/Discover/Experience + adjective + Home/Homes + at + ${projectName}, ${location}]
Body: [2–3 sentences — investment/value focus. Does NOT repeat the pointers below.]
✔ [USP]   ✔ [USP]   ✔ [USP]   ✔ [USP]
Price: ${configuration} @ ${price}*
[Closing line]
T&C Apply
Call Now: ${phone || 'XXXXXXXXXX'}`

    const withCapTemplate = `Creative 1 — [BUCKET 1 from: ${buckets}]

[CREATIVE]
Heading: [Benefit/occasion-driven headline.]
One supporting line: [Expands the heading — 1 line]
✔ [USP]   ✔ [USP]   ✔ [USP]   ✔ [USP]
CTA: [Appeal to schedule a visit]
${projectName} | ${configuration} @ ${price}* | ${location} | Call: ${phone || 'XXXXXXXXXX'}

[CAPTION]
Hook: [Visible before opening WA. Must make them open. This = subject line equivalent.]
Body: [3–4 sentences. Benefits supporting the creative — does NOT repeat pointers.]
CTA: [Schedule visit / Call button text]

---

Creative 2 — [BUCKET 2]
[Same structure — different angle]

---

Creative 3 — [BUCKET 3]
[Same structure — different angle]`

    const USER = `Write 3 WhatsApp Creatives for ${proj}.
Config: ${configuration || 'N/A'} | Price: ${price || 'N/A'} | Phone: ${phone || 'XXXXXXXXXX'}
Tone: ${tone} | Language: ${language}
Buckets/Topics: ${buckets}
${occ}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

CRITICAL RULE — Body vs Pointers:
Body copy = paints the EMOTIONAL BENEFIT of what life looks like.
Pointers = lists the FEATURES that create that life.
They must NEVER say the same thing.
✗ Wrong: Body says "0 dead space layouts" AND pointer says "0 Dead Space Layouts"
✓ Right: Body says "every room has a purpose, every square foot works for you" + Pointer says "0 Dead Space Layouts"

Reference example (use this structure exactly):
Creative 1
Heading: Grand Gudi Padwa Offer.
Subline: Own a thoughtfully designed Home at GK ARIA, Tathawade Highstreet
Body: Experience smarter living in a prime highstreet location where everything you need is just minutes away — work, schools, shopping & daily essentials.
✔ 0 Dead Space Layouts   ✔ Prime Highstreet Location   ✔ 50–50 Payment Scheme   ✔ Fixed Pre-EMI ₹21,000*
Price: 2 BHK @ ₹71.1 Lacs*
This Gudi Padwa, upgrade to smarter living and stronger investment value.
Limited Period Offer
T&C Apply
Call Now: 080-65918500

Now write for ${proj} using this EXACT structure:

${fmt === 'With Caption' ? withCapTemplate : noCapTemplate}

Output ONLY the 3 creatives. Start directly with "Creative 1".`

    return { system: SYSTEM, user: USER }
  }

  // ── AD COMMUNICATION ─────────────────────────────────────────
  if (taskType === 'Ad Communication') {
    const type = adType || 'Google Search'
    const USER = `Write Ad Communication copy for ${proj}.
Config: ${configuration || 'N/A'} | Price: ${price || 'N/A'} | Phone: ${phone || 'N/A'}
Ad Type: ${type} | Tone: ${tone} | Language: ${language}
${occasion ? `Occasion: ${occasion}` : ''}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

RULES: No em dashes. No repetition between pinned and subsequent headlines. Config > Price > Location in pinned headline. Each headline = different bucket. Descriptions give BENEFIT not feature. Show character count after each element like (27 chars).

${type.includes('Google') ? `OUTPUT — GOOGLE SEARCH ADS:

Pinned Headline (max 30): [Config | Price | Location] (XX chars)
Pinned Description (max 90): [Everything pinned headline missed — 1 flowing sentence] (XX chars)

Headline 1 (max 30): [Hero USP] (XX chars)
Description 1 (max 90): [BENEFIT of H1 — not the feature] (XX chars)

Headline 2 (max 30): [Different bucket] (XX chars)
Description 2 (max 90): [Benefit of H2] (XX chars)

Headline 3 (max 30): [Location — direct] (XX chars)
Description 3 (max 90): [What location does for buyer's life] (XX chars)

Headline 4 (max 30): [Developer/Trust] (XX chars)
Description 4 (max 90): [Developer RTB] (XX chars)

Headline 5 (max 30): [Social proof] (XX chars)
Headline 6 (max 30): [Another USP] (XX chars)
Headline 7 (max 30): [Amenity/lifestyle] (XX chars)
Headline 8 (max 30): [Spec/design] (XX chars)
Headline 9 (max 30): [Connectivity] (XX chars)
Headline 10 (max 30): [Remaining USP] (XX chars)` : ''}

${type.includes('Meta') ? `OUTPUT — META ADS:

Creative 1 — [Offer/Launch/Hero USP angle]
Headline (max 40): [Punchy]
Primary Text Hook: [First line before See More — must work standalone]
Primary Text Body: [2–3 sentences — benefits]
✔ [USP 1]   ✔ [USP 2]   ✔ [USP 3]   ✔ [USP 4]
Price: ${configuration} @ ${price}*
CTA Button: [Learn More / Book Now]
Disclaimer: *Price subject to change. T&C Apply.

---
Creative 2 — [Different angle]
[Same structure]

---
Creative 3 — [Different angle]
[Same structure]` : ''}

Output ONLY the ad copy. No preamble.`
    return { system: SYSTEM, user: USER }
  }

  // ── NURTURING EMAILERS ────────────────────────────────────────
  if (taskType === 'Nurturing Emailers') {
    const stages = emailStages || 'Incoming, Prospect, Opportunity'
    const USER = `Write Nurturing Emailers for ${proj}.
Config: ${configuration || 'N/A'} | Price: ${price || 'N/A'} | Phone: ${phone || 'N/A'}
Stages: ${stages} | Tone: ${tone} | Language: ${language}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

STAGE GUIDE: INCOMING=intro project. PROSPECT=hero feature bucket. OPPORTUNITY=FOMO/urgency. SCHEDULED/CONDUCTED/BOOKED=fixed formats only.
RULE: Body paints benefits. Pointers list features. NEVER repeat same idea in both.

For each stage:

━━━ STAGE: [NAME] ━━━

Subject Lines:
A. [Curiosity]
B. [Benefit]
C. [Urgency]
→ Recommended: [X] — [5-word reason]

Headline: [Sets tone for this stage]

Dear [Homebuyer / Lead Name],

[Body — 50–70 words for Incoming/Prospect/Opportunity. Experiential. Paints benefits of pointers without repeating features.]

✔ [Feature]
✔ [Feature]
✔ [Feature]
✔ [Feature]

[CTA line]

${projectName}
${configuration} | ${price}*
${location}
Call: ${phone || 'XXXXXXXXXX'}

FIXED FORMATS (no extra copy):
SCHEDULED: Confirm date/time/address, build hype.
CONDUCTED: Ask for feedback — good and bad welcome.
BOOKED: Congratulate, 2–3 specific RTBs, welcome them.

Output ONLY the emailers. No preamble.`
    return { system: SYSTEM, user: USER }
  }

  // ── VIDEOS ────────────────────────────────────────────────────
  if (taskType === 'Videos') {
    const USER = `Write a video script for ${proj}.
Type: ${videoType || 'Ad'} | Duration: ${videoDur || '30 sec'} | Platform: ${platform || 'Instagram'} | Style: ${videoStyle || 'Text + VO'}
Tone: ${tone} | Language: ${language}
Config: ${configuration} | Price: ${price}
USPs: ${keyUSPs || 'N/A'}
${concept ? `Concept: ${concept}` : ''}
${ctb}

RULES: Hook = first 3 seconds = everything. Text on screen = billboard short, works mute. Benefits > Features. Micro-hooks for 20sec+. End with clarity.

OUTPUT:

VIDEO BRIEF
Type: ${videoType || 'Ad'} | Platform: ${platform || 'Instagram'} | Duration: ${videoDur || '30 sec'} | Style: ${videoStyle || 'Text + VO'}

━━━ 5 HOOK OPTIONS ━━━
Hook 1: Visual — [what's on screen] | Text/VO — [the line]
Hook 2: Visual — [description] | Text/VO — [line]
Hook 3: Visual — [description] | Text/VO — [line]
Hook 4: Visual — [description] | Text/VO — [line]
Hook 5: Visual — [description] | Text/VO — [line]
→ Recommended: Hook [X] — [reason]

━━━ NARRATIVE FLOW ━━━
Beat 1 (0–Xs): [Hook — emotional state]
Beat 2 (X–Xs): [Tension/build]
Beat 3 (X–Xs): [Benefits land]
Beat 4 (X–Xs): [Payoff]
Beat 5 (X–Xs): [CTA]

━━━ FULL SCRIPT ━━━
Scene 1 (0–Xs)
Visual: [specific]
Text: [SHORT — 3–5 words. Billboard.]
VO: [natural speech]

[All scenes]

Closing Frame
Visual: [final shot]
Text: ${projectName} | ${configuration} @ ${price} | [CTA]
VO: [closing line]

━━━ MUSIC DIRECTION ━━━
Genre: [type] | Tempo: [pace] | Mood: [feel] | Reference: [e.g. Apple product launch]

Output ONLY the script. No preamble.`
    return { system: SYSTEM, user: USER }
  }

  // ── HEADLINES ─────────────────────────────────────────────────
  if (taskType === 'Headlines/Image Lines') {
    const USER = `Write headlines for ${proj}.
Config: ${configuration} | Audience: ${targetAudience} | USPs: ${keyUSPs} | Tone: ${tone} | Language: ${language}
${concept ? `Concept: ${concept}` : ''}
${ctb}

Good headline = 1.Useful 2.Unique 3.Ultra-specific 4.Urgent (in that order)

38 approaches: 1.Size of claim 2.Speed 3.Compare 4.Metaphor 5.Sensitize 6.Example 7.Dramatize 8.Paradox 9.Remove limits 10.Identity 11.How much work 12.Question 13.Information 14.Authority 15.Before/after 16.Newness 17.Exclusivity 18.Challenge reader 19.Case history quote 20.Condense 21.Symbolize 22.Mechanism 23.Contradict expectations 24.Connect need+claim 25.Info in ad 26.Case history 27.Name the problem 28.Warn pitfalls 29.Phraseology 30.Show ease 31.State difference 32.Overcome limitation 33.Emphasize difference 34.Address directly 35.Dramatize difficulty 36.Accuse of being too good 37.Challenge limiting beliefs 38.Q&A

OUTPUT:

━━━ 10 CHOSEN APPROACHES ━━━
Approach [#] — [NAME]: [Why it fits this project — 1 sentence]
[× 10]

━━━ 20 HEADLINES ━━━

Approach [#] — [NAME]
Rationale: [1 sentence]
A: [Headline]
B: [Different headline — not a rephrasing]

[× 10 = 20 total]

━━━ 10 IMAGE LINES ━━━
[Max 6 words. Works standalone on image.]
1. [Line]  2. [Line]  3. [Line]  4. [Line]  5. [Line]
6. [Line]  7. [Line]  8. [Line]  9. [Line]  10. [Line]

━━━ BROCHURE SECTION HEADERS ━━━
Architecture: [Header]
Amenities: [Header]
Location: [Header]
Lifestyle: [Header]
Residences/Price: [Header]

Output ONLY the headlines. No preamble.`
    return { system: SYSTEM, user: USER }
  }

  // ── SITE BRANDING ─────────────────────────────────────────────
  if (taskType === 'Site Branding') {
    const USER = `Write Site Branding copy for ${proj}.
External panels: ${extPanels || 'TBD'} | Internal panels: ${intPanels || 'TBD'}
Tone: ${tone} | Language: ${language} | USPs: ${keyUSPs}
${concept ? `Concept: ${concept}` : ''}
${ctb}

RULES: External = one glance = one message. All external lines = same word count ±1. No minutes/distances — use near/close to. Internal = sequenced as customer journey.

OUTPUT:

━━━ PANEL PLANNING ━━━
External: ${extPanels || 'TBD'} | Internal: ${intPanels || 'TBD'}
Bucket allocation: [Divide internal across Amenities | Residences | Developer | Overview]
Journey sequence: [e.g. Amenity → Residences → Developer → Overview]

━━━ FEATURE LIST — EXTERNAL PANELS ━━━
[One feature per panel]
1. [Feature]  2. [Feature]  [continue]

━━━ EXTERNAL PANEL COPY ━━━
[Same word count ±1 for ALL external lines]
Panel E1 — [Feature]: "[Line]" (X words)
Panel E2 — [Feature]: "[Line]" (X words)
[continue]

━━━ INTERNAL PANEL COPY ━━━
Panel I1 — [Bucket/Feature]
Headline: [Evocative]
Copy: [1–2 sentences, benefit-led]
• [Feature]  • [Feature]  • [Feature]
[continue for all panels]

Output ONLY the panel copy. No preamble.`
    return { system: SYSTEM, user: USER }
  }

  // ── COFFEE TABLE BOOK ─────────────────────────────────────────
  if (taskType === 'Coffee Table Book') {
    const USER = `Write a Coffee Table Book for ${proj}.
Config: ${configuration} | Price: ${price} | Audience: ${targetAudience}
Tone: ${tone} | Language: ${language} | USPs: ${keyUSPs}
${concept ? `Concept: ${concept}` : ''}
${problem ? `Problem: ${problem}` : ''}
${objectives ? `Objectives: ${objectives}` : ''}
${ctb}

THE ONE RULE: Body copy paints the life. Pointers support with features. NEVER say the same thing in both.
✗ Wrong: Body says "50+ amenities" AND pointer says "50+ Amenities"  
✓ Right: Body says "there's always somewhere to be" + Pointer says "50+ Amenities across 4 Levels"

OUTPUT:

━━━ 5 NARRATIVE JOURNEY OPTIONS ━━━
[Specific/narrow — NOT "Day in a Life". Address real pain points.]
Journey 1 — [NAME]: [2–3 sentences: territory + how it flows through all 5 buckets]
[× 5]
→ Recommended: Journey [X] — [reason]

━━━ SECTION FLOW ━━━
Order: [Bucket] → [Bucket] → [Bucket] → [Bucket] → [Bucket]
Rationale: [1 sentence]

━━━ BUILDUP ━━━
[2–3 lines. No project name. Emotional stage-setter.]

━━━ CONCEPT PAGE ━━━
Concept Line: [Poetic, ownable]
Visual Cue: [Image/mood description]

━━━ OVERVIEW ━━━
Headline: [NOT "Welcome to ${projectName}"]
Body: [40–60 words. Benefits. Does NOT mention the features in pointers.]
• [Feature]  • [Feature]  • [Feature]  • [Feature]  • [Feature]
Visual Cue: [Specific image]
Design Note: [Layout suggestion]

━━━ LOCATION ━━━
Headline: [About the address/neighbourhood]
Body: [40–60 words. Does NOT repeat pointers.]
• [Connectivity/landmark]  • [Feature]  • [Feature]  • [Feature]
Visual Cue: [Image]

━━━ RESIDENCES ━━━
Headline: [About home — design, space, light]
Body: [40–60 words. How it FEELS. Does NOT repeat pointers.]
• [Spec/design feature]  • [Feature]  • [Feature]  • [Feature]
Visual Cue: [Image]

━━━ AMENITIES ━━━
Headline: [About the life amenities enable — not a list]
Body: [40–60 words. Community, rhythm. Does NOT repeat pointers.]
• [Amenity]  • [Amenity]  • [Amenity]  • [Amenity]  • [Amenity]
Visual Cue: [Image]

━━━ DEVELOPER ━━━
Headline: [Trust, legacy — not generic]
Body: [40–60 words. Track record. Does NOT repeat pointers.]
• [Developer fact — number-led]  • [Fact]  • [Fact]  • [Fact]
Visual Cue: [Image]

━━━ BACK COVER ━━━
${location} | Call: ${phone || '[Contact]'} | [Fine print]
${configuration} | ${location}

Output ONLY the CTB copy. No preamble.`
    return { system: SYSTEM, user: USER }
  }

  // ── COMMUNICATION DOC ─────────────────────────────────────────
  const USER = `Write a Communication Document for ${proj}.
Config: ${configuration} | Price: ${price} | Phone: ${phone}
Audience: ${targetAudience} | Tone: ${tone} | Language: ${language}
USPs: ${keyUSPs}
${concept ? `Concept: ${concept}` : ''}
${ctb}

OUTPUT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT FACTS STRIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project Name: ${projectName}
Location: ${location}
Developer: [From brief]
Type: [Residential/Commercial/Mixed Use]
Config & Price: ${configuration} from ${price}
Concept/Tagline: ${concept || 'TBD'}
Language: ${language}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2–3 sentences: what + where + why now. Then 1 sentence on positioning idea.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT USPs / RTBs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Number-led USP — e.g. "4-acre land parcel"]
• [USP]  • [USP]  • [USP]  • [USP]  • [USP]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY ASPECTS & DIRECTIONAL NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Launch status]  • [Product focus]  • [Payment scheme]  • [Time-sensitive]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET DEMOGRAPHICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Segment | Age | Profession | Income | Why They Buy
[Segment] | [Age] | [Job] | [Income] | [Reason]
[Segment] | [Age] | [Job] | [Income] | [Reason]
[Segment] | [Age] | [Job] | [Income] | [Reason]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIFESTYLE & MESSAGING ANGLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Segment 1 angle]  • [Segment 2 angle]  • [Segment 3 angle]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND TONE & VOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Traits: [4–6 descriptors]
USE: ["example phrase"]  ["example phrase"]
AVOID: "world-class" without proof, em dashes, adjective stacking

Output ONLY the Communication Doc. No preamble.`
  return { system: SYSTEM, user: USER }
}

// ─── Call Groq API ────────────────────────────────────────────────
async function callGroq(system, user, language) {
  const apiKey = getApiKey()
  const model = pickModel(language, false)

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user },
      ],
      max_tokens: 4000,
      temperature: 0.75,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `API error ${res.status}`
    if (res.status === 401) throw new Error('Invalid Groq API key. Update it in Admin → Settings.')
    if (res.status === 429) throw new Error('Rate limit hit. Please wait a moment and try again.')
    throw new Error(msg)
  }

  const out = await res.json()
  return out?.choices?.[0]?.message?.content || ''
}

// ─── Main export ──────────────────────────────────────────────────
export async function generateCopy(data) {
  if (!getApiKey()) throw new Error('No API key set. Go to Admin → Settings.')
  const { system, user } = buildPrompt(data.taskType, data)
  return callGroq(system, user, data.language)
}

// ─── WA Image generation ──────────────────────────────────────────
// Renders WA creative copy as a styled image using HTML Canvas
export function renderWAImage(creativeText, projectName, bgColor = '#1a1714') {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width  = 1080
    canvas.height = 1350 // 4:5 ratio — works for Instagram and WA
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Subtle texture overlay
    ctx.fillStyle = 'rgba(255,255,255,0.02)'
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.fillRect(0, i, canvas.width, 1)
    }

    // Gold accent bar top
    ctx.fillStyle = '#C49635'
    ctx.fillRect(80, 80, 120, 4)

    // Parse the creative text into sections
    const lines = creativeText.split('\n').map(l => l.trim()).filter(Boolean)
    let heading = '', subline = '', body = '', pointers = [], price = '', closing = '', cta = ''

    lines.forEach(line => {
      if (line.startsWith('Heading:')) heading = line.replace('Heading:', '').trim()
      else if (line.startsWith('Subline:')) subline = line.replace('Subline:', '').trim()
      else if (line.startsWith('Body:')) body = line.replace('Body:', '').trim()
      else if (line.startsWith('✔')) pointers = line.split('✔').map(p => p.trim()).filter(Boolean)
      else if (line.startsWith('Price:')) price = line.replace('Price:', '').trim()
      else if (line.startsWith('Call Now:') || line.startsWith('Call:')) cta = line
      else if (!closing && !line.includes('T&C') && !line.includes('Limited') && !line.startsWith('Creative') && heading) {
        if (!price && !cta) closing = line
      }
    })

    // Font helpers
    const wrapText = (text, x, y, maxWidth, lineHeight, font, color) => {
      ctx.font = font
      ctx.fillStyle = color
      const words = text.split(' ')
      let line = '', currentY = y
      words.forEach((word, i) => {
        const testLine = line + word + ' '
        if (ctx.measureText(testLine).width > maxWidth && i > 0) {
          ctx.fillText(line, x, currentY)
          line = word + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      })
      ctx.fillText(line, x, currentY)
      return currentY + lineHeight
    }

    let y = 140

    // Project label
    ctx.font = '500 28px "Arial"'
    ctx.fillStyle = '#C49635'
    ctx.fillText(projectName.toUpperCase(), 80, y)
    y += 60

    // Heading
    y = wrapText(heading, 80, y, 920, 68, 'bold 62px "Georgia"', '#FAF7F2')
    y += 20

    // Subline
    y = wrapText(subline, 80, y, 920, 40, '400 34px "Arial"', 'rgba(250,247,242,0.7)')
    y += 40

    // Divider
    ctx.strokeStyle = 'rgba(196,150,53,0.4)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, y)
    ctx.lineTo(1000, y)
    ctx.stroke()
    y += 40

    // Body
    y = wrapText(body, 80, y, 920, 46, '400 36px "Arial"', 'rgba(250,247,242,0.85)')
    y += 40

    // Pointers
    if (pointers.length) {
      ctx.font = '600 30px "Arial"'
      ctx.fillStyle = '#FAF7F2'
      const pLine = pointers.map(p => `✔ ${p}`).join('   ')
      y = wrapText(pLine, 80, y, 920, 40, '600 28px "Arial"', '#FAF7F2')
      y += 30
    }

    // Divider
    ctx.strokeStyle = 'rgba(196,150,53,0.4)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, y)
    ctx.lineTo(1000, y)
    ctx.stroke()
    y += 40

    // Price
    if (price) {
      ctx.font = 'bold 44px "Georgia"'
      ctx.fillStyle = '#C49635'
      ctx.fillText(price, 80, y)
      y += 60
    }

    // Closing
    if (closing) {
      y = wrapText(closing, 80, y, 920, 40, 'italic 32px "Georgia"', 'rgba(250,247,242,0.8)')
      y += 20
    }

    // Bottom bar
    ctx.fillStyle = 'rgba(196,150,53,0.15)'
    ctx.fillRect(0, canvas.height - 120, canvas.width, 120)

    // CTA
    if (cta) {
      ctx.font = '600 28px "Arial"'
      ctx.fillStyle = '#C49635'
      ctx.fillText(cta, 80, canvas.height - 70)
    }

    // T&C
    ctx.font = '22px "Arial"'
    ctx.fillStyle = 'rgba(250,247,242,0.35)'
    ctx.fillText('Limited Period Offer  |  T&C Apply', 80, canvas.height - 35)

    resolve(canvas.toDataURL('image/png'))
  })
}
