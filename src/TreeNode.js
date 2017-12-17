import React from 'react';
import classNames from 'classnames'
import PropTypes from 'prop-types';
import Animate from 'rc-animate'
import Spinner from './Spinner'


const defaultTitle = '---'

class TreeNode extends React.Component {
  constructor(props) {

    super(props);

    [
      'onExpand',
      'onCheck',
      'onContextMenu',
      'onMouseEnter',
      'onMouseLeave',
      'onDragStart',
      'onDragEnd',
      'onDragEnter',
      'onDragOver',
      'onDragLeave',
      'onDrop',
    ].forEach((m) => (this[m] = this[m].bind(this)))

    this.state = {
      dataLoading: false,
      dragNodeHighlight: false
    }

  }

  componentDidMount() {

    // eslint-disable-next-line no-underscore-dangle
    if (!this.props.root._treeNodeInstances) {
      // eslint-disable-next-line no-underscore-dangle
      this.props.root._treeNodeInstances = []
    }

    // eslint-disable-next-line no-underscore-dangle
    this.props.root._treeNodeInstances.push(this)

  }

  // shouldComponentUpdate(nextProps) {
  //   if (!nextProps.expanded) {
  //     return false;
  //   }
  //   return true;
  // }

  onCheck() {
    this.props.root.onCheck(this)
  }

  onSelect() {
    this.props.root.onSelect(this)
  }

  onMouseEnter(e) {
    e.preventDefault()
    this.props.root.onMouseEnter(e, this)
  }

  onMouseLeave(e) {
    e.preventDefault()
    this.props.root.onMouseLeave(e, this)
  }

  onContextMenu(e) {
    e.preventDefault()
    this.props.root.onContextMenu(e, this)
  }

  onDragStart(e) {
    // console.log('dragstart', this.props.eventKey, e);
    // e.preventDefault();
    e.stopPropagation()

    this.setState({
      dragNodeHighlight: true,
    })

    this.props.root.onDragStart(e, this)
    try {
      // ie throw error
      e.dataTransfer.setData('text/plain', 'firefox-need-it')
    }
    finally {
      // empty
    }
  }

  onDragEnd(e) {
    // console.log('dragend', this.props.eventKey, e)
    // e.preventDefault();
    e.stopPropagation()

    this.setState({
      dragNodeHighlight: false,
    })

    this.props.root.onEndStart(e, this)

  }

  onDragEnter(e) {
    // console.log('dragenter', this.props.eventKey, e);
    e.preventDefault()
    e.stopPropagation()
    this.props.root.onDragEnter(e, this)
  }

  onDragOver(e) {
    // console.log(this.props.eventKey, e);
    // todo disabled
    e.preventDefault()
    e.stopPropagation()
    this.props.root.onDragOver(e, this)
    return false
  }

  onDragLeave(e) {
    // console.log(this.props.eventKey, e);
    e.stopPropagation()
    this.props.root.onDragLeave(e, this)
  }

  onDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      dragNodeHighlight: false,
    })
    this.props.root.onDrop(e, this)
  }

  onExpand() {
    const callbackPromise = this.props.root.onExpand(this)
    if (callbackPromise && typeof callbackPromise === 'object') {
      const setLoading = (dataLoading) => {
        this.setState({ dataLoading })
      }
      setLoading(true)
      callbackPromise.then(() => {
        setLoading(false)
      }, () => {
        setLoading(false)
      })
    }
  }

  // keyboard event support
  onKeyDown(e) {
    e.preventDefault()
  }


  getListProps(props, filterCls) {

    const { prefixCls } = props

    const liProps = {}

    if (props.draggable) {
      liProps.onDragEnter = this.onDragEnter
      liProps.onDragOver = this.onDragOver
      liProps.onDragLeave = this.onDragLeave
      liProps.onDrop = this.onDrop
    }

    let disabledCls = ''
    let dragOverCls = ''
    if (props.disabled) {
      disabledCls = `${prefixCls}-treenode-disabled`
    }
    else if (props.dragOver) {
      dragOverCls = 'drag-over'
    }
    else if (props.dragOverGapTop) {
      dragOverCls = 'drag-over-gap-top'
    }
    else if (props.dragOverGapBottom) {
      dragOverCls = 'drag-over-gap-bottom'
    }

    liProps.className = classNames(
      props.className, disabledCls, dragOverCls, filterCls
    )

    return liProps

  }

  hasChildren() {
    const { items } = this.props
    return items &&
      (
        items.type === TreeNode ||
        (Array.isArray(items) &&
        items.every((item) => item.type === TreeNode))
      )
  }


  renderExpander(props, isExpandable, expandState) {

    const fn = isExpandable
      ? (this.renderNodeExpander)
      : (this.renderLeafExpander)

    return fn.call(this, props, expandState)

  }


  renderLeafExpander(props) {

    const { prefixCls } = props

    const expanderProps = {}

    const cls = {
      [`${prefixCls}-expander-noop`]: true,
    }

    expanderProps.className = classNames(cls)

    if (props.root && props.root.renderLeafExpander) {
      return props.root.renderLeafExpander({
        ...props,
        expanderProps
      })
    }

    return <span {...expanderProps} />
  }


  renderNodeExpander(props, expandState) {

    const prefixCls = props.prefixCls

    const expanderProps = {}
    const expanderCls = {
      [`${prefixCls}-expander`]: true,
    }

    expanderCls[`${prefixCls}-expander_${expandState}`] = true

    expanderProps.className = classNames(expanderCls)
    expanderProps.onClick = !props.disabled ? this.onExpand : null
    const depth = props.pos.split('-').length - 1

    if (props.root && this.props.root.renderNodeExpander) {
      return this.props.root.renderNodeExpander({
        ...{
          ...props,
          isRoot: props.pos === '0-0',
          depth
        },
        expandState,
        expanderProps
      })
    }

    return (<span
      style={{ left: `${(depth - 1) * 18}px` }}
      {...expanderProps}
    />)

  }


  renderCheckbox(props) {

    const prefixCls = props.prefixCls
    const checkboxCls = {
      [`${prefixCls}-checkbox`]: true,
    }
    if (props.checked) {
      checkboxCls[`${prefixCls}-checkbox-checked`] = true
    }
    else if (props.halfChecked) {
      checkboxCls[`${prefixCls}-checkbox-indeterminate`] = true
    }
    let customEle = null
    if (typeof props.checkable !== 'boolean') {
      customEle = props.checkable
    }
    if (props.disabled || props.disableCheckbox) {
      checkboxCls[`${prefixCls}-checkbox-disabled`] = true
      return (<span
        ref={(ref) => (this.checkbox = ref)}
        className={classNames(checkboxCls)}
      >{customEle}</span>)
    }
    return (
      <span
        ref={(ref) => (this.checkbox = ref)}
        className={classNames(checkboxCls)}
        onClick={this.onCheck}
      >{customEle}</span>
    )

  }

  renderChildren(props) {

    const renderFirst = this.renderFirst

    this.renderFirst = 1

    let transitionAppear = true

    if (!renderFirst && props.expanded) {
      transitionAppear = false
    }

    const children = props.items
    let newChildren = children

    if (this.hasChildren()) {

      const cls = {
        [`${props.prefixCls}-child-tree`]: true,
        [`${props.prefixCls}-child-tree-open`]: props.expanded,
      }

      const animProps = {}

      if (props.openTransitionName) {
        animProps.transitionName = props.openTransitionName
      }
      else if (typeof props.openAnimation === 'object') {
        animProps.animation = Object.assign({}, props.openAnimation)
        if (!transitionAppear) {
          delete animProps.animation.appear
        }
      }

      newChildren = (
        <Animate {...animProps}
          showProp="data-expanded"
          transitionAppear={transitionAppear}
          component=""
        >
          {!props.expanded ? null : <ul className={classNames(cls)} data-expanded={props.expanded}>
            {React.Children.map(children, (item, index) => (
              props.root.renderTreeNode(item, index, props.pos)
            ), props.root)}
          </ul>}
        </Animate>
      )

    }
    return newChildren
  }


  renderSelectHandle(props, selected) {

    const prefixCls = props.prefixCls
    // const iconEleCls = {
    //   [`${prefixCls}-iconEle`]: true,
    //   [`${prefixCls}-icon_loading`]: this.state.dataLoading,
    //   [`${prefixCls}-icon__${expandState}`]: true,
    // }

    const content = props.children || props.title

    const icon = (props.loadData && this.state.dataLoading)
      ? <Spinner /> /* <span className={classNames(iconEleCls)}></span>*/
      : null

    const domProps = {}

    if (!props.disabled) {

      if (selected) {
        domProps.className = `${prefixCls}-node-selected`
      }

      domProps.onClick = (/* e */) => {
        // e.preventDefault();
        if (props.selectable) {
          this.onSelect()
        }
        // not fire check event
        // if (props.checkable) {
        //   this.onCheck();
        // }
      }

      if (props.onRightClick) {
        domProps.onContextMenu = this.onContextMenu
      }

      if (props.onMouseEnter) {
        domProps.onMouseEnter = this.onMouseEnter
      }

      if (props.onMouseLeave) {
        domProps.onMouseLeave = this.onMouseLeave
      }

      if (props.draggable) {
        domProps.draggable = true
        domProps.onDragStart = this.onDragStart
        domProps.className = `${domProps.className || ''} draggable `
        domProps['aria-grabbed'] = true
      }

    }

    return (
      <span {...domProps}>
        {icon}{content}
      </span>
    )

  }


  render() {

    const props = this.props
    const padding = this.props.padding
    const basePadding = this.props.basePadding
    const prefixCls = props.prefixCls
    const expandState = props.expanded ? 'open' : 'close'


    const selected = props.selected // ||
      // eslint-disable-next-line no-underscore-dangle
      // hightlight the node while it's being dragged
      // (!props._dropTrigger &&
      // this.state.dragNodeHighlight)

    // show the expander if...
    // 1. the element has children
    let isExpandable = this.hasChildren() ||
    // or the element doesn't have children but a load function and the state
    // never changed to expanded yet (= not yet loaded)
    (!!props.loadData && expandState !== 'open')

    let newChildren = null

    // don't render the children if not expanded
    // and openAnimation is not set
    if (props.expanded || props.openAnimation) {

      newChildren = this.renderChildren(props)
      if (!newChildren || newChildren === props.items) {

        newChildren = null
        if (!props.loadData || props.isLeaf) {
          isExpandable = false
        }
      }

    }

    const filterCls = (props.filterTreeNode && props.filterTreeNode(this))
      ? 'filter-node'
      : ''
    const liProps = this.getListProps(props, filterCls)
    const depth = props.pos ? (props.pos.split('-').length - 1) : 0

    return (
      <li {...liProps} ref={(ref) => (this.li = ref)}>

        <div
          ref={(ref) => (this.selectHandle = ref)}
          className={classNames(
            `${prefixCls}-item-label `,
            {
              [`${prefixCls}-item-label-active`]: selected,
              [`${prefixCls}-item-dropped`]: props.dropped
            }
          )}
          style={{ paddingLeft: `${basePadding + (depth * padding)}px` }}
        >
          {this.renderExpander(props, isExpandable, expandState, selected)}

          {props.checkable ? this.renderCheckbox(props, selected) : null}

          {this.renderSelectHandle(this.props, selected)}
        </div>

        {newChildren}

      </li>
    )

  }
}

TreeNode.isTreeNode = 1

TreeNode.propTypes = {
  prefixCls: PropTypes.string,
  disabled: PropTypes.bool,
  disableCheckbox: PropTypes.bool,
  expanded: PropTypes.bool,
  isLeaf: PropTypes.bool,
  root: PropTypes.object,
  onSelect: PropTypes.func,
  items: PropTypes.node,
  padding: PropTypes.number,
  basePadding: PropTypes.number
}

TreeNode.defaultProps = {
  title: defaultTitle,
  padding: 18,
  basePadding: 0
}

export default TreeNode