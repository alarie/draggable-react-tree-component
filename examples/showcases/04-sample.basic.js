import React, { Component, PropTypes } from 'react'
/* eslint-disable */
import 'react-tree-component/assets/index.less'
import './basic.less'
import Tree, { TreeNode } from 'react-tree-component'
/* eslint-enable */

class Demo extends Component {
  static propTypes = {
    keys: PropTypes.array,
  }

  static defaultProps = {
    keys: ['0-0-0-0'],
  }


  constructor(props) {
    super(props)
    const keys = this.props.keys
    this.state = {
      defaultExpandedKeys: keys,
      defaultSelectedKeys: keys,
      defaultCheckedKeys: keys,
      switchIt: true,
    }
  }
  onExpand(expandedKeys) {
    console.log('onExpand', expandedKeys)
  }
  onSelect(selectedKeys, info) {
    console.log('selected', selectedKeys, info)
    this.selKey = info.node.props.eventKey
  }
  onCheck(checkedKeys, info) {
    console.log('onCheck', checkedKeys, info)
  }
  onEdit() {
    setTimeout(() => {
      console.log('current key: ', this.selKey)
    }, 0)
  }
  onDel(e) {
    if (!window.confirm('sure to delete?')) {
      return
    }
    e.stopPropagation()
  }
  render() {

    const customLabel = (<span className="cus-label">
      <span>operations: </span>
      <span style={{ color: 'blue' }} onClick={this.onEdit}>Edit</span>&nbsp;
      <span style={{ color: 'red' }} onClick={this.onDel}>Delete</span>
    </span>)

    const tree = [
      {
        key: 'p1',
        title: 'parent 1',
        children: [
          { key: 'p10', title: customLabel },
          {
            title: 'parent 1-1',
            key: 'p11',
            children: [
              {
                title: 'parent 2-1',
                disableCheckbox: true,
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

    const loop = (nodes) => {
      if (!nodes || !nodes.length) {
        return null
      }
      return nodes.map((node) =>
        <TreeNode
          key={node.key}
          disableCheckbox={node.disableCheckbox}
          items={loop(node.children)}
        >{node.title}</TreeNode>
      )
    }


    return (<div style={{ margin: '0 20px' }}>
      <h2>simple</h2>
      <Tree
        className="myCls" showLine checkable defaultExpandAll
        defaultExpandedKeys={this.state.defaultExpandedKeys}
        onExpand={this.onExpand}
        defaultSelectedKeys={this.state.defaultSelectedKeys}
        defaultCheckedKeys={this.state.defaultCheckedKeys}
        onSelect={this.onSelect} onCheck={this.onCheck}
      >
        {loop(tree)}
      </Tree>
    </div>)
  }
}


export { Demo as default }
