import { TASK_SYSTEM_PROMPTS } from './tasks.js'
import { getApiKey } from './store.js'

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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.8 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `API error ${res.status}`
    if (res.status === 400) throw new Error('Invalid Gemini API key. Update it in Admin → Settings.')
    if (res.status === 429) throw new Error('Rate limit hit. Please wait a moment and try again.')
    throw new Error(msg)
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
