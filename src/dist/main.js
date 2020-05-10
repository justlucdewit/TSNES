// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.ts":[function(require,module,exports) {
"use strict";

exports.__esModule = true;

var bus_1 = require("./bus");

var cartridge_1 = require("./cartridge");

var b = new bus_1.Bus();
console.log(b);
var romload = document.getElementById("romload");

if (romload != null) {
  romload.onclick = function () {
    b.insertCartridge(new cartridge_1.Cardridge());
  };
} // const cpu = new CPU6502();
// /*
//     *=$8000
//     LDX #10
//     STX $0000
//     LDX #3
//     STX $0001
//     LDY $0000
//     LDA #0
//     CLC
//     loop
//     ADC $0001
//     DEY
//     DNE loop
//     STA $0002
//     NOP
//     NOP
//     NOP
// */
// const program = [
//   //1:00:16
//   0xa2, // store 0x0a to register A
//   0x0a,
//   0x8e, // store register A to 0x0000
//   0x00,
//   0x00,
//   0xa2, // store 0x03 in register A
//   0x03,
//   0x8e, // store register A to 0x0001
//   0x01,
//   0x00,
//   0xac, // store 0x0000 to acc
//   0x00,
//   0x00,
//   0xa9, // load 00 into acc
//   0x00,
//   0x18, // clear carry
//   0x6d, // add bit at 0001 to acc
//   0x01,
//   0x00,
//   0x88,
//   0xd0, // branch back
//   0xfa, //
//   0x8d,
//   0x02,
//   0x00,
//   0xea,
//   0xea,
//   0xea,
// ];
// cpu.loadProgram(0x8000, program);
// let view = document.getElementById("view");
// let viewBar = document.getElementById("viewbar");
// let viewTitle = document.getElementById("viewtitle");
// let currentPage = "80";
// let running = false;
// const updateTitle = () => {
//   if (viewTitle != null) {
//     const newTitle = fillInHex(currentPage, 2);
//     viewTitle.innerHTML = `<h1><b>View on page 0x${newTitle}:</h1></b>`;
//   }
// };
// updateTitle();
// if (viewBar != null) {
//   viewBar.innerHTML = `
//   <button id="back10"><<</button>
//   <button id="back1"><</button>
//   <button id="next1">></button>
//   <button id="next10">>></button>
//   <button id="step">step</button>
//   <button id="run">run</button>
//   <button id="stop">stop</button>`;
// }
// const setFlagColor = (el: HTMLElement | null, active: boolean) => {
//   if (el != null) {
//     if (active) {
//       el.classList.remove("red");
//       el.classList.add("green");
//     } else {
//       el.classList.remove("green");
//       el.classList.add("red");
//     }
//   }
// };
// const updateRegisters = () => {
//   const a = document.getElementById("regA");
//   const x = document.getElementById("regX");
//   const y = document.getElementById("regY");
//   if (a != null && x != null && y != null) {
//     x.innerHTML = "X = 0x" + fillInHex(cpu.x.toString(16), 2);
//     y.innerHTML = "Y = 0x" + fillInHex(cpu.y.toString(16), 2);
//     a.innerHTML = "A = 0x" + fillInHex(cpu.a.toString(16), 2);
//   }
// };
// updateRegisters();
// const updateFlags = () => {
//   const f1 = document.getElementById("cary");
//   const f2 = document.getElementById("zero");
//   const f3 = document.getElementById("interupts");
//   const f4 = document.getElementById("decimal");
//   const f5 = document.getElementById("break");
//   const f6 = document.getElementById("unused");
//   const f7 = document.getElementById("overflow");
//   const f8 = document.getElementById("negative");
//   setFlagColor(f1, cpu.GetFlag(0));
//   setFlagColor(f2, cpu.GetFlag(1));
//   setFlagColor(f3, cpu.GetFlag(2));
//   setFlagColor(f4, cpu.GetFlag(3));
//   setFlagColor(f5, cpu.GetFlag(4));
//   setFlagColor(f6, cpu.GetFlag(5));
//   setFlagColor(f7, cpu.GetFlag(6));
//   setFlagColor(f8, cpu.GetFlag(7));
// };
// updateFlags();
// const changePage = (delta: number) => {
//   let n = parseInt(currentPage, 16) + delta;
//   if (n < 0) {
//     n = 0x00;
//   }
//   if (n > 0xff) {
//     n = 0xff;
//   }
//   currentPage = n.toString(16);
//   renderPage();
//   updateTitle();
// };
// const renderPage = () => {
//   if (view != null) {
//     view.innerHTML =
//       "<h2>" + printPage(cpu, parseInt(currentPage, 16)) + "</h2>";
//   }
// };
// renderPage();
// let step = document.getElementById("step");
// if (step != null) {
//   step.onclick = () => {
//     cpu.step();
//     updateFlags();
//     renderPage();
//     updateRegisters();
//   };
// }
// let b1 = document.getElementById("back10");
// if (b1 != null) {
//   b1.onclick = () => {
//     changePage(-16);
//   };
// }
// let b2 = document.getElementById("back1");
// if (b2 != null) {
//   b2.onclick = () => {
//     changePage(-1);
//   };
// }
// let b3 = document.getElementById("next10");
// if (b3 != null) {
//   b3.onclick = () => {
//     changePage(16);
//   };
// }
// let b4 = document.getElementById("next1");
// if (b4 != null) {
//   b4.onclick = () => {
//     changePage(1);
//   };
// }
// const autoRun = () => {
//   cpu.step();
//   updateFlags();
//   renderPage();
//   updateRegisters();
//   if (running) {
//     window.requestAnimationFrame(autoRun);
//   }
// };
// let brun = document.getElementById("run");
// if (brun != null) {
//   brun.onclick = () => {
//     running = true;
//     autoRun();
//   };
// }
// let bstop = document.getElementById("stop");
// if (bstop != null) {
//   bstop.onclick = () => {
//     running = false;
//   };
// }
},{}],"C:/Users/lucde/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60662" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["C:/Users/lucde/AppData/Roaming/npm/node_modules/parcel/src/builtins/hmr-runtime.js","main.ts"], null)
//# sourceMappingURL=/main.js.map