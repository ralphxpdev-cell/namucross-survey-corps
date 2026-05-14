import { NextRequest, NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GITHUB_OWNER = process.env.GITHUB_OWNER!
const GITHUB_REPO  = process.env.GITHUB_REPO!

const GH_HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
}

// GET /api/sessions/[member] → 최신 브리프를 Pi 컨텍스트로 반환
export async function GET(
  _req: NextRequest,
  { params }: { params: { member: string } }
) {
  const member = decodeURIComponent(params.member)

  const listRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/members/${encodeURIComponent(member)}`,
    { headers: GH_HEADERS, cache: 'no-store' }
  )

  if (!listRes.ok) return NextResponse.json({ context: null })

  const files = await listRes.json()
  const latest = (files as any[])
    .filter(f => f.type === 'dir' && f.name.startsWith('brief_'))
    .sort((a, b) => b.name.localeCompare(a.name))[0]

  if (!latest) return NextResponse.json({ context: null })

  const briefRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/members/${encodeURIComponent(member)}/${latest.name}/_brief.md`,
    { headers: GH_HEADERS, cache: 'no-store' }
  )

  if (!briefRes.ok) return NextResponse.json({ context: null })

  const data = await briefRes.json()
  const context = Buffer.from(data.content, 'base64').toString('utf-8')

  return NextResponse.json({ context, folder: latest.name })
}

// POST /api/sessions/[member] → Pi 세션 로그 GitHub에 저장
export async function POST(
  req: NextRequest,
  { params }: { params: { member: string } }
) {
  const member = decodeURIComponent(params.member)
  const { messages, summary } = await req.json()

  if (!messages?.length) {
    return NextResponse.json({ error: '메시지 없음' }, { status: 400 })
  }

  const now = new Date()
  const ts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('')

  const filePath = `members/${member}/sessions/session_${ts}.md`

  const lines = [
    `# Pi 세션 — ${member}`,
    `저장: ${now.toLocaleString('ko-KR')}`,
    summary ? `\n## 요약\n${summary}` : '',
    '\n## 대화 내용',
    ...(messages as any[]).map(m =>
      `\n**${m.role === 'user' ? '👤 유저' : '🤖 Pi'}**\n${m.content}`
    ),
  ]

  const encoded = Buffer.from(lines.join('\n'), 'utf-8').toString('base64')

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(filePath)}`,
    {
      method: 'PUT',
      headers: { ...GH_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `🤖 ${member} — Pi 세션 저장 (${ts})`,
        content: encoded,
        committer: { name: 'Survey Corps Bot', email: 'bot@namucross.kr' },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message || '저장 실패' }, { status: res.status })
  }

  return NextResponse.json({ success: true, path: filePath })
}
