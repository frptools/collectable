function isNone(node) {
  return node.left === node;
}

var _nextId = 0;
function Node(type, size, key, ids, pid, gid, pos, flag = '') {
  var id, dupe = false;
  switch(type) {
    case 'dummy': id = `dummy-${gid}-${pos}`; break;
    case 'none': id = `leaf-${pid}-${pos}`; break;
    default:
      id = `node-${key}`;
      if(ids.has(id)) {
        id += `-${pid}-${pos}`;
        dupe = true;
      }
      break;
  }
  ids.add(id);
  return {
    id,
    type,
    size,
    text: key,
    flag,
    dupe
  };
}

const DummyNode = (ids, pid, gid, pos, flag = '') => Node('dummy', 30, void 0, ids, pid, gid, pos, flag);
const VoidNode = (ids, pid, gid, pos) => Node('none', 12, void 0, ids, pid, gid, pos);
const RedNode = (key, ids, pid, gid, pos, flag = '') => Node('red', 30, key, ids, pid, gid, pos, flag);
const BlackNode = (key, ids, pid, gid, pos, flag = '') => Node('black', 30, key, ids, pid, gid, pos, flag);

function SubtreeBranch(node, left, ids, pid, gid, pos) {
  const red = ('_red' in node ? node._red : node.red);
  const branchNode = red ? (node.red ? RedNode : BlackNode)(node.key, ids, pid, gid, pos, node._flag) : DummyNode(ids, pid, gid, pos, node._flag);
  if(node.red) pid = branchNode.id;
  return {
    type: 'branch',
    node: branchNode,
    dummy: !red,
    inner: Subtree(red ? left ? node.right : node.left : node, ids, pid, gid, `${pos}i`),
    outer: red ? Subtree(left ? node.left : node.right, ids, pid, gid, `${pos}o`) : void 0,
  };
}

function Subtree(node, ids, pid, gid, pos) {
  if(isNone(node)) return VoidNode(ids, pid, gid, pos);
  const center = (node.red ? RedNode : BlackNode)(node.key, ids, pid, gid, pos, node._flag);
  var left, right;
  if(center.dupe) {
    node._flag += ` flag-cycle`;
    return center;
  }
  return {
    type: 'subtree',
    node: center,
    left: SubtreeBranch(node.left, true, ids, center.id, pid, `${pos}l`),
    right: SubtreeBranch(node.right, false, ids, center.id, pid, `${pos}r`),
  };
}

export function createModel(tree) {
  const ids = new Set();
  return Subtree(tree._root, ids, 'R', 'R', 'root');
}