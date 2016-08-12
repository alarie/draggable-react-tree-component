import React from 'react'
import ReactDOM from 'react-dom'
import examples from './showcases'

const App = () => {
  const keys = Object.keys(examples)
  return (<div>{
    keys.map((key) => {

      const Example = examples[key]

      let result
      try {
        result = <Example />
      }
      catch (ex) {
        result = `${key}: ${ex.toString()}`
      }

      return <div>{result}</div>
    }
  )}</div>)
}

ReactDOM.render(<App />, document.getElementById('app'))
