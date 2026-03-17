import { useState } from 'react'
import { renderWAImage } from '../utils/api.js'

function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/━+/g, '<hr/>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em>$1</em>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^[-•] (.+)$/gm,  '<li>$1</li>')
    .split('\n\n')
    .map(b => /^<[hulbhd]/.test(b.trim()) ? b : `<p>${b}</p>`)
    .join('\n')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[123hr])/g, '$1')
    .replace(/(<\/h[123]>|<hr\/>)<\/p>/g, '$1')
}

// Split WA output into individual creatives
function parseWACreatives(text) {
  const parts = text.split(/---\s*\n/).filter(p => p.trim())
  return parts.filter(p => p.includes('Heading:') || p.includes('Creative'))
}

export default function CopyOutput({ output, taskType, projectName, onRegenerate }) {
  const [copied,       setCopied]       = useState(false)
  const [genImg,       setGenImg]       = useState(false)
  const [waImages,     setWaImages]     = useState([])
  const [imgLoading,   setImgLoading]   = useState(false)

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

  function downloadImg(dataUrl, idx) {
    const a = Object.assign(document.createElement('a'), {
      href: dataUrl,
      download: `${projectName || 'project'}_WA_Creative_${idx + 1}.png`,
    })
    a.click()
  }

  async function handleGenerateImages() {
    setImgLoading(true)
    setWaImages([])
    try {
      const creatives = parseWACreatives(output)
      const images = await Promise.all(
        creatives.map((c, i) =>
          renderWAImage(c, projectName || 'Project', i % 2 === 0 ? '#1a1714' : '#0f2027')
        )
      )
      setWaImages(images)
      setGenImg(true)
    } catch (e) {
      alert('Image generation failed: ' + e.message)
    } finally {
      setImgLoading(false)
    }
  }

  const isWA = taskType === 'WA Creatives'

  return (
    <div className="card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-parchment-100">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0"></div>
          <div>
            <p className="text-sm font-semibold text-ink-900 leading-tight">{taskType}</p>
            {projectName && <p className="text-[11px] text-ink-600 mt-0.5">{projectName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isWA && (
            <button onClick={handleGenerateImages} disabled={imgLoading}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-sm border border-gold-400 bg-gold-400/10 text-gold-600 hover:bg-gold-400/20 transition-all disabled:opacity-50">
              {imgLoading
                ? <><span className="spinner text-gold-500" style={{width:11,height:11}}></span> Generating…</>
                : <>🎨 Generate Images</>}
            </button>
          )}
          <button onClick={copy}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-sm border border-parchment-200 text-ink-600 hover:border-ink-700 hover:text-ink-900 transition-all">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button onClick={download}
            className="text-[11px] font-medium px-2.5 py-1.5 rounded-sm border border-parchment-200 text-ink-600 hover:border-ink-700 hover:text-ink-900 transition-all">
            Save .txt
          </button>
          {onRegenerate && (
            <button onClick={onRegenerate}
              className="text-[11px] font-medium px-2.5 py-1.5 rounded-sm border border-parchment-200 bg-parchment-100 text-ink-700 hover:border-ink-600 transition-all">
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Generated WA Images */}
      {genImg && waImages.length > 0 && (
        <div className="px-5 py-5 border-b border-parchment-100">
          <p className="label mb-3">Generated Creatives — click to download</p>
          <div className="grid grid-cols-3 gap-3">
            {waImages.map((img, i) => (
              <div key={i} className="group relative cursor-pointer rounded-sm overflow-hidden border border-parchment-200"
                onClick={() => downloadImg(img, i)}>
                <img src={img} alt={`Creative ${i + 1}`} className="w-full h-auto" />
                <div className="absolute inset-0 bg-ink-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <span className="text-white text-xs font-medium">↓ Download</span>
                </div>
                <p className="text-center text-[10px] text-ink-600 py-1.5">Creative {i + 1}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-ink-600/40 mt-2">
            These are layout previews. Final designs should be done by the design team.
          </p>
        </div>
      )}

      {/* Copy text output */}
      <div className="px-5 py-5 overflow-y-auto max-h-[60vh]">
        <div className="copy-output" dangerouslySetInnerHTML={{ __html: renderMd(output) }} />
      </div>

      <div className="px-5 py-2.5 border-t border-parchment-100 bg-parchment-50/60">
        <p className="text-[11px] text-ink-600/40">Adjust inputs and click Retry for a fresh variation.</p>
      </div>
    </div>
  )
}
