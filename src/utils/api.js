import { TASK_SYSTEM_PROMPTS } from './tasks.js'
import { getApiKey } from './store.js'

const MODELS = [
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768'
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
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert real estate marketing copywriter.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.8
        })
      })

      if (res.status === 429) {
        lastError = new Error('Rate limit hit. Trying another model…')
        continue
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = err?.error?.message || `API error ${res.status}`
        if (res.status === 401) throw new Error('Invalid Groq API key. Update it in Admin → Settings.')
        throw new Error(msg)
      }

      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content || ''
      if (text) return text

    } catch (e) {
      if (e.message.includes('Invalid Groq API key')) throw e
      lastError = e
    }
  }

  throw new Error('Rate limit reached on all models. Please wait 1 minute and try again.')
}
