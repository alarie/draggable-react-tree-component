import React, { Component } from 'react'
import { gData } from './util'
/* eslint-disable */
import Tree, { TreeNode } from 'react-tree-component'
import 'react-tree-component/assets/index.less'
/* eslint-enable */
import './draggable.less'

class Demo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gData,
      autoExpandParent: true,
      expandedKeys: ['0-0-key', '0-0-0-key', '0-0-0-0-key'],
    }
  }
  onDragStart(info) {
    console.log('start', info)
  }
  onDragEnter(info) {
    // console.log('enter', info)
    this.setState({
      expandedKeys: info.expandedKeys,
    })
  }
  onDrop(info) {
    console.log('drop', info)
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    // const dragNodesKeys = info.dragNodesKeys;
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
        return null
      })
    }
    const data = [...this.state.gData]
    let dragObj
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })
    if (info.dropToGap) {
      let ar
      let i
      loop(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      ar.splice(i, 0, dragObj)
    }
    else {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj)
      })
    }
    this.setState({
      gData: data,
      expandedKeys: info.rawExpandedKeys.concat([info.node.props.eventKey]),
    })
  }
  onExpand(expandedKeys) {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }

  render() {
    const loop = data => (
      data.map((item) =>
        (<TreeNode
          key={item.key}
          items={
            (item.children && item.children.length) ? loop(item.children) : null
          }
        >
          <a href={`#/${item.key}`} draggable={false}>
            {item.title}
          </a>
        </TreeNode>)
      )
    )
    return (<div className="draggable-demo">
      <h2>draggable </h2>
      <p>drag a node into another node</p>
      <div className="draggable-container">
        <Tree
          expandedKeys={this.state.expandedKeys}
          onExpand={this.onExpand} autoExpandParent={this.state.autoExpandParent}
          draggable
          onDragStart={this.onDragStart}
          onDragEnter={this.onDragEnter}
          onDrop={this.onDrop}
        >
          {loop(this.state.gData)}
        </Tree>
      </div>
    </div>)
  }
}


export { Demo as default }
