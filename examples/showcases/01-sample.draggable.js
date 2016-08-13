/* eslint-disable */
import React, { Component } from 'react'
import { gData } from './util'
import Tree, { TreeNode } from '../../src'
import '../../assets/index.less'
/* eslint-enable */
import './draggable.less'

class Demo extends Component {
  constructor(props) {
    super(props);

    [
      'onDragStart',
      'onDragEnter',
      'onDrop',
      'onExpand'
    ].forEach((name) => (this[name] = this[name].bind(this)))

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


    // traverse to the hiven key and execute the given callback
    const traverseToKey = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr)
        }
        if (item.children) {
          return traverseToKey(item.children, key, callback)
        }
        return null
      })
    }

    const data = [...this.state.gData]
    let dragObj

    traverseToKey(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (info.dropToGap) {
      traverseToKey(data, dropKey, (item) => {
        item.children = item.children || []

        let index = info.dropPosition +
          (info.dropPositionOnNode > 0 ? 1 : 0)

        if (info.isSameLevel && info.dragPosition < info.dropPosition) {
          index -= 1
        }
        // where to insert
        item.children.splice(index, 0, dragObj)
      })
    }
    else {
      traverseToKey(data, dropKey, (item) => {
        item.children = item.children || []
        // where to insert
        item.children.push(dragObj)
      })
    }

    this.setState({
      gData: data,
      expandedKeys: info.rawExpandedKeys.concat([dropKey]),
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
      <h2>Draggable </h2>
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
