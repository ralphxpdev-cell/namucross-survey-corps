'use client'

import { useState, useEffect } from 'react'

interface BriefFile {
  name: string
  path: string
  url: string
  date: string
}

interface MemberData {
  name: string
  briefs: BriefFile[]
}

const MEMBER_COLORS = [
  { bg: 'bg-blue-500/15',    border: 'border-blue-500/25',    text: 'text-blue-400'    },
  { bg: 'bg-purple-500/15',  border: 'border-purple-500/25',  text: 'text-purple-400'  },
  { bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', text: 'text-emerald-400' },
  { bg: 'bg-rose-500/15',    border: 'border-rose-500/25',    text: 'text-rose-400'    },
  { bg: 'bg-cyan-500/15',    border: 'border-cyan-500/25',    text: 'text-cyan-400'    },
]

function formatDate(raw: string) {
  // brief_20260511_2000 → 2026.05.11 20:00
  const d = raw.replace('brief_', '')
  if (d.length >= 8) {
    const y = d.slice(0, 4), m = d.slice(4, 6), day = d.slice(6, 8)
    const t = d.slice(9) // HHMM
    return `${y}.${m}.${day}${t ? ` ${t.slice(0, 2)}:${t.slice(2)}` : ''}`
  }
  return raw
}

export default function DashboardPage() {
  const [pw, setPw] = useState('')
  const [auth, setAuth] = useState(false)
  const [error, setError] = useState('')
  const [members, setMembers] = useState<MemberData[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<string>('')

  const handleAuth = () => {
    if (pw === 'tomob2026') {
      setAuth(true)
      setError('')
    } else {
      setError('패스워드가 틀렸습니다.')
    }
  }

  const fetchBriefs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/briefs')
      const data = await res.json()
      setMembers(data.members || [])
      setLastFetch(new Date().toLocaleTimeString('ko-KR'))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth) fetchBriefs()
  }, [auth])

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs space-y-6 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
                <path d="M14 8v12M4 8l10 6 10-6" stroke="#f59e0b" strokeWidth="1.5"/>
              </svg>
              <span className="text-zinc-200 font-semibold">사령관 대시보드</span>
            </div>
            <p className="text-zinc-600 text-xs">패스워드를 입력해주세요</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="패스워드"
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm outline-none focus:border-zinc-600 transition-colors text-center"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              onClick={handleAuth}
              className="w-full py-3 rounded-xl bg-corps-500 hover:bg-corps-600 text-zinc-950 font-semibold text-sm transition-all"
            >
              입장
            </button>
          </div>
          <a href="/" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors block">
            ← 멤버 화면으로
          </a>
        </div>
      </div>
    )
  }

  const totalBriefs = members.reduce((acc, m) => acc + m.briefs.length, 0)

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="border-b border-zinc-900 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 8v12l10 6 10-6V8L14 2z" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
            <path d="M14 8v12M4 8l10 6 10-6" stroke="#f59e0b" strokeWidth="1.5"/>
          </svg>
          <div>
            <span className="text-zinc-100 font-semibold text-sm">사령관 대시보드</span>
            <span className="text-zinc-700 text-xs ml-2">namucross survey corps</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastFetch && <span className="text-zinc-700 text-xs">마지막 갱신 {lastFetch}</span>}
          <button
            onClick={fetchBriefs}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors disabled:opacity-50"
          >
            {loading ? '갱신 중...' : '새로고침'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* 요약 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-600 mb-1">총 멤버</p>
            <p className="text-2xl font-bold text-zinc-100">{members.length}<span className="text-sm font-normal text-zinc-500 ml-1">명</span></p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-600 mb-1">제출된 기획서</p>
            <p className="text-2xl font-bold text-corps-400">{totalBriefs}<span className="text-sm font-normal text-zinc-500 ml-1">개</span></p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-600 mb-1">미제출</p>
            <p className="text-2xl font-bold text-zinc-400">{members.filter(m => m.briefs.length === 0).length}<span className="text-sm font-normal text-zinc-500 ml-1">명</span></p>
          </div>
        </div>

        {/* 멤버 카드 */}
        <div className="space-y-3">
          {loading && members.length === 0 ? (
            <div className="text-center py-16 text-zinc-700 text-sm">불러오는 중...</div>
          ) : (
            members.map((m, i) => {
              const color = MEMBER_COLORS[i % MEMBER_COLORS.length]
              const isExpanded = expanded === m.name
              return (
                <div key={m.name} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  {/* 카드 헤더 */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : m.name)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${color.bg} ${color.border} ${color.text}`}>
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 font-medium text-sm">{m.name}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">
                        기획서 {m.briefs.length}개
                        {m.briefs[0] && ` · 최근 ${formatDate(m.briefs[0].date)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {m.briefs.length > 0 ? (
                        <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                          제출 완료
                        </span>
                      ) : (
                        <span className="text-[11px] bg-zinc-800 text-zinc-600 px-2.5 py-1 rounded-full">
                          미제출
                        </span>
                      )}
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#52525b" strokeWidth="2"
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </button>

                  {/* 기획서 목록 (펼침) */}
                  {isExpanded && m.briefs.length > 0 && (
                    <div className="border-t border-zinc-800 px-5 py-3 space-y-2">
                      {m.briefs.map((b) => (
                        <div key={b.name} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-zinc-400 text-xs font-mono">{b.name}</p>
                            <p className="text-zinc-600 text-[11px] mt-0.5">{formatDate(b.date)}</p>
                          </div>
                          <a
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-corps-400 hover:text-corps-300 transition-colors px-3 py-1.5 rounded-lg bg-corps-500/10 border border-corps-500/20"
                          >
                            GitHub에서 보기 →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  {isExpanded && m.briefs.length === 0 && (
                    <div className="border-t border-zinc-800 px-5 py-4 text-zinc-700 text-xs">
                      아직 제출된 기획서가 없습니다.
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
