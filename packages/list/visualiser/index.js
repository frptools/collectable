import Immutable from 'immutable';
import CJ from 'circular-json';
import Cycle from '@cycle/most-run';
import {fromEvent} from 'most';
import {create} from '@most/create'
import {a, h, div, span, thunk, makeDOMDriver} from '@motorcycle/dom';
// import {PList} from '../../../.build/packages/list';
// import {nextId as nextInternalId} from '../../../.build/packages/shared/ownership';
// import {TreeWorker, tryCommitOtherView, getAtOrdinal} from '../../../.build/packages/list/traversal';
// import {append} from '../../../.build/packages/list/values';
// import {slice} from '../../../.build/packages/list/slice';
// import {PListState} from '../../../.build/packages/list/state';
// import {Slot} from '../../../.build/packages/list/slot';
// import {View} from '../../../.build/packages/list/view';
import {log, publish, setCallback} from '../../../.build/packages/list/src/internals/debug';
import * as CC from '../../../.build/packages/core/src';
import * as L from '../../../.build/packages/list/src';
import * as LI from '../../../.build/packages/list/src/internals';

require('./styles.styl');

var nextId = 0;
const storageKey = 'collectable-visualiser-';
var alignment = getSavedValue('alignment');

function updateAlignment(delta) {
  var listsEl = document.querySelector('.list-container .lists');
  if(listsEl.children.length === 1) {
    if(delta < 0 && (alignment === 4 || alignment === 2)) {
      delta = -2;
    }
    else if(delta > 0 && (alignment === 0 || alignment === 2)) {
      delta = 2;
    }
  }
  alignment = Math.min(4, Math.max(0, delta + alignment));
  saveValue('alignment', alignment);
  updateEdges();
}

var colors = {
  0: ['white', '#7fbad8', '#0075b2'],
  1: ['white', '#91a0ce', '#24429e'],
  2: ['white', '#ab86e0', '#570ec1'],
  3: ['white', '#c693cb', '#8d2798'],
  4: ['white', '#e17fa2', '#c30045'],
  5: ['white', '#ee8c7f', '#de1900'],
  6: ['white', '#eeb27f', '#de6500'],
  7: ['black', '#6f4900', '#de9200'],
  8: ['black', '#6f5f00', '#debe00'],
  9: ['black', '#6c7200', '#d9e400'],
  10: ['white', '#b8e08d', '#72c11b'],
  11: ['white', '#94d4a9', '#2aaa54'],
  12: ['black', '#797a7a', '#f2f4f4'],
  13: ['black', '#333339', '#676773'],
  main: i => colors[Math.abs(i)][2],
  inverse: i => colors[Math.abs(i)][0],
  mid: i => colors[Math.abs(i)][1],
};

function colorText(i, mid = false) {
  return {color: mid ? colors.mid(i) : colors.main(i)};
}

function colorFill(i, mid = false) {
  return {color: mid ? colors.mid(i) : colors.inverse(i), 'background-color': colors.main(i)};
}

function colorFillInv(i, mid = false) {
  return {color: mid ? colors.mid(i) : colors.main(i), 'background-color': colors.inverse(i)};
}

function hashString(str) {
  var hash = 5381, i = str.length;
  while(i) hash = (hash * 33) ^ str.charCodeAt(--i);
  return hash >>> 0;
}

function safe(id) {
  return typeof id === 'symbol'
    ? id.toString().substr(7, id.toString().length - 8)
    : id;
}

const colorWheelSize = 12;
function chooseStyle(id, textOnly) {
  var number;
  if(id === null || id === void 0) number = 0;
  else if(typeof id !== 'number') number = hashString(safe(id));
  else number = id;
  var index = number % colorWheelSize;
  var isMid = number % (colorWheelSize*2) > colorWheelSize;
  return textOnly ? colorText(index, isMid) : colorFill(index, isMid);
}

function getViewSlotKey() {
  var id, index;
  if(arguments.length === 1) {
    var view = arguments[0];
    if(!view.parent || !view.parent.parent) return null;
    id = view.parent.slot.id;
    index = view.slotIndex;
  }
  else {
    id = arguments[0];
    index = arguments[1];
  }
  return `${id};${index}`;
}

function addView(map, key, view) {
  if(!map.has(key)) map.set(key, new Set());
  var set = map.get(key);
  set.add(view);
}

var _addLogEvent, _canStartLogging = false;
function beginCollectingLogs() {
  _canStartLogging = true;
  if(!_addLogEvent) return;
  var add = _addLogEvent;
  var logs = [];
  var previousList = [];
  setCallback(function(lists, done, message) {
    if(Array.isArray(lists)) {
      if(arguments.length === 1) {
        var err;
        if(err = lists.find(arg => arg instanceof Error)) {
          logs.push(lists);
          message = `ERROR: ${err && err.message || err}`;
          done = true;
          lists = previousList;
        }
        else {
          logs.push(lists.map(arg => typeof arg === 'object' ? CJ.parse(CJ.stringify(arg)) : arg));
          return;
        }
      }
    }
    else {
      lists = [lists];
    }
    previousList = lists;

    lists = lists.map(list => {
      var json = CJ.stringify(list);
      try {
        list = CJ.parse(json);
      }
      catch(e) {
        console.log(json);
        throw e;
      }
      var views = {
        bySlotId: new Map(),
        byLocation: new Map(),
        byId: new Map(),
        byParentId: new Map(),
        all: new Set()
      };
      viewsOf(list).forEach((view, i) => {
        if(!view.group) return;
        do {
          if(!('index' in view)) view.index = i;
          views.byId.set(view.id, view);
          views.all.add(view);
          addView(views.bySlotId, view.slot.id, view);
          if(view.parent && view.parent.parent) {
            addView(views.byLocation, getViewSlotKey(view), view);
            addView(views.byParentId, view.parent.id, view);
          }
          view = view.parent;
        }
        while(view.parent);
      });
      return {list, views};
    })
    var entry = {lists, done, message, logs};
    logs = [];
    add(entry);
  });
}
var list$ = create(add => {
  _addLogEvent = add;
  if(_canStartLogging) beginCollectingLogs();
});

function renderTimeline(DOM, model) {
  return div('.timeline', {hook: {postpatch: updateLeftPosition}}, model.timeline
    .map((entry, i) => a('.version', {
      attrs: {'data-index': i.toString()},
      class: {active: i === model.index, done: !!entry.done},
      props: {href: 'javascript:void 0'}
    }, [
      span('.index', i.toString()),
      span('.message', entry.message)
    ]))
    .toArray());
}

function isLeafNode(slot) {
  return !slot || !slot.slots || slot.slots.length === 0 || !slot.slots.find(s => s && s.slots);
}

function isReservedNode(slot) {
  return !!slot && slot.slots && slot.group <= 0;
}

function isPlaceholderNode(slot) {
  return isReservedNode(slot);
}

var containers = [];
var edges = [];

function getElement(id) {
  var el = document.getElementsByClassName(id)[0];
  if(!el) {
    console.warn('MISSING ENDPOINT ELEMENT: ' + id);
  }
  return el;
}

function getEndpointElements(endpoint) {
  var vEl, hEl;
  switch(endpoint.type) {
    case 'slot':
      vEl = getElement(`slot-${endpoint.listIndex}-${endpoint.id}-${endpoint.index}`);
      hEl = vEl && vEl.parentNode.parentNode;
      break;
    case 'pslot':
      vEl = getElement(`pslot-${endpoint.listIndex}-${endpoint.branch}-${endpoint.index}`);
      hEl = vEl && vEl.parentNode.parentNode;
      break;
    case 'view':
      vEl = getElement(`view-${endpoint.listIndex}-${endpoint.id}`);
      hEl = vEl && vEl.parentNode;
      break;
    case 'pnode':
      vEl = getElement(`pnode-${endpoint.listIndex}-${endpoint.branch}-${endpoint.index}`);
      break;
    case 'node':
      vEl = getElement(`node-${endpoint.listIndex}-${endpoint.id}`);
      hEl = vEl && vEl.parentNode.classList.contains('has-view') ? vEl.parentNode : vEl;
      break;
  }
  return [vEl, hEl || vEl];
}

function getPathMarkup(edge, path) {
  var color, width, extra = '';
  var marker = edge[0].type + '-arrow';
  switch(edge[0].type) {
    case 'view':
      color = '#0680b7';
      width = 3;
      extra = ' stroke-dasharray="3, 2"';
      break;

    case 'pnode':
      color = '#03a9f4';
      width = 4;
      extra = ' stroke-dasharray="3, 1"';
      break;

    case 'pslot':
      color = '#999';
      width = 2;
      extra = ' stroke-dasharray="5, 1"';
      break;

    default:
      color = '#333';
      width = 2;
      break;
  }
  var style = `stroke:${color}; fill:none; stroke-width:${width}`;
  return `<path d="${path}" style="${style}" marker-end="url(#${marker})"${extra}/>`;
}

function getMidX(el) {
  return Math.floor(el.offsetLeft + (el.offsetWidth/2));
}

function getMidY(el) {
  return Math.floor(el.offsetTop + (el.offsetHeight/2));
}

function arrow(id, color) {
  return `<marker id="${id}" markerWidth="4" markerHeight="5" refx="3" refy="2" orient="auto" markerUnits="strokeWidth">
    <path d="M0,0 L0,4 L4,2 z" fill="${color}" />
  </marker>`;
}

function drawLines() {
  var listsEl = document.querySelector('.list-container .lists');
  var svgEl = document.getElementById('edges');
  if(!svgEl) return;
  svgEl.style.width = (listsEl.offsetLeft + listsEl.offsetWidth) + 'px';
  svgEl.style.height = (listsEl.offsetTop + listsEl.offsetHeight) + 'px';
  var paths = `
    ${arrow('view-arrow', '#0680b7')}
    ${arrow('slot-arrow', '#333')}
    ${arrow('pslot-arrow', '#999')}
    ${arrow('pnode-arrow', '#03a9f4')}
  `;
  edges.forEach(edge => {
    var type = `${edge[0].type}-${edge[1].type}`;
    var [vStartEl, hStartEl] = getEndpointElements(edge[0]);
    var [vEndEl, hEndEl] = getEndpointElements(edge[1]);
    if(!vStartEl || !vEndEl) {
      console.warn('unable to render edge:', edge);
      return;
    }
    var x0, y0, x1, y1, cx0, cy0, cx1, cy1, h, w;
    switch(type) {
      case 'view-view':
        var isLeftDirected = vStartEl.offsetLeft > vEndEl.offsetLeft;
        var isAbove = isLeftDirected ? hEndEl.offsetLeft + hEndEl.offsetWidth + 20 > vStartEl.offsetLeft
                                    : hEndEl.offsetLeft + 20 < vStartEl.offsetLeft + vStartEl.offsetWidth;
        x0 = getMidX(vStartEl);
        y0 = hStartEl.offsetTop;
        if(isAbove) {
          x1 = getMidX(vEndEl);
          y1 = hEndEl.offsetTop + hEndEl.offsetHeight;
          h = Math.floor((y1 - y0)/1.5);
          cx0 = x0;
          cy0 = y0 + h;
          cx1 = x1;
          cy1 = y1 - h;
        }
        else {
          x1 = hEndEl.offsetLeft + (hStartEl.offsetLeft < hEndEl.offsetLeft ? 0 : hEndEl.offsetWidth);
          y1 = getMidY(vEndEl);
          h = Math.floor((y1 - y0)/2);
          cx0 = x0;
          cy0 = y1 - h;
          cx1 = x0;
          cy1 = y1;
        }
        break;

      case 'slot-node':
      case 'pslot-pnode':
      case 'pslot-node':
        x0 = getMidX(vStartEl);
        x1 = getMidX(vEndEl);
        y0 = hStartEl.offsetTop + hStartEl.offsetHeight;
        y1 = hEndEl.offsetTop;
        h = Math.floor((y1 - y0)/1.5);
        w = Math.floor((x1 - x0)/20);
        cx0 = x0 + w;
        cy0 = y0 + h;
        cx1 = x1 - w;
        cy1 = y1 - h;
        break;

      case 'pnode-node':
        y0 = getMidY(vStartEl);
        y1 = getMidY(vEndEl);
        if(isLeftDirected) {
          x0 = hStartEl.offsetLeft;
          x1 = hEndEl.offsetLeft + hEndEl.offsetWidth;
        }
        else {
          x0 = hStartEl.offsetLeft + hStartEl.offsetWidth;
          x1 = hEndEl.offsetLeft;
        }
        w = Math.floor((x1 - x0)/2);
        cx0 = Math.floor(x0 + w);
        cy0 = y0;
        cx1 = Math.floor(x1 - w);
        cy1 = y1;
        break;

      default:
        return;
    }
    var path = `M${x0},${y0} C${cx0},${cy0} ${cx1},${cy1} ${x1},${y1}`;
    paths += getPathMarkup(edge, path);
  });
  svgEl.innerHTML = paths;
  setTimeout(() => {
    document.querySelector('.version.active').scrollIntoViewIfNeeded(false);
    var el = document.querySelector('.list-container')
    switch(alignment) {
      case 0: el.scrollLeft = 0; break;
      case 1: el.scrollLeft = listsEl.children.length > 1 ? listsEl.children[0].offsetWidth/2 - el.offsetWidth/2 : el.scrollWidth/2 - el.offsetWidth/2; break;
      case 2: el.scrollLeft = listsEl.children.length > 1 ? listsEl.children[1].offsetLeft - el.offsetWidth/2 : el.scrollWidth/2 - el.offsetWidth/2; break;
      case 3: el.scrollLeft = listsEl.children.length > 1 ? listsEl.children[1].offsetLeft + listsEl.children[1].offsetWidth/2 - el.offsetWidth/2 : el.scrollWidth/2 - el.offsetWidth/2; break;
      case 4: el.scrollLeft = el.scrollWidth; break;
    }
    // if(listsEl.children.length > 1) {

    //   // el.scrollLeft = listsEl.children[1].offsetLeft - (el.offsetWidth/2)
    //   // el.scrollLeft = el.scrollWidth;
    // }
    // else {
    //   // el.scrollLeft = el.scrollWidth/2 - el.offsetWidth/2;
    //   el.scrollLeft = el.scrollWidth;
    // }
    el.scrollTop = el.scrollHeight;
  }, 100);
}

function renderView(listIndex, {view, isCorrectSlotRef}, index) {
  var props = [
    span('.prop.id', [span('.value', view.id.toString())]),
    span('.prop.parent', [span('.value', view.parent && view.parent.parent ? view.parent.id.toString() : 'n/a')]),
    span('.prop.group', [span('.value', {style: chooseStyle(view.group)}, [view.group])]),
    span('.prop.slotIndex', [span('.value', view.slotIndex.toString())]),
    span('.prop.start', [span('.value', view.offset.toString())]),
    span('.prop.anchor', [span('.value', view.anchor ? 'RIGHT' : 'LEFT')]),
    span('.prop.sizeDelta', [span('.value', (view.sizeDelta > 0 ? '+' : '') + view.sizeDelta)]),
    span('.prop.slotsDelta', [span('.value', (view.slotsDelta > 0 ? '+' : '') + view.slotsDelta)]),
    // span('.prop.changed', [span('.value', view.uncommitted.toString())]),
  ];
  if(index === -1) {
    props.push(
      span('.prop.parentId', [span('.value', view.parent.id.toString())]),
      span('.prop.slotId', [span('.value', view.slot.id.toString())]),
    );
  }
  return div(`.view-${listIndex}-${view.id}.view`, {class: {unused: index === -1}}, [
    div('.props', props)
  ]);
}

function renderNode(listIndex, {slot, hasChildren, isLeaf, isPlaceholder, views, branchId, parentBranchId}, slotIndex) {
  var recompute = slot.recompute;
  var isRelaxed = slot.recompute !== -1;
  var slots = isLeaf || hasChildren
    ? slot.slots.map((value, i) => value === void 0 || value === null
      ? div('.slot.void', {class: {leaf: isLeaf}}, [span('.slot-index', i.toString())])
      : isLeaf
        ? div('.slot.leaf', value === void 0 || value === null ? '-' : value.toString())
        : div(isPlaceholderNode(value) ? `.pslot-${listIndex}-${branchId}-${i}.slot.mid.placeholder` : `.slot-${listIndex}-${value.id}-${i}.slot.mid`, [
          span('.slot-prop.id', value.id.toString()),
          span('.slot-index', i.toString()),
          span('.slot-prop.size', value.size.toString()),
          span('.slot-prop.sum', {class: {invalid: i >= slot.slots.length - recompute}}, value.sum),
        ]))
    : [span('.no-slots', 'Empty')];

  const nodeViews = [
    div(`${isPlaceholder ? `.pnode-${listIndex}-${parentBranchId}-${slotIndex}` : `.node-${listIndex}-${slot.id}`}.node`,
      {class: {leaf: isLeaf, placeholder: isPlaceholder, relaxed: isRelaxed}}, [
      div('.props', [
        span('.prop.group', [span('.value', {style: chooseStyle(slot.group)}, [slot.group.toString()])]),
        span('.prop.id', [span('.value', [slot.id.toString()])]),
        span('.prop.size', [span('.value', [slot.size.toString()])]),
        span('.prop.sum', [span('.value', [slot.sum.toString()])]),
        span('.prop.recompute', [span('.value', recompute.toString())]),
        span('.prop.subcount', [span('.value', [slot.subcount.toString()])]),
      ]),
      div('.slots', slots)
    ])
  ];

  if(views) {
    views.forEach((view, i) => {
      nodeViews.push(renderView(listIndex, view, i));
    });
  }
  return div('.node-view-container', {class: {'has-view': !!views, changed: views && views[0] && (views[0].view.sizeDelta || views[0].view.slotsDelta)}}, nodeViews);
}

function matchViewsToSlot(listIndex, level, slot, parent, parentSlotIndex, parentBranchId, parentViewId, views, unusedViews) {
  var viewsBySlotIndex = parent && views.byLocation.get(getViewSlotKey(parent.id, parentSlotIndex));
  var viewsBySlotId = slot && views.bySlotId.get(slot.id);
  var viewsByParentId = (parentSlotIndex === -1 /*|| slot.group === 0*/) && parentViewId && views.byParentId.get(parentViewId);
  var slotRefs = new Set();
  var viewRefs = new Set();
  var items = [];
  var isInputSlotPlaceholder = isPlaceholderNode(slot);
  var makeItem = (slot, views) => {
    var isLeaf = level === 0 || isLeafNode(slot);
    var item = {
      branchId: ++nextId,
      parentBranchId,
      slot,
      views,
      isLeaf,
      isPlaceholder: !views && isPlaceholderNode(slot),
      hasChildren: !isLeaf && !!slot.slots && slot.slots.length > 0
    };
    return item;
  };
  var addView = view => {
    if(unusedViews.has(view) && !viewRefs.has(view)) {
      var item;
      viewRefs.add(view);
      if(view.parent && view.parent.parent) {
        edges.push([
          {type: 'view', listIndex, id: view.id},
          {type: 'view', listIndex, id: view.parent.id}
        ]);
      }
      if(slotRefs.has(view.slot)) {
        item = items.find(item => item.slot === view.slot)
      }
      else {
        items.push(item = makeItem(view.slot, []));
        slotRefs.add(view.slot);
      }
      item.views.push({view, isCorrectSlotRef: slot === view.slot || isInputSlotPlaceholder});
    }
  };
  if(viewsBySlotIndex) viewsBySlotIndex.forEach(addView);
  if(viewsBySlotId) viewsBySlotId.forEach(addView);
  if(viewsByParentId) viewsByParentId.forEach(addView);

  if(slot && !slotRefs.has(slot)) {
    items.unshift(makeItem(slot, null));
  }

  return items;
}

function renderNodeContainer(listIndex, slot, parent, parentSlotIndex, views, unusedViews, level, parentBranchId, parentView) {
  var isPlaceholder = isPlaceholderNode(slot);
  var isLeaf = isLeafNode(slot);

  if(parent && parentSlotIndex >= 0) {
    if(isPlaceholder) {
      var vspid = views.byParentId.get(parentView && parentView.id);
      var hasView = vspid && Array.from(vspid).find(v => v.slot.id === slot.id);
      edges.push([
        {type: 'pslot', listIndex, branch: parentBranchId, index: parentSlotIndex},
        hasView ? {type: 'node', listIndex, id: slot.id} :
          {type: 'pnode', listIndex, branch: parentBranchId, index: parentSlotIndex}
      ]);
    }
    else if(parentSlotIndex >= 0) {
      edges.push([
        {type: 'slot', listIndex, id: slot.id, index: parentSlotIndex},
        {type: 'node', listIndex, id: slot.id}
      ]);
    }
  }

  var items = matchViewsToSlot(listIndex, level, slot, parent, parentSlotIndex, parentBranchId, parentView && parentView.id, views, unusedViews);
  if(parentSlotIndex >= 0 && items.length > 1 && items[0].isPlaceholder && items[1].views) {
    edges.push([
      {type: 'pnode', listIndex, branch: items[0].parentBranchId, index: parentSlotIndex},
      {type: 'node', listIndex, id: items[1].slot.id}
    ]);
  }

  var branches = [], firstView = null;
  items.forEach((item, i) => {
    if(!item.slot) return;
    if(item.views) {
      item.views.forEach(v => {
        if(!firstView) firstView = v.view;
        unusedViews.delete(v.view);
      });
    }
    var childSlots = item.slot.slots/*.filter(s => s)*/, orphaned = false;
    if(childSlots.length === 0) {
      childSlots = [null]; // make sure a single child will render
      orphaned = true;
    }
    branches.push(div(`.branch-${listIndex}-${item.branchId}.branch`, {
      class: {'is-pnode': item.isPlaceholder, 'is-node': !item.isPlaceholder, 'is-leaf': item.isLeaf}}, [
      renderNode(listIndex, item, parentSlotIndex),
      item.hasChildren || !item.isLeaf
        ? div('.branch-children', childSlots.map((slot, i) =>
            !slot ? null : renderNodeContainer(listIndex, slot, item.slot, orphaned ? -1 : i, views, unusedViews, level - 1, item.branchId, firstView)))
        : ''
    ]));
  });
  return div('.branch-container', branches);
}

function updateLeftPosition() {
  var el = document.querySelector('.timeline');
  var width = el.offsetWidth;
  el = document.querySelector('.list-container');
  el.style.right = width + 'px';
  el.style.left = 0;
}

function updateEdges() {
  requestAnimationFrame(drawLines);
  setTimeout(drawLines, 500);
}

document.addEventListener('readystatechange', () => {
  if(document.readyState === 'complete') {
    updateEdges();
  }
})

function viewsOf(arg) {
  return (arg.slot && [arg]) || (arg._left && [arg._left, arg._right]) || (arg._state && viewsOf(arg._state));
}

function lastViewOf(list) {
  var views = viewsOf(list);
  return views[views.length - 1];
}

function findRoot(list, right) {
  var views = viewsOf(list);
  var view = views[right ? 1 : 0];
  var otherView = views.length > 1 ? views[right ? 0 : 1] : null;
  if((right && !otherView) || (otherView && otherView.id !== 0 && view.id === 0)) return null;
  var level = 0;
  while(view.parent && view.parent.parent) {
    view = view.parent;
    level++;
  }
  return {view, level};
}

function renderList(model) {
  edges.length = 0;
  var entry = model.timeline.get(model.index);
  if(entry.logs.length > 0) {
    entry.logs.forEach(logs => {
      if(typeof logs[0] === 'string') {
        var match = /^\[([A-Za-z0-9]+)(([#\.])\s*([_A-Za-z0-9]+)?)?\s*(\([^\)]+\))?\]/.exec(logs[0]);
        if(match) {
          var msg = '%c]' + logs[0].slice(match[0].length);
          logs = [''].concat(logs.slice(1));
          if(match[5]) {
            msg = ` %c${match[5]}${msg}`;
            logs.unshift('color: white');
          }
          if(match[4]) {
            msg = `%c${match[3]}%c${match[4]}${msg}`;
            logs.unshift('color: #999', 'color: #f06');
          }
          msg = `[%c${match[1]}${msg}`;
          logs.unshift(msg, match[3] ? 'color: orange' : 'color: #f06');
        }
      }
      console.log.apply(console, logs);
    });
  }
  console.debug(`# VERSION INDEX ${model.index}${entry.message ? `: ${entry.message}` : ''}`);
  var i = 0;
  var lists = entry.lists.map(({list, views}) => {
    function renderRoot(root, withProps) {
      var unusedViews = new Set(views.all.values());
      var nodeContainer = renderNodeContainer(i++, root.view.slot, null, 0, views, unusedViews, root.level, 0);
      var state = list._state || list;

      return div('.list', [
        div('.props', [
          div('.id', withProps ? ['id: ', ('id' in state ? state.id : state.slot.id).toString()] : '.'),
          div('.size', withProps ? ['size: ', ('_size' in state ? state._size : state.slot.size).toString()] : '.'),
          div('.group', withProps ? ['group: ', ('_group' in state ? state._group : state.slot.group).toString()] : '.'),
          div('.view-ids', withProps ? ['views: ', ('_left' in state ? `[left id: ${state._left.id}, right id: ${state._right.id}]` : '-').toString()] : '.'),
          div('.last-write', withProps && '_lastWrite' in state ? ['last write: ', (state._lastWrite === 0 ? 'LEFT' : 'RIGHT').toString()] : '.'),
        ]),
        div('.container', [
          nodeContainer,
          // ...Array.from(unusedViews).map(view => renderView(i, {view, isCorrectSlotRef: false}, -1))
        ]),
      ]);
    }
    var left = findRoot(list, false);
    var right = findRoot(list, true);
    var dom = [];
    if(left) {
      dom.push(renderRoot(left, true));
    }
    if(right && (!left || left.view.id !== right.view.id)) {
      dom.push(renderRoot(right, dom.length === 0));
    }
    return dom;
  }).reduce((acc, dom) => acc.concat(dom), []);

  var message = entry.message || '';
  return div('.list-container', {class: {done: !!entry.done}}, [
    h('svg#edges', {style: {zoom: model.zoom}, attr: {'data-temp': Math.random()}, hook: {insert: updateEdges, postpatch: updateEdges}}),
    // div('.message', {class: {done: !!entry.done}}, message),
    div('.lists', {style: {zoom: model.zoom}}, lists)
  ]);
}

function render(DOM) {
  return model => {
    return div('.app', [
      thunk('div.list-container', 0, renderList, model, model.index, model.zoom),
      renderTimeline(DOM, model),
    ])
  };
}

function getSavedValue(key) {
  var value = localStorage.getItem(`${storageKey}-${key}`);
  console.log(`saved value for ${`${storageKey}-${key}`} is ${value}.`);
  return value ? parseInt(value) : 0;
}

function saveValue(key, value) {
  localStorage.setItem(`${storageKey}-${key}`, value.toString());
  console.log(`${key} (${value}) saved.`);
}


function main({DOM, events}) {
  var model = {
    index: 0,
    timeline: Immutable.List()
  };

  var selectVersion$ = DOM.select('.version')
    .events('click')
    .map(ev => parseInt(ev.currentTarget.dataset.index))
    .map(i => model => model.index = i);

  var key$ = fromEvent('keydown', window)
    .map(ev => {
      var fn;
      switch(ev.which) {
        case 36:  /* home  */ fn = model => { model.index = 0; }; break;
        case 35:  /* end   */ fn = model => { model.index = model.timeline.size - 1; }; break;
        case 37:  /* left  */ fn = model => { if(model.index > 0) model.index--; }; break;
        case 39:  /* right */ fn = model => { if(model.index + 1 < model.timeline.size) model.index++; }; break;
        case 107: /* +     */ fn = model => { if(model.zoom < 1) model.zoom = Math.min(1, model.zoom + 0.1); }; break;
        case 109: /* -     */ fn = model => { if(model.zoom > 0.1) model.zoom = Math.max(0.1, Math.round((model.zoom - 0.1)*10)/10); }; break;
        case 219: /* [     */ fn = model => { updateAlignment(-1); }; break;
        case 221: /* ]     */ fn = model => { updateAlignment(1); }; break;
        case 83:  /* s     */ fn = model => { saveValue('current index', model.index); }; break;
        case 88:  /* x     */ console.clear(); fn = false; break;
        case 33:  /* pgup  */ fn = model => {
            for(var i = model.index - 1; i >= 0; i--) {
              if(model.timeline.get(i).done) return (model.index = i);
            }
          }; break;
        case 34:  /* pgdn */ fn = model => {
            for(var i = model.index + 1; i < model.timeline.size; i++) {
              if(model.timeline.get(i).done) return (model.index = i);
            }
          }; break;
        default: /*console.log(ev.which);*/ return null;
      }
      ev.preventDefault();
      return fn;
    })
    .filter(fn => fn);

  const startIndex = getSavedValue('current index');

  return {
    DOM: list$
      .map(args => model => {
        model.timeline = model.timeline.push(args);
        var thisIndex = Math.min(startIndex, model.timeline.size - 1);
        if(thisIndex === startIndex && model.index !== startIndex) {
          console.clear();
          model.index = thisIndex;
        }
      })
      .merge(selectVersion$, key$)
      .scan((model, fn) => (fn(model), model), {index: 0, zoom: 1, timeline: Immutable.List()})
      .filter(model => model.timeline.size > 0)
      .map(render(DOM))
  }
}

// -----------------------------------------------------------------------------

(function() {
  Cycle.run(main, {
    DOM: makeDOMDriver('#app-root')
  });

  setTimeout(() => {
    function firstView(arg) {
      return arg instanceof View ? arg : firstActiveView(arg);
    }
    function firstActiveView(state) {
      return state._left.isNone() ? state.right : state._left;
    }
    function commitToRoot(state) {
      var worker = TreeWorker.defaultPrimary().reset(state, firstActiveView(state), state.group, 2);
      while(!worker.isRoot()) {
        worker.ascend(2);
      }
    }
    function makeList(values, initialSize, usePrepend) {
      const list = L.thaw(L.empty());
      if(initialSize > 0) {
        L.appendArray(values.slice(0, initialSize), list);
        commitToRoot(list);
        values = values.slice(initialSize);
      }
      if(usePrepend) {
        L.prependArray(values, list);
      }
      else {
        L.appendArray(values, list);
      }
      commitToRoot(list);
      return list;
    }

    var BRANCH_FACTOR = 8;
    publish(L.empty(), true, 'START');

    function runCapacityTests1() {
      beginCollectingLogs();
      var list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2), L.empty());
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 1, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR << 1, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(Math.pow(BRANCH_FACTOR, 2), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(Math.pow(BRANCH_FACTOR, 3), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
    }

    function runCapacityTests2() {
      beginCollectingLogs();
      var list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2), L.empty());
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 1, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR << 1, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(Math.pow(BRANCH_FACTOR, 2), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(Math.pow(BRANCH_FACTOR, 3), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(Math.pow(BRANCH_FACTOR, 4), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
    }

    function runCapacityTests3() {
      beginCollectingLogs();
      var list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2), L.empty());
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 1, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(Math.pow(BRANCH_FACTOR, 2), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(Math.pow(BRANCH_FACTOR, 3), list.size), list);
      publish(list, true, `list size: ${list.size}`);
    }

    function runCapacityTests4() {
      beginCollectingLogs();
      var list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2), L.empty());
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 1, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(Math.pow(BRANCH_FACTOR, 2), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(Math.pow(BRANCH_FACTOR, 3), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(Math.pow(BRANCH_FACTOR, 4), list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
      list = L.prependArray(makeValues(BRANCH_FACTOR >>> 2, list.size), list);
      publish(list, true, `list size: ${list.size}`);
    }

    function runAppendTests() {
      var list = L.thaw(L.empty());
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      for(var i = 0; i < values.length; i++) {
        append(list, [values[i]]);
        if(i % BRANCH_FACTOR === BRANCH_FACTOR - 1) {
          // publish(list, true, `list size: ${list.size}`);
        }
      }
      beginCollectingLogs();
      publish(list, true, `list size: ${list.size}`);
      for(var i = 0; i < values.length; i++) {
        var value = getAtOrdinal(list, i);
        publish(list, true, `value at index ${i} is ${value}`);
      }
    }

    function runConcatTests1() {
      beginCollectingLogs();
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) - (BRANCH_FACTOR >>> 2));
      var leftValues = values.slice(0, BRANCH_FACTOR + (BRANCH_FACTOR >>> 1));
      var rightValues = values.slice(leftValues.length);

      var list1 = L.prepend('X', L.fromArray(leftValues));
      publish(list1, true, `list #1 size: ${list1.size}`);

      var list2 = L.prepend('Y', L.fromArray(rightValues));
      publish(list2, true, `list #2 size: ${list2.size}`);

      var list3 = L.concat(list1, list2);
      publish(list3, true, `list #3 size: ${list3.size}`);
      publish(list1, true, 'list1: X + leftValues');
      publish(list2, true, 'list2: Y + rightValues');
      publish(list3, true, 'list3');
    }

    function runConcatTests2() {
      beginCollectingLogs();
      const n0 = BRANCH_FACTOR - 1;
      const n1 = BRANCH_FACTOR - 2;
      var list0 = makeList(makeValues(n0), 1, false);
      publish(list0, true, `list0 size: ${list0.size}`);
      var list1 = makeList(makeValues(n1, n0), 1, false);
      publish(list1, true, `list1 size: ${list1.size}`);
      var list2 = concat(list0, list1);
      publish(list2, true, `list2 size: ${list2.size}`);
      var list3 = L.append('X', 'Y', 'Z', 'K', list2);
      publish(list3, true, `list3 size: ${list3.size}`);
    }

    function runConcatTests3() {
      beginCollectingLogs();
      const n0 = BRANCH_FACTOR - 1;
      const n1 = Math.pow(BRANCH_FACTOR, 2) - n0 - 1;
      var list0 = makeList(makeValues(n0), 1, false);
      publish(list0, true, `list0 size: ${list0.size}`);
      var list1 = makeList(makeValues(n1, n0), 1, false);
      publish(list1, true, `list1 size: ${list1.size}`);
      var list2 = L.concat(list1, list0);
      publish(list2, true, `list2 size: ${list2.size}`);
      var list3 = L.append('X', list2);
      publish(list3, true, `list3 size: ${list3.size}`);
    }

    function runConcatTests4() {
      beginCollectingLogs();
      var values1 = makeValues(2);
      var values2 = makeValues(BRANCH_FACTOR >>> 1);
      var values3 = makeValues((BRANCH_FACTOR << 1) + (BRANCH_FACTOR >>> 2));
      var list1 = L.fromArray(values1)
      publish(list1, true, '[list1] fromArray(values1)');
      var list2 = L.fromArray(values2)
      publish(list2, true, '[list2] fromArray(values2)');
      var list3 = L.fromArray(values3)
      publish(list3, true, '[list3] fromArray(values3)');
      var list4 = L.concat(list3, list2)
      publish(list4, true, '[list4] concat(list3, list2)');
      var list5 = L.concat(list4, list1)
      publish(list5, true, '[list5] concat(list4, list1)');
    }

    function runTraversalTests() {
      var list = L.prependArray(makeValues(Math.pow(BRANCH_FACTOR, 2) + (BRANCH_FACTOR>>>2)), L.empty());
      beginCollectingLogs();
      publish(list, true, `Initial list size: ${list.size}`);
      list = L.appendArray(makeValues(BRANCH_FACTOR*3, list.size), list);
      publish(list, true, `Appended some values. New list size: ${list.size}`);
      var index = list.size - BRANCH_FACTOR - (BRANCH_FACTOR >>> 2);
      var value = list.get(index);
      publish(list, true, `Value at index ${index} is ${value}`);
      index -= 2;
      value = list.get(index);
      publish(list, true, `Value at index ${index} is ${value}`);
      index -= BRANCH_FACTOR;
      value = list.get(index);
      publish(list, true, `Value at index ${index} is ${value}`);
      index += BRANCH_FACTOR;
      value = list.get(index);
      publish(list, true, `Value at index ${index} is ${value}`);
      for(index = 0; index < list.size; index++) {
        value = list.get(index);
        publish(list, true, `Value at index ${index} is ${value}`);
      }
    }

    function runTraversalTests2() {
      const values_h4_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 4) + BRANCH_FACTOR + 1);
      const list = makeList(values_h4_pBF_p1, 1, false);
      beginCollectingLogs();
      publish(list, true, 'Initial list');
      var array = list.toArray().reduce((arr, x, i) => typeof x === 'string' ? arr : arr.concat([[i, x]]), []);
      log(array);
      publish(list, true, 'Final list');
    }

    function runSliceTests1() {
      beginCollectingLogs();
      var list1 = L.fromArray(makeValues(Math.pow(BRANCH_FACTOR, 2) - (BRANCH_FACTOR >>> 2)))
      publish(list1, true, 'Left initial list');
      var list2 = L.fromArray(makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR - (BRANCH_FACTOR >>> 1), list1.size));
      publish(list2, true, 'Right initial list');
      var list3 = list1.concat(list2);
      publish(list3, true, 'Initial concatenated list');

      publish(list3.slice(0, 4), true, 'list3.slice(0, 4)');
      publish(list3.slice(4), true, 'list3.slice(4)');
      var value = list3.get(70);
      publish(list3, true, `the value at index 70 is ${value}`);
      publish(list3.slice(70), true, 'list3.slice(70)');
      publish(list3.slice(70, 128), true, 'list3.slice(70, 128)');
      publish(list3.slice(128), true, 'list3.slice(128)');
    }

    function runSliceTests2() {
      beginCollectingLogs();

      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      var list = L.fromArray(values)._state;
      var halfbf = BRANCH_FACTOR >>> 1;
      var end = BRANCH_FACTOR*halfbf + halfbf;

      publish(list, true, 'Initial list');
      slice(list, 2, end);
      publish(list, true, `list.slice(2, ${end})`);
      commitToRoot(list);
      publish(list, true, `committed to root`);
    }

    function runSliceTests3() {
      beginCollectingLogs();

      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = L.fromArray(values)._state;
      const halfbf = BRANCH_FACTOR >>> 1;
      const start = 0;
      const end = halfbf + 1;

      publish(list, true, 'Initial list');
      slice(list, start, end);
      publish(list, true, `Completed: list.slice(${start}, ${end})`);
    }

    function runSliceTests4() {
      beginCollectingLogs();

      const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
      const list = L.fromArray(values)._state;
      const start = 1;
      const end = BRANCH_FACTOR;

      publish(list, true, 'Initial list');
      slice(list, start, end);
      publish(list, true, `Completed: list.slice(${start}, ${end})`);
    }

    function runSliceTests5() {
      beginCollectingLogs();

      const values = makeValues(BRANCH_FACTOR*2);
      const list = L.fromArray(values)._state;
      const start = BRANCH_FACTOR;
      const end = BRANCH_FACTOR + 1;

      publish(list, true, 'Initial list');
      slice(list, start, end);
      publish(list, true, `Completed: list.slice(${start}, ${end})`);
    }

    function runInsertionTests() {
      beginCollectingLogs();
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = L.fromArray(values);
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      var list1a = L.skip(index, list1);
      publish(list1a, true, `sliced list [${index}:end]`);
      var list1b = L.take(index, list1);
      publish(list1b, true, `sliced list [0:${index}]`);
      var list2 = L.insertArray(index, ['J', 'K'], list1);
    }

    function runDeletionTests1() {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = L.fromArray(values);
      beginCollectingLogs();
      publish(list0, true, `initial list`);
      var list2 = list0.delete(BRANCH_FACTOR >>> 1);
      publish(list2, true, `updated list`);
      for(var i = 0; i < list2.size; i++) {
        var value = list2.get(i);
        publish(list2, true, `value at index ${i} is ${value}`);
      }
    }

    function runDeletionTests2() {
      beginCollectingLogs();
      var values = makeValues(BRANCH_FACTOR*4);
      var list0 = L.fromArray(values);
      var list1 = L.empty().prependArray(values);
      var list2 = list0.delete(BRANCH_FACTOR + 2);
      log(`will now delete from list 2 (size: ${list2.size}) at ${list1.size - BRANCH_FACTOR - 2}`);
      var list3 = list1.delete(list1.size - BRANCH_FACTOR - 2);
    }

    function runDeletionTests3() {
      beginCollectingLogs();
      var values = makeValues(BRANCH_FACTOR - 1);
      var list0 = L.fromArray(values);
      var list1 = list0.delete(0);
      var list2 = list0.delete(1);
      var list3 = list0.delete(BRANCH_FACTOR - 2);
    }

    function runDeletionTests4() {
      beginCollectingLogs();
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = L.fromArray(values);
      var list1 = list0.delete(values.length - 1);
      var list2 = list0.delete(values.length - (BRANCH_FACTOR >>> 1));
      var list3 = list0.delete(values.length - BRANCH_FACTOR);
    }

    function runDeletionTests5() {
      beginCollectingLogs();
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = L.fromArray(values);
      var list1 = list0.delete(0);
      var list2 = list0.delete(BRANCH_FACTOR >>> 1);
      var list3 = list0.delete(BRANCH_FACTOR - 1);
    }

    function runCompositeTests() {
      beginCollectingLogs();
      var list = L.empty();
      for(var i = 0, m = BRANCH_FACTOR*(BRANCH_FACTOR + 2); i < m; i++) {
        list = L.append(`+${i+1}`, list);
        publish(list, true, `appended "+${i+1}" --> list size: ` + list._size);
        i++;
        list = L.prepend(`-${i+1}`, list);
        publish(list, true, `prepended "-${i+1}" --> list size: ` + list._size);
      }
    }

    function runCompositeTests2() {
      beginCollectingLogs();
      var list = L.empty();
      var offset = BRANCH_FACTOR + (BRANCH_FACTOR >>> 2);
      var values = [];
      for(var i = 0, m = BRANCH_FACTOR*BRANCH_FACTOR*(BRANCH_FACTOR + 2); i < m; i++) {
        var value = `+${i+1}`;
        list = L.append(value, list);
        publish(list, true, `appended "${value}" --> list size: ` + list._size);
        values.push(value);
        value = `-${(++i)+1}`;
        list = L.prepend(value, list);
        values.unshift(value);
        publish(list, true, `prepended "-${i+1}" --> list size: ` + list._size);
        if(offset + 1 < list._size) {
          var a = L.get(offset, list);
          publish(list, true, `get at ${offset}: "${a}", should be: "${values[offset]}"`);
          var b = L.get(-offset, list);
          publish(list, true, `get at ${-offset}: "${b}", should be: "${values[values.length - offset]}"`);
        }
      }
    }

    function runCompositeTests3() {
      beginCollectingLogs();
      var list = L.empty();
      for(var i = 0; i < 1100; i++) {
        list = L.append(i, list);
        publish(list, true, `appended "${i}" --> list size: ` + list._size);
        var index = L.size(list) >>> 1;
        var value = L.get(index, list);
        publish(list, true, `get at ${index}: "${value}"`);
      }
    }

    function runUpdateTests() {
      beginCollectingLogs();

      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list1 = L.fromArray(values);
      var list2 = list1.set(0, 'J');
      list2 = list2.set(2, 'K');
      list2 = list2.set(5, 'L');
      publish(list1, true, `original list should be: [${values}]`);
      publish(list2, true, `updated list should be: [J,B,K,X,Y,L]`);

      values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      list1 = L.fromArray(values);
      list2 = list1.set(0, 'J');
      list2 = list2.set(BRANCH_FACTOR*2, 'K');
      list2 = list2.set(values.length - 1, 'L');
      publish(list1, true, `original list`);
      publish(list2, true, `updated list`);

      list1 = L.fromArray(values);
      list2 = list1.set(values.length - 1, 'L');
      list2 = list2.set(BRANCH_FACTOR*2, 'K');
      list2 = list2.set(0, 'J');
      publish(list1, true, `original list`);
      publish(list2, true, `updated list`);

      list1 = L.fromArray(values);
      list2 = list1.set(BRANCH_FACTOR*2, 'K');
      list2 = list2.set(values.length - 1, 'L');
      list2 = list2.set(0, 'J');
      list2 = list2.set(1, 'H');
      publish(list1, true, `original list`);
      publish(list2, true, `updated list`);
    }

    runCompositeTests3();

  }, 100);
})();

function text(i) {
  return '' + i;
}

function makeValues(count, offset = 0, format = text) {
  var values = new Array(count);
  if(typeof offset === 'function') format = offset, offset = 0;
  for(var i = 0; i < count; i++) {
    values[i] = format(i + offset);
  }
  return values;
}
