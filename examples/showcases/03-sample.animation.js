import React from 'react'
/* eslint-disable */
import Tree, { TreeNode } from 'react-tree-component'
import cssAnimation from 'css-animation'
import 'react-tree-component/assets/index.less'
/* eslint-enable */

const STYLE = `
.collapse {
  overflow: hidden;
  display: block;
}

.collapse-active {
  transition: height 0.3s ease-out;
}
`

function animate(node, show, done) {
  let height = node.offsetHeight
  return cssAnimation(node, 'collapse', {
    start() {
      if (!show) {
        node.style.height = `${node.offsetHeight}px`
      }
      else {
        height = node.offsetHeight
        node.style.height = 0
      }
    },
    active() {
      node.style.height = `${show ? height : 0}px`
    },
    end() {
      node.style.height = ''
      done()
    },
  })
}

const animation = {
  enter(node, done) {
    return animate(node, true, done)
  },
  leave(node, done) {
    return animate(node, false, done)
  },
  appear(node, done) {
    return animate(node, true, done)
  },
}

const tree = [
  {
    key: 'p1',
    title: 'parent 1',
    children: [
      { key: 'p10', title: 'leaf' },
      {
        title: 'parent 1-1',
        key: 'p11',
        children: [
          {
            title: 'parent 2-1',
            key: 'p21',
            children: [
            { title: 'leaf', key: 'p211' },
            { title: 'leaf', key: 'p212' }
            ]
          },
        { key: 'p22', title: 'leaf' }
        ] }

    ]
  }
]

const Demo = () => {

  const loop = (nodes) => {
    if (!nodes || !nodes.length) {
      return null
    }
    return nodes.map((node) =>
      <TreeNode key={node.key} items={loop(node.children)}>{node.title}</TreeNode>
    )
  }

  return (<div>
    <h2>Animated</h2>
    <style dangerouslySetInnerHTML={{ __html: STYLE }} />
    <Tree
      defaultExpandAll={false}
      defaultExpandedKeys={['p1']}
      openAnimation={animation}
    >{loop(tree)}</Tree>
  </div>)

}

export { Demo as default }
