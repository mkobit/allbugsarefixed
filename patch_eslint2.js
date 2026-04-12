import fs from 'fs'
const code = fs.readFileSync('eslint.config.mjs', 'utf8')
const patch = `
  // Remark plugins often need to mutate AST nodes
  {
    files: ['src/lib/remark/**/*.ts', 'src/lib/remark/**/*.mjs', 'src/lib/remark/**/*.js'],
    rules: {
      'functional/immutable-data': 'off',
      'functional/no-expression-statements': 'off',
      'functional/no-throw-statements': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
`
const newCode = code.replace(/ {2}\/\/ Remark plugins often need to mutate AST nodes([\s\S]*?) {2}\/\/ Playwright Tests/, patch + '  // Playwright Tests')
fs.writeFileSync('eslint.config.mjs', newCode)
