import Cycle from '@cycle/most-run';
import {fromEvent} from 'most';
import {create} from '@most/create'
import {a, h, div, span, thunk, makeDOMDriver} from '@motorcycle/dom';
import {List, setCallback, getProp} from '../lib/collectable/list';
import Immutable from 'immutable';
import CJ from 'circular-json';

require('./styles.styl');

var nextId = 0;

function viewSlotIndex(view) {
  return view.meta & 3;
}

function getViewSlotKey() {
  var id, index;
  if(arguments.length === 1) {
    var view = arguments[0];
    if(!view.parent.parent) return null;
    id = view.parent.slot.id;
    index = viewSlotIndex(view);
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
  setCallback(function(lists, done, message) {
    if(Array.isArray(lists)) {
      if(arguments.length === 1) {
        logs.push(lists.map(arg => typeof arg === 'object' ? CJ.parse(CJ.stringify(arg)) : arg));
        return;
      }
    }
    else {
      lists = [lists];
    }

    lists = lists.map(list => {
      list = CJ.parse(CJ.stringify(list));
      var views = {
        bySlotId: new Map(),
        byLocation: new Map(),
        byId: new Map(),
        byParentId: new Map(),
        all: new Set()
      };
      list._views.forEach((view, i) => {
        do {
          if(!('index' in view)) view.index = i;
          views.byId.set(view.id, view);
          views.all.add(view);
          addView(views.bySlotId, view.slot.id, view);
          if(view.parent.parent) {
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
  return slot && (slot.shift === 0 || slot.group === 1);
}

function isDummyNode(slot) {
  return slot && slot.group === 1;
}

var containers = [];
var edges = [];

function getElement(id) {
  var el = document.getElementsByClassName(id)[0];
  if(!el) {
    console.log(id);
    debugger;
  }
  return el;
}

function getEndpointElements(endpoint) {
  var vEl, hEl;
  switch(endpoint.type) {
    case 'slot':
      vEl = getElement(`slot-${endpoint.listIndex}-${endpoint.id}-${endpoint.index}`);
      break;
    case 'dslot':
      vEl = getElement(`dslot-${endpoint.listIndex}-${endpoint.branch}-${endpoint.index}`);
      break;
    case 'view':
      vEl = getElement(`view-${endpoint.listIndex}-${endpoint.id}`);
      hEl = vEl.parentNode;
      break;
    case 'dummy':
      vEl = getElement(`dummy-${endpoint.listIndex}-${endpoint.branch}-${endpoint.index}`);
      break;
    case 'node':
      vEl = getElement(`node-${endpoint.listIndex}-${endpoint.id}`);
      hEl = vEl.parentNode;
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

    case 'dummy':
      color = '#03a9f4';
      width = 4;
      extra = ' stroke-dasharray="3, 1"';
      break;

    case 'dslot':
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
  svgEl.style.width = (listsEl.offsetLeft + listsEl.offsetWidth) + 'px';
  svgEl.style.height = (listsEl.offsetTop + listsEl.offsetHeight) + 'px';
  var paths = `
    ${arrow('view-arrow', '#0680b7')}
    ${arrow('slot-arrow', '#333')}
    ${arrow('dslot-arrow', '#999')}
    ${arrow('dummy-arrow', '#03a9f4')}
  `;
  edges.forEach(edge => {
    var type = `${edge[0].type}-${edge[1].type}`;
    var [vStartEl, hStartEl] = getEndpointElements(edge[0]);
    var [vEndEl, hEndEl] = getEndpointElements(edge[1]);
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
      case 'dslot-dummy':
        x0 = getMidX(vStartEl);
        x1 = getMidX(vEndEl);
        y0 = vStartEl.offsetTop + vStartEl.offsetHeight;
        y1 = vEndEl.offsetTop;
        h = Math.floor((y1 - y0)/1.5);
        w = Math.floor((x1 - x0)/20);
        cx0 = x0 + w;
        cy0 = y0 + h;
        cx1 = x1 - w;
        cy1 = y1 - h;
        break;

      case 'dummy-node':
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
      el.scrollLeft = listsEl.children[1].offsetLeft - (el.offsetWidth/2)
    }
    else {
      el.scrollLeft = el.scrollWidth;
    }
    el.scrollTop = el.scrollHeight;
  }, 100);
}

function renderView(listIndex, {view, isCorrectSlotRef}, index) {
  var props = [
    span('.prop.id', [span('.value', view.id.toString())]),
    span('.prop.group', [span('.value', {style: chooseStyle(view.group)}, [view.group])]),
    span('.prop.slotIndex', [span('.value', viewSlotIndex(view).toString())])
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

function renderNode(listIndex, {slot, hasChildren, isLeaf, isDummy, views, branchId, parentBranchId}, slotIndex) {
  var invalidSlotsCount = getProp('invalidSlotsCount', slot);

  var slots = isLeaf || hasChildren
    ? slot.slots.map((value, i) => !value
    ? div('.slot.void', {class: {leaf: isLeaf}}, [span('.slot-index', i.toString())]) : isLeaf
      ? div('.slot.leaf', value) : isDummyNode(value)
      ? div(`.dslot-${listIndex}-${branchId}-${i}.slot.mid.dummy`, [span('.slot-index', i.toString())])
      : div(`.slot-${listIndex}-${value.id}-${i}.slot.mid`, {class: {relaxed: getProp('isRelaxed', slot)}}, [
        span('.slot-index', i.toString()),
        span('.slot-prop.count', getProp('slotCount', value)),
        span('.slot-prop.range', {invalid: slot.slots.length - invalidSlotsCount >= i}, getProp('cumulativeRange', value)),
      ]))
    : [span('.no-slots', 'Empty')];

  const nodeViews = [
    div(`${isDummy ? `.dummy-${listIndex}-${parentBranchId}-${slotIndex}` : `.node-${listIndex}-${slot.id}`}.node`, {class: {leaf: isLeaf, dummy: isDummy}}, [
      div('.props', [
        span('.prop.id', [span('.value', [slot.id])]),
        span('.prop.group', [span('.value', {style: chooseStyle(slot.group)}, [slot.group])]),
        span('.prop.slotCount', [span('.value', [getProp('slotCount', slot)])]),
        span('.prop.invalidSlotsCount', [span('.value', invalidSlotsCount.toString())]),
        span('.prop.cumulativeRange', [span('.value', [getProp('cumulativeRange', slot)])]),
      ]),
      div('.slots', slots)
    ])
  ];

  if(views) {
    views.forEach((view, i) => {
      nodeViews.push(renderView(listIndex, view, i));
    });
  }
  return div('.node-view-container', {class: {'has-view': !!views}}, nodeViews);
}

function matchViewsToSlot(listIndex, slot, parent, parentSlotIndex, parentBranchId, parentViewId, views, unusedViews) {
  var viewsBySlotIndex = parent && views.byLocation.get(getViewSlotKey(parent.id, parentSlotIndex));
  var viewsBySlotId = slot && views.bySlotId.get(slot.id);
  var viewsByParentId = parentSlotIndex === -1 && parentViewId && views.byParentId.get(parentViewId);
  var slotRefs = new Set();
  var viewRefs = new Set();
  var items = [];
  var isInputSlotDummy = !!slot && isDummyNode(slot);
  var makeItem = (slot, views) => {
    var isLeaf = isLeafNode(slot);
    var item = {
      branchId: ++nextId,
      parentBranchId,
      slot,
      views,
      isLeaf,
      isDummy: !!slot && isDummyNode(slot),
      hasChildren: !isLeaf && !!slot.slots && slot.slots.length > 0
    };
    return item;
  };
  var addView = view => {
    if(unusedViews.has(view) && !viewRefs.has(view)) {
      var item;
      viewRefs.add(view);
      if(view.parent.parent) {
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
      item.views.push({view, isCorrectSlotRef: slot === view.slot || isInputSlotDummy});
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
  var isDummy = isDummyNode(slot);
  var isLeaf = isLeafNode(slot);

  if(parent && parentSlotIndex >= 0) {
    if(isDummy) {
      edges.push([
        {type: 'dslot', listIndex, branch: parentBranchId, index: parentSlotIndex},
        {type: 'dummy', listIndex, branch: parentBranchId, index: parentSlotIndex}
      ]);
    }
    else if(parentSlotIndex >= 0) {
      edges.push([
        {type: 'slot', listIndex, id: slot.id, index: parentSlotIndex},
        {type: 'node', listIndex, id: slot.id}
      ]);
    }
  }

  var items = matchViewsToSlot(listIndex, slot, parent, parentSlotIndex, parentBranchId, parentView && parentView.id, views, unusedViews);
  if(parentSlotIndex >= 0 && items.length > 1 && items[0].isDummy && items[1].views) {
    edges.push([
      {type: 'dummy', listIndex, branch: items[0].parentBranchId, index: parentSlotIndex},
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
    var childSlots = item.slot.slots.filter(s => s), orphaned = false;
    if(childSlots.length === 0) {
      childSlots = [null]; // make sure a single child will render
      orphaned = true;
    }
    branches.push(div(`.branch-${listIndex}-${item.branchId}.branch`, {
      class: {'is-dummy': item.isDummy, 'is-node': !item.isDummy, 'is-leaf': item.isLeaf}}, [
      renderNode(listIndex, item, parentSlotIndex),
      item.hasChildren || !item.isLeaf
        ? div('.branch-children', childSlots.map((slot, i) =>
            renderNodeContainer(listIndex, slot, item.slot, orphaned ? -1 : i, views, unusedViews, level + 1, item.branchId, firstView)))
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
}

document.addEventListener('readystatechange', () => {
  if(document.readyState === 'complete') {
    updateEdges();
  }
})

function renderList(model) {
  edges.length = 0;
  var entry = model.timeline.get(model.index);
  console.debug(`# VERSION INDEX ${model.index}${entry.message ? `: ${entry.message}` : ''}`);
  if(entry.logs.length > 0) {
    entry.logs.forEach(logs => console.log.apply(console, logs));
  }
  var lists = entry.lists.map(({list, views}, i) => {
    var root = list._views[list._views.length - 1];
    var unusedViews = new Set(views.all.values());
    while(root.parent.parent) root = root.parent;
    var nodeContainer = renderNodeContainer(i, root.slot, null, 0, views, unusedViews, 0, 0);
    return div('.list', [
      div('.props', [
        div('.size', 'list size: ' + list.size)
      ]),
      div('.container', [
        nodeContainer,
        ...Array.from(unusedViews).map(view => renderView(i, {view, isCorrectSlotRef: false}, -1))
      ])
    ]);
  })

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
        case 36:  /* home */ fn = model => { model.index = 0; }; break;
        case 35:  /* end  */ fn = model => { model.index = model.timeline.size - 1; }; break;
        case 188: /*  ,   */ fn = model => { if(model.index > 0) model.index--; }; break;
        case 190: /*  .   */ fn = model => { if(model.index + 1 < model.timeline.size) model.index++; }; break;
        case 107: /*  +   */ fn = model => { if(model.zoom < 1) model.zoom = Math.min(1, model.zoom + 0.1); }; break;
        case 109: /*  -   */ fn = model => { if(model.zoom > 0.1) model.zoom = Math.max(0.1, Math.round((model.zoom - 0.1)*10)/10); }; break;
        case 88:  /*  x   */ console.clear(); fn = false; break;
        case 33:  /* pgup */ fn = model => {
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
        var startIndex = 1;
        if(model.timeline.size > startIndex && model.index !== startIndex) {
          console.clear();
          model.index = startIndex;
        }
      })
      .merge(selectVersion$, key$)
      .scan((model, fn) => (fn(model), model), {index: 0, zoom: 1, timeline: Immutable.List()})
      .filter(model => model.timeline.size > 0)
      .map(render(DOM))
  }
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
  main: i => colors[i][2],
  inverse: i => colors[i][0],
  mid: i => colors[i][1],
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
function chooseStyle(id) {
  var number;
  if(id === null || id === void 0) number = 0;
  else if(typeof id !== 'number') number = hashString(safe(id));
  else number = id;
  var index = number % colorWheelSize;
  var isMid = number % (colorWheelSize*2) > colorWheelSize;
  var isInverse = number % (colorWheelSize*4) > colorWheelSize*2;
  return isInverse ? colorFillInv(index, isMid) : colorFill(index, isMid);
}


// -----------------------------------------------------------------------------

(function() {
  var list = listOf(69);
  Cycle.run(main, {
    DOM: makeDOMDriver('#app-root')
  });
  list = list.append('FOO', 'BAR', 'BAZ');
})();

function listOf(size) {
  const values = makeValues(size);
  var list = List.empty();
  while(list.size < size) {
    list = list.append(...values.slice(list.size, list.size + 7));
  }
  return list;
}

function text(i) {
  return '' + i;
}

function makeValues(count) {
  var values = [];
  for(var i = 0; i < count; i++) {
    values.push(text(i));
  }
  return values;
}

