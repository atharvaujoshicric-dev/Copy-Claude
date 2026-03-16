import { useState, useEffect } from 'react'
import TaskSelector from '../components/TaskSelector.jsx'
import CopyForm from '../components/CopyForm.jsx'
import CopyOutput from '../components/CopyOutput.jsx'
import { getApiKey, getSheetUrl, fetchProjects } from '../utils/store.js'
import { generateCopy } from '../utils/api.js'

export default function GeneratePage() {
  const [task,      setTask]      = useState(null)
  const [projects,  setProjects]  = useState([])
  const [output,    setOutput]    = useState(null)
  const [lastForm,  setLastForm]  = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const hasKey   = !!getApiKey()
  const hasSheet = !!getSheetUrl()

  useEffect(() => {
    if (!hasSheet) return
    fetchProjects().then(setProjects).catch(() => {})
  }, [hasSheet])

  async function handleGenerate(formData) {
    setLoading(true); setError(null); setOutput(null); setLastForm(formData)
    try {
      const text = await generateCopy({ ...formData, taskType: task })
      setOutput({ text, taskType: task, projectName: formData.projectName })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[.16em] text-gold-500 font-semibold mb-2">AI-Powered Marketing Copy</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink-900 leading-[1.15] mb-3">
          Write better copy,<br /><em className="text-ink-600">ten times faster.</em>
        </h1>
        <p className="text-ink-600 text-sm leading-relaxed max-w-xl">
          Pick a task type, fill in your project details, and get professionally structured
          marketing copy — ready for design, video, digital, and print.
        </p>
      </div>

      {!hasKey && (
        <div className="mb-6 card p-4 border-gold-400/40 bg-gold-400/5 flex items-start gap-3">
          <span className="text-gold-500 mt-0.5">⚠</span>
          <p className="text-sm text-ink-700">
            No API key configured.{' '}
            <a href="/admin/login" className="text-gold-600 underline underline-offset-2">Admin login</a>
            {' '}→ Settings → add your free Gemini API key.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <TaskSelector
            selected={task}
            onSelect={t => { setTask(t); setOutput(null); setError(null) }}
          />
          {task
            ? <CopyForm taskType={task} projects={projects} onSubmit={handleGenerate} loading={loading} />
            : <div className="card p-8 text-center border-dashed border-parchment-200">
                <p className="text-sm text-ink-600/50">Select a task type to begin</p>
              </div>
          }
        </div>

        <div className="lg:col-span-7">
          {error && (
            <div className="card p-5 border-red-200 bg-red-50/50 flex gap-3">
              <span className="text-red-500 flex-shrink-0">✕</span>
              <div>
                <p className="text-sm font-semibold text-red-800">Generation failed</p>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
          {loading && (
            <div className="card p-14 text-center">
              <div className="spinner text-gold-500 mx-auto mb-4" style={{ width: 24, height: 24 }}></div>
              <p className="text-sm text-ink-600">Generating your copy…</p>
              <p className="text-[11px] text-ink-600/40 mt-1">Usually 5–15 seconds</p>
            </div>
          )}
          {output && !loading && (
            <CopyOutput
              output={output.text}
              taskType={output.taskType}
              projectName={output.projectName}
              onRegenerate={() => lastForm && handleGenerate(lastForm)}
            />
          )}
          {!output && !loading && !error && (
            <div className="card p-14 text-center border-dashed border-parchment-200">
              <div className="space-y-1.5 mb-5">
                {[16, 10, 13, 7].map((w, i) => (
                  <div key={i} className="h-1 bg-parchment-100 rounded-full mx-auto" style={{ width: `${w * 4}px` }}></div>
                ))}
              </div>
              <p className="text-xs text-ink-600/40 uppercase tracking-widest">Generated copy appears here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
