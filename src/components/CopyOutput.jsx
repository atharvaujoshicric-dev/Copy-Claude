import { useState } from 'react'

function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^[-•] (.+)$/gm,  '<li>$1</li>')
    .split('\n\n')
    .map(b => /^<[hulbh]/.test(b.trim()) ? b : `<p>${b}</p>`)
    .join('\n')
    .replace(/<p><\/p>/g, '')
}

export default function CopyOutput({ output, taskType, projectName, onRegenerate }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function download() {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([output], { type: 'text/plain' })),
      download: `${projectName || 'copy'}_${taskType}_${Date.now()}.txt`,
    })
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-parchment-100">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage-400"></div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{taskType}</p>
            {projectName && <p className="text-[11px] text-ink-600 mt-0.5">{projectName}</p>}
          </div>
        </div>
        <div className="flex gap-1.5">
          {[
            { label: copied ? 'Copied!' : 'Copy', onClick: copy },
            { label: 'Save .txt', onClick: download },
            onRegenerate && { label: 'Retry', onClick: onRegenerate, highlight: true },
          ].filter(Boolean).map(btn => (
            <button key={btn.label} onClick={btn.onClick}
              className={`text-[11px] font-medium px-2.5 py-1.5 rounded-sm border transition-all
                ${btn.highlight
                  ? 'bg-parchment-100 border-parchment-200 text-ink-700 hover:border-ink-600'
                  : 'border-parchment-200 text-ink-600 hover:border-ink-700 hover:text-ink-900'}`}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-5 overflow-y-auto max-h-[65vh]">
        <div className="copy-output" dangerouslySetInnerHTML={{ __html: renderMd(output) }} />
      </div>
      <div className="px-5 py-2.5 border-t border-parchment-100 bg-parchment-50/60">
        <p className="text-[11px] text-ink-600/40">Adjust inputs and click Retry for a fresh variation.</p>
      </div>
    </div>
  )
}
