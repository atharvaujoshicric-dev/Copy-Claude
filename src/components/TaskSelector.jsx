import { TASKS } from '../utils/tasks.js'

export default function TaskSelector({ selected, onSelect }) {
  return (
    <div className="card p-4">
      <p className="label mb-3">Step 1 — Task Type</p>
      <div className="space-y-1">
        {TASKS.map(t => {
          const active = selected === t.id
          return (
            <button key={t.id} onClick={() => onSelect(t.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-sm border transition-all flex items-center gap-3
                ${active ? 'bg-ink-900 border-ink-900' : 'bg-white border-parchment-200 hover:border-ink-600'}`}>
              <span className="text-base w-5 text-center flex-shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${active ? 'text-parchment-50' : 'text-ink-900'}`}>{t.id}</p>
                <p className={`text-[11px] mt-0.5 ${active ? 'text-parchment-200/60' : 'text-ink-600/60'}`}>{t.desc}</p>
              </div>
              {active && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
                  <path d="M1.5 6.5L4.5 9.5L11.5 2.5" stroke="#D4A847" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
