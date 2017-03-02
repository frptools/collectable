import {svg, h} from '@motorcycle/dom';

const NODE_SIDE_GAP = 10;
const DEPTH_MARGIN = 40;
const BRANCH_MARGIN = 20;

function renderModel(model, offset) {
  switch(model.type) {
    case 'red':
    case 'black':
    case 'dummy':
    case 'none':
      return renderNode(model, calculateRect(model.size, model.size, offset));
    case 'subtree':
      return renderSubtree(model, offset);
    default: throw new Error('Unexpected model type: ' + model.type);
  }
}

function textFor(arg) {
  if('x' in arg && 'width' in arg) return rectText(arg);
  if(arg.type === 'none' || arg === arg.left) return '<none>';
  if(arg.type === 'dummy') return '<dummy>';
  if(arg.text || arg.key) return arg.text || arg.key;
  if(arg.dummy) return textFor(arg.inner);
  if(arg.node) return textFor(arg.node);
  return '?';
}
function rectText(rect) {
  return `${rect.x}, ${rect.y} (${rect.width}x${rect.height})`;
}

function renderSubtree(subtree, offset = {x: 1, y: 1}) {
  const leftNodeRect = calculateRect(subtree.left.node.size, subtree.left.node.size, offset);
  const nextNodeOffset = placeRight(offset, leftNodeRect.width + NODE_SIDE_GAP);
  const centerNodeRect = calculateRect(subtree.node.size, subtree.node.size, nextNodeOffset);
  const rightNodeRect = calculateRect(subtree.right.node.size, subtree.right.node.size, placeRight(nextNodeOffset, centerNodeRect.width + NODE_SIDE_GAP));
  leftNodeRect.cy = rightNodeRect.cy = centerNodeRect.cy;
  leftNodeRect.y = centerNodeRect.y + (centerNodeRect.height - leftNodeRect.height)/2;
  rightNodeRect.y = centerNodeRect.y + (centerNodeRect.height - rightNodeRect.height)/2;
  const nodesRect = calculateBoundingBox(leftNodeRect, centerNodeRect, rightNodeRect);

  var lowerOffset = placeBelow(offset, nodesRect.height + DEPTH_MARGIN);
  var branch;
  const leftOuter = branch = !subtree.left.outer ? void 0 : renderModel(subtree.left.outer, lowerOffset);
  const leftInner = branch = renderModel(subtree.left.inner, branch ? lowerOffset = placeRight(lowerOffset, branch.rect.width + BRANCH_MARGIN) : lowerOffset);
  const rightInner = branch = renderModel(subtree.right.inner, lowerOffset = placeRight(lowerOffset, branch.rect.width + BRANCH_MARGIN));
  const rightOuter = !subtree.right.outer ? void 0 : renderModel(subtree.right.outer, placeRight(lowerOffset, branch.rect.width + BRANCH_MARGIN));
  const branchesRect = calculateBoundingBox(leftOuter, leftInner, rightInner, rightOuter);

  var nodesOffsetX = Math.max(0, rightInner.rect.x - branchesRect.x - nodesRect.width/2);
  [leftNodeRect, centerNodeRect, rightNodeRect, nodesRect].forEach(rect => {
    rect.x += nodesOffsetX;
    rect.cx += nodesOffsetX;
  });

  const centerId = subtree.node.id;
  const leftId = subtree.left.node.id;
  const rightId = subtree.right.node.id;

  var linode, rinode, lonode, ronode;
  const leftInnerId = (linode = subtree.left.inner.node || subtree.left.inner).id;
  const rightInnerId = (rinode = subtree.right.inner.node || subtree.right.inner).id;
  const leftOuterId = leftOuter ? (lonode = subtree.left.outer.node || subtree.left.outer).id : '';
  const rightOuterId = rightOuter ? (ronode = subtree.right.outer.node || subtree.right.outer).id : '';

  const leftNode = renderNode(subtree.left.node, leftNodeRect);
  const centerNode = renderNode(subtree.node, centerNodeRect);
  const rightNode = renderNode(subtree.right.node, rightNodeRect);

  const rect = calculateBoundingBox(nodesRect, branchesRect);
  rect.cx = centerNodeRect.cx;
  const lflag = centerNode.flag && leftNode.flag ? `flag` : '';
  const rflag = centerNode.flag && rightNode.flag ? `flag` : '';
  const liflag = leftNode.flag && linode.flag ? `flag` : '';
  const riflag = leftNode.flag && rinode.flag ? `flag` : '';
  const loflag = leftNode.flag && lonode && lonode.flag ? `flag` : '';
  const roflag = leftNode.flag && ronode && ronode.flag ? `flag` : '';
  const views = [
    ...leftNode.views,
    ...centerNode.views,
    ...rightNode.views,
    ...(leftOuter ? leftOuter.views : []),
    ...leftInner.views,
    ...rightInner.views,
    ...(rightOuter ? rightOuter.views : []),
    renderEdge(centerNodeRect.x, centerNodeRect.cy, leftNodeRect.x + leftNodeRect.width, leftNodeRect.cy, centerId, leftId, lflag),
    renderEdge(centerNodeRect.x + centerNodeRect.width, centerNodeRect.cy, rightNodeRect.x, rightNodeRect.cy, centerId, rightId, rflag),
    renderEdge(leftNodeRect.cx, leftNodeRect.y + leftNodeRect.height, leftInner.rect.cx, leftInner.rect.y, leftId, leftInnerId, liflag),
    renderEdge(rightNodeRect.cx, rightNodeRect.y + rightNodeRect.height, rightInner.rect.cx, rightInner.rect.y, rightId, rightInnerId, riflag),
    ...(!leftOuter ? [] : [renderEdge(leftNodeRect.cx, leftNodeRect.y + leftNodeRect.height, leftOuter.rect.cx, leftOuter.rect.y, leftId, leftOuterId, loflag)]),
    ...(!rightOuter ? [] : [renderEdge(rightNodeRect.cx, rightNodeRect.y + rightNodeRect.height, rightOuter.rect.cx, rightOuter.rect.y, rightId, rightOuterId, roflag)])
  ];
  return {rect, views};
}

function onInsertNode(v) {
  const el = v.element;
  el.querySelector('.anim-shrink').endElement();
  el.querySelector('.anim-shrink').beginElement();
  el.querySelector('.anim-opacity').endElement();
  el.querySelector('.anim-opacity').beginElement();
  el.querySelector('.anim-move-x').endElement();
  el.querySelector('.anim-move-y').endElement();
}

function onUpdateNode(v0, v1) {
  const el = v0.element;
  if(!el || !v0.props || !v0.props.attrs || !v0.props.attrs.cx) return;
  var ax = v1.children.find(c => c.props.attrs.class === 'anim-move-x');
  var ay = v1.children.find(c => c.props.attrs.class === 'anim-move-y');
  if(!ax) return;
  ax.props.attrs.from = v0.props.attrs.cx;
  ay.props.attrs.from = v0.props.attrs.cy;
  var ac0 = v0.children.find(c => c.props.attrs.class === 'anim-color');
  var ac1 = v1.children.find(c => c.props.attrs.class === 'anim-color');
  if(!ac0 || !ac1) return;
  ac1.props.attrs.from = ac0.props.attrs.to;
}

function onPostPatchNode(v) {
  const el = v.element;
  const ax = el.querySelector('.anim-move-x');
  if(!ax) return;
  const ay = el.querySelector('.anim-move-y');
  ax.endElement();
  ax.beginElement();
  ay.endElement();
  ay.beginElement();
  const ac = el.querySelector('.anim-color');
  if(!ac) return;
  ac.endElement();
  ac.beginElement();
}

function onUpdateNodeText(v0, v1) {
  const el = v0.element;
  if(!el || !v0.props || !v0.props.attrs || !v0.props.attrs.x || !v1.children) return;
  var ax = v1.children.find(c => c.props && c.props.attrs && c.props.attrs.class === 'anim-move-x');
  var ay = v1.children.find(c => c.props && c.props.attrs && c.props.attrs.class === 'anim-move-y');
  if(!ax) return;
  ax.props.attrs.from = v0.props.attrs.x;
  ay.props.attrs.from = v0.props.attrs.y;
}

function onPostPatchNodeText(v) {
  const el = v.element;
  const ax = el.querySelector('.anim-move-x');
  if(!ax) return;
  const ay = el.querySelector('.anim-move-y');
  ax.endElement();
  ax.beginElement();
  ay.endElement();
  ay.beginElement();
}

const EASE_IN_OUT_CURVE = '0.5 0 0.5 1';
const EASE_IN_OUT_CURVES = `${EASE_IN_OUT_CURVE} ; ${EASE_IN_OUT_CURVE}`;
const ANIM_DUR_FAST = 0.25;
const ANIM_DUR_MED = .5;
const ANIM_TIMES_FAST = `0 ; ${ANIM_DUR_FAST/2} ; ${ANIM_DUR_FAST}`;
const ANIM_TIMES_MED = `0 ; ${ANIM_DUR_MED/2} ; ${ANIM_DUR_MED}`;

function renderNode(node, rect) {
  const r = node.size/2;
  const circleAnims = [
    h('animate', {attrs: {class: 'anim-shrink', attributeType: 'XML', attributeName: 'r', from: r*1.5, to: r, dur: ANIM_DUR_FAST, repeatCount: 1}}),
    h('animate', {attrs: {class: 'anim-opacity', attributeType: 'XML', attributeName: 'opacity', from: 0, to: 1, dur: ANIM_DUR_MED, repeatCount: 1}}),
    h('animate', {attrs: {class: 'anim-move-x', attributeType: 'XML', attributeName: 'cx', from: rect.cx, to: rect.cx, calcMode: 'spline', keyTimes: ANIM_TIMES_FAST, keySplines: EASE_IN_OUT_CURVES, dur: ANIM_DUR_FAST, repeatCount: 1, fill: 'freeze'}}),
    h('animate', {attrs: {class: 'anim-move-y', attributeType: 'XML', attributeName: 'cy', from: rect.cy, to: rect.cy, calcMode: 'spline', keyTimes: ANIM_TIMES_FAST, keySplines: EASE_IN_OUT_CURVES, dur: ANIM_DUR_FAST, repeatCount: 1, fill: 'freeze'}}),
  ];
  const textAnims = [];
  if(node.type === 'red' || node.type === 'black') {
    circleAnims.push(h('animate', {attrs: {class: 'anim-color', attributeType: 'CSS', attributeName: 'fill', to: node.type === 'red' ? '#ec4857' : '#333', dur: ANIM_DUR_FAST, repeatCount: 1}}));
    textAnims.push(
      h('animate', {attrs: {class: 'anim-move-x', attributeType: 'XML', attributeName: 'x', from: rect.cx, to: rect.cx, calcMode: 'spline', keyTimes: ANIM_TIMES_FAST, keySplines: EASE_IN_OUT_CURVES, dur: ANIM_DUR_FAST, repeatCount: 1, fill: 'freeze'}}),
      h('animate', {attrs: {class: 'anim-move-y', attributeType: 'XML', attributeName: 'y', from: rect.cy, to: rect.cy, calcMode: 'spline', keyTimes: ANIM_TIMES_FAST, keySplines: EASE_IN_OUT_CURVES, dur: ANIM_DUR_FAST, repeatCount: 1, fill: 'freeze'}}),
    );
  }
  var flag = node.flag ? ` flag-${node.flag}` : '';
  const circle = h('circle', {attrs: {r, cx: rect.cx, cy: rect.cy, opacity: 1}, insert: onInsertNode, update: onUpdateNode, postpatch: onPostPatchNode}, circleAnims);
  const views = [svg({key: node.id, attrs: {id: node.id, class: `node ${node.type}${flag}`}}, [
    circle,
    ...(node.text === void 0 ? [] : [
      h('text', {attrs: {x: rect.cx, y: rect.cy}, update: onUpdateNodeText, postpatch: onPostPatchNodeText}, [`${node.text}`, ...textAnims])
    ])
  ])];
  return {rect, views};
}

function onInsertEdge(v) {
  const el = v.element;
  el.querySelector('.anim-opacity').beginElement();
}

function onUpdateEdge(v0, v1) {
  const el = v0.element;
  if(!el || !v0.props || !v0.props.attrs || !v0.props.attrs.d) return;
  var anim = v1.children.find(c => c.props.attrs.class === 'anim-move');
  if(!anim) return;
  anim.props.attrs.from = v0.props.attrs.d;
  // v1.props.attrs.d = v0.props.attrs.d;
}

function onPostPatchEdge(v) {
  const el = v.element;
  const anim = el.querySelector('.anim-move');
  if(!anim) return;
  anim.endElement();
  anim.beginElement();
}

function renderEdge(x0, y0, x1, y1, fromId, toId, flag = '') {
  const id = `edge--${fromId}--${toId}`;
  const xh = Math.floor((x1 - x0)/6);
  const yh = Math.floor((y1 - y0)/2);
  const cx0 = x0 + xh;
  const cy0 = Math.floor(y0 + yh);
  const cx1 = x1 - xh;
  const cy1 = Math.floor(y1 - yh);
  const d = `M${x0},${y0} C${cx0},${cy0} ${cx1},${cy1} ${x1},${y1}`;
  const anims = [
    h('animate', {attrs: {class: 'anim-opacity', attributeType: 'XML', attributeName: 'opacity', from: 0, to: 1, dur: ANIM_DUR_MED, repeatCount: 1}}),
    h('animate', {attrs: {class: 'anim-move', attributeType: 'XML', attributeName: 'd', from: d, to: d, calcMode: 'spline', keyTimes: ANIM_TIMES_FAST, keySplines: EASE_IN_OUT_CURVES, dur: ANIM_DUR_FAST, repeatCount: 1, fill: 'freeze'}})
  ];
  if(flag) flag = ` ${flag}`;
  return h('path', {key: id, attrs: {id, class: `edge ${y1 > y0 ? 'tb' : x1 > x0 ? 'lr' : 'rl'}${flag}`, d, opacity: 1}, insert: onInsertEdge, update: onUpdateEdge, postpatch: onPostPatchEdge}, anims);
}

function calculateRect(width, height, {x = 0, y = 0, xAnchor = 'left', yAnchor = 'top'} = {}) {
  const w2 = width/2;
  const h2 = height/2;
  var cx, cy;
  switch(xAnchor) {
    case 'left': cx = x + w2; break;
    case 'right': cx = x - w2; x -= width; break;
    case 'center': cx = x; x -= w2; break;
  }
  switch(yAnchor) {
    case 'top': cy = y + h2; break;
    case 'bottom': cy = y - h2; y -= height; break;
    case 'center': cy = y; y -= h2; break;
  }
  return {width, height, x, y, cx, cy};
}

function extend(...a) {
  return Object.assign({}, ...a);
}

function placeLeft(offset, distance, yOffset, yAnchor) {
  return extend(offset, {
    x: (offset.x || 0) - (distance || 0),
    y: offset.y + (yOffset || 0),
    xAnchor: 'right',
    yAnchor: yAnchor || offset.yAnchor
  });
}

function placeRight(offset, distance, yOffset, yAnchor) {
  return extend(offset, {
    x: (offset.x || 0) + (distance || 0),
    y: offset.y + (yOffset || 0),
    xAnchor: 'left',
    yAnchor: yAnchor || offset.yAnchor
  });
}

function placeBelow(offset, distance) {
  return extend(offset, {
    y: offset.y + (distance || 0),
    yAnchor: 'top'
  });
}

function calculateBoundingBox() {
  var left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
  for(var i = 0; i < arguments.length; i++) {
    var rect = arguments[i];
    if(rect) {
      if('rect' in rect) rect = rect.rect;
      left = Math.min(rect.x, left);
      right = Math.max(rect.x + rect.width, right);
      top = Math.min(rect.y, top);
      bottom = Math.max(rect.y + rect.height, bottom);
    }
  }
  const width = right - left;
  const height = bottom - top;
  return {
    x: left,
    y: top,
    cx: left + width/2,
    cy: top + height/2,
    width,
    height
  };
}

function getMidX(left, width) {
  return Math.floor(left + width/2);
}

function getMidY(top, height) {
  return Math.floor(top, height/2);
}

function arrow(id, cls) {
  return h('marker', {attrs: {id, class: cls, refX: 3, refY: 2, markerUnits: 'strokeWidth', markerWidth: 4, markerHeight: 4, orient: 'auto'}}, [
    h('path', {attrs: {d: 'M0,0 L0,4 L4,2 z'}})
  ]);
}

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareElements(a, b) {
  if(a.tagName !== b.tagName) return compare(a.tagName, b.tagName);
  if(a.props && a.props.attrs && b.props && b.props.attrs) {
    if(a.props.attrs.id !== b.props.attrs.id) return compare(a.props.attrs.id||0, b.props.attrs.id||0);
    if(a.props.attrs.class !== b.props.attrs.class) return compare(a.props.attrs.class||'', b.props.attrs.class||'');
  }
  return 0;
}

export function render({index, model}) {
  const {views, rect} = renderModel(model);
  views.sort(compareElements);
  return svg({attrs: {width: rect.width + 2, height: rect.height + 2}}, [
    h('defs', [
      h('filter', {id: 'drop-shadow'}, [
        h('feGaussianBlur', {attrs: {in: 'SourceAlpha', stdDeviation: '2.2'}}),
        h('feOffset', {attrs: {dx: '0', dy: '0', result: 'offsetblur'}}),
        h('feFlood', {attrs: {'flood-color': 'rgba(0,0,0,0.5)'}}),
        h('feComposite', {attrs: {in2: 'offsetblur', operator: 'in'}}),
        h('feMerge', [
          h('feMergeNode'),
          h('feMergeNode', {attrs: {in: 'SourceGraphic'}}),
        ]),
      ]),
      arrow('left-arrow', 'arrow left'),
      arrow('right-arrow', 'arrow right'),
      arrow('down-arrow', 'arrow down'),
    ]),
    h('g', views)
  ]);
}
