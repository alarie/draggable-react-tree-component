'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DRAG_EXPAND_DELAY = 500; /* eslint no-underscore-dangle: "off" */

var DROPPED_NODE_CLASS_NAME_DELAY = 1200;
var DROP_GAP_SIZE = 2;

function noop() {}

var Tree = function (_React$Component) {
  (0, _inherits3.default)(Tree, _React$Component);

  function Tree(props) {
    (0, _classCallCheck3.default)(this, Tree);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Tree.__proto__ || (0, _getPrototypeOf2.default)(Tree)).call(this, props));

    ['onKeyDown', 'onCheck'].forEach(function (m) {
      _this[m] = _this[m].bind(_this);
    });
    _this.contextmenuKeys = [];
    _this.checkedKeysChange = true;

    _this.dragEnterTimeout = null;

    _this.state = {
      expandedKeys: _this.getDefaultExpandedKeys(props),
      checkedKeys: _this.getDefaultCheckedKeys(props),
      selectedKeys: _this.getDefaultSelectedKeys(props),
      dragNodesKeys: '',
      dragOverNodeKey: '',
      dropNodeKey: '',
      droppedNodeKey: null
    };
    return _this;
  }

  (0, _createClass3.default)(Tree, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var expandedKeys = this.getDefaultExpandedKeys(nextProps, true);
      var checkedKeys = this.getDefaultCheckedKeys(nextProps, true);
      var selectedKeys = this.getDefaultSelectedKeys(nextProps, true);
      var st = {};

      if (nextProps.externalDragMode) {
        this.dragNodesKeys = nextProps.externalDragMode.externalDragNodeKeys;
        this.dragNode = nextProps.externalDragMode.externalDragNode;
      }

      if (expandedKeys) {
        st.expandedKeys = expandedKeys;
      }
      if (checkedKeys) {
        if (nextProps.checkedKeys === this.props.checkedKeys) {
          this.checkedKeysChange = false;
        } else {
          this.checkedKeysChange = true;
        }
        st.checkedKeys = checkedKeys;
      }
      if (selectedKeys) {
        st.selectedKeys = selectedKeys;
      }
      this.setState(st);
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(e, treeNode) {

      this.dragNode = treeNode;
      this.dragNodesKeys = this.getDragNodes(treeNode);

      var st = {
        dragNodesKeys: this.dragNodesKeys
      };

      this.cacheExpandedKeys();

      // collapse the currently dragged node
      var expandedKeys = this.updateExpandedKeys(treeNode, { expand: false });

      if (expandedKeys) {
        // Controlled expand, save and then reset
        st.expandedKeys = expandedKeys;
      }

      this.setState(st);

      this.props.onDragStart({
        event: e,
        node: treeNode,
        nodeKeys: this.dragNodesKeys
      });

      this._dropTrigger = false;
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e, treeNode) {
      var _this2 = this;

      var enterGap = this.isOverGap(e, treeNode);

      // dragging over itself
      if (this.dragNode && this.dragNode.props && this.dragNode.props.eventKey && treeNode.props && treeNode.props.eventKey && this.dragNode.props.eventKey === treeNode.props.eventKey && enterGap === 0) {
        this.setState({ dragOverNodeKey: '' });
        return;
      }

      var state = { dragOverNodeKey: treeNode.props.eventKey };

      var expandedKeys = this.state.expandedKeys;

      var updateState = function updateState() {

        expandedKeys = _this2.updateExpandedKeys(treeNode, { expand: true });

        if (expandedKeys) {
          _this2.cacheExpandedKeys();
          state.expandedKeys = expandedKeys;
        }
      };

      if (!enterGap) {
        this.currDragOverKey = treeNode.props.eventKey;
        this.startDragEnterTimeout(function () {
          updateState();
          _this2.setState(state);
        });
      } else {
        this.currDragOverKey = null;
      }

      this.setState(state);

      this.props.onDragEnter({
        event: e,
        node: treeNode,
        expandedKeys: expandedKeys && [].concat((0, _toConsumableArray3.default)(expandedKeys)) || [].concat((0, _toConsumableArray3.default)(this.state.expandedKeys))
      });
    }
  }, {
    key: 'onDragOver',
    value: function onDragOver(e, treeNode) {

      if (this.isOverGap(e, treeNode) || this.currDragOverKey !== treeNode.props.eventKey) {
        this.stopDragEnterTimeout(treeNode.props.eventKey);
        this.onDragEnter(e, treeNode);
      }

      this.props.onDragOver({ event: e, node: treeNode });
    }
  }, {
    key: 'onDragLeave',
    value: function onDragLeave(e, treeNode) {

      this.stopDragEnterTimeout(treeNode.props.eventKey);
      this.props.onDragLeave({ event: e, node: treeNode });
      this.setState({
        dragOverNodeKey: ''
      });
    }
  }, {
    key: 'onDragEnd',
    value: function onDragEnd(e, treeNode) {
      this.dropPosition = null;
      this.currDragOverKey = null;
      this.props.onDragEnd({ event: e, node: treeNode });
      this.setState({
        dragOverNodeKey: '',
        dropNodeKey: null
      });
    }
  }, {
    key: 'onDrop',
    value: function onDrop(e, treeNode) {
      var _this3 = this;

      var key = treeNode.props.eventKey;
      var droppedNodeKey = this.dragNode.props.eventKey;

      this.setState({
        dragOverNodeKey: '',
        dropNodeKey: key,
        droppedNodeKey: droppedNodeKey
      }, function () {
        setTimeout(function () {
          if (_this3.state.droppedNodeKey === droppedNodeKey) {
            _this3.setState({
              droppedNodeKey: null
            });
          }
        }, _this3.props.droppedNodeClassNameDelay || DROPPED_NODE_CLASS_NAME_DELAY);
      });

      if (this.dragNodesKeys.indexOf(key) > -1) {
        if (console.warn) {
          console.warn('Cannot drop node on one of it\'s children');
        }
        return false;
      }

      var posArr = treeNode.props.pos.split('-');
      var dragPosArr = this.dragNode.props.pos.split('-');

      var res = {
        event: e,
        node: treeNode,
        dragNode: this.dragNode,
        dragNodesKeys: [].concat((0, _toConsumableArray3.default)(this.dragNodesKeys)),
        dropPositionOnNode: this.dropPosition,
        dropPosition: Number(posArr.slice(-1)[0]),
        dragPosition: Number(dragPosArr.slice(-1)[0]),
        isSameLevel: posArr.slice(0, -1).join('-') === dragPosArr.slice(0, -1).join('-')
      };

      if (res.dropPositionOnNode !== 0) {
        res.dropToGap = true;
        var parentPos = posArr.slice(0, -1).join('-');

        this.traverseToKey(parentPos, function (item, index, pos, eventKey) {
          res.node.props = { eventKey: eventKey };
        });
      }

      // Adjust dropPosition
      var index = res.dropPosition + (res.dropPositionOnNode > 0 ? 1 : 0);

      if (res.isSameLevel && res.dragPosition < res.dropPosition) {
        index -= 1;
      }
      res.dropPosition = index;

      // restore expanded keys
      if ('expandedKeys' in this.props) {
        if (this._rawExpandedKeys) {
          res.rawExpandedKeys = [].concat((0, _toConsumableArray3.default)(this._rawExpandedKeys));
        } else {
          res.rawExpandedKeys = [].concat((0, _toConsumableArray3.default)(this.state.expandedKeys));
        }
      }

      this.props.onDrop(res);
      this._dropTrigger = true;

      // reset
      this.dropPosition = null;
      this.currDragOverKey = null;

      this.setState({
        expandedKeys: res.rawExpandedKeys.concat([res.node.props.eventKey])
      });

      return undefined;
    }
  }, {
    key: 'onExpand',
    value: function onExpand(treeNode) {
      var _this4 = this;

      var expanded = !treeNode.props.expanded;
      var controlled = 'expandedKeys' in this.props;
      var expandedKeys = [].concat((0, _toConsumableArray3.default)(this.state.expandedKeys));
      var index = expandedKeys.indexOf(treeNode.props.eventKey);
      if (expanded && index === -1) {
        expandedKeys.push(treeNode.props.eventKey);
      } else if (!expanded && index > -1) {
        expandedKeys.splice(index, 1);
      }
      if (!controlled) {
        this.setState({ expandedKeys: expandedKeys });
      }
      this.props.onExpand(expandedKeys, { node: treeNode, expanded: expanded });

      // after data loaded, need set new expandedKeys
      if (expanded && this.props.loadData) {
        return this.props.loadData(treeNode).then(function () {
          if (!controlled) {
            _this4.setState({ expandedKeys: expandedKeys });
          }
        });
      }

      return undefined;
    }
  }, {
    key: 'onCheck',
    value: function onCheck(treeNode) {
      var _this5 = this;

      var checked = !treeNode.props.checked;
      if (treeNode.props.halfChecked) {
        checked = true;
      }
      var key = treeNode.props.eventKey;
      var checkedKeys = [].concat((0, _toConsumableArray3.default)(this.state.checkedKeys));
      var index = checkedKeys.indexOf(key);

      var newSt = {
        event: 'check',
        node: treeNode,
        checked: checked
      };

      if (this.props.checkStrictly && 'checkedKeys' in this.props) {
        if (checked && index === -1) {
          checkedKeys.push(key);
        }
        if (!checked && index > -1) {
          checkedKeys.splice(index, 1);
        }
        newSt.checkedNodes = [];
        (0, _util.loopAllChildren)(this.props.children, function (item, ind, pos, keyOrPos) {
          if (checkedKeys.indexOf(keyOrPos) !== -1) {
            newSt.checkedNodes.push(item);
          }
        });
        this.props.onCheck((0, _util.getStrictlyValue)(checkedKeys, this.props.checkedKeys.halfChecked), newSt);
      } else {
        if (checked && index === -1) {
          this.treeNodesStates[treeNode.props.pos].checked = true;
          var checkedPositions = [];
          (0, _keys2.default)(this.treeNodesStates).forEach(function (i) {
            if (_this5.treeNodesStates[i].checked) {
              checkedPositions.push(i);
            }
          });
          (0, _util.handleCheckState)(this.treeNodesStates, (0, _util.filterParentPosition)(checkedPositions), true);
        }
        if (!checked) {
          this.treeNodesStates[treeNode.props.pos].checked = false;
          this.treeNodesStates[treeNode.props.pos].halfChecked = false;
          (0, _util.handleCheckState)(this.treeNodesStates, [treeNode.props.pos], false);
        }
        var checkKeys = (0, _util.getCheck)(this.treeNodesStates);
        newSt.checkedNodes = checkKeys.checkedNodes;
        newSt.checkedNodesPositions = checkKeys.checkedNodesPositions;
        newSt.halfCheckedKeys = checkKeys.halfCheckedKeys;
        this.checkKeys = checkKeys;

        this._checkedKeys = checkedKeys = checkKeys.checkedKeys;
        if (!('checkedKeys' in this.props)) {
          this.setState({
            checkedKeys: checkedKeys
          });
        }
        this.props.onCheck(checkedKeys, newSt);
      }
    }
  }, {
    key: 'onSelect',
    value: function onSelect(treeNode) {
      var props = this.props;
      var selectedKeys = [].concat((0, _toConsumableArray3.default)(this.state.selectedKeys));
      var eventKey = treeNode.props.eventKey;
      var index = selectedKeys.indexOf(eventKey);
      var selected = void 0;
      if (index !== -1) {
        selected = false;
        selectedKeys.splice(index, 1);
      } else {
        selected = true;
        if (!props.multiple) {
          selectedKeys.length = 0;
        }
        selectedKeys.push(eventKey);
      }
      var selectedNodes = [];
      if (selectedKeys.length) {
        (0, _util.loopAllChildren)(this.props.children, function (item) {
          if (selectedKeys.indexOf(item.key) !== -1) {
            selectedNodes.push(item);
          }
        });
      }
      var newSt = {
        event: 'select',
        node: treeNode,
        selected: selected,
        selectedNodes: selectedNodes
      };
      if (!('selectedKeys' in this.props)) {
        this.setState({
          selectedKeys: selectedKeys
        });
      }
      props.onSelect(selectedKeys, newSt);
    }
  }, {
    key: 'onMouseEnter',
    value: function onMouseEnter(e, treeNode) {
      this.props.onMouseEnter({ event: e, node: treeNode });
    }
  }, {
    key: 'onMouseLeave',
    value: function onMouseLeave(e, treeNode) {
      this.props.onMouseLeave({ event: e, node: treeNode });
    }
  }, {
    key: 'onContextMenu',
    value: function onContextMenu(e, treeNode) {
      var selectedKeys = [].concat((0, _toConsumableArray3.default)(this.state.selectedKeys));
      var eventKey = treeNode.props.eventKey;
      if (this.contextmenuKeys.indexOf(eventKey) === -1) {
        this.contextmenuKeys.push(eventKey);
      }
      this.contextmenuKeys.forEach(function (key) {
        var index = selectedKeys.indexOf(key);
        if (index !== -1) {
          selectedKeys.splice(index, 1);
        }
      });
      if (selectedKeys.indexOf(eventKey) === -1) {
        selectedKeys.push(eventKey);
      }
      this.setState({
        selectedKeys: selectedKeys
      });
      this.props.onRightClick({ event: e, node: treeNode });
    }

    // all keyboard events callbacks run from here at first

  }, {
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      e.preventDefault();
    }
  }, {
    key: 'getFilterExpandedKeys',
    value: function getFilterExpandedKeys(props, expandKeyProp, expandAll) {
      var keys = props[expandKeyProp];
      if (!expandAll && !props.autoExpandParent) {
        return keys || [];
      }
      var expandedPositionArr = [];
      if (props.autoExpandParent) {
        (0, _util.loopAllChildren)(props.children, function (item, index, pos, newKey) {
          if (keys.indexOf(newKey) > -1) {
            expandedPositionArr.push(pos);
          }
        });
      }
      var filterExpandedKeys = [];
      (0, _util.loopAllChildren)(props.children, function (item, index, pos, newKey) {
        if (expandAll) {
          filterExpandedKeys.push(newKey);
        } else if (props.autoExpandParent) {
          expandedPositionArr.forEach(function (p) {
            if ((p.split('-').length > pos.split('-').length && (0, _util.isInclude)(pos.split('-'), p.split('-')) || pos === p) && filterExpandedKeys.indexOf(newKey) === -1) {
              filterExpandedKeys.push(newKey);
            }
          });
        }
      });
      return filterExpandedKeys.length ? filterExpandedKeys : keys;
    }
  }, {
    key: 'getDefaultExpandedKeys',
    value: function getDefaultExpandedKeys(props, willReceiveProps) {
      var expandedKeys = willReceiveProps ? undefined : this.getFilterExpandedKeys(props, 'defaultExpandedKeys', props.defaultExpandedKeys.length ? false : props.defaultExpandAll);
      if ('expandedKeys' in props) {
        expandedKeys = (props.autoExpandParent ? this.getFilterExpandedKeys(props, 'expandedKeys', false) : props.expandedKeys) || [];
      }
      return expandedKeys;
    }
  }, {
    key: 'getDefaultCheckedKeys',
    value: function getDefaultCheckedKeys(props, willReceiveProps) {
      var checkedKeys = willReceiveProps ? undefined : props.defaultCheckedKeys;
      if ('checkedKeys' in props) {
        checkedKeys = props.checkedKeys || [];
        if (props.checkStrictly) {
          if (props.checkedKeys.checked) {
            checkedKeys = props.checkedKeys.checked;
          } else if (!Array.isArray(props.checkedKeys)) {
            checkedKeys = [];
          }
        }
      }
      return checkedKeys;
    }
  }, {
    key: 'getDefaultSelectedKeys',
    value: function getDefaultSelectedKeys(props, willReceiveProps) {
      var getKeys = function getKeys(keys) {
        if (props.multiple) {
          return [].concat((0, _toConsumableArray3.default)(keys));
        }
        if (keys.length) {
          return [keys[0]];
        }
        return keys;
      };
      var selectedKeys = willReceiveProps ? undefined : getKeys(props.defaultSelectedKeys);
      if ('selectedKeys' in props) {
        selectedKeys = getKeys(props.selectedKeys);
      }
      return selectedKeys;
    }
  }, {
    key: 'getOpenTransitionName',
    value: function getOpenTransitionName() {
      var props = this.props;
      var transitionName = props.openTransitionName;
      var animationName = props.openAnimation;
      if (!transitionName && typeof animationName === 'string') {
        transitionName = props.prefixCls + '-open-' + animationName;
      }
      return transitionName;
    }
  }, {
    key: 'getDragNodes',
    value: function getDragNodes(treeNode) {
      var dragNodesKeys = [];
      var tPArr = treeNode.props.pos.split('-');
      (0, _util.loopAllChildren)(this.props.children, function (item, index, pos, newKey) {
        var pArr = pos.split('-');
        if (treeNode.props.pos === pos || tPArr.length < pArr.length && (0, _util.isInclude)(tPArr, pArr)) {
          dragNodesKeys.push(newKey);
        }
      });
      return dragNodesKeys;
    }
  }, {
    key: 'startDragEnterTimeout',
    value: function startDragEnterTimeout(cb) {
      this.stopDragEnterTimeout();
      this.dragEnterTimeout = setTimeout(cb, this.props.dragExpandDelay || DRAG_EXPAND_DELAY);
    }
  }, {
    key: 'stopDragEnterTimeout',
    value: function stopDragEnterTimeout() {
      if (this.dragEnterTimeout) {
        clearTimeout(this.dragEnterTimeout);
      }
    }
  }, {
    key: 'traverseToKey',
    value: function traverseToKey(key, fn) {
      (0, _util.loopAllChildren)(this.props.children, function (item, index, pos, newKey, siblingPos, parent) {
        if (pos === key) {
          fn(item, index, pos, newKey, siblingPos, parent);
          return true;
        }
        return false;
      });
    }
  }, {
    key: 'isOverGap',
    value: function isOverGap(e, treeNode) {

      var offsetTop = (0, _util.getOffset)(treeNode.selectHandle).top;
      var offsetHeight = treeNode.selectHandle.offsetHeight;
      var pageY = e.pageY;
      var gapHeight = this.props.dropGapSize || DROP_GAP_SIZE;

      this.dropPosition = 0;

      if (pageY > offsetTop + offsetHeight - gapHeight) {
        this.dropPosition = 1;
      } else if (pageY < offsetTop + gapHeight) {
        this.dropPosition = -1;
      }

      return this.dropPosition;
    }
  }, {
    key: 'cacheExpandedKeys',
    value: function cacheExpandedKeys() {

      if (!this._rawExpandedKeys && 'expandedKeys' in this.props) {
        this._rawExpandedKeys = [].concat((0, _toConsumableArray3.default)(this.state.expandedKeys));
      }
    }
  }, {
    key: 'updateExpandedKeys',
    value: function updateExpandedKeys(treeNode, val) {

      var key = treeNode.props.eventKey;
      var expandedKeys = this.state.expandedKeys;
      var expandedIndex = expandedKeys.indexOf(key);
      var exKeys = void 0;

      // collapse
      if (expandedIndex > -1 && !val.expand) {
        exKeys = [].concat((0, _toConsumableArray3.default)(expandedKeys));
        exKeys.splice(expandedIndex, 1);
        return exKeys;
      }

      // expand
      if (val.expand && expandedKeys.indexOf(key) === -1) {
        expandedKeys = expandedKeys.concat([key]);
        this.props.onExpand(expandedKeys, { node: treeNode });
        return expandedKeys;
      }

      return null;
    }
  }, {
    key: 'filterTreeNode',
    value: function filterTreeNode(treeNode) {
      var filterTreeNode = this.props.filterTreeNode;
      if (typeof filterTreeNode !== 'function' || treeNode.props.disabled) {
        return false;
      }
      return filterTreeNode.call(this, treeNode);
    }
  }, {
    key: 'renderTreeNode',
    value: function renderTreeNode(child, index) {
      var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var pos = level + '-' + index;
      var key = child.key || pos;
      var state = this.state;
      var props = this.props;

      // prefer to child's own selectable property if passed
      var selectable = props.selectable;

      // eslint-disable-next-line no-prototype-builtins
      if (child.props.hasOwnProperty('selectable')) {
        selectable = child.props.selectable;
      }

      var cloneProps = {
        ref: 'treeNode-' + key,
        root: this,
        eventKey: key,
        pos: pos,
        selectable: selectable,
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
        filterTreeNode: this.filterTreeNode.bind(this)
      };
      if (props.checkable) {
        cloneProps.checkable = props.checkable;
        if (props.checkStrictly) {
          if (state.checkedKeys) {
            cloneProps.checked = state.checkedKeys.indexOf(key) !== -1 || false;
          }
          if (props.checkedKeys.halfChecked) {
            cloneProps.halfChecked = props.checkedKeys.halfChecked.indexOf(key) !== -1 || false;
          } else {
            cloneProps.halfChecked = false;
          }
        } else {
          if (this.checkedKeys) {
            cloneProps.checked = this.checkedKeys.indexOf(key) !== -1 || false;
          }
          cloneProps.halfChecked = this.halfCheckedKeys.indexOf(key) !== -1;
        }

        if (this.treeNodesStates[pos]) {
          (0, _assign2.default)(cloneProps, this.treeNodesStates[pos].siblingPosition);
        }
      }
      return _react2.default.cloneElement(child, cloneProps);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this6 = this;

      var props = this.props;
      var domProps = {
        className: (0, _classnames2.default)(props.className, props.prefixCls),
        role: 'tree-node'
      };
      if (props.focusable) {
        domProps.tabIndex = '0';
        domProps.onKeyDown = this.onKeyDown;
      }
      // console.log(this.state.expandedKeys, this._rawExpandedKeys, props.children);
      if (props.checkable && (this.checkedKeysChange || props.loadData)) {
        if (props.checkStrictly) {
          this.treeNodesStates = {};
          (0, _util.loopAllChildren)(props.children, function (item, index, pos, keyOrPos, siblingPosition) {
            _this6.treeNodesStates[pos] = {
              siblingPosition: siblingPosition
            };
          });
        } else if (props._treeNodesStates) {
          this.treeNodesStates = props._treeNodesStates.treeNodesStates;
          this.halfCheckedKeys = props._treeNodesStates.halfCheckedKeys;
          this.checkedKeys = props._treeNodesStates.checkedKeys;
        } else {
          var checkedKeys = this.state.checkedKeys;
          var checkKeys = void 0;
          if (!props.loadData && this.checkKeys && this._checkedKeys && (0, _util.arraysEqual)(this._checkedKeys, checkedKeys)) {
            // if checkedKeys the same as _checkedKeys from onCheck, use _checkedKeys.
            checkKeys = this.checkKeys;
          } else {
            var checkedPositions = [];
            this.treeNodesStates = {};
            (0, _util.loopAllChildren)(props.children, function (item, index, pos, keyOrPos, siblingPosition) {
              _this6.treeNodesStates[pos] = {
                node: item,
                key: keyOrPos,
                checked: false,
                halfChecked: false,
                siblingPosition: siblingPosition
              };
              if (checkedKeys.indexOf(keyOrPos) !== -1) {
                _this6.treeNodesStates[pos].checked = true;
                checkedPositions.push(pos);
              }
            });
            // if the parent node's key exists, it all children node will be checked
            (0, _util.handleCheckState)(this.treeNodesStates, (0, _util.filterParentPosition)(checkedPositions), true);
            checkKeys = (0, _util.getCheck)(this.treeNodesStates);
          }
          this.halfCheckedKeys = checkKeys.halfCheckedKeys;
          this.checkedKeys = checkKeys.checkedKeys;
        }
      }

      /* eslint-disable */
      return _react2.default.createElement(
        'ul',
        (0, _extends3.default)({}, domProps, { unselectable: true, ref: 'tree' }),
        _react2.default.Children.map(props.children, this.renderTreeNode, this)
      );
      /* eslint-enable */
    }
  }]);
  return Tree;
}(_react2.default.Component);

Tree.propTypes = {
  droppedNodeClassNameDelay: _react.PropTypes.number,
  prefixCls: _react.PropTypes.string,
  children: _react.PropTypes.any,
  showLine: _react.PropTypes.bool,
  showIcon: _react.PropTypes.bool,
  selectable: _react.PropTypes.bool,
  multiple: _react.PropTypes.bool,
  checkable: _react.PropTypes.oneOfType([_react.PropTypes.bool, _react.PropTypes.node]),
  _treeNodesStates: _react.PropTypes.object,
  checkStrictly: _react.PropTypes.bool,
  draggable: _react.PropTypes.bool,
  autoExpandParent: _react.PropTypes.bool,
  defaultExpandAll: _react.PropTypes.bool,
  defaultExpandedKeys: _react.PropTypes.arrayOf(_react.PropTypes.string),
  expandedKeys: _react.PropTypes.arrayOf(_react.PropTypes.string),
  defaultCheckedKeys: _react.PropTypes.arrayOf(_react.PropTypes.string),
  checkedKeys: _react.PropTypes.oneOfType([_react.PropTypes.arrayOf(_react.PropTypes.string), _react.PropTypes.object]),
  defaultSelectedKeys: _react.PropTypes.arrayOf(_react.PropTypes.string),
  selectedKeys: _react.PropTypes.arrayOf(_react.PropTypes.string),
  onExpand: _react.PropTypes.func,
  onCheck: _react.PropTypes.func,
  onSelect: _react.PropTypes.func,
  loadData: _react.PropTypes.func,
  onMouseEnter: _react.PropTypes.func,
  onMouseLeave: _react.PropTypes.func,
  onRightClick: _react.PropTypes.func,
  onDragStart: _react.PropTypes.func,
  onDragEnd: _react.PropTypes.func,
  onDragEnter: _react.PropTypes.func,
  onDragOver: _react.PropTypes.func,
  onDragLeave: _react.PropTypes.func,
  onDrop: _react.PropTypes.func,
  filterTreeNode: _react.PropTypes.func,
  openTransitionName: _react.PropTypes.string,
  openAnimation: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.object]),
  dragExpandDelay: _react.PropTypes.number,
  dropGapSize: _react.PropTypes.number,
  externalDragMode: _react.PropTypes.object
};

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
  onDrop: noop
};

exports.default = Tree;
module.exports = exports['default'];