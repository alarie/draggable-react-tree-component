
function requireAll(req, loader = '') {

  return req.keys()
  .filter((key) => key.indexOf('./sample-') >= 0)
  .reduce((memo, key) => {
    const name = key.replace('./sample-', '').replace('.js', '')
    memo[name] = req(`${loader}${key}`)
    return memo
  }, {})
}


const examples = requireAll(require.context('./', true, /\.js$/))
const codes = requireAll(require.context('!!raw!./', true, /\.js$/), '')

module.exports = { examples, codes }
