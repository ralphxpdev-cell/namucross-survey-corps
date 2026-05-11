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
          // 1단계: members/이름/ 폴더 목록 (brief_날짜_시간 폴더들)
          const res = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/members/${encodeURIComponent(member)}`,
            { headers }
          )
          if (!res.ok) return { name: member, briefs: [] }

          const folders = await res.json() as Array<{ name: string; path: string; type: string }>

          // 2단계: 각 brief_* 폴더 안의 _brief.md 수집
          const briefFolders = folders.filter(f => f.type === 'dir' && f.name.startsWith('brief_'))

          const briefs: BriefFile[] = (
            await Promise.all(
              briefFolders.map(async (folder) => {
                try {
                  const folderRes = await fetch(
                    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(folder.path)}`,
                    { headers }
                  )
                  if (!folderRes.ok) return null

                  const files = await folderRes.json() as Array<{ name: string; path: string; html_url: string }>
                  const briefFile = files.find(f => f.name === '_brief.md')
                  if (!briefFile) return null

                  return {
                    name: folder.name,
                    path: briefFile.path,
                    url:  briefFile.html_url,
                    date: folder.name.replace('brief_', ''),
                  }
                } catch {
                  return null
                }
              })
            )
          )
            .filter((b): b is BriefFile => b !== null)
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
