'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = undefined

const _react = require('react')

const _react2 = _interopRequireDefault(_react)

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj } }

const Spinner = function Spinner() {
  return _react2.default.createElement(
    'div',
    { className: 'sk-wave' },
    _react2.default.createElement('div', { className: 'sk-rect sk-rect1' }),
    _react2.default.createElement('div', { className: 'sk-rect sk-rect2' }),
    _react2.default.createElement('div', { className: 'sk-rect sk-rect3' }),
    _react2.default.createElement('div', { className: 'sk-rect sk-rect4' }),
    _react2.default.createElement('div', { className: 'sk-rect sk-rect5' })
  )
}

exports.default = Spinner
module.exports = exports['default']
