import { TASK_SYSTEM_PROMPTS } from './tasks.js'
import { getApiKey } from './store.js'

// Try multiple models in order — if one is rate limited, fall back to next
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
]

export async function generateCopy({
  taskType, projectName, location, configuration,
  targetAudience, keyUSPs, tone, platform, language,
  additionalNotes, ctbContext,
}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key set. Go to Admin → Settings.')

  const prompt = `${TASK_SYSTEM_PROMPTS[taskType] || ''}

PROJECT DETAILS:
- Project: ${projectName || 'Not specified'}
- Location: ${location || 'Not specified'}
- Configuration: ${configuration || 'Not specified'}
- Target Audience: ${targetAudience || 'Home buyers, investors'}
- Key USPs: ${keyUSPs || 'Not specified'}
- Tone: ${tone || 'Premium & Aspirational'}
- Platform: ${platform || 'General'}
- Language: ${language || 'English'}
- Notes: ${additionalNotes || 'None'}
${ctbContext ? `\n--- CTB / PROJECT BRIEF ---\n${ctbContext.slice(0, 4000)}\n---` : ''}

Generate the ${taskType} copy now. Use ## headings and bullet points where appropriate.`

  let lastError = null

  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2000, temperature: 0.8 },
          }),
        }
      )

      if (res.status === 429) {
        // Rate limited on this model — try next
        lastError = new Error('Rate limit hit. Trying another model…')
        continue
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = err?.error?.message || `API error ${res.status}`
        if (res.status === 400) throw new Error('Invalid Gemini API key. Update it in Admin → Settings.')
        throw new Error(msg)
      }

      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (text) return text
    } catch (e) {
      if (e.message.includes('Invalid Gemini API key')) throw e
      lastError = e
    }
  }

  // All models failed
  throw new Error('Rate limit reached on all models. Please wait 1 minute and try again.')
}
