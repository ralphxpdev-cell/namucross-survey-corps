'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MEMBERS = ['이태섭', '안성은', '백은총', '김승리', '구광현', '전성은']

const COLORS = [
  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
]

const SB_URL = 'https://qitxwciaphfftuisyjrg.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdHh3Y2lhcGhmZnR1aXN5anJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NjMwMTcsImV4cCI6MjA4OTEzOTAxN30.dkgdVwG_8W1CzKQhFe5REr-5n27sBzsMvxDxwzeCni0'

async function fetchKey(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/sc_members?name=eq.${encodeURIComponent(name)}&select=api_key`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    )
    const data = await res.json()
    return data[0]?.api_key ?? null
  } catch { return null }
}

async function saveKey(name: string, apiKey: string) {
  await fetch(`${SB_URL}/rest/v1/sc_members`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ name, api_key: apiKey, updated_at: new Date().toISOString() }),
  })
}

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected]   = useState<string | null>(null)
  const [apiKey, setApiKey]       = useState('')
  const [error, setError]         = useState('')
  const [savedMember, setSavedMember] = useState<string | null>(null)
  const [checking, setChecking]   = useState(false)
  const [needsKey, setNeedsKey]   = useState(false)

  const [copied, setCopied] = useState(false)

  const copyInstall = () => {
    navigator.clipboard.writeText('npm install -g github:ralphxpdev-cell/sc-launcher')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 저장된 멤버 → Supabase에서 키 자동 조회
  useEffect(() => {
    const m = localStorage.getItem('sc_member')
    if (!m) return
    setChecking(true)
    fetchKey(m).then(key => {
      if (key) {
        localStorage.setItem('sc_api_key', key)
        setSavedMember(m)
      }
      setChecking(false)
    })
  }, [])

  // 멤버 카드 클릭 → Supabase 조회
  const handleSelect = async (name: string) => {
    setSelected(name)
    setNeedsKey(false)
    setError('')
    setChecking(true)
    const key = await fetchKey(name)
    setChecking(false)
    if (key) {
      localStorage.setItem('sc_member', name)
      localStorage.setItem('sc_api_key', key)
      setNeedsKey(false)
    } else {
      setNeedsKey(true)
    }
  }

  // API 키 최초 입력 → Supabase 저장
  const handleStart = async () => {
    if (!selected || !apiKey.trim()) return
    if (!apiKey.trim().startsWith('AIza') || apiKey.trim().length < 30) {
      setError('Gemini API 키 형식이 올바르지 않습니다. (AIza로 시작)')
      return
    }
    setChecking(true)
    await saveKey(selected, apiKey.trim())
    setChecking(false)
    localStorage.setItem('sc_member', selected)
    localStorage.setItem('sc_api_key', apiKey.trim())
    setSavedMember(selected)
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

        {/* 저장된 계정 */}
        {savedMember && !checking && (
          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">{savedMember}님 Pi 시작하기</p>
              <div>
                <p className="text-xs text-zinc-600 mb-1.5">① 처음 한 번만 설치</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] text-zinc-300 bg-zinc-950 px-3 py-2 rounded-lg truncate">
                    npm install -g github:ralphxpdev-cell/sc-launcher
                  </code>
                  <button
                    onClick={copyInstall}
                    className="shrink-0 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 transition-colors"
                  >
                    {copied ? '✓' : '복사'}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-1.5">② 매번 터미널에서</p>
                <code className="block text-base text-corps-400 bg-zinc-950 px-3 py-2 rounded-lg font-bold tracking-wide">
                  sc
                </code>
              </div>
            </div>
            <button
              onClick={() => { setSavedMember(null); setSelected(null) }}
              className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              다른 멤버로 →
            </button>
          </div>
        )}

        {/* 로딩 */}
        {checking && (
          <div className="text-center py-8 text-zinc-600 text-sm">확인 중...</div>
        )}

        {/* 멤버 선택 폼 */}
        {!savedMember && !checking && (
          <>
            <div>
              <p className="text-xs text-zinc-600 tracking-widest uppercase mb-4">멤버 선택</p>
              <div className="grid grid-cols-3 gap-2">
                {MEMBERS.map((name, i) => (
                  <button
                    key={name}
                    onClick={() => handleSelect(name)}
                    className={`relative p-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                      selected === name
                        ? `${COLORS[i % COLORS.length]} border`
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 mx-auto ${
                      selected === name ? '' : 'bg-zinc-800 text-zinc-500'
                    }`}>
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

            {/* API 키 있음 → sc 명령어 안내 */}
            {selected && !needsKey && !checking && (
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">{selected}님 Pi 시작하기</p>
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">① 처음 한 번만 설치</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[11px] text-zinc-300 bg-zinc-950 px-3 py-2 rounded-lg truncate">
                      npm install -g github:ralphxpdev-cell/sc-launcher
                    </code>
                    <button
                      onClick={copyInstall}
                      className="shrink-0 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 transition-colors"
                    >
                      {copied ? '✓' : '복사'}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-600 mb-1.5">② 매번 터미널에서</p>
                  <code className="block text-base text-corps-400 bg-zinc-950 px-3 py-2 rounded-lg font-bold tracking-wide">
                    sc
                  </code>
                </div>
              </div>
            )}

            {/* API 키 입력 — Supabase에 없을 때만 */}
            {needsKey && selected && (
              <div>
                <p className="text-xs text-zinc-600 tracking-widest uppercase mb-4">
                  Gemini API 키 <span className="text-zinc-700 normal-case">(처음 한 번만)</span>
                </p>
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={e => { setApiKey(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                    autoFocus
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
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
                <button
                  onClick={handleStart}
                  disabled={!apiKey.trim()}
                  className={`mt-4 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    apiKey.trim()
                      ? 'bg-corps-500 hover:bg-corps-600 text-zinc-950 shadow-lg shadow-corps-500/20'
                      : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                  }`}
                >
                  저장하고 시작하기
                </button>
              </div>
            )}
          </>
        )}

        <div className="text-center pt-2">
          <a href="/dashboard" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            사령관 대시보드 →
          </a>
        </div>

      </div>
    </div>
  )
}
