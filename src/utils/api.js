import { TASK_SYSTEM_PROMPTS } from './tasks.js'
import { getApiKey } from './store.js'

// Groq free tier — very fast, generous limits
// Model: llama-3.3-70b-versatile (best quality on Groq free tier)
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function generateCopy({
  taskType, projectName, location, configuration,
  targetAudience, keyUSPs, tone, platform, language,
  additionalNotes, ctbContext,
}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No API key set. Go to Admin → Settings.')

  const systemPrompt = TASK_SYSTEM_PROMPTS[taskType] || `You are a professional real estate marketing copywriter. Generate ${taskType} copy.`

  const userMessage = `PROJECT DETAILS:
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

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `API error ${res.status}`
    if (res.status === 401) throw new Error('Invalid Groq API key. Update it in Admin → Settings.')
    if (res.status === 429) throw new Error('Rate limit hit. Please wait a moment and try again.')
    throw new Error(msg)
  }

  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ''
}
Done
Copy everything above and paste it into GitHub replacing the old file. Then commit.

Also — after committing, wait for the GitHub Action to finish (green tick), then:

Open your live site
Hard refresh — press Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
Go to Admin → Settings → delete the old Gemini key → paste your Groq key (starts with gsk_) → Save
The error "Invalid Gemini API key" means the browser is still running old cached code AND/OR the old Gemini key is still saved in localStorage. The hard refresh + re-entering the key will fix both.







