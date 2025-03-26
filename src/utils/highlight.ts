import cpp from '@shikijs/langs/cpp'
import githubDarkDefault from '@shikijs/themes/github-dark-default'
import { createHighlighterCoreSync, createJavaScriptRegexEngine } from 'shiki'

const shiki = createHighlighterCoreSync({
  themes: [githubDarkDefault],
  langs: [cpp],
  engine: createJavaScriptRegexEngine(),
})

export const highlight = (code: string) =>
  shiki.codeToHtml(code, { lang: 'cpp', theme: 'github-dark-default' })
