/* eslint no-underscore-dangle: "off" */
import PropTypes from 'prop-types';

import React from 'react';
import classNames from 'classnames'
import {
  loopAllChildren,
  isInclude,
  getOffset,
  filterParentPosition,
  handleCheckState,
  getCheck,
  getStrictlyValue,
  arraysEqual,
} from './util'

const DRAG_EXPAND_DELAY = 500
const DROPPED_NODE_CLASS_NAME_DELAY = 1200
const DROP_GAP_SIZE = 2

function noop() {}

class Tree extends React.Component {
  constructor(props) {
    super(props);
    ['onKeyDown', 'onCheck'].forEach((m) => {
      this[m] = this[m].bind(this)
    })
    this.contextmenuKeys = []
    this.checkedKeysChange = true

    this.dragEnterTimeout = null

    this.state = {
      expandedKeys: this.getDefaultExpandedKeys(props),
      checkedKeys: this.getDefaultCheckedKeys(props),
      selectedKeys: this.getDefaultSelectedKeys(props),
      dragNodesKeys: '',
      dragOverNodeKey: '',
      dropNodeKey: '',
      droppedNodeKey: null,
    }
  }

  componentWillReceiveProps(nextProps) {
    const expandedKeys = this.getDefaultExpandedKeys(nextProps, true)
    const checkedKeys = this.getDefaultCheckedKeys(nextProps, true)
    const selectedKeys = this.getDefaultSelectedKeys(nextProps, true)
    const st = {}

    if (nextProps.externalDragMode) {
      this.dragNodesKeys = nextProps.externalDragMode.externalDragNodeKeys
      this.dragNode = nextProps.externalDragMode.externalDragNode
    }

    if (expandedKeys) {
      st.expandedKeys = expandedKeys
    }
    if (checkedKeys) {
      if (nextProps.checkedKeys === this.props.checkedKeys) {
        this.checkedKeysChange = false
      }
      else {
        this.checkedKeysChange = true
      }
      st.checkedKeys = checkedKeys
    }
    if (selectedKeys) {
      st.selectedKeys = selectedKeys
    }
    this.setState(st)
  }

  onDragStart(e, treeNode) {

    this.dragNode = treeNode
    this.dragNodesKeys = this.getDragNodes(treeNode)

    const st = {
      dragNodesKeys: this.dragNodesKeys,
    }

    this.cacheExpandedKeys()

    // collapse the currently dragged node
    const expandedKeys = this.updateExpandedKeys(treeNode, { expand: false })

    if (expandedKeys) {
      // Controlled expand, save and then reset
      st.expandedKeys = expandedKeys
    }

    this.setState(st)

    this.props.onDragStart({
      event: e,
      node: treeNode,
      nodeKeys: this.dragNodesKeys
    })

    this._dropTrigger = false

  }

  onDragEnter(e, treeNode) {

    const enterGap = this.isOverGap(e, treeNode)

    // dragging over itself
    if (
      this.dragNode &&
      this.dragNode.props &&
      this.dragNode.props.eventKey &&
      treeNode.props &&
      treeNode.props.eventKey &&
      this.dragNode.props.eventKey === treeNode.props.eventKey &&
      enterGap === 0
    ) {
      this.setState({ dragOverNodeKey: '' })
      return
    }

    const state = { dragOverNodeKey: treeNode.props.eventKey }

    let expandedKeys = this.state.expandedKeys

    const updateState = () => {

      expandedKeys = this.updateExpandedKeys(treeNode, { expand: true })

      if (expandedKeys) {
        this.cacheExpandedKeys()
        state.expandedKeys = expandedKeys
      }

    }

    if (!enterGap) {
      this.currDragOverKey = treeNode.props.eventKey
      this.startDragEnterTimeout(() => {
        updateState()
        this.setState(state)
      })
    }
    else {
      this.currDragOverKey = null
    }


    this.setState(state)

    this.props.onDragEnter({
      event: e,
      node: treeNode,
      expandedKeys: (expandedKeys && [...expandedKeys]) || [...this.state.expandedKeys],
    })

  }

  onDragOver(e, treeNode) {

    if (this.isOverGap(e, treeNode) ||
      this.currDragOverKey !== treeNode.props.eventKey
    ) {
      this.stopDragEnterTimeout(treeNode.props.eventKey)
      this.onDragEnter(e, treeNode)
    }

    this.props.onDragOver({ event: e, node: treeNode })

  }


  onDragLeave(e, treeNode) {

    this.stopDragEnterTimeout(treeNode.props.eventKey)
    this.props.onDragLeave({ event: e, node: treeNode })
    this.setState({
      dragOverNodeKey: ''
    })
  }

  onDragEnd(e, treeNode) {
    this.dropPosition = null
    this.currDragOverKey = null
    this.props.onDragEnd({ event: e, node: treeNode })
    this.setState({
      dragOverNodeKey: '',
      dropNodeKey: null,
    })
  }

  onDrop(e, treeNode) {

    const key = treeNode.props.eventKey
    const droppedNodeKey = this.dragNode.props.eventKey

    this.setState({
      dragOverNodeKey: '',
      dropNodeKey: key,
      droppedNodeKey
    }, () => {
      setTimeout(() => {
        if (this.state.droppedNodeKey === droppedNodeKey) {
          this.setState({
            droppedNodeKey: null
          })
        }
      }, this.props.droppedNodeClassNameDelay || DROPPED_NODE_CLASS_NAME_DELAY)
    })

    if (this.dragNodesKeys.indexOf(key) > -1) {
      if (console.warn) {
        console.warn('Cannot drop node on one of it\'s children')
      }
      return false
    }

    const posArr = treeNode.props.pos.split('-')
    const dragPosArr = this.dragNode.props.pos.split('-')

    const res = {
      event: e,
      node: treeNode,
      dragNode: this.dragNode,
      dragNodesKeys: [...this.dragNodesKeys],
      dropPositionOnNode: this.dropPosition,
      dropPosition: Number(posArr.slice(-1)[0]),
      dragPosition: Number(dragPosArr.slice(-1)[0]),
      isSameLevel: posArr.slice(0, -1).join('-') === dragPosArr.slice(0, -1).join('-')
    }

    if (res.dropPositionOnNode !== 0) {
      res.dropToGap = true
      const parentPos = posArr.slice(0, -1).join('-')

      this.traverseToKey(parentPos, (item, index, pos, eventKey) => {
        res.node.props = { eventKey }
      })
    }

    // Adjust dropPosition
    let index = res.dropPosition + (res.dropPositionOnNode > 0 ? 1 : 0)

    if (res.isSameLevel && res.dragPosition < res.dropPosition) {
      index -= 1
    }
    res.dropPosition = index

    // restore expanded keys
    if ('expandedKeys' in this.props) {
      if (this._rawExpandedKeys) {
        res.rawExpandedKeys = [...this._rawExpandedKeys]
      }
      else {
        res.rawExpandedKeys = [...this.state.expandedKeys]
      }
    }

    this.props.onDrop(res)
    this._dropTrigger = true

    // reset
    this.dropPosition = null
    this.currDragOverKey = null

    this.setState({
      expandedKeys: res.rawExpandedKeys.concat([res.node.props.eventKey]),
    })


    return undefined

  }

  onExpand(treeNode) {
    const expanded = !treeNode.props.expanded
    const controlled = 'expandedKeys' in this.props
    const expandedKeys = [...this.state.expandedKeys]
    const index = expandedKeys.indexOf(treeNode.props.eventKey)
    if (expanded && index === -1) {
      expandedKeys.push(treeNode.props.eventKey)
    }
    else if (!expanded && index > -1) {
      expandedKeys.splice(index, 1)
    }
    if (!controlled) {
      this.setState({ expandedKeys })
    }
    this.props.onExpand(expandedKeys, { node: treeNode, expanded })

    // after data loaded, need set new expandedKeys
    if (expanded && this.props.loadData) {
      return this.props.loadData(treeNode).then(() => {
        if (!controlled) {
          this.setState({ expandedKeys })
        }
      })
    }

    return undefined
  }

  onCheck(treeNode) {
    let checked = !treeNode.props.checked
    if (treeNode.props.halfChecked) {
      checked = true
    }
    const key = treeNode.props.eventKey
    let checkedKeys = [...this.state.checkedKeys]
    const index = checkedKeys.indexOf(key)

    const newSt = {
      event: 'check',
      node: treeNode,
      checked,
    }

    if (this.props.checkStrictly && ('checkedKeys' in this.props)) {
      if (checked && index === -1) {
        checkedKeys.push(key)
      }
      if (!checked && index > -1) {
        checkedKeys.splice(index, 1)
      }
      newSt.checkedNodes = []
      loopAllChildren(this.props.children, (item, ind, pos, keyOrPos) => {
        if (checkedKeys.indexOf(keyOrPos) !== -1) {
          newSt.checkedNodes.push(item)
        }
      })
      this.props.onCheck(getStrictlyValue(checkedKeys, this.props.checkedKeys.halfChecked), newSt)
    }
    else {
      if (checked && index === -1) {
        this.treeNodesStates[treeNode.props.pos].checked = true
        const checkedPositions = []
        Object.keys(this.treeNodesStates).forEach(i => {
          if (this.treeNodesStates[i].checked) {
            checkedPositions.push(i)
          }
        })
        handleCheckState(this.treeNodesStates, filterParentPosition(checkedPositions), true)
      }
      if (!checked) {
        this.treeNodesStates[treeNode.props.pos].checked = false
        this.treeNodesStates[treeNode.props.pos].halfChecked = false
        handleCheckState(this.treeNodesStates, [treeNode.props.pos], false)
      }
      const checkKeys = getCheck(this.treeNodesStates)
      newSt.checkedNodes = checkKeys.checkedNodes
      newSt.checkedNodesPositions = checkKeys.checkedNodesPositions
      newSt.halfCheckedKeys = checkKeys.halfCheckedKeys
      this.checkKeys = checkKeys

      this._checkedKeys = checkedKeys = checkKeys.checkedKeys
      if (!('checkedKeys' in this.props)) {
        this.setState({
          checkedKeys,
        })
      }
      this.props.onCheck(checkedKeys, newSt)
    }
  }

  onSelect(treeNode) {
    const props = this.props
    const selectedKeys = [...this.state.selectedKeys]
    const eventKey = treeNode.props.eventKey
    const index = selectedKeys.indexOf(eventKey)
    let selected
    if (index !== -1) {
      selected = false
      selectedKeys.splice(index, 1)
    }
    else {
      selected = true
      if (!props.multiple) {
        selectedKeys.length = 0
      }
      selectedKeys.push(eventKey)
    }
    const selectedNodes = []
    if (selectedKeys.length) {
      loopAllChildren(this.props.children, (item) => {
        if (selectedKeys.indexOf(item.key) !== -1) {
          selectedNodes.push(item)
        }
      })
    }
    const newSt = {
      event: 'select',
      node: treeNode,
      selected,
      selectedNodes,
    }
    if (!('selectedKeys' in this.props)) {
      this.setState({
        selectedKeys,
      })
    }
    props.onSelect(selectedKeys, newSt)
  }

  onMouseEnter(e, treeNode) {
    this.props.onMouseEnter({ event: e, node: treeNode })
  }

  onMouseLeave(e, treeNode) {
    this.props.onMouseLeave({ event: e, node: treeNode })
  }

  onContextMenu(e, treeNode) {
    const selectedKeys = [...this.state.selectedKeys]
    const eventKey = treeNode.props.eventKey
    if (this.contextmenuKeys.indexOf(eventKey) === -1) {
      this.contextmenuKeys.push(eventKey)
    }
    this.contextmenuKeys.forEach((key) => {
      const index = selectedKeys.indexOf(key)
      if (index !== -1) {
        selectedKeys.splice(index, 1)
      }
    })
    if (selectedKeys.indexOf(eventKey) === -1) {
      selectedKeys.push(eventKey)
    }
    this.setState({
      selectedKeys,
    })
    this.props.onRightClick({ event: e, node: treeNode })
  }

  // all keyboard events callbacks run from here at first
  onKeyDown(e) {
    e.preventDefault()
  }

  getFilterExpandedKeys(props, expandKeyProp, expandAll) {
    const keys = props[expandKeyProp]
    if (!expandAll && !props.autoExpandParent) {
      return keys || []
    }
    const expandedPositionArr = []
    if (props.autoExpandParent) {
      loopAllChildren(props.children, (item, index, pos, newKey) => {
        if (keys.indexOf(newKey) > -1) {
          expandedPositionArr.push(pos)
        }
      })
    }
    const filterExpandedKeys = []
    loopAllChildren(props.children, (item, index, pos, newKey) => {
      if (expandAll) {
        filterExpandedKeys.push(newKey)
      }
      else if (props.autoExpandParent) {
        expandedPositionArr.forEach(p => {
          if (((p.split('-').length > pos.split('-').length &&
            isInclude(pos.split('-'), p.split('-'))) || pos === p)
            && filterExpandedKeys.indexOf(newKey) === -1) {
            filterExpandedKeys.push(newKey)
          }
        })
      }
    })
    return filterExpandedKeys.length ? filterExpandedKeys : keys
  }

  getDefaultExpandedKeys(props, willReceiveProps) {
    let expandedKeys = willReceiveProps ? undefined :
      this.getFilterExpandedKeys(props, 'defaultExpandedKeys',
        props.defaultExpandedKeys.length ? false : props.defaultExpandAll)
    if ('expandedKeys' in props) {
      expandedKeys = (props.autoExpandParent ?
        this.getFilterExpandedKeys(props, 'expandedKeys', false) :
        props.expandedKeys) || []
    }
    return expandedKeys
  }

  getDefaultCheckedKeys(props, willReceiveProps) {
    let checkedKeys = willReceiveProps ? undefined : props.defaultCheckedKeys
    if ('checkedKeys' in props) {
      checkedKeys = props.checkedKeys || []
      if (props.checkStrictly) {
        if (props.checkedKeys.checked) {
          checkedKeys = props.checkedKeys.checked
        }
        else if (!Array.isArray(props.checkedKeys)) {
          checkedKeys = []
        }
      }
    }
    return checkedKeys
  }

  getDefaultSelectedKeys(props, willReceiveProps) {
    const getKeys = (keys) => {
      if (props.multiple) {
        return [...keys]
      }
      if (keys.length) {
        return [keys[0]]
      }
      return keys
    }
    let selectedKeys = willReceiveProps ? undefined : getKeys(props.defaultSelectedKeys)
    if ('selectedKeys' in props) {
      selectedKeys = getKeys(props.selectedKeys)
    }
    return selectedKeys
  }

  getOpenTransitionName() {
    const props = this.props
    let transitionName = props.openTransitionName
    const animationName = props.openAnimation
    if (!transitionName && typeof animationName === 'string') {
      transitionName = `${props.prefixCls}-open-${animationName}`
    }
    return transitionName
  }

  getDragNodes(treeNode) {
    const dragNodesKeys = []
    const tPArr = treeNode.props.pos.split('-')
    loopAllChildren(this.props.children, (item, index, pos, newKey) => {
      const pArr = pos.split('-')
      if (treeNode.props.pos === pos || (tPArr.length < pArr.length && isInclude(tPArr, pArr))) {
        dragNodesKeys.push(newKey)
      }
    })
    return dragNodesKeys
  }

  startDragEnterTimeout(cb) {
    this.stopDragEnterTimeout()
    this.dragEnterTimeout = setTimeout(
      cb,
      this.props.dragExpandDelay || DRAG_EXPAND_DELAY
    )
  }

  stopDragEnterTimeout() {
    if (this.dragEnterTimeout) {
      clearTimeout(this.dragEnterTimeout)
    }
  }

  traverseToKey(key, fn) {
    loopAllChildren(this.props.children, (item, index, pos, newKey, siblingPos, parent) => {
      if (pos === key) {
        fn(item, index, pos, newKey, siblingPos, parent)
        return true
      }
      return false
    })
  }

  isOverGap(e, treeNode) {

    const offsetTop = (0, getOffset)(treeNode.selectHandle).top
    const offsetHeight = treeNode.selectHandle.offsetHeight
    const pageY = e.pageY
    const gapHeight = this.props.dropGapSize || DROP_GAP_SIZE

    this.dropPosition = 0

    if (pageY > (offsetTop + offsetHeight) - gapHeight) {
      this.dropPosition = 1
    }
    else if (pageY < offsetTop + gapHeight) {
      this.dropPosition = -1
    }

    return this.dropPosition
  }

  cacheExpandedKeys() {

    if (!this._rawExpandedKeys && ('expandedKeys' in this.props)) {
      this._rawExpandedKeys = [...this.state.expandedKeys]
    }

  }

  updateExpandedKeys(treeNode, val) {

    const key = treeNode.props.eventKey
    const expandedKeys = this.state.expandedKeys
    const expandedIndex = expandedKeys.indexOf(key)
    let exKeys

    // collapse
    if (expandedIndex > -1 && !val.expand) {
      exKeys = [...expandedKeys]
      exKeys.splice(expandedIndex, 1)
      return exKeys
    }

    // expand
    if (val.expand && expandedKeys.indexOf(key) === -1) {
      return expandedKeys.concat([key])
    }

    return null

  }

  filterTreeNode(treeNode) {
    const filterTreeNode = this.props.filterTreeNode
    if (typeof filterTreeNode !== 'function' || treeNode.props.disabled) {
      return false
    }
    return filterTreeNode.call(this, treeNode)
  }

  renderTreeNode(child, index, level = 0) {
    const pos = `${level}-${index}`
    const key = child.key || pos
    const state = this.state
    const props = this.props

    // prefer to child's own selectable property if passed
    let selectable = props.selectable

    // eslint-disable-next-line no-prototype-builtins
    if (child.props.hasOwnProperty('selectable')) {
      selectable = child.props.selectable
    }

    const cloneProps = {
      ref: `treeNode-${key}`,
      root: this,
      eventKey: key,
      pos,
      selectable,
      loadData: props.loadData,
      onMouseEnter: props.onMouseEnter,
      onMouseLeave: props.onMouseLeave,
      onRightClick: props.onRightClick,
      prefixCls: props.prefixCls,
      showLine: props.showLine,
      showIcon: props.showIcon,
      draggable: props.draggable,
      dragOver: state.dragOverNodeKey === key && this.dropPosition === 0,
      dragOverGapTop: state.dragOverNodeKey === key && this.dropPosition === -1,
      dragOverGapBottom: state.dragOverNodeKey === key && this.dropPosition === 1,
      dropped: state.droppedNodeKey && state.droppedNodeKey === key,
      _dropTrigger: this._dropTrigger,
      expanded: state.expandedKeys.indexOf(key) !== -1,
      selected: state.selectedKeys.indexOf(key) !== -1,
      openTransitionName: this.getOpenTransitionName(),
      openAnimation: props.openAnimation,
      filterTreeNode: this.filterTreeNode.bind(this),
    }
    if (props.checkable) {
      cloneProps.checkable = props.checkable
      if (props.checkStrictly) {
        if (state.checkedKeys) {
          cloneProps.checked = state.checkedKeys.indexOf(key) !== -1 || false
        }
        if (props.checkedKeys.halfChecked) {
          cloneProps.halfChecked = props.checkedKeys.halfChecked.indexOf(key) !== -1 || false
        }
        else {
          cloneProps.halfChecked = false
        }
      }
      else {
        if (this.checkedKeys) {
          cloneProps.checked = this.checkedKeys.indexOf(key) !== -1 || false
        }
        cloneProps.halfChecked = this.halfCheckedKeys.indexOf(key) !== -1
      }

      if (this.treeNodesStates[pos]) {
        Object.assign(cloneProps, this.treeNodesStates[pos].siblingPosition)
      }
    }
    return React.cloneElement(child, cloneProps)
  }

  render() {
    const props = this.props
    const domProps = {
      className: classNames(props.className, props.prefixCls),
      role: 'tree-node',
    }
    if (props.focusable) {
      domProps.tabIndex = '0'
      domProps.onKeyDown = this.onKeyDown
    }
    // console.log(this.state.expandedKeys, this._rawExpandedKeys, props.children);
    if (props.checkable && (this.checkedKeysChange || props.loadData)) {
      if (props.checkStrictly) {
        this.treeNodesStates = {}
        loopAllChildren(props.children, (item, index, pos, keyOrPos, siblingPosition) => {
          this.treeNodesStates[pos] = {
            siblingPosition,
          }
        })
      }
      else if (props._treeNodesStates) {
        this.treeNodesStates = props._treeNodesStates.treeNodesStates
        this.halfCheckedKeys = props._treeNodesStates.halfCheckedKeys
        this.checkedKeys = props._treeNodesStates.checkedKeys
      }
      else {
        const checkedKeys = this.state.checkedKeys
        let checkKeys
        if (!props.loadData && this.checkKeys && this._checkedKeys &&
          arraysEqual(this._checkedKeys, checkedKeys)) {
          // if checkedKeys the same as _checkedKeys from onCheck, use _checkedKeys.
          checkKeys = this.checkKeys
        }
        else {
          const checkedPositions = []
          this.treeNodesStates = {}
          loopAllChildren(props.children, (item, index, pos, keyOrPos, siblingPosition) => {
            this.treeNodesStates[pos] = {
              node: item,
              key: keyOrPos,
              checked: false,
              halfChecked: false,
              siblingPosition,
            }
            if (checkedKeys.indexOf(keyOrPos) !== -1) {
              this.treeNodesStates[pos].checked = true
              checkedPositions.push(pos)
            }
          })
          // if the parent node's key exists, it all children node will be checked
          handleCheckState(this.treeNodesStates, filterParentPosition(checkedPositions), true)
          checkKeys = getCheck(this.treeNodesStates)
        }
        this.halfCheckedKeys = checkKeys.halfCheckedKeys
        this.checkedKeys = checkKeys.checkedKeys
      }
    }

    /* eslint-disable */
    return (
      <ul {...domProps} unselectable ref="tree">
        {React.Children.map(props.children, this.renderTreeNode, this)}
      </ul>
    )
    /* eslint-enable */
  }
}

Tree.propTypes = {
  droppedNodeClassNameDelay: PropTypes.number,
  prefixCls: PropTypes.string,
  children: PropTypes.any,
  showLine: PropTypes.bool,
  showIcon: PropTypes.bool,
  selectable: PropTypes.bool,
  multiple: PropTypes.bool,
  checkable: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.node,
  ]),
  _treeNodesStates: PropTypes.object,
  checkStrictly: PropTypes.bool,
  draggable: PropTypes.bool,
  autoExpandParent: PropTypes.bool,
  defaultExpandAll: PropTypes.bool,
  defaultExpandedKeys: PropTypes.arrayOf(PropTypes.string),
  expandedKeys: PropTypes.arrayOf(PropTypes.string),
  defaultCheckedKeys: PropTypes.arrayOf(PropTypes.string),
  checkedKeys: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.object,
  ]),
  defaultSelectedKeys: PropTypes.arrayOf(PropTypes.string),
  selectedKeys: PropTypes.arrayOf(PropTypes.string),
  onExpand: PropTypes.func,
  onCheck: PropTypes.func,
  onSelect: PropTypes.func,
  loadData: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onRightClick: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragEnter: PropTypes.func,
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDrop: PropTypes.func,
  filterTreeNode: PropTypes.func,
  openTransitionName: PropTypes.string,
  openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  dragExpandDelay: PropTypes.number,
  dropGapSize: PropTypes.number,
  externalDragMode: PropTypes.object,
}

Tree.defaultProps = {
  dragExpandDelay: DRAG_EXPAND_DELAY,
  droppedNodeClassNameDelay: DROPPED_NODE_CLASS_NAME_DELAY,
  dropGapSize: DROP_GAP_SIZE,
  prefixCls: 'react-tree',
  showLine: false,
  showIcon: true,
  selectable: true,
  multiple: false,
  checkable: false,
  checkStrictly: false,
  draggable: false,
  autoExpandParent: true,
  defaultExpandAll: false,
  defaultExpandedKeys: [],
  defaultCheckedKeys: [],
  defaultSelectedKeys: [],
  onExpand: noop,
  onCheck: noop,
  onSelect: noop,
  onDragStart: noop,
  onDragEnd: noop,
  onDragEnter: noop,
  onDragOver: noop,
  onDragLeave: noop,
  onDrop: noop,
}

export default Tree