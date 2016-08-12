'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function noop() {}

var Tree = function (_React$Component) {
  (0, _inherits3.default)(Tree, _React$Component);

  function Tree(props) {
    (0, _classCallCheck3.default)(this, Tree);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Tree).call(this, props));

    ['onKeyDown', 'onCheck'].forEach(function (m) {
      _this[m] = _this[m].bind(_this);
    });
    _this.contextmenuKeys = [];
    _this.checkedKeysChange = true;

    _this.state = {
      expandedKeys: _this.getDefaultExpandedKeys(props),
      checkedKeys: _this.getDefaultCheckedKeys(props),
      selectedKeys: _this.getDefaultSelectedKeys(props),
      dragNodesKeys: '',
      dragOverNodeKey: '',
      dropNodeKey: ''
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
      var expandedKeys = this.getExpandedKeys(treeNode, false);
      if (expandedKeys) {
        // Controlled expand, save and then reset
        this.getRawExpandedKeys();
        st.expandedKeys = expandedKeys;
      }
      this.setState(st);
      this.props.onDragStart({
        event: e,
        node: treeNode
      });
      this._dropTrigger = false;
    }
  }, {
    key: 'onDragEnterGap',
    value: function onDragEnterGap(e, treeNode) {
      var offsetTop = (0, _util.getOffset)(treeNode.selectHandle).top;
      var offsetHeight = treeNode.selectHandle.offsetHeight;
      var pageY = e.pageY;
      var gapHeight = 2;
      if (pageY > offsetTop + offsetHeight - gapHeight) {
        this.dropPosition = 1;
        return 1;
      }
      if (pageY < offsetTop + gapHeight) {
        this.dropPosition = -1;
        return -1;
      }
      this.dropPosition = 0;
      return 0;
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e, treeNode) {

      var enterGap = this.onDragEnterGap(e, treeNode);

      if (this.dragNode.props.eventKey === treeNode.props.eventKey && enterGap === 0) {
        this.setState({
          dragOverNodeKey: ''
        });
        return;
      }

      var st = {
        dragOverNodeKey: treeNode.props.eventKey
      };

      var expandedKeys = this.getExpandedKeys(treeNode, true);

      if (expandedKeys) {
        this.getRawExpandedKeys();
        st.expandedKeys = expandedKeys;
      }

      this.setState(st);

      this.props.onDragEnter({
        event: e,
        node: treeNode,
        expandedKeys: expandedKeys && [].concat((0, _toConsumableArray3.default)(expandedKeys)) || [].concat((0, _toConsumableArray3.default)(this.state.expandedKeys))
      });
    }
  }, {
    key: 'onDragOver',
    value: function onDragOver(e, treeNode) {
      this.props.onDragOver({ event: e, node: treeNode });
    }
  }, {
    key: 'onDragLeave',
    value: function onDragLeave(e, treeNode) {
      this.props.onDragLeave({ event: e, node: treeNode });
    }
  }, {
    key: 'onDrop',
    value: function onDrop(e, treeNode) {
      var key = treeNode.props.eventKey;
      this.setState({
        dragOverNodeKey: '',
        dropNodeKey: key
      });
      if (this.dragNodesKeys.indexOf(key) > -1) {
        if (console.warn) {
          console.warn('can not drop to dragNode(include it\'s children node)');
        }
        return false;
      }

      var posArr = treeNode.props.pos.split('-');
      var res = {
        event: e,
        node: treeNode,
        dragNode: this.dragNode,
        dragNodesKeys: [].concat((0, _toConsumableArray3.default)(this.dragNodesKeys)),
        dropPosition: this.dropPosition + Number(posArr[posArr.length - 1])
      };
      if (this.dropPosition !== 0) {
        res.dropToGap = true;
      }
      if ('expandedKeys' in this.props) {
        res.rawExpandedKeys = [].concat((0, _toConsumableArray3.default)(this._rawExpandedKeys)) || [].concat((0, _toConsumableArray3.default)(this.state.expandedKeys));
      }
      this.props.onDrop(res);
      this._dropTrigger = true;
    }
  }, {
    key: 'onExpand',
    value: function onExpand(treeNode) {
      var _this2 = this;

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
            _this2.setState({ expandedKeys: expandedKeys });
          }
        });
      }
    }
  }, {
    key: 'onCheck',
    value: function onCheck(treeNode) {
      var _this3 = this;

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
          (function () {
            _this3.treeNodesStates[treeNode.props.pos].checked = true;
            var checkedPositions = [];
            (0, _keys2.default)(_this3.treeNodesStates).forEach(function (i) {
              if (_this3.treeNodesStates[i].checked) {
                checkedPositions.push(i);
              }
            });
            (0, _util.handleCheckState)(_this3.treeNodesStates, (0, _util.filterParentPosition)(checkedPositions), true);
          })();
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
    key: 'getRawExpandedKeys',
    value: function getRawExpandedKeys() {
      if (!this._rawExpandedKeys && 'expandedKeys' in this.props) {
        this._rawExpandedKeys = [].concat((0, _toConsumableArray3.default)(this.state.expandedKeys));
      }
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
    key: 'getExpandedKeys',
    value: function getExpandedKeys(treeNode, expand) {
      var key = treeNode.props.eventKey;
      var expandedKeys = this.state.expandedKeys;
      var expandedIndex = expandedKeys.indexOf(key);
      var exKeys = void 0;
      if (expandedIndex > -1 && !expand) {
        exKeys = [].concat((0, _toConsumableArray3.default)(expandedKeys));
        exKeys.splice(expandedIndex, 1);
        return exKeys;
      }
      if (expand && expandedKeys.indexOf(key) === -1) {
        return expandedKeys.concat([key]);
      }
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
      var level = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

      var pos = level + '-' + index;
      var key = child.key || pos;
      var state = this.state;
      var props = this.props;

      // prefer to child's own selectable property if passed
      var selectable = props.selectable;
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
          (0, _objectAssign2.default)(cloneProps, this.treeNodesStates[pos].siblingPosition);
        }
      }
      return _react2.default.cloneElement(child, cloneProps);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

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
            _this4.treeNodesStates[pos] = {
              siblingPosition: siblingPosition
            };
          });
        } else if (props._treeNodesStates) {
          this.treeNodesStates = props._treeNodesStates.treeNodesStates;
          this.halfCheckedKeys = props._treeNodesStates.halfCheckedKeys;
          this.checkedKeys = props._treeNodesStates.checkedKeys;
        } else {
          (function () {
            var checkedKeys = _this4.state.checkedKeys;
            var checkKeys = void 0;
            if (!props.loadData && _this4.checkKeys && _this4._checkedKeys && (0, _util.arraysEqual)(_this4._checkedKeys, checkedKeys)) {
              // if checkedKeys the same as _checkedKeys from onCheck, use _checkedKeys.
              checkKeys = _this4.checkKeys;
            } else {
              (function () {
                var checkedPositions = [];
                _this4.treeNodesStates = {};
                (0, _util.loopAllChildren)(props.children, function (item, index, pos, keyOrPos, siblingPosition) {
                  _this4.treeNodesStates[pos] = {
                    node: item,
                    key: keyOrPos,
                    checked: false,
                    halfChecked: false,
                    siblingPosition: siblingPosition
                  };
                  if (checkedKeys.indexOf(keyOrPos) !== -1) {
                    _this4.treeNodesStates[pos].checked = true;
                    checkedPositions.push(pos);
                  }
                });
                // if the parent node's key exists, it all children node will be checked
                (0, _util.handleCheckState)(_this4.treeNodesStates, (0, _util.filterParentPosition)(checkedPositions), true);
                checkKeys = (0, _util.getCheck)(_this4.treeNodesStates);
              })();
            }
            _this4.halfCheckedKeys = checkKeys.halfCheckedKeys;
            _this4.checkedKeys = checkKeys.checkedKeys;
          })();
        }
      }

      return _react2.default.createElement(
        'ul',
        (0, _extends3.default)({}, domProps, { unselectable: true, ref: 'tree' }),
        _react2.default.Children.map(props.children, this.renderTreeNode, this)
      );
    }
  }]);
  return Tree;
}(_react2.default.Component);

Tree.propTypes = {
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
  onDragEnter: _react.PropTypes.func,
  onDragOver: _react.PropTypes.func,
  onDragLeave: _react.PropTypes.func,
  onDrop: _react.PropTypes.func,
  filterTreeNode: _react.PropTypes.func,
  openTransitionName: _react.PropTypes.string,
  openAnimation: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.object])
};

Tree.defaultProps = {
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
  onDragEnter: noop,
  onDragOver: noop,
  onDragLeave: noop,
  onDrop: noop
};

exports.default = Tree;
module.exports = exports['default'];