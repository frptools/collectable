function isNone(node) {
  return node._left === node;
}

var _nextId = 0;
function Node(type, size, count, key, ids, pid, gid, pos, flag = '') {
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
    count,
    flag,
    dupe,
  };
}

const DummyNode = (ids, pid, gid, pos, flag = '') => Node('dummy', 30, 0, void 0, ids, pid, gid, pos, flag);
const VoidNode = (ids, pid, gid, pos) => Node('none', 12, 0, void 0, ids, pid, gid, pos);
const RedNode = (key, count, ids, pid, gid, pos, flag = '') => Node('red', 30, count, key, ids, pid, gid, pos, flag);
const BlackNode = (key, count, ids, pid, gid, pos, flag = '') => Node('black', 30, count, key, ids, pid, gid, pos, flag);

function SubtreeBranch(node, left, ids, pid, gid, pos) {
  const red = ('__red' in node ? node.__red : node._red);
  const branchNode = red ? (node._red ? RedNode : BlackNode)(node.key, node._count, ids, pid, gid, pos, node.__flag) : DummyNode(ids, pid, gid, pos, node.__flag);
  if(node._red) pid = branchNode.id;
  return {
    type: 'branch',
    node: branchNode,
    dummy: !red,
    inner: Subtree(red ? left ? node._right : node._left : node, ids, pid, gid, `${pos}i`),
    outer: red ? Subtree(left ? node._left : node._right, ids, pid, gid, `${pos}o`) : void 0,
  };
}

function Subtree(node, ids, pid, gid, pos) {
  if(isNone(node)) return VoidNode(ids, pid, gid, pos);
  const center = (node._red ? RedNode : BlackNode)(node.key, node._count, ids, pid, gid, pos, node.__flag);
  var left, right;
  if(center.dupe) {
    node.__flag += ` flag-cycle`;
    return center;
  }
  return {
    type: 'subtree',
    node: center,
    left: SubtreeBranch(node._left, true, ids, center.id, pid, `${pos}l`),
    right: SubtreeBranch(node._right, false, ids, center.id, pid, `${pos}r`),
  };
}

export function createModel(tree) {
  const ids = new Set();
  return Subtree(tree._root, ids, 'R', 'R', 'root');
}