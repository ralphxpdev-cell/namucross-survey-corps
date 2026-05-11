import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const GITHUB_OWNER = process.env.GITHUB_OWNER!
const GITHUB_REPO  = process.env.GITHUB_REPO!

const MEMBERS = ['이태섭', '안성은', '백은총', '김승리', '구광현', '전성은']

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

export async function GET() {
  try {
    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    }

    const results: MemberData[] = await Promise.all(
      MEMBERS.map(async (member) => {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/members/${encodeURIComponent(member)}`,
            { headers }
          )
          if (!res.ok) return { name: member, briefs: [] }

          const files = await res.json() as Array<{ name: string; path: string; html_url: string }>

          const briefs: BriefFile[] = files
            .filter(f => f.name.endsWith('.md'))
            .map(f => ({
              name: f.name,
              path: f.path,
              url:  f.html_url,
              date: f.name.replace('brief_', '').replace('.md', ''),
            }))
            .sort((a, b) => b.date.localeCompare(a.date))

          return { name: member, briefs }
        } catch {
          return { name: member, briefs: [] }
        }
      })
    )

    return NextResponse.json({ members: results })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
