import Cycle from '@cycle/most-run';
import {fromEvent} from 'most';
import {create} from '@most/create'
import {a, h, div, span, thunk, makeDOMDriver} from '@motorcycle/dom';
import {List, setCallback} from '../lib/collectable/list';
// import {ListState} from '../lib/collectable/list/state';
import {nextId as nextInternalId, log, publish} from '../lib/collectable/list/common';
import {ascend, tryCommitOtherView} from '../lib/collectable/list/traversal';
import {Slot} from '../lib/collectable/list/slot';
import {View} from '../lib/collectable/list/view';
import Immutable from 'immutable';
import CJ from 'circular-json';

require('./styles.styl');

var nextId = 0;

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
  // var isInverse = number % (colorWheelSize*4) > colorWheelSize*2;
  // return isInverse ? colorFillInv(index, isMid) : colorFill(index, isMid);
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

var list$ = create(add => {
  var logs = [];
  var previousList = [];
  setCallback(function(lists, done, message) {
    if(Array.isArray(lists)) {
      if(arguments.length === 1) {
        if(lists.find(arg => arg instanceof Error)) {
          logs.push(lists);
          message = 'ERROR';
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
      list = CJ.parse(CJ.stringify(list));
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
  return isReservedNode(slot); // && slot.slots[0] === null && slot.slots[slot.slots.length - 1] === null;
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
    if(listsEl.children.length > 1) {
      // el.scrollLeft = listsEl.children[1].offsetLeft - (el.offsetWidth/2)
      // el.scrollLeft = el.scrollWidth;
    }
    else {
      // el.scrollLeft = el.scrollWidth/2 - el.offsetWidth/2;
      // el.scrollLeft = el.scrollWidth;
    }
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
    ? slot.slots.map((value, i) => !value
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
  return (arg.slot && [arg]) || (arg.left && [arg.left, arg.right]) || (arg._state && viewsOf(arg._state));
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
    entry.logs.forEach(logs => console.log.apply(console, logs));
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
          div('.size', withProps ? ['list size: ', ('size' in state ? state.size : state.slot.size).toString()] : '!')
        ]),
        div('.container', [
          nodeContainer,
          // ...Array.from(unusedViews).map(view => renderView(i, {view, isCorrectSlotRef: false}, -1))
        ])
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
    div('.message', {class: {done: !!entry.done}}, message),
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

  return {
    DOM: list$
      .map(args => model => {
        model.timeline = model.timeline.push(args);
        var startIndex = 340;
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
//     var list = List.empty();
// publish(list, true, 'EMPTY LIST');
    // var list = listOf(95);
    // list = listOf(1).concat(listOf(32, 1), listOf(1, 33)).append(...makeValues(70, 34));
    function getState(arg) {
      return arg instanceof List ? arg._state : arg;
    }
    function firstView(arg) {
      return arg instanceof View ? arg : firstActiveView(arg);
    }
    function firstActiveView(arg) {
      var state = getState(arg);
      return state.left.isNone() ? state.right : state.left;
    }
    function commitToRoot(arg) {
      var state = getState(arg);
      function commit(view, isOther) {
        var otherView = state.getOtherView(view.anchor);
        var isUncommitted = !isOther && !otherView.isNone();
        var level = 0;
        while(!view.parent.isNone()) {
          var oldParent = view.parent;
          var parent = ascend(state.group, view, 2);
          if(isUncommitted && tryCommitOtherView(state, otherView, oldParent, parent, 0)) {
            isUncommitted = false;
          }
          view.parent = parent;
          view.slot = parent.slot.slots[view.slotIndex];
          view = parent;
        }
      }
      if(!state.left.isNone()) commit(state.left, false);
      if(!state.right.isNone()) commit(state.right, true);
    }

    var BRANCH_FACTOR = 8;
    // var m = BRANCH_FACTOR/2;
    // var n0 = BRANCH_FACTOR*m + 1;
    // var n1 = BRANCH_FACTOR*m + 3;
    // var left = List.of(makeValues(n0));
    // var right = List.of(makeValues(n1, n0));
    // var list = List.of(makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2));
    // var list = List.of(makeValues(BRANCH_FACTOR*BRANCH_FACTOR + BRANCH_FACTOR + 1)).asMutable();
    var list = List.empty().asMutable();
    var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
    // var values = makeValues(BRANCH_FACTOR*2, list.size);
    for(var i = 0; i < values.length; i++) {
      list.prepend(values[i]);
    }
publish(list, true, 'all values added');
publish(list, true, `value #${8}: ${list.get(8)}`);
//     for(var i = 0; i < values.length; i++) {
// publish(list, true, `value #${i}: ${list.get(i)}`);
//     }
    // log(`reset left view to position 0: ${list.get(0)}`);
// publish(list, true, `pre-commit`);
//     commitToRoot(list);
    // var list = List.of(makeValues(BRANCH_FACTOR));
    // list = list.concat(List.of(makeValues(1, BRANCH_FACTOR)));
    // list = list.appendArray(makeValues(BRANCH_FACTOR*2, BRANCH_FACTOR + 1));
//     var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
//     var index = values.length >>> 1;
//     var value = text(index);
// console.log(`${values.length} values; #${index} should equal "${value}"`);
//     var list = List.empty().prependArray(values);
    // var list = listOf(1).concat(listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1))
    //                     .append(...makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2))
    //                     .prepend('X');

// publish(list, true, `pre-get index ${index}`);
    // log(`item at index ${index}: ${list.get(index)}`);
// publish(list, true, `pre-get index ${index+1}`);
//     log(`item at index ${index+1}: ${list.get(index+1)}`);
// publish(list, true, `pre-get index ${index-1}`);
//     log(`item at index ${index-1}: ${list.get(index-1)}`);
// publish(list, true, `post-get index ${index-1}`);
//     list = list.append(...makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2));
//     log(`item at index ${index}: ${list.get(index)}`);
// publish(list, true, `got index ${index}`);

    // var iterations = 70;
    // for(var i = 0, c = 1, d = 0, prepend = true; i < iterations; i++, d += c, c = ((d>>>2)%2 === 1 ? i : iterations - i), prepend = !prepend) {
    //   list = prepend ? list.prependArray(makeValues(c, d)) : list.appendArray(makeValues(c, d))
    // }

//     var n0 = Math.pow(BRANCH_FACTOR, 2) + 1;
//     var n1 = BRANCH_FACTOR + 1;

//     list = List.of(makeValues(n0));
// publish(list, true, 'PRE CONCAT');
//     list = list.concat(List.of(makeValues(n1, n0)));
//     list = list.append('X');
      // list = list.prepend('X');
      // list = list.append('Y', 'Z');
// publish(left, true, 'FINAL STATE #1');
      // list = list.append(...makeValues(BRANCH_FACTOR*145 + BRANCH_FACTOR/2 + 1));
      // list = list.prepend(...makeValues(BRANCH_FACTOR*145 + BRANCH_FACTOR/2 + 1));
      // list = list.prepend(...makeValues(BRANCH_FACTOR*2 + BRANCH_FACTOR/2));
      // list = list.prepend(...makeValues(BRANCH_FACTOR*3 + BRANCH_FACTOR/2));
      // list = list.append(...makeValues(BRANCH_FACTOR*2 + BRANCH_FACTOR/2));
      // list = list.prepend(...makeValues(BRANCH_FACTOR*3 + BRANCH_FACTOR/2));
      // list = list.append(...makeValues(BRANCH_FACTOR*2 + BRANCH_FACTOR/2));
      // list = list.append(...makeValues(BRANCH_FACTOR*3 + BRANCH_FACTOR/2));
      // list = list.prepend(...makeValues(BRANCH_FACTOR*2 + BRANCH_FACTOR/2));
      // list = list.prepend(...makeValues(BRANCH_FACTOR*3 + BRANCH_FACTOR/2));
// publish(left, true, 'FINAL STATE #2');
      // left = left.prepend(...makeValues(BRANCH_FACTOR*BRANCH_FACTOR*BRANCH_FACTOR+1, 99));
// publish([left], true, 'left');
//       var right = MutableList.empty().append(...makeValues(BRANCH_FACTOR*3, BRANCH_FACTOR));
// publish([right], true, 'right; pre-get');
// log(`the value at position #40 is ${right.get(BRANCH_FACTOR + 8)}`);
// publish([right], true, 'post-get');
// publish([left, right], true, 'pre-concat');
//       left.concat(right);

publish(list, true, 'FINAL STATE');
    // var prefix = 'A'.charCodeAt(0);
    // var sizes = [7, 56, 1, 13, 2, 5, 70];
    // var offset = 0;
    // for(var i = 0; i < sizes.length; i++, prefix++) {
    //   var size = sizes[i];
    //   var newList = List.of(makeValues(size, offset, i => `${String.fromCharCode(prefix)}${i}`));
    //   offset += size;
    //   list = i === 0 ? newList : list.concat(newList);
    // }
    // list = list.append('X');
    // list = list.append('A', 'B', 'C');
    // for(var i = 0, j = 1, c = 'A'; i < 20; i++, j = (j*257>>>1), c = String.fromCharCode(c.charCodeAt(0) + 1)) {
    //   list = list
    //     ? list.concat(List.of(makeValues(j%257 + 1, i => `${c}${i}`)))
    //     : List.of(makeValues(3, i => `${c}${i}`));
    // }
    // runTest();

  }, 100);
})();

function listOf(size, offset = 0) {
  const values = makeValues(size, offset);
  var list = List.empty();
  while(list.size < size) {
    list = list.append(...values.slice(list.size, list.size + 13));
  }
  return list;
}

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

function runTest() {
  var BRANCH_FACTOR = 8;
  var BRANCH_INDEX_BITCOUNT = 3;
  var large = BRANCH_FACTOR << BRANCH_INDEX_BITCOUNT;
  var small = BRANCH_FACTOR;
  var group = nextInternalId();

  function copySum(src, srcidx, dest, destidx) {
      dest.slots[destidx].sum = src.slots[srcidx].sum;
  }

  function makeRelaxedPair() {
      var offset = 0;
      var left = makeRelaxedSlot([
          makeStandardSlot(large, 1, 0),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(small, 1, offset += large),
          makeStandardSlot(small, 1, offset += small),
          makeStandardSlot(large, 1, offset += small),
          makeStandardSlot(large, 1, offset += large)
      ]);
      var right = makeRelaxedSlot([
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(small, 1, offset += large),
          makeStandardSlot(small, 1, offset += small),
      ]);
      return [left, right];
  }
  function makeBalancedPair(originalPair) {
      var offset = 0;
      var left = makeRelaxedSlot([
          makeStandardSlot(large, 1, 0),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large),
          makeStandardSlot(large, 1, offset += large)
      ]);
      var right = makeRelaxedSlot([
          makeStandardSlot(small * 3, 1, offset += large),
          makeStandardSlot(small, 1, offset += small * 3)
      ]);
      copySum(originalPair[0], 4, left, 4);
      copySum(originalPair[0], 6, left, 5);
      copySum(originalPair[0], 7, left, 6);
      copySum(originalPair[1], 0, left, 7);
      copySum(originalPair[1], 1, right, 0);
      copySum(originalPair[1], 3, right, 1);
      left.recompute = 4;
      return [left, right];
  }
  function makeStandardSlot(requiredSize, level, valueOffset) {
    var slots;
    var size = 0;
    var subcount = 0;
    if (level === 0) {
      slots = makeValues(requiredSize, valueOffset);
      size = requiredSize;
    }
    else {
      slots = [];
      var lowerSubtreeMaxSize = 1 << (BRANCH_INDEX_BITCOUNT * level);
      while (size < requiredSize) {
        var lowerSize = Math.min(requiredSize - size, lowerSubtreeMaxSize);
        var lowerSlot = makeStandardSlot(lowerSize, level - 1, valueOffset + size);
        subcount += lowerSlot.slots.length;
        size += lowerSize;
        slots.push(lowerSlot);
      }
    }
    var slot = new Slot(1, size, 0, -1, subcount, slots);
    return slot;
  }
  function makeRelaxedSlot(slots) {
    var size = 0, subcount = 0, sum = 0;
    slots.forEach(slot => {
      size += slot.size;
      subcount += slot.slots.length;
      sum += slot.size;
      slot.sum = sum;
    });
    var slot = new Slot(group, size, 0, 0, subcount, slots);
    return slot;
  }
  function createViewFromSlot(slot) {
    var start = 0, end = slot.size, index = 0, group = slot.group;
    var view = View.none();
    do {
      start = end - slot.size;
      view = new View(group, start, end, index, 0, 0, false, view, slot);
      index = slot.slots.length - 1;
      slot = slot.slots[slot.slots.length - 1];
    } while (slot instanceof Slot);
    return view;
  }
  function buildListFromRootSlot(slot) {
    var list = new List(slot.size, [createViewFromSlot(slot)], []);
    return list;
  }

  var nodesA = makeRelaxedPair();
  var nodesB = makeBalancedPair(nodesA);
  var listA0 = buildListFromRootSlot(nodesA[0]);
  var listA1 = buildListFromRootSlot(nodesA[1]);
  publish([listA0, listA1], true, 'Artificial list pair created for concatenation testing');
  var listA2 = listA0.concat(listA1);
  var listB0 = buildListFromRootSlot(nodesB[0]);
  var listB1 = buildListFromRootSlot(nodesB[1]);
  publish([listB0, listB1], true, 'Comparison pair created for concatenation testing');
}