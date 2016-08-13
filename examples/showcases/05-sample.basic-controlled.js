/* eslint-disable */
import 'react-tree-component/assets/index.less'
import React, { PropTypes, Component } from 'react'
import ReactDOM from 'react-dom'
import Tree, { TreeNode } from '../../src/'
import { gData,
  /* filterParentPosition, getFilterExpandedKeys,*/ getRadioSelectKeys } from './util'
/* eslint-enable */

class Demo extends Component {
  static propTypes = {
    multiple: PropTypes.bool,
  }
  static defaultProps = {
    visible: false,
    multiple: true,
  }
  constructor(props) {
    super(props);

    [
      'onExpand',
      'onCheck',
      'onCheckStrictly',
      'onSelect',
      'onRbSelect',
      'onClose',
      'onTriggerChecked',
      'onOk'
    ].forEach((key) => (this[key] = this[key].bind(this)))
    this.state = {
      // expandedKeys: getFilterExpandedKeys(gData, ['0-0-0-key']),
      expandedKeys: ['0-0-0-key'],
      autoExpandParent: true,
      // checkedKeys: ['0-0-0-0-key', '0-0-1-0-key', '0-1-0-0-key'],
      checkedKeys: ['0-0-0-key'],
      checkStrictlyKeys: { checked: ['0-0-1-key'], halfChecked: [] },
      selectedKeys: [],
      treeData: [],
    }
  }
  onExpand(expandedKeys) {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    })
  }
  onCheck(checkedKeys) {
    this.setState({
      checkedKeys,
    })
  }
  onCheckStrictly(checkedKeys, /* extra*/) {
    // const { checkedNodesPositions } = extra;
    // const pps = filterParentPosition(checkedNodesPositions.map(i => i.pos));
    // console.log(checkedNodesPositions.filter(i => pps.indexOf(i.pos) > -1).map(i => i.node.key));
    const cks = {
      checked: checkedKeys.checked || checkedKeys,
      halfChecked: [`0-0-${parseInt(Math.random() * 3, 10)}-key`],
    }
    this.setState({
      // checkedKeys,
      checkStrictlyKeys: cks,
      // checkStrictlyKeys: checkedKeys,
    })
  }
  onSelect(selectedKeys, info) {
    console.log('onSelect', selectedKeys, info)
    this.setState({
      selectedKeys,
    })
  }
  onRbSelect(selectedKeys, info) {
    // eslint-disable-next-line no-underscore-dangle
    let _selectedKeys = selectedKeys
    if (info.selected) {
      _selectedKeys = getRadioSelectKeys(gData, selectedKeys, info.node.props.eventKey)
    }
    this.setState({
      selectedKeys: _selectedKeys,
    })
  }
  onClose() {
    this.setState({
      visible: false,
    })
  }
  onTriggerChecked() {
    this.setState({
      checkedKeys: [`0-0-${parseInt(Math.random() * 3, 10)}-key`],
    })
  }
  onOk() {
    this.setState({
      visible: false,
    })
  }
  showModal() {
    this.setState({
      expandedKeys: ['0-0-0-key', '0-0-1-key'],
      checkedKeys: ['0-0-0-key'],
      visible: true,
    })
    // simulate Ajax
    setTimeout(() => {
      this.setState({
        treeData: [...gData],
      })
    }, 2000)
  }

  render() {
    const loop = (data) => (
      data.map((item) => (
        <TreeNode
          key={item.key}
          items={(item.children && item.children.length) ? loop(item.children) : null}
          disableCheckbox={item.key === '0-0-0-key'}
        >
          {item.title}
        </TreeNode>
      ))
    )

    return (<div style={{ padding: '0 20px' }}>
      <h2>dialog</h2>
      <button className="btn btn-primary" onClick={this.showModal}>show dialog</button>


      <h2>controlled</h2>
      <Tree
        checkable
        onExpand={this.onExpand} expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        onCheck={this.onCheck} checkedKeys={this.state.checkedKeys}
        onSelect={this.onSelect} selectedKeys={this.state.selectedKeys}
      >
        {loop(gData)}
      </Tree>
      <button onClick={this.onTriggerChecked}>trigger checked</button>

      <h2>checkStrictly</h2>
      <Tree
        checkable multiple={this.props.multiple}
        defaultExpandAll
        onExpand={this.onExpand} expandedKeys={this.state.expandedKeys}
        onCheck={this.onCheckStrictly}
        checkedKeys={this.state.checkStrictlyKeys}
        checkStrictly
      >
        {loop(gData)}
      </Tree>

      <h2>radios behavior select (in the same level)</h2>
      <Tree
        multiple defaultExpandAll
        onSelect={this.onRbSelect}
        selectedKeys={getRadioSelectKeys(gData, this.state.selectedKeys)}
      >
        {loop(gData)}
      </Tree>
    </div>)
  }
}

export { Demo as default }

/*

<Modal
  title="TestDemo" visible={this.state.visible}
  onOk={this.onOk} onClose={this.onClose}
>
  {this.state.treeData.length ? (
    <Tree
      checkable className="dialog-tree"
      onExpand={this.onExpand} expandedKeys={this.state.expandedKeys}
      autoExpandParent={this.state.autoExpandParent}
      onCheck={this.onCheck} checkedKeys={this.state.checkedKeys}
    >
      {loop(this.state.treeData)}
    </Tree>
  ) : 'loading...'}
</Modal>

*/
