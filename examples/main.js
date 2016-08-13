/* eslint-disable */
import React from 'react'
import ReactDOM from 'react-dom'
import showcases from './showcases'
import 'milligram/dist/milligram.css'
import readme from 'html!markdown!../README.md'
/* eslint-enable */


const examples = showcases.examples
const codes = showcases.codes

const App = () => {

  const keys = Object.keys(examples)
  return (<div className="container">

    <div className="container">
      <div className="row">
        <div className="column column-100"
          dangerouslySetInnerHTML={{
            __html: readme
          }}
        />
      </div>
    </div>

    <h2 id="examples">Examples</h2>

    <hr />

    {
    keys.map((key) => {

      const Example = examples[key]

      let result
      const html = codes[key]
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      try {
        result = (<div className="row">
          <div className="column column-25">
            <Example />
          </div>
          <div className="column column-75">
            <pre>
              <code
                className="lang-js"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </pre>
          </div>
        </div>)
      }
      catch (ex) {
        result = `${key}: ${ex.toString()}`
      }

      return (<div className="container">

          {result}

      </div>)
    }
  )}</div>)
}

ReactDOM.render(<App />, document.getElementById('app'))
