'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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

var _rcAnimate = require('rc-animate');

var _rcAnimate2 = _interopRequireDefault(_rcAnimate);

var _Spinner = require('./Spinner');

var _Spinner2 = _interopRequireDefault(_Spinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultTitle = '---';

var TreeNode = function (_React$Component) {
  (0, _inherits3.default)(TreeNode, _React$Component);

  function TreeNode(props) {
    (0, _classCallCheck3.default)(this, TreeNode);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TreeNode).call(this, props));

    ['onExpand', 'onCheck', 'onContextMenu', 'onMouseEnter', 'onMouseLeave', 'onDragStart', 'onDragEnd', 'onDragEnter', 'onDragOver', 'onDragLeave', 'onDrop'].forEach(function (m) {
      return _this[m] = _this[m].bind(_this);
    });

    _this.state = {
      dataLoading: false,
      dragNodeHighlight: false
    };

    return _this;
  }

  (0, _createClass3.default)(TreeNode, [{
    key: 'componentDidMount',
    value: function componentDidMount() {

      // eslint-disable-next-line no-underscore-dangle
      if (!this.props.root._treeNodeInstances) {
        // eslint-disable-next-line no-underscore-dangle
        this.props.root._treeNodeInstances = [];
      }

      // eslint-disable-next-line no-underscore-dangle
      this.props.root._treeNodeInstances.push(this);
    }

    // shouldComponentUpdate(nextProps) {
    //   if (!nextProps.expanded) {
    //     return false;
    //   }
    //   return true;
    // }

  }, {
    key: 'onCheck',
    value: function onCheck() {
      this.props.root.onCheck(this);
    }
  }, {
    key: 'onSelect',
    value: function onSelect() {
      this.props.root.onSelect(this);
    }
  }, {
    key: 'onMouseEnter',
    value: function onMouseEnter(e) {
      e.preventDefault();
      this.props.root.onMouseEnter(e, this);
    }
  }, {
    key: 'onMouseLeave',
    value: function onMouseLeave(e) {
      e.preventDefault();
      this.props.root.onMouseLeave(e, this);
    }
  }, {
    key: 'onContextMenu',
    value: function onContextMenu(e) {
      e.preventDefault();
      this.props.root.onContextMenu(e, this);
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(e) {
      // console.log('dragstart', this.props.eventKey, e);
      // e.preventDefault();
      e.stopPropagation();

      this.setState({
        dragNodeHighlight: true
      });

      this.props.root.onDragStart(e, this);
      try {
        // ie throw error
        e.dataTransfer.setData('text/plain', 'firefox-need-it');
      } finally {
        // empty
      }
    }
  }, {
    key: 'onDragEnd',
    value: function onDragEnd(e) {
      // console.log('dragend', this.props.eventKey, e)
      // e.preventDefault();
      e.stopPropagation();

      this.setState({
        dragNodeHighlight: false
      });

      this.props.root.onEndStart(e, this);
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e) {
      // console.log('dragenter', this.props.eventKey, e);
      e.preventDefault();
      e.stopPropagation();
      this.props.root.onDragEnter(e, this);
    }
  }, {
    key: 'onDragOver',
    value: function onDragOver(e) {
      // console.log(this.props.eventKey, e);
      // todo disabled
      e.preventDefault();
      e.stopPropagation();
      this.props.root.onDragOver(e, this);
      return false;
    }
  }, {
    key: 'onDragLeave',
    value: function onDragLeave(e) {
      // console.log(this.props.eventKey, e);
      e.stopPropagation();
      this.props.root.onDragLeave(e, this);
    }
  }, {
    key: 'onDrop',
    value: function onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        dragNodeHighlight: false
      });
      this.props.root.onDrop(e, this);
    }
  }, {
    key: 'onExpand',
    value: function onExpand() {
      var _this2 = this;

      var callbackPromise = this.props.root.onExpand(this);
      if (callbackPromise && (typeof callbackPromise === 'undefined' ? 'undefined' : (0, _typeof3.default)(callbackPromise)) === 'object') {
        (function () {
          var setLoading = function setLoading(dataLoading) {
            _this2.setState({ dataLoading: dataLoading });
          };
          setLoading(true);
          callbackPromise.then(function () {
            setLoading(false);
          }, function () {
            setLoading(false);
          });
        })();
      }
    }

    // keyboard event support

  }, {
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      e.preventDefault();
    }
  }, {
    key: 'getListProps',
    value: function getListProps(props, filterCls) {
      var prefixCls = props.prefixCls;


      var liProps = {};

      if (props.draggable) {
        liProps.onDragEnter = this.onDragEnter;
        liProps.onDragOver = this.onDragOver;
        liProps.onDragLeave = this.onDragLeave;
        liProps.onDrop = this.onDrop;
      }

      var disabledCls = '';
      var dragOverCls = '';
      if (props.disabled) {
        disabledCls = prefixCls + '-treenode-disabled';
      } else if (props.dragOver) {
        dragOverCls = 'drag-over';
      } else if (props.dragOverGapTop) {
        dragOverCls = 'drag-over-gap-top';
      } else if (props.dragOverGapBottom) {
        dragOverCls = 'drag-over-gap-bottom';
      }

      liProps.className = (0, _classnames2.default)(props.className, disabledCls, dragOverCls, filterCls);

      return liProps;
    }
  }, {
    key: 'hasChildren',
    value: function hasChildren() {
      var items = this.props.items;

      return items && (items.type === TreeNode || Array.isArray(items) && items.every(function (item) {
        return item.type === TreeNode;
      }));
    }
  }, {
    key: 'renderExpander',
    value: function renderExpander(props, isExpandable, expandState) {

      var fn = isExpandable ? this.renderNodeExpander : this.renderLeafExpander;

      return fn.call(this, props, expandState);
    }
  }, {
    key: 'renderLeafExpander',
    value: function renderLeafExpander(props) {
      var prefixCls = props.prefixCls;


      var expanderProps = {};

      var cls = (0, _defineProperty3.default)({}, prefixCls + '-expander-noop', true);

      expanderProps.className = (0, _classnames2.default)(cls);

      if (props.root && props.root.renderLeafExpander) {
        return props.root.renderLeafExpander((0, _extends3.default)({}, props, {
          expanderProps: expanderProps
        }));
      }

      return _react2.default.createElement('span', expanderProps);
    }
  }, {
    key: 'renderNodeExpander',
    value: function renderNodeExpander(props, expandState) {

      var prefixCls = props.prefixCls;

      var expanderProps = {};
      var expanderCls = (0, _defineProperty3.default)({}, prefixCls + '-expander', true);

      expanderCls[prefixCls + '-expander_' + expandState] = true;

      expanderProps.className = (0, _classnames2.default)(expanderCls);
      expanderProps.onClick = !props.disabled ? this.onExpand : null;
      var depth = props.pos.split('-').length - 1;

      if (props.root && this.props.root.renderNodeExpander) {
        return this.props.root.renderNodeExpander((0, _extends3.default)((0, _extends3.default)({}, props, {
          isRoot: props.pos === '0-0',
          depth: depth
        }), {
          expandState: expandState,
          expanderProps: expanderProps
        }));
      }

      return _react2.default.createElement('span', (0, _extends3.default)({
        style: { left: (depth - 1) * 18 + 'px' }
      }, expanderProps));
    }
  }, {
    key: 'renderCheckbox',
    value: function renderCheckbox(props) {
      var _this3 = this;

      var prefixCls = props.prefixCls;
      var checkboxCls = (0, _defineProperty3.default)({}, prefixCls + '-checkbox', true);
      if (props.checked) {
        checkboxCls[prefixCls + '-checkbox-checked'] = true;
      } else if (props.halfChecked) {
        checkboxCls[prefixCls + '-checkbox-indeterminate'] = true;
      }
      var customEle = null;
      if (typeof props.checkable !== 'boolean') {
        customEle = props.checkable;
      }
      if (props.disabled || props.disableCheckbox) {
        checkboxCls[prefixCls + '-checkbox-disabled'] = true;
        return _react2.default.createElement(
          'span',
          {
            ref: function ref(_ref) {
              return _this3.checkbox = _ref;
            },
            className: (0, _classnames2.default)(checkboxCls)
          },
          customEle
        );
      }
      return _react2.default.createElement(
        'span',
        {
          ref: function ref(_ref2) {
            return _this3.checkbox = _ref2;
          },
          className: (0, _classnames2.default)(checkboxCls),
          onClick: this.onCheck
        },
        customEle
      );
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren(props) {

      var renderFirst = this.renderFirst;

      this.renderFirst = 1;

      var transitionAppear = true;

      if (!renderFirst && props.expanded) {
        transitionAppear = false;
      }

      var children = props.items;
      var newChildren = children;

      if (this.hasChildren()) {
        var _cls2;

        var cls = (_cls2 = {}, (0, _defineProperty3.default)(_cls2, props.prefixCls + '-child-tree', true), (0, _defineProperty3.default)(_cls2, props.prefixCls + '-child-tree-open', props.expanded), _cls2);

        var animProps = {};

        if (props.openTransitionName) {
          animProps.transitionName = props.openTransitionName;
        } else if ((0, _typeof3.default)(props.openAnimation) === 'object') {
          animProps.animation = (0, _assign2.default)({}, props.openAnimation);
          if (!transitionAppear) {
            delete animProps.animation.appear;
          }
        }

        newChildren = _react2.default.createElement(
          _rcAnimate2.default,
          (0, _extends3.default)({}, animProps, {
            showProp: 'data-expanded',
            transitionAppear: transitionAppear,
            component: ''
          }),
          !props.expanded ? null : _react2.default.createElement(
            'ul',
            { className: (0, _classnames2.default)(cls), 'data-expanded': props.expanded },
            _react2.default.Children.map(children, function (item, index) {
              return props.root.renderTreeNode(item, index, props.pos);
            }, props.root)
          )
        );
      }
      return newChildren;
    }
  }, {
    key: 'renderSelectHandle',
    value: function renderSelectHandle(props, selected) {
      var _this4 = this;

      var prefixCls = props.prefixCls;
      // const iconEleCls = {
      //   [`${prefixCls}-iconEle`]: true,
      //   [`${prefixCls}-icon_loading`]: this.state.dataLoading,
      //   [`${prefixCls}-icon__${expandState}`]: true,
      // }

      var content = props.children || props.title;

      var icon = props.loadData && this.state.dataLoading ?
      // <span className={classNames(iconEleCls)}></span>
      _react2.default.createElement(_Spinner2.default, null) : null;

      var domProps = {};

      if (!props.disabled) {

        if (selected) {
          domProps.className = prefixCls + '-node-selected';
        }

        domProps.onClick = function () /* e */{
          // e.preventDefault();
          if (props.selectable) {
            _this4.onSelect();
          }
          // not fire check event
          // if (props.checkable) {
          //   this.onCheck();
          // }
        };

        if (props.onRightClick) {
          domProps.onContextMenu = this.onContextMenu;
        }

        if (props.onMouseEnter) {
          domProps.onMouseEnter = this.onMouseEnter;
        }

        if (props.onMouseLeave) {
          domProps.onMouseLeave = this.onMouseLeave;
        }

        if (props.draggable) {
          domProps.draggable = true;
          domProps.onDragStart = this.onDragStart;
          domProps.className = (domProps.className || '') + ' draggable ';
          domProps['aria-grabbed'] = true;
        }
      }

      return _react2.default.createElement(
        'span',
        domProps,
        icon,
        content
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this,
          _classNames;

      var props = this.props;
      var padding = this.props.padding;
      var basePadding = this.props.basePadding;
      var prefixCls = props.prefixCls;
      var expandState = props.expanded ? 'open' : 'close';

      var selected = props.selected; // ||
      // eslint-disable-next-line no-underscore-dangle
      // hightlight the node while it's being dragged
      // (!props._dropTrigger &&
      // this.state.dragNodeHighlight)

      // show the expander if...
      // 1. the element has children
      var isExpandable = this.hasChildren() ||
      // or the element doesn't have children but a load function and the state
      // never changed to expanded yet (= not yet loaded)
      !!props.loadData && expandState !== 'open';

      var newChildren = null;

      // don't render the children if not expanded
      // and openAnimation is not set
      if (props.expanded || props.openAnimation) {

        newChildren = this.renderChildren(props);
        if (!newChildren || newChildren === props.items) {

          newChildren = null;
          if (!props.loadData || props.isLeaf) {
            isExpandable = false;
          }
        }
      }

      var filterCls = props.filterTreeNode && props.filterTreeNode(this) ? 'filter-node' : '';
      var liProps = this.getListProps(props, filterCls);
      var depth = props.pos ? props.pos.split('-').length - 1 : 0;

      return _react2.default.createElement(
        'li',
        (0, _extends3.default)({}, liProps, { ref: function ref(_ref4) {
            return _this5.li = _ref4;
          } }),
        _react2.default.createElement(
          'div',
          {
            ref: function ref(_ref3) {
              return _this5.selectHandle = _ref3;
            },
            className: (0, _classnames2.default)(prefixCls + '-item-label ', (_classNames = {}, (0, _defineProperty3.default)(_classNames, prefixCls + '-item-label-active', selected), (0, _defineProperty3.default)(_classNames, prefixCls + '-item-dropped', props.dropped), _classNames)),
            style: { paddingLeft: basePadding + depth * padding + 'px' }
          },
          this.renderExpander(props, isExpandable, expandState, selected),
          props.checkable ? this.renderCheckbox(props, selected) : null,
          this.renderSelectHandle(this.props, selected)
        ),
        newChildren
      );
    }
  }]);
  return TreeNode;
}(_react2.default.Component);

TreeNode.isTreeNode = 1;

TreeNode.propTypes = {
  prefixCls: _react.PropTypes.string,
  disabled: _react.PropTypes.bool,
  disableCheckbox: _react.PropTypes.bool,
  expanded: _react.PropTypes.bool,
  isLeaf: _react.PropTypes.bool,
  root: _react.PropTypes.object,
  onSelect: _react.PropTypes.func,
  items: _react.PropTypes.node,
  padding: _react.PropTypes.number,
  basePadding: _react.PropTypes.number
};

TreeNode.defaultProps = {
  title: defaultTitle,
  padding: 18,
  basePadding: 0
};

exports.default = TreeNode;
module.exports = exports['default'];