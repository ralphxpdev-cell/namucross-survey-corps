'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MEMBERS = ['이태섭', '안성은', '백은총', '김승리', '구광현', '전성은']

const COLORS = [
  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!selected || !apiKey.trim()) return
    if (!apiKey.startsWith('AIza')) {
      setError('Gemini API 키는 AIza로 시작해야 합니다.')
      return
    }

    setLoading(true)
    setError('')

    // 간단한 API 키 검증
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'hi' }] }] }),
        }
      )
      if (!res.ok) throw new Error()
    } catch {
      setError('API 키를 확인해주세요. 키가 유효하지 않습니다.')
      setLoading(false)
      return
    }

    localStorage.setItem('sc_member', selected)
    localStorage.setItem('sc_api_key', apiKey.trim())
    router.push('/workspace')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* 로고 */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2.5 mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
            <path d="M14 8v12M4 8l10 6 10-6" stroke="#f59e0b" strokeWidth="1.5"/>
          </svg>
          <span className="text-zinc-100 font-semibold tracking-tight text-lg">Survey Corps</span>
        </div>
        <p className="text-zinc-500 text-sm">나무십자가 AI 조사병단 — 기획서 작성 봇</p>
      </div>

      <div className="w-full max-w-sm space-y-8">
        {/* STEP 1: 멤버 선택 */}
        <div>
          <p className="text-xs text-zinc-600 tracking-widest uppercase mb-4">01 — 멤버 선택</p>
          <div className="grid grid-cols-3 gap-2">
            {MEMBERS.map((name, i) => (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className={`relative p-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                  selected === name
                    ? `${COLORS[i]} border`
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 mx-auto ${
                  selected === name ? '' : 'bg-zinc-800 text-zinc-500'
                }`}
                  style={selected === name ? {} : {}}
                >
                  {name[0]}
                </div>
                <span className="block text-xs">{name}</span>
                {selected === name && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-corps-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: API 키 */}
        <div>
          <p className="text-xs text-zinc-600 tracking-widest uppercase mb-4">02 — Gemini API 키</p>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-mono placeholder-zinc-700 outline-none focus:border-zinc-600 transition-colors"
            />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-600 hover:text-corps-400 transition-colors"
            >
              Google AI Studio에서 무료 발급 →
            </a>
          </div>
          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          disabled={!selected || !apiKey.trim() || loading}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            selected && apiKey.trim() && !loading
              ? 'bg-corps-500 hover:bg-corps-600 text-zinc-950 shadow-lg shadow-corps-500/20'
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
          }`}
        >
          {loading ? '확인 중...' : selected ? `${selected}님으로 시작하기` : '멤버를 선택해주세요'}
        </button>

        {/* 사령관 링크 */}
        <div className="text-center pt-2">
          <a href="/dashboard" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            사령관 대시보드 →
          </a>
        </div>
      </div>
    </div>
  )
}
