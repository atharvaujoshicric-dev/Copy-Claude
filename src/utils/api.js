import { getApiKey } from './store.js'

const GROQ_MODEL = 'llama-3.3-70b-versatile'

// ─── Build exact fill-in-the-blank templates per task ────────────
// The model receives the EXACT output structure with [PLACEHOLDERS]
// and just fills them in — no ambiguity about format.

function buildPrompt(taskType, data) {
  const {
    projectName, location, configuration, price,
    targetAudience, keyUSPs, tone, language,
    additionalNotes, ctbContext,
  } = data

  // Parse extra fields from additionalNotes
  const get = (key) => {
    const match = (additionalNotes || '').match(new RegExp(`${key}:\\s*(.+)`))
    return match ? match[1].trim() : ''
  }

  const concept     = get('Project Concept/Tagline')
  const phone       = get('Contact Number')
  const occasion    = get('Occasion/Campaign')
  const adType      = get('Ad Type')
  const videoType   = get('Video Type')
  const videoDur    = get('Video Duration')
  const videoStyle  = get('Video Style')
  const platform    = get('Platform')
  const waFormat    = get('WA Format')
  const waBuckets   = get('WA Buckets')
  const emailStages = get('Email Stages')
  const extPanels   = get('External Panels')
  const intPanels   = get('Internal Panels')
  const problem     = get('Problem Statement')
  const objectives  = get('Objectives')

  const ctb = ctbContext ? `\nCTB/BRIEF CONTEXT:\n${ctbContext.slice(0, 3000)}` : ''
  const proj = `${projectName}${location ? ', ' + location : ''}`

  const SYSTEM = `You are a senior real estate copywriter with decades of experience. You know exactly what makes buyers tick. You write copy that is specific, benefit-driven, and never generic. You ALWAYS follow the exact output format given to you — no deviations, no preamble, no explanations.`

  // ── WA CREATIVES ──────────────────────────────────────────────
  if (taskType === 'WA Creatives') {
    const buckets = waBuckets || 'Overview, Location, Offer'
    const fmt = waFormat || 'No Caption'
    const occ = occasion ? `Occasion: ${occasion}` : ''

    const USER = `Write 3 WhatsApp Creatives for ${proj}.
Config: ${configuration || 'N/A'} | Price: ${price || 'N/A'} | Phone: ${phone || 'XXXXXXXXXX'}
Tone: ${tone} | Language: ${language}
Buckets/Topics: ${buckets}
${occ}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

RULES:
- Body copy paints the BENEFIT. Pointers list the FEATURES. They must NEVER repeat each other.
- If body says "every room has a purpose", pointer says "0 Dead Space Layouts" — not both.
- Heading ends with a full stop.
- Exactly 4 checkmark pointers on one line separated by 3 spaces.
- Use actual USPs and pricing from the brief above.

${fmt === 'With Caption' ? `FORMAT — WITH CAPTION:

Creative 1 — [BUCKET]

[CREATIVE SECTION]
Heading: [Occasion or benefit-driven headline.]
One supporting line: [Own/Discover/Experience + adjective + Home/Homes + at + ${projectName} + ${location}]
✔ [USP 1]   ✔ [USP 2]   ✔ [USP 3]   ✔ [USP 4]
CTA: [Appeal to schedule a visit]
${projectName} | ${configuration} @ ${price}* | ${location} | Call: ${phone || 'XXXXXXXXXX'}

[CAPTION SECTION]
Hook: [Visible before opening WA chat — makes them want to open. 1 punchy line.]
Body: [3–4 sentences expanding on benefits — supports the headline and pointers without repeating them]
CTA: [e.g. 📞 Call us / Schedule a visit]

---
Creative 2 — [DIFFERENT BUCKET]
[Repeat same structure]

---
Creative 3 — [DIFFERENT BUCKET]
[Repeat same structure]` :

`FORMAT — NO CAPTION (follow this EXACTLY — same structure as this real example):

Creative 1 — [BUCKET]

Heading: Grand Gudi Padwa Offer.
Subline: Own a thoughtfully designed Home at GK ARIA, Tathawade Highstreet
Body: Experience smarter living in a prime highstreet location where everything you need is just minutes away — work, schools, shopping & daily essentials.
✔ 0 Dead Space Layouts   ✔ Prime Highstreet Location   ✔ 50–50 Payment Scheme   ✔ Fixed Pre-EMI ₹21,000*
Price: 2 BHK @ ₹71.1 Lacs*
This Gudi Padwa, upgrade to smarter living and stronger investment value.
Limited Period Offer
T&C Apply
Call Now: 080-65918500

Now write the 3 creatives for ${proj} following EXACTLY the same structure:

Creative 1 — [BUCKET 1 from: ${buckets}]

Heading: [${occ ? occasion + ' offer or angle.' : 'Benefit or occasion-driven headline.'}]
Subline: [Own/Discover/Experience + adjective + Home/Homes + at + ${projectName} + ${location}]
Body: [2–3 sentences. Paints the benefit/lifestyle. Does NOT repeat the pointers below.]
✔ [USP from brief]   ✔ [USP from brief]   ✔ [USP from brief]   ✔ [USP from brief]
Price: ${configuration} @ ${price}*
[One closing line — occasion hook or aspiration or investment angle]
${occasion ? 'Limited Period Offer' : ''}
T&C Apply
Call Now: ${phone || 'XXXXXXXXXX'}

---

Creative 2 — [BUCKET 2 from: ${buckets}]

Heading: [Different angle from Creative 1.]
Subline: [Own/Discover/Experience + adjective + Home/Homes + at + ${projectName} + ${location}]
Body: [2–3 sentences — different angle from Creative 1. Does NOT repeat the pointers below.]
✔ [USP]   ✔ [USP]   ✔ [USP]   ✔ [USP]
Price: ${configuration} @ ${price}*
[Closing line]
T&C Apply
Call Now: ${phone || 'XXXXXXXXXX'}

---

Creative 3 — [BUCKET 3 from: ${buckets}]

Heading: [Investment or value angle.]
Subline: [Own/Discover/Experience + adjective + Home/Homes + at + ${projectName} + ${location}]
Body: [2–3 sentences — investment/value angle. Does NOT repeat the pointers below.]
✔ [USP]   ✔ [USP]   ✔ [USP]   ✔ [USP]
Price: ${configuration} @ ${price}*
[Closing line]
T&C Apply
Call Now: ${phone || 'XXXXXXXXXX'}`}

Output ONLY the creatives. No preamble. No explanations. Start directly with "Creative 1".`

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

RULES:
- No em dashes anywhere
- No repetition between pinned headline and subsequent headlines
- Config, price, location in pinned headline — in that order
- Each headline covers a DIFFERENT point — no two headlines say the same thing
- Descriptions give the BENEFIT of the headline feature — never repeat the feature
- Show character count after EVERY element in brackets like (27 chars)

${type.includes('Google') ? `OUTPUT FORMAT — GOOGLE SEARCH ADS:

Pinned Headline (max 30 chars): [Config | Price | Location] (XX chars)
Pinned Description (max 90 chars): [What the pinned headline didn't cover — 1 flowing sentence] (XX chars)

Headline 1 (max 30 chars): [Hero USP of the project] (XX chars)
Description 1 (max 90 chars): [Benefit of H1 — what it does for the buyer, not a repeat of the feature] (XX chars)

Headline 2 (max 30 chars): [Different bucket from H1] (XX chars)
Description 2 (max 90 chars): [Benefit of H2] (XX chars)

Headline 3 (max 30 chars): [Location angle — direct] (XX chars)
Description 3 (max 90 chars): [What this location does for the buyer's daily life] (XX chars)

Headline 4 (max 30 chars): [Developer / Trust] (XX chars)
Description 4 (max 90 chars): [Supporting developer RTB] (XX chars)

Headline 5 (max 30 chars): [Social proof or keyword] (XX chars)
Headline 6 (max 30 chars): [Another USP] (XX chars)
Headline 7 (max 30 chars): [Amenity or lifestyle] (XX chars)
Headline 8 (max 30 chars): [Specification or design] (XX chars)
Headline 9 (max 30 chars): [Connectivity or convenience] (XX chars)
Headline 10 (max 30 chars): [Any remaining strong USP] (XX chars)` : ''}

${type.includes('Meta') || type.includes('meta') ? `OUTPUT FORMAT — META ADS:

Creative 1 — [ANGLE: e.g. Offer / Launch / Hero USP]
Headline (max 40 chars): [Punchy, benefit/occasion-driven]
Primary Text Hook: [First visible line before "See More" — must work standalone and stop the scroll]
Primary Text Body: [2–3 sentences — benefits, lifestyle, location]
✔ [USP 1]   ✔ [USP 2]   ✔ [USP 3]   ✔ [USP 4]
Price: ${configuration} @ ${price}*
CTA Button: [Learn More / Book Now / Get Quote]
Disclaimer: *Price subject to change. T&C Apply.

---
Creative 2 — [Different angle]
[Same structure]

---
Creative 3 — [Different angle]
[Same structure]` : ''}

Output ONLY the ad copy. No preamble. No explanations.`

    return { system: SYSTEM, user: USER }
  }

  // ── NURTURING EMAILERS ────────────────────────────────────────
  if (taskType === 'Nurturing Emailers') {
    const stages = emailStages || 'Incoming, Prospect, Opportunity'
    const USER = `Write Nurturing Emailers for ${proj}.
Config: ${configuration || 'N/A'} | Price: ${price || 'N/A'} | Phone: ${phone || 'N/A'}
Stages required: ${stages}
Tone: ${tone} | Language: ${language}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

STAGE GUIDE:
- INCOMING: intro details. Body = overview. Pointers = intro USPs.
- PROSPECT: hero feature bucket — the project's strongest selling point.
- OPPORTUNITY: drive FOMO — limited units, price increase, exclusive offer.
- SITE VISIT SCHEDULED: fixed format — confirm date/time/address, build hype.
- SITE VISIT CONDUCTED: fixed format — ask for feedback.
- BOOKED: fixed format — congratulate, make them feel like best decision of their life.

RULE: Body copy paints benefits. Pointers list features. NEVER repeat same idea in both.

OUTPUT FORMAT — write each stage requested:

━━━ STAGE: [STAGE NAME] ━━━

Subject Lines:
A. [Curiosity angle]
B. [Benefit angle]
C. [Urgency angle]
→ Recommended: [A/B/C] — [5-word reason]

Headline: [Sets tone for this stage]

Dear [Homebuyer / Lead Name],

[Body copy — experiential, benefit-led. 50–70 words for Incoming/Prospect/Opportunity. Paints what the pointers support — does NOT list the features.]

✔ [Feature relevant to this stage]
✔ [Feature]
✔ [Feature]
✔ [Feature]

[CTA line]

${projectName}
${configuration} | ${price}*
${location}
Call: ${phone || 'XXXXXXXXXX'}

[For SCHEDULED/CONDUCTED/BOOKED — use their fixed formats. Do not add extra copy.]

Output ONLY the emailers. No preamble. Start directly with the first stage.`

    return { system: SYSTEM, user: USER }
  }

  // ── VIDEOS ────────────────────────────────────────────────────
  if (taskType === 'Videos') {
    const USER = `Write a video script for ${proj}.
Video Type: ${videoType || 'Ad'} | Duration: ${videoDur || '30 sec'} | Platform: ${platform || 'Instagram'}
Style: ${videoStyle || 'Text on screen + Voiceover'}
Tone: ${tone} | Language: ${language}
Config: ${configuration} | Price: ${price}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

RULES:
- Hook is EVERYTHING. First 3 seconds. If it doesn't land, nothing else matters.
- Text on screen: SHORT. Billboard not brochure. Readable on 5" mobile without sound.
- Assume mute — video must work without audio.
- Benefits > Features. Show how the benefit FEELS, not just what the feature is.
- For 20+ sec: add micro-hook midway to re-catch attention.
- End with clarity — crisp CTA, never fade to nothing.

OUTPUT FORMAT:

VIDEO BRIEF
Type: ${videoType || 'Ad'}
Platform: ${platform || 'Instagram'}
Duration: ${videoDur || '30 sec'}
Style: ${videoStyle || 'Text on screen + Voiceover'}

━━━
5 HOOK OPTIONS
(Each hook = first 3 seconds. Each must be genuinely different. Works on mute.)

Hook 1: Visual — [what's on screen] | Text — [the line]
Hook 2: Visual — [what's on screen] | Text — [the line]
Hook 3: Visual — [what's on screen] | Text — [the line]
Hook 4: Visual — [what's on screen] | Text — [the line]
Hook 5: Visual — [what's on screen] | Text — [the line]
→ Recommended: Hook [X] — [one-line reason]

━━━
NARRATIVE FLOW

Beat 1 (0–Xs): [Hook — emotional state created]
Beat 2 (X–Xs): [Tension/build — what keeps them watching]
Beat 3 (X–Xs): [Benefits land — features shown as felt experiences]
Beat 4 (X–Xs): [Payoff — aspiration]
Beat 5 (X–Xs): [CTA + project details]

━━━
FULL SCRIPT

Scene 1 (0–Xs)
Visual: [specific]
Text on Screen: [SHORT — 3-5 words max]
VO: [natural speech, not ad-speak]

[Continue all scenes]

Closing Frame
Visual: [final shot]
Text on Screen: ${projectName} | ${concept || ''} | ${configuration} @ ${price} | [CTA]
VO: [closing line]

━━━
MUSIC DIRECTION
Genre: [e.g. Cinematic / Indie]
Tempo: [Slow build / Upbeat]
Mood: [e.g. Warm and aspirational]
Reference feel: [e.g. Apple product launch]

Output ONLY the script. No preamble.`

    return { system: SYSTEM, user: USER }
  }

  // ── HEADLINES / IMAGE LINES ───────────────────────────────────
  if (taskType === 'Headlines/Image Lines') {
    const USER = `Write headlines for ${proj}.
Config: ${configuration} | Price: ${price || 'N/A'}
Target Audience: ${targetAudience || 'Home buyers, investors'}
Key USPs: ${keyUSPs || 'N/A'}
Tone: ${tone} | Language: ${language}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

A good headline must be (priority order): 1. Useful 2. Unique 3. Ultra-specific/Short 4. Urgent

THE 38 APPROACHES:
1. Size of claim | 2. Speed of claim | 3. Comparing | 4. Metaphor | 5. Sensitizing | 6. Example | 7. Dramatizing | 8. Paradox | 9. Remove limitations | 10. Identity | 11. How much work product does | 12. Question | 13. Offering information | 14. Authority | 15. Before/after | 16. Newness | 17. Exclusivity | 18. Challenge reader | 19. Case-history quote | 20. Condense | 21. Symbolize | 22. Mechanism | 23. Contradict expectations | 24. Connect need + claim | 25. Info in ad | 26. Case history | 27. Name the problem | 28. Warn about pitfalls | 29. Phraseology | 30. Show how easy | 31. State the difference | 32. Overcome limitation | 33. Emphasize difference | 34. Address prospect directly | 35. Dramatize difficulty of production | 36. Accuse claim of being too good | 37. Challenge limiting beliefs | 38. Q&A

OUTPUT FORMAT:

━━━ SELECTED 10 APPROACHES ━━━
[Choose the 10 most relevant for this project. Give 1-sentence rationale for each.]

Approach [#] — [NAME]: [Why it fits this project]
[× 10]

━━━ 20 HEADLINES (2 per approach) ━━━

Approach [#] — [APPROACH NAME]
Rationale: [1 sentence why this fits]
A: [Headline — useful, unique, ultra-specific]
B: [Headline — genuinely different from A, not a rephrasing]

[× 10 approaches]

━━━ 10 IMAGE LINES / OVERLAYS ━━━
[Max 6 words each. Works standalone on an image.]
1. [Line]
2. [Line]
3. [Line]
4. [Line]
5. [Line]
6. [Line]
7. [Line]
8. [Line]
9. [Line]
10. [Line]

━━━ BROCHURE SECTION HEADERS ━━━
Architecture spread: [Header]
Amenities spread: [Header]
Location spread: [Header]
Lifestyle spread: [Header]
Residences/Price spread: [Header]

Output ONLY the headlines content. No preamble.`

    return { system: SYSTEM, user: USER }
  }

  // ── SITE BRANDING ─────────────────────────────────────────────
  if (taskType === 'Site Branding') {
    const USER = `Write Site Branding copy for ${proj}.
External panels: ${extPanels || 'TBD'} | Internal panels: ${intPanels || 'TBD'}
Tone: ${tone} | Language: ${language}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${ctb}

RULES:
- External panels: ONE glance = ONE message. Short creative line conveying emotional benefit.
- Internal panels: more detail allowed — these are READ by waiting customers.
- All external panel lines: SAME word count (±1 word).
- No distances in minutes — use "near", "close to", "next to."
- No location references on external panels — they're already at the site.
- Sequence internal panels as customer journey through the space.

OUTPUT FORMAT:

━━━ PANEL PLANNING ━━━
External Panels: ${extPanels || 'TBD'}
Internal Panels: ${intPanels || 'TBD'}
Internal bucket allocation: [Divide panels across: Amenities | Residences | Developer | Overview]
Sequence: [e.g. Amenity → Residences → Developer → Overview → repeat]

━━━ FEATURE LIST FOR EXTERNAL PANELS ━━━
[One feature per panel, drawn from USPs. Split if needed.]
1. [Feature]
2. [Feature]
[Continue for all external panels]

━━━ EXTERNAL PANEL COPY ━━━
[Each line: emotional benefit of the feature. Same word count ±1 across all lines.]

Panel E1 — [Feature]
Line: "[Creative line]"
Word count: (X words)

Panel E2 — [Feature]
Line: "[Creative line]"
Word count: (X words)

[Continue for all external panels]

━━━ INTERNAL PANEL COPY ━━━
[Sequenced as customer journey. Format: Headline + Supporting Copy + Pointers]

Panel I1 — [Bucket] — [Feature focus]
Headline: [Evocative, concept-aligned]
Supporting Copy: [1–2 sentences, benefit-led]
Pointers:
• [Feature]
• [Feature]
• [Feature]

[Continue for all internal panels]

Output ONLY the panel copy. No preamble.`

    return { system: SYSTEM, user: USER }
  }

  // ── COFFEE TABLE BOOK ─────────────────────────────────────────
  if (taskType === 'Coffee Table Book') {
    const USER = `Write a Coffee Table Book for ${proj}.
Config: ${configuration} | Price: ${price || 'N/A'}
Target Audience: ${targetAudience || 'HNI home buyers'}
Tone: ${tone} | Language: ${language}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Project Concept: ${concept}` : ''}
${problem ? `Problem Statement: ${problem}` : ''}
${objectives ? `Objectives: ${objectives}` : ''}
${ctb}

RULE — THE MOST IMPORTANT ONE:
Body copy paints the picture of the life. Pointers list the features that make that life possible.
They must NEVER say the same thing.
If pointer says "50+ Amenities", body says "there's always somewhere to be, something to do, someone to meet" — NOT "with 50+ amenities".

OUTPUT FORMAT:

━━━ 5 NARRATIVE JOURNEY OPTIONS ━━━
[Specific and narrow. NOT generic like "A Day in the Life". Each must address a real customer pain point.]

Journey 1 — [NAME]: [2–3 sentences: emotional territory + how it flows through Overview → Location → Residences → Amenities → Developer]
Journey 2 — [NAME]: [Same]
Journey 3 — [NAME]: [Same]
Journey 4 — [NAME]: [Same]
Journey 5 — [NAME]: [Same]
→ Recommended: Journey [X] — [1-sentence reason]

━━━ SECTION FLOW ━━━
Recommended order: [Bucket] → [Bucket] → [Bucket] → [Bucket] → [Bucket]
Rationale: [1 sentence]

━━━ BUILDUP ━━━
[2–3 lines. Emotional stage-setter before concept page. No project name yet. Light pain-point or soft aspiration build.]

━━━ CONCEPT PAGE ━━━
Concept Line: [Poetic, ownable — the soul of the CTB]
Visual Cue: [Describe the image/mood for this spread]

━━━ OVERVIEW ━━━
Headline: [Concept-style — NOT "Welcome to ${projectName}"]
Body Copy: [40–60 words. Benefits-first. Paints the life. Does NOT mention the features listed below.]
Pointers:
• [Feature — 3–5 words]
• [Feature]
• [Feature]
• [Feature]
• [Feature]
Visual Cue: [Specific image suggestion]
Design Note: [Layout/transition suggestion]

━━━ LOCATION ━━━
Headline: [Evocative — about the address, neighbourhood, city context]
Body Copy: [40–60 words. What this location does for the buyer's life. Does NOT repeat pointers.]
Pointers:
• [Landmark/connectivity feature]
• [Feature]
• [Feature]
• [Feature]
Visual Cue: [Image suggestion]

━━━ RESIDENCES ━━━
Headline: [About the home itself — design, space, light]
Body Copy: [40–60 words. How it FEELS to live here. Does NOT repeat pointers.]
Pointers:
• [Spec/design feature]
• [Feature]
• [Feature]
• [Feature]
Visual Cue: [Image suggestion]

━━━ AMENITIES ━━━
Headline: [About the life amenities enable — not just a list]
Body Copy: [40–60 words. The community, the rhythm of life. Does NOT repeat pointers.]
Pointers:
• [Amenity — short]
• [Amenity]
• [Amenity]
• [Amenity]
• [Amenity]
Visual Cue: [Image suggestion]

━━━ DEVELOPER ━━━
Headline: [Trust, legacy, assurance — not generic]
Body Copy: [40–60 words. Why this developer. Track record, promise, delivery. Does NOT repeat pointers.]
Pointers:
• [Developer fact — number-led if possible]
• [Fact]
• [Fact]
• [Fact]
Visual Cue: [Image suggestion]

━━━ BACK COVER ━━━
${location || '[Site Address]'} | Call: ${phone || '[Contact]'} | [Fine print / RERA]
${configuration} Residences
${location}

Output ONLY the CTB copy. No preamble.`

    return { system: SYSTEM, user: USER }
  }

  // ── CONCEPTS ─────────────────────────────────────────────────
  if (taskType === 'Concepts') {
    const USER = `Write Concept Routes for ${proj}.
Config: ${configuration} | Price: ${price || 'N/A'}
Target Audience: ${targetAudience || 'Home buyers, investors'}
Tone: ${tone} | Language: ${language}
Key USPs: ${keyUSPs || 'N/A'}
${problem ? `Problem Statement: ${problem}` : ''}
${objectives ? `Objectives: ${objectives}` : ''}
${ctb}

RULE: Routes are DIRECTIONS, not taglines. They are the emotional spaces within which final lines will be developed.
Routes must be SPECIFIC and NARROW. NOT generic ("A Day in the Life", "Before and After").
Base routes on real customer pain points. Frame them through emotional benefits.

OUTPUT FORMAT:

━━━ ABOUT ━━━
Project Name: ${projectName}
Config & Price: ${configuration} from ${price || 'N/A'}
Location: ${location}
Developer: [From brief]

Project USPs (equal-length for design cohesiveness):
• [USP]
• [USP]
• [USP]
• [USP]
• [USP]

━━━ PROBLEM STATEMENT ━━━
${problem || '[Write based on brief — location sentiment, config challenges, market perception, or reason for revamp]'}

━━━ OBJECTIVES ━━━
• [Counter to problem statement]
• [Strength to leverage]
• [Communication goal]

━━━ BRAND LADDER ━━━
Feature | Functional Benefit | Emotional Benefit
[Feature 1] | [What it does] | [How buyer feels]
[Feature 2] | [What it does] | [How buyer feels]
[Feature 3] | [What it does] | [How buyer feels]
[Feature 4] | [What it does] | [How buyer feels]
[Feature 5] | [What it does] | [How buyer feels]

━━━ 10 CONCEPT ROUTES ━━━

Route 1 — [NAME IN CAPS]
Direction: [2 sentences — emotional territory and communication angle]
Pain point addressed: [Specific buyer anxiety or desire]
How it flows: [How Overview → Location → Residences → Amenities → Developer would each feel in this route]

[Repeat for Routes 2–10. Each must be GENUINELY different.]

━━━ CONCEPT LINE OPTIONS (Top 3 routes) ━━━

Route [X] — [NAME]
Main Concept Line: [Short, ownable, memorable]
Supporting Line: [Optional]
RTB Strip: [RTB 1] | [RTB 2] | [RTB 3]
(RTBs must not repeat what the concept line communicates)

[Repeat for 2 more routes]

Output ONLY the concepts content. No preamble.`

    return { system: SYSTEM, user: USER }
  }

  // ── COMMUNICATION DOC ─────────────────────────────────────────
  const USER = `Write a Communication Document for ${proj}.
Config: ${configuration} | Price: ${price || 'N/A'} | Phone: ${phone || 'N/A'}
Developer: [From brief]
Target Audience: ${targetAudience || 'Home buyers, investors'}
Tone: ${tone} | Language: ${language}
Key USPs: ${keyUSPs || 'N/A'}
${concept ? `Concept/Tagline: ${concept}` : ''}
${ctb}

OUTPUT FORMAT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT FACTS STRIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project Name: ${projectName}
Location: ${location}
Developer: [From brief]
Project Type: [Residential / Commercial / Mixed Use]
Config & Price: ${configuration} from ${price || 'TBD'}
Concept/Tagline: ${concept || 'TBD'}
Language of Comms: ${language}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[2–3 sentences: what + where + why now. Elevator pitch. Then 1 sentence on the positioning/design idea.]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT USPs / RTBs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[6–8 bullets. Lead with numbers. One idea each. These go verbatim in brochures.]
• [USP — number-led]
• [USP]
• [USP]
• [USP]
• [USP]
• [USP]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY ASPECTS & DIRECTIONAL NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[4–6 bullets. What the copy team must know. Launch status, product focus, payment scheme, time-sensitive info.]
• [Aspect]
• [Aspect]
• [Aspect]
• [Aspect]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET DEMOGRAPHICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Segment | Age | Profession | Income | Why They Buy
[Segment 1] | [Age] | [Profession] | [Income] | [Reason]
[Segment 2] | [Age] | [Profession] | [Income] | [Reason]
[Segment 3] | [Age] | [Profession] | [Income] | [Reason]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIFESTYLE PREFERENCES & MESSAGING ANGLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [e.g. Urban convenience — messaging angle]
• [e.g. Investment confidence — messaging angle]
• [e.g. Family lifestyle — messaging angle]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND TONE & VOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Traits: [4–6 descriptors — e.g. Aspirational · Warm · Grounded · Confident]
USE: ["example phrase"], ["example phrase"], ["example phrase"]
AVOID: "world-class" without proof, em dashes, stacking adjectives without data

Output ONLY the Communication Doc. No preamble.`

  return { system: SYSTEM, user: USER }
}

// ─── Main generate function ───────────────────────────────────────
export async function generateCopy(data) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key set. Go to Admin → Settings.')

  const { system, user } = buildPrompt(data.taskType, data)

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user },
      ],
      max_tokens: 4000,
      temperature: 0.7,
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
