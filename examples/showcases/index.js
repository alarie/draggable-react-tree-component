const examples = {}

function requireAll(req) {
  req.keys()
  .filter((key) => key.indexOf('./sample-') === 0)
  .forEach((key) => {
    const name = key.replace('./sample-', '').replace('.js', '')
    console.log(name);
    examples[name] = req(key)
  })
}

requireAll(require.context('./', true, /\.js$/))

module.exports = examples
