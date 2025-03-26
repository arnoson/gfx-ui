import Prism from 'prismjs'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
// import 'prismjs/themes/prism-tomorrow.css'
import '~/assets/theme-github-copiltot.css'

Prism.manual = true

export const highlight = (code: string) =>
  Prism.highlight(code, Prism.languages.cpp, 'cpp')
