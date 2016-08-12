# react-tree-component
---

A (trying to be) lightweight tree component for react.

**[See examples](http://alarie.github.io/react-tree-component/#examples)**


# Fork info

This repository is a fork of [rc-tree]( https://github.com/react-component/tree).

**It changes several issues:**

- allows passing of tree-nodes as children of the `<TreeNode />` component
- allows to use links as children
- removes much of the css/images and leaves it to the user to provide the proper for the *expand* and *folder* icon


**Future plans**

- remove the checkboxes from the view and provide them as plugin

## Code Samples

### Passing nodes

  ```javascript

  return data.map((item) => {

    return <TreeNode
      key={item.key}
      items={
        (item.children && item.children.length)
        ? loop(item.children)
        : null
      }>{item.title}</TreeNode>}

  })
  ```

### Using Links
  In *rc-tree* this was not possible because the `<TreeNode />` Element container was a
  link itself. Thus you would have ended with a link inside of a link. Now this is possible.

  > **NOTE for when you are using `draggable` with links:**
  > Links are draggable by default. So you would end up with dragging a rather ugly link preview. To get around this you have to disable the draggability of links. Setting `draggable={false}` should do the trick. This way the tree plays nicely with libs like react-router:

  ```javascript
  return data.map((item) => {

    return (<TreeNode
        ...
      >
        <Link
          to={...}
          draggable={false}
          style={{
            paddingLeft: `${(item.depth - 1) * 18}px`
          }}
        >
          {item.name}
        </Link>
      </TreeNode>)

  })
  ```


<!-- ## install

[![rc-tree](https://nodei.co/npm/react-tree-component.png)](https://npmjs.org/package/react-tree-component) -->

## API

### Tree props

| name     | description    | type     | default      |
|----------|----------------|----------|--------------|
|className | additional css class of root dom node | String | '' |
|prefixCls | prefix class | String | '' |
|showLine | whether show line | bool | true |
|showIcon | whether show icon | bool | true |
|selectable | whether can be selected | bool | true |
|multiple | whether multiple select | bool | false |
|checkable | whether support checked | bool/React Node | false |
|defaultExpandAll | expand all treeNodes | bool | false |
|defaultExpandedKeys | expand specific treeNodes | String[] | - |
|expandedKeys | Controlled expand specific treeNodes | String[] | - |
|autoExpandParent | whether auto expand parent treeNodes | bool | true |
|defaultCheckedKeys | default checked treeNodes | String[] | [] |
|checkedKeys | Controlled checked treeNodes(After setting, defaultCheckedKeys will not work). Note: parent and children nodes are associated, if the parent node's key exists, it all children node will be checked, and vice versa. When set checkable and checkStrictly, it should be an object, which contains checked array and halfChecked array. | String[]/{checked:Array<String>,halfChecked:Array<String>} | [] |
|checkStrictly| check node precisely, parent and children nodes are not associated| bool | false |
|defaultSelectedKeys | default selected treeNodes | String[] | [] |
|selectedKeys | Controlled selected treeNodes(After setting, defaultSelectedKeys will not work) | String[] | [] |
|onExpand | fire on treeNode expand or not | function(expandedKeys, {expanded: bool, node}) | - |
|onCheck | click the treeNode/checkbox to fire | function(checkedKeys, e:{checked: bool, checkedNodes, node, event}) | - |
|onSelect | click the treeNode to fire | function(selectedKeys, e:{selected: bool, selectedNodes, node, event}) | - |
|filterTreeNode | filter some treeNodes as you need. it should return true | function(node) | - |
|loadData | load data asynchronously and the return value should be a promise | function(node) | - |
|onRightClick | select current treeNode and show customized contextmenu | function({event,node}) | - |
|onMouseEnter | call when mouse enter a treeNode | function({event,node}) | - |
|onMouseLeave | call when mouse leave a treeNode | function({event,node}) | - |
|draggable | whether can drag treeNode. (drag events are not supported in Internet Explorer 8 and earlier versions or Safari 5.1 and earlier versions.) | bool | false |
|onDragStart | it execs when fire the tree's dragstart event | function({event,node}) | - |
|onDragEnter | it execs when fire the tree's dragenter event | function({event,node,expandedKeys}) | - |
|onDragOver | it execs when fire the tree's dragover event | function({event,node}) | - |
|onDragLeave | it execs when fire the tree's dragleave event | function({event,node}) | - |
|onDrop | it execs when fire the tree's drop event | function({event, node, dragNode, dragNodesKeys}) | - |

### TreeNode props

| name     | description    | type     | default      |
|----------|----------------|----------|--------------|
|className | additional class to treeNode | String | '' |
|disabled | whether disabled the treeNode | bool | false |
|disableCheckbox | whether disable the treeNode' checkbox | bool | false |
|title | tree/subTree's title | String/element | '---' |
|key | it's used with tree props's (default)ExpandedKeys / (default)CheckedKeys / (default)SelectedKeys. you'd better to set it, and it must be unique in the tree's all treeNodes | String | treeNode's position |
|isLeaf | whether it's leaf node | bool | false |
|href|the link url|string|''|
|linkClassName|the css class for the link|string|''|

## Note

The number of treeNodes can be very large, but when enable `checkable`,
it will spend more computing time, so we cached some calculations(e.g. `this.treeNodesStates`),
to avoid double computing. But, this bring some restrictions,
**when you async load treeNodes, you should render tree like this**
`{this.state.treeData.length ? <Tree ...>{this.state.treeData.map(t => <TreeNode ... />)}</Tree> : 'loading tree'}`


## Development

```
npm install
npm start
```

## License
react-tree-component is released under the MIT license.
