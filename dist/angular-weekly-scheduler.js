/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"angular-weekly-scheduler": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/demo-app.ts","vendor"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/ng-weekly-scheduler.less":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/ng-weekly-scheduler.less ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.i, "br-weekly-scheduler {\n  background: #fff;\n  border-left: 1px solid #ddd;\n  border-right: 1px solid #ddd;\n  border-top: 1px solid #ddd;\n  color: #1c1c1c;\n  display: block;\n  margin-bottom: 10px;\n  /* The dark class will be applied by a client on the outside of this component */\n}\nbr-weekly-scheduler br-multi-slider .slot.active {\n  box-shadow: 0px 0px 2px 2px #1c1c1c;\n}\nbr-weekly-scheduler br-multi-slider .slot.nullEnd {\n  background: linear-gradient(to right, currentColor, rgba(255, 255, 255, 0.5));\n}\nbr-weekly-scheduler br-multi-slider .slot span {\n  color: #fff;\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\nbr-weekly-scheduler .labels {\n  border-right: 1px solid #ddd;\n}\nbr-weekly-scheduler .striped > div:nth-child(even) {\n  background-color: #f6f6f6;\n}\nbr-weekly-scheduler .srow {\n  border-bottom: 1px solid #ddd;\n}\nbr-weekly-scheduler .timestamps div {\n  border-width: 2px;\n}\nbr-weekly-scheduler .timestamps div:hover {\n  background-color: #f6f6f6;\n}\nbr-weekly-scheduler .buttons div {\n  display: inline-block;\n}\n.dark br-weekly-scheduler {\n  background: #1c1c1c;\n  border-left: 1px solid #777;\n  border-right: 1px solid #777;\n  border-top: 1px solid #777;\n  color: #fff;\n}\n.dark br-weekly-scheduler br-multi-slider .slot.active {\n  box-shadow: 0px 0px 2px 2px #fff;\n}\n.dark br-weekly-scheduler br-multi-slider .slot.nullEnd {\n  background: linear-gradient(to right, currentColor, rgba(28, 28, 28, 0.5));\n}\n.dark br-weekly-scheduler br-multi-slider .slot span {\n  color: #fff;\n  display: block;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.dark br-weekly-scheduler .labels {\n  border-right: 1px solid #777;\n}\n.dark br-weekly-scheduler .striped > div:nth-child(even) {\n  background-color: #333;\n}\n.dark br-weekly-scheduler .srow {\n  border-bottom: 1px solid #777;\n}\n.dark br-weekly-scheduler .timestamps div {\n  border-width: 2px;\n}\n.dark br-weekly-scheduler .timestamps div:hover {\n  background-color: #333;\n}\nbr-weekly-scheduler .fullWidth {\n  width: 100%;\n}\nbr-weekly-scheduler .labels {\n  display: block;\n  float: left;\n  text-align: center;\n}\nbr-weekly-scheduler .labels .dummy {\n  height: 15px;\n}\nbr-weekly-scheduler .labels .srow {\n  padding: 0 5px;\n}\nbr-weekly-scheduler br-schedule-area-container {\n  display: block;\n  overflow-x: auto;\n  /** Practical effect of \"start zoomed if the screen is below this width\" */\n}\nbr-weekly-scheduler br-schedule-area-container .schedule-area {\n  min-width: 600px;\n}\nbr-weekly-scheduler .srow {\n  position: relative;\n  height: 28px;\n  line-height: 28px;\n}\nbr-weekly-scheduler .srow.buttons {\n  height: auto;\n}\nbr-weekly-scheduler .srow.explanations {\n  padding-left: 5px;\n}\nbr-weekly-scheduler .srow.explanations.violation {\n  color: red;\n}\nbr-weekly-scheduler .calendar {\n  display: table;\n  table-layout: fixed;\n  position: relative;\n  width: 100%;\n}\nbr-weekly-scheduler .timestamps {\n  display: table;\n  font-size: 0.6em;\n  font-weight: bold;\n  line-height: 15px;\n  height: 15px;\n  table-layout: fixed;\n  text-transform: uppercase;\n  width: 100%;\n}\nbr-weekly-scheduler .timestamps div {\n  overflow: hidden;\n  padding-left: 2px;\n  text-overflow: clip;\n}\nbr-weekly-scheduler .timestamps div:hover {\n  cursor: pointer;\n}\nbr-hourly-grid {\n  display: table-row;\n}\nbr-hourly-grid div {\n  box-sizing: border-box;\n  display: table-cell;\n  height: 100%;\n}\nbr-hourly-grid .interval {\n  display: block;\n  float: left;\n}\nbr-multi-slider {\n  cursor: crosshair;\n  height: 100%;\n  top: 0;\n  position: absolute;\n  width: 100%;\n}\nbr-multi-slider .ghost-wrapper {\n  width: 100%;\n  height: 100%;\n}\nbr-multi-slider .slot {\n  font-family: monospace;\n  font-size: x-small;\n  position: absolute;\n  top: 5px;\n  bottom: 5px;\n  border-radius: 3px;\n  text-align: center;\n  white-space: nowrap;\n  line-height: 18px;\n}\nbr-multi-slider .slot.nullEnd {\n  text-align: left;\n}\nbr-multi-slider .slot .slotWrapper {\n  display: flex;\n  height: 100%;\n}\nbr-multi-slider .slot .slotWrapper .middle {\n  cursor: all-scroll;\n  display: inline-block;\n  overflow: hidden;\n  padding: 0 4px;\n}\nbr-multi-slider br-ghost-slot {\n  background: #5ab56a;\n  color: #5ab56a;\n  opacity: 0.6;\n  cursor: pointer;\n  user-select: none;\n}\nbr-multi-slider br-ghost-slot span {\n  color: #fff;\n}\nbr-multi-slider br-time-range {\n  display: block;\n  width: 100%;\n}\nbr-multi-slider br-weekly-slot {\n  /**\n     * We want to set the COLOR on any item we want to have a custom background color for.\n     * This is because the gradient backgrounds for allowNulls rely on currentColor.\n     * The text color within is set using a more specific selector\n     */\n  background: #2e81e1;\n  color: #2e81e1;\n  user-select: none;\n}\nbr-multi-slider br-weekly-slot.disable {\n  cursor: not-allowed;\n  color: #666;\n  background: #c0c0c0;\n}\nbr-multi-slider br-weekly-slot.pending {\n  background-color: #c81919;\n}\nbr-multi-slider br-weekly-slot .handle {\n  display: inline-block;\n  flex-grow: 1;\n}\nbr-multi-slider br-weekly-slot .handle.left,\nbr-multi-slider br-weekly-slot .handle.right {\n  cursor: e-resize;\n  min-width: 4px;\n  height: 100%;\n}\nbr-multi-slider br-weekly-slot.disable .handle {\n  cursor: not-allowed;\n}\nbr-multi-slider br-weekly-slot .handle.left:hover,\nbr-multi-slider br-weekly-slot .handle.right:hover {\n  background-color: #000;\n  opacity: 0.3;\n}\nbr-multi-slider br-weekly-slot .handle.left {\n  float: left;\n}\nbr-multi-slider br-weekly-slot .handle.right {\n  float: right;\n}\nbr-multi-slider br-weekly-slot.active {\n  font-weight: bolder;\n  z-index: 10;\n}\n", ""]);


/***/ }),

/***/ "./src/demo-app.ts":
/*!*************************!*\
  !*** ./src/demo-app.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var module_1 = __webpack_require__(/*! ./ng-weekly-scheduler/app/module */ "./src/ng-weekly-scheduler/app/module.ts");
var DemoItem_1 = __webpack_require__(/*! ./ng-weekly-scheduler/demo/DemoItem */ "./src/ng-weekly-scheduler/demo/DemoItem.ts");
var DemoAdapter_1 = __webpack_require__(/*! ./ng-weekly-scheduler/demo/DemoAdapter */ "./src/ng-weekly-scheduler/demo/DemoAdapter.ts");
function application() {
    angular.module('demoApp', [module_1.default])
        .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
        function ($q, $scope, $timeout, $log) {
            $scope.model = {
                options: {
                    buttonClasses: ['wow!'],
                    createItem: function (day, schedules) {
                        return new DemoItem_1.DemoItem(day, schedules);
                    },
                    defaultValue: false,
                    editSlot: function (schedule) {
                        schedule.start += 60;
                        schedule.value = true;
                        return $q.when(schedule);
                    },
                    fillEmptyWithDefault: true,
                    interval: 60,
                    fillNullEnds: 1800,
                    maxTimeSlot: 7200,
                    minimumSeparation: 300,
                    onChange: function (isValid) {
                        console.log("changed!");
                    },
                    restrictionExplanations: {
                        maxTimeSlot: function (value) { return "Slots cannot be longer than " + value + "!"; }
                    },
                    saveScheduler: function () {
                        $scope.result = $scope.adapter.getSnapshot();
                        return $q.when(true);
                    }
                }
            };
            $scope.adapter = new DemoAdapter_1.DemoAdapter([
                {
                    day: 5 /* Saturday */,
                    start: 3600,
                    end: 7200,
                    value: true
                }
            ]);
        }]);
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['demoApp']);
    });
}
application();


/***/ }),

/***/ "./src/ng-weekly-scheduler.less":
/*!**************************************!*\
  !*** ./src/ng-weekly-scheduler.less ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../node_modules/css-loader/dist/cjs.js!../node_modules/less-loader/dist/cjs.js!./ng-weekly-scheduler.less */ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js!./src/ng-weekly-scheduler.less");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./src/ng-weekly-scheduler/adapter/AdapterService.ts":
/*!***********************************************************!*\
  !*** ./src/ng-weekly-scheduler/adapter/AdapterService.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var AdapterService = /** @class */ (function () {
    function AdapterService(groupService, itemFactory) {
        this.groupService = groupService;
        this.itemFactory = itemFactory;
    }
    AdapterService.prototype.getItemsFromAdapter = function (config, adapter) {
        var result = [];
        if (adapter) {
            var schedules = adapter.initialData.map(function (data) { return adapter.customModelToWeeklySchedulerRange(data); });
            var groupedSchedules = this.groupService.groupSchedules(schedules);
            for (var key in groupedSchedules) {
                var item = this.itemFactory.createItem(config, parseInt(key, 10), groupedSchedules[key]);
                result.push(item);
            }
        }
        return result;
    };
    AdapterService.$name = 'brWeeklySchedulerAdapterService';
    AdapterService.$inject = [
        'brWeeklySchedulerGroupService',
        'brWeeklySchedulerItemFactory'
    ];
    return AdapterService;
}());
exports.AdapterService = AdapterService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/adapter/module.ts":
/*!***************************************************!*\
  !*** ./src/ng-weekly-scheduler/adapter/module.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var AdapterService_1 = __webpack_require__(/*! ./AdapterService */ "./src/ng-weekly-scheduler/adapter/AdapterService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.adapter', [])
    .service(AdapterService_1.AdapterService.$name, AdapterService_1.AdapterService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/app/module.ts":
/*!***********************************************!*\
  !*** ./src/ng-weekly-scheduler/app/module.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
__webpack_require__(/*! ../../ng-weekly-scheduler.less */ "./src/ng-weekly-scheduler.less");
var module_1 = __webpack_require__(/*! ../adapter/module */ "./src/ng-weekly-scheduler/adapter/module.ts");
var module_2 = __webpack_require__(/*! ../configuration/module */ "./src/ng-weekly-scheduler/configuration/module.ts");
var module_3 = __webpack_require__(/*! ../conflicting-options/module */ "./src/ng-weekly-scheduler/conflicting-options/module.ts");
var module_4 = __webpack_require__(/*! ../drag/module */ "./src/ng-weekly-scheduler/drag/module.ts");
var module_5 = __webpack_require__(/*! ../element-offset/module */ "./src/ng-weekly-scheduler/element-offset/module.ts");
var module_6 = __webpack_require__(/*! ../end-adjuster/module */ "./src/ng-weekly-scheduler/end-adjuster/module.ts");
var module_7 = __webpack_require__(/*! ../fill-empty-with-default/module */ "./src/ng-weekly-scheduler/fill-empty-with-default/module.ts");
var module_8 = __webpack_require__(/*! ../full-calendar/module */ "./src/ng-weekly-scheduler/full-calendar/module.ts");
var module_9 = __webpack_require__(/*! ../ghost-slot/module */ "./src/ng-weekly-scheduler/ghost-slot/module.ts");
var module_10 = __webpack_require__(/*! ../group-by/module */ "./src/ng-weekly-scheduler/group-by/module.ts");
var module_11 = __webpack_require__(/*! ../handle/module */ "./src/ng-weekly-scheduler/handle/module.ts");
var module_12 = __webpack_require__(/*! ../hourly-grid/module */ "./src/ng-weekly-scheduler/hourly-grid/module.ts");
var module_13 = __webpack_require__(/*! ../last-ghost-day/module */ "./src/ng-weekly-scheduler/last-ghost-day/module.ts");
var module_14 = __webpack_require__(/*! ../max-time-slot/module */ "./src/ng-weekly-scheduler/max-time-slot/module.ts");
var module_15 = __webpack_require__(/*! ../minimum-separation/module */ "./src/ng-weekly-scheduler/minimum-separation/module.ts");
var module_16 = __webpack_require__(/*! ../missing-days/module */ "./src/ng-weekly-scheduler/missing-days/module.ts");
var module_17 = __webpack_require__(/*! ../mono-schedule/module */ "./src/ng-weekly-scheduler/mono-schedule/module.ts");
var module_18 = __webpack_require__(/*! ../mouse-tracker/module */ "./src/ng-weekly-scheduler/mouse-tracker/module.ts");
var module_19 = __webpack_require__(/*! ../multislider/module */ "./src/ng-weekly-scheduler/multislider/module.ts");
var module_20 = __webpack_require__(/*! ../null-end/module */ "./src/ng-weekly-scheduler/null-end/module.ts");
var module_21 = __webpack_require__(/*! ../overlap/module */ "./src/ng-weekly-scheduler/overlap/module.ts");
var module_22 = __webpack_require__(/*! ../purge-default/module */ "./src/ng-weekly-scheduler/purge-default/module.ts");
var module_23 = __webpack_require__(/*! ../resize/module */ "./src/ng-weekly-scheduler/resize/module.ts");
var module_24 = __webpack_require__(/*! ../restriction-explanations/module */ "./src/ng-weekly-scheduler/restriction-explanations/module.ts");
var module_25 = __webpack_require__(/*! ../revalidate/module */ "./src/ng-weekly-scheduler/revalidate/module.ts");
var module_26 = __webpack_require__(/*! ../schedule-area-container/module */ "./src/ng-weekly-scheduler/schedule-area-container/module.ts");
var module_27 = __webpack_require__(/*! ../schedule-count/module */ "./src/ng-weekly-scheduler/schedule-count/module.ts");
var module_28 = __webpack_require__(/*! ../schedule-validator/module */ "./src/ng-weekly-scheduler/schedule-validator/module.ts");
var module_29 = __webpack_require__(/*! ../scroll/module */ "./src/ng-weekly-scheduler/scroll/module.ts");
var module_30 = __webpack_require__(/*! ../time/module */ "./src/ng-weekly-scheduler/time/module.ts");
var module_31 = __webpack_require__(/*! ../time-range/module */ "./src/ng-weekly-scheduler/time-range/module.ts");
var module_32 = __webpack_require__(/*! ../touch/module */ "./src/ng-weekly-scheduler/touch/module.ts");
var module_33 = __webpack_require__(/*! ../weekly-scheduler-config/module */ "./src/ng-weekly-scheduler/weekly-scheduler-config/module.ts");
var module_34 = __webpack_require__(/*! ../weekly-scheduler/module */ "./src/ng-weekly-scheduler/weekly-scheduler/module.ts");
var module_35 = __webpack_require__(/*! ../weekly-scheduler-item/module */ "./src/ng-weekly-scheduler/weekly-scheduler-item/module.ts");
var module_36 = __webpack_require__(/*! ../weekly-scheduler-range/module */ "./src/ng-weekly-scheduler/weekly-scheduler-range/module.ts");
var module_37 = __webpack_require__(/*! ../weekly-slot/module */ "./src/ng-weekly-scheduler/weekly-slot/module.ts");
var module_38 = __webpack_require__(/*! ../value-normalization/module */ "./src/ng-weekly-scheduler/value-normalization/module.ts");
var module_39 = __webpack_require__(/*! ../zoom/module */ "./src/ng-weekly-scheduler/zoom/module.ts");
// import { IWeeklySchedulerAdapter as WeeklySchedulerAdapter } from '../adapter/IWeeklySchedulerAdapter';
// import { IWeeklySchedulerOptions as WeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';
// export namespace weeklyScheduler {
//     export type IWeeklySchedulerAdapter<TCustom, TValue> = WeeklySchedulerAdapter<TCustom, TValue>;
//     export type IWeeklySchedulerOptions<T> = WeeklySchedulerOptions<T>;
// }
exports.default = angular.module('br.weeklyScheduler', [
    module_1.default,
    module_2.default,
    module_3.default,
    module_4.default,
    module_5.default,
    module_6.default,
    module_7.default,
    module_8.default,
    module_10.default,
    module_9.default,
    module_11.default,
    module_12.default,
    module_13.default,
    module_14.default,
    module_15.default,
    module_17.default,
    module_18.default,
    module_16.default,
    module_19.default,
    module_20.default,
    module_21.default,
    module_22.default,
    module_23.default,
    module_24.default,
    module_25.default,
    module_26.default,
    module_27.default,
    module_28.default,
    module_29.default,
    module_30.default,
    module_31.default,
    module_32.default,
    module_33.default,
    module_34.default,
    module_35.default,
    module_36.default,
    module_37.default,
    module_38.default,
    module_39.default
])
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/configuration/ConfigurationService.ts":
/*!***********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/configuration/ConfigurationService.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var ConfigurationService = /** @class */ (function () {
    function ConfigurationService(timeConstants) {
        this.timeConstants = timeConstants;
    }
    ConfigurationService.prototype.getConfiguration = function (options) {
        var interval = options.interval || 900; // seconds
        var intervalCount = this.timeConstants.SECONDS_IN_DAY / interval;
        var defaultOptions = this.getDefaultOptions();
        var userOptions = angular.merge(defaultOptions, options);
        var result = angular.extend(userOptions, {
            interval: interval,
            maxValue: this.timeConstants.SECONDS_IN_DAY,
            hourCount: this.timeConstants.HOURS_IN_DAY,
            intervalCount: intervalCount,
        });
        return result;
    };
    ConfigurationService.prototype.getDefaultOptions = function () {
        return {
            createItem: function (day, schedules) { return { day: day, schedules: schedules }; },
            monoSchedule: false,
            onChange: function () { return angular.noop(); },
            onRemove: function () { return angular.noop(); },
            restrictionExplanations: {
                maxTimeSlot: function (value) { return "Max time slot length: " + value; },
                minimumSeparation: function (value) { return "Slots must be at least " + value + " apart!"; },
                fullCalendar: 'For this calendar, every day must be completely full of schedules.',
                monoSchedule: 'This calendar may only have one time slot per day',
                nullEnds: 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.',
                scheduleCount: function (options) {
                    var pluralizedSlot = 'slot' + (options.count === 1 ? '' : 's');
                    if (options.exact) {
                        return "This calendar must have exactly " + options.count + " " + pluralizedSlot + " per day";
                    }
                    else {
                        return "This calendar may only have a maximum of " + options.count + " " + pluralizedSlot + " per day";
                    }
                }
            },
            scheduleCountOptions: {
                count: null,
                exact: false
            }
        };
    };
    ConfigurationService.$name = 'brWeeklySchedulerConfigurationService';
    ConfigurationService.$inject = [
        'brWeeklySchedulerTimeConstantsService'
    ];
    return ConfigurationService;
}());
exports.ConfigurationService = ConfigurationService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/configuration/module.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/configuration/module.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ConfigurationService_1 = __webpack_require__(/*! ./ConfigurationService */ "./src/ng-weekly-scheduler/configuration/ConfigurationService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.configuration', [])
    .service(ConfigurationService_1.ConfigurationService.$name, ConfigurationService_1.ConfigurationService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/conflicting-options/ConflictingOptionsService.ts":
/*!**********************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/conflicting-options/ConflictingOptionsService.ts ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var ConflictingOptionsService = /** @class */ (function () {
    function ConflictingOptionsService() {
    }
    ConflictingOptionsService.prototype.getConflictingOptions = function (options) {
        if (options.nullEnds && options.scheduleCountOptions && options.scheduleCountOptions.count > 1) {
            return "A nullEnds calendar has a maximum scheduleCount of 1";
        }
        if (options.fullCalendar && options.fillEmptyWithDefault) {
            return "Options 'fullCalendar' & 'fillEmptyWithDefault' are mutually exclusive.";
        }
        if (options.fillEmptyWithDefault && !angular.isDefined(options.defaultValue)) {
            return "If using option 'fillEmptyWithDefault', you must also provide 'defaultValue.'";
        }
        return '';
    };
    ConflictingOptionsService.$name = 'brWeeklySchedulerConflictingOptionsService';
    return ConflictingOptionsService;
}());
exports.ConflictingOptionsService = ConflictingOptionsService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/conflicting-options/module.ts":
/*!***************************************************************!*\
  !*** ./src/ng-weekly-scheduler/conflicting-options/module.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ConflictingOptionsService_1 = __webpack_require__(/*! ./ConflictingOptionsService */ "./src/ng-weekly-scheduler/conflicting-options/ConflictingOptionsService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.conflictingOptions', [])
    .service(ConflictingOptionsService_1.ConflictingOptionsService.$name, ConflictingOptionsService_1.ConflictingOptionsService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/demo/DemoAdapter.ts":
/*!*****************************************************!*\
  !*** ./src/ng-weekly-scheduler/demo/DemoAdapter.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** The data is already in an acceptable format for the demo so just pass it through */
/** @internal */
var DemoAdapter = /** @class */ (function () {
    function DemoAdapter(initialData) {
        this.initialData = initialData;
        this.items = [];
    }
    DemoAdapter.prototype.getSnapshot = function () {
        return Array.prototype.concat.apply([], this.items.map(function (item) {
            return item.schedules.map(function (schedule) {
                return {
                    day: schedule.day,
                    start: schedule.start,
                    end: schedule.end,
                    value: schedule.value
                };
            });
        }));
    };
    DemoAdapter.prototype.customModelToWeeklySchedulerRange = function (range) {
        range.$class = 'test';
        return range;
    };
    return DemoAdapter;
}());
exports.DemoAdapter = DemoAdapter;


/***/ }),

/***/ "./src/ng-weekly-scheduler/demo/DemoItem.ts":
/*!**************************************************!*\
  !*** ./src/ng-weekly-scheduler/demo/DemoItem.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var DemoItem = /** @class */ (function () {
    function DemoItem(day, schedules) {
        this.day = day;
        this.schedules = schedules;
    }
    Object.defineProperty(DemoItem.prototype, "editable", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return DemoItem;
}());
exports.DemoItem = DemoItem;


/***/ }),

/***/ "./src/ng-weekly-scheduler/drag/DragService.ts":
/*!*****************************************************!*\
  !*** ./src/ng-weekly-scheduler/drag/DragService.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var DragService = /** @class */ (function () {
    function DragService(endAdjusterService, nullEndWidth, rangeFactory) {
        this.endAdjusterService = endAdjusterService;
        this.nullEndWidth = nullEndWidth;
        this.rangeFactory = rangeFactory;
    }
    DragService.prototype.getDragRangeFromSchedule = function (config, schedule) {
        return this.rangeFactory.createRange(config, {
            day: schedule.day,
            start: schedule.start,
            end: config.nullEnds ?
                this.endAdjusterService.adjustEndForView(config, schedule.start + this.nullEndWidth) :
                this.endAdjusterService.adjustEndForView(config, schedule.end),
            value: schedule.value
        });
    };
    DragService.$name = 'brWeeklySchedulerDragService';
    DragService.$inject = [
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerRangeFactory'
    ];
    return DragService;
}());
exports.DragService = DragService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/drag/module.ts":
/*!************************************************!*\
  !*** ./src/ng-weekly-scheduler/drag/module.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var DragService_1 = __webpack_require__(/*! ./DragService */ "./src/ng-weekly-scheduler/drag/DragService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.drag', [])
    .service(DragService_1.DragService.$name, DragService_1.DragService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/element-offset/ElementOffsetService.ts":
/*!************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/element-offset/ElementOffsetService.ts ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This helps reduce code duplication
 * This is used as a substitute for jQuery to keep dependencies minimal
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ElementOffsetService = /** @class */ (function () {
    function ElementOffsetService() {
    }
    ElementOffsetService.prototype.left = function ($element) {
        return $element[0].getBoundingClientRect().left;
    };
    ElementOffsetService.prototype.right = function ($element) {
        return $element[0].getBoundingClientRect().right;
    };
    ElementOffsetService.$name = 'brWeeklySchedulerElementOffsetService';
    return ElementOffsetService;
}());
exports.ElementOffsetService = ElementOffsetService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/element-offset/module.ts":
/*!**********************************************************!*\
  !*** ./src/ng-weekly-scheduler/element-offset/module.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ElementOffsetService_1 = __webpack_require__(/*! ./ElementOffsetService */ "./src/ng-weekly-scheduler/element-offset/ElementOffsetService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.elementOffset', [])
    .service(ElementOffsetService_1.ElementOffsetService.$name, ElementOffsetService_1.ElementOffsetService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/end-adjuster/EndAdjusterService.ts":
/*!********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/end-adjuster/EndAdjusterService.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var EndAdjusterService = /** @class */ (function () {
    function EndAdjusterService() {
    }
    EndAdjusterService.prototype.adjustEndForModel = function (config, end) {
        if (end === config.maxValue) {
            return 0;
        }
        return end;
    };
    EndAdjusterService.prototype.adjustEndForView = function (config, end) {
        if (end === 0) {
            return config.maxValue;
        }
        return end;
    };
    EndAdjusterService.$name = 'brWeeklySchedulerEndAdjusterService';
    return EndAdjusterService;
}());
exports.EndAdjusterService = EndAdjusterService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/end-adjuster/module.ts":
/*!********************************************************!*\
  !*** ./src/ng-weekly-scheduler/end-adjuster/module.ts ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var EndAdjusterService_1 = __webpack_require__(/*! ./EndAdjusterService */ "./src/ng-weekly-scheduler/end-adjuster/EndAdjusterService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.endAdjuster', [])
    .service(EndAdjusterService_1.EndAdjusterService.$name, EndAdjusterService_1.EndAdjusterService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/fill-empty-with-default/FillEmptyWithDefaultService.ts":
/*!****************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/fill-empty-with-default/FillEmptyWithDefaultService.ts ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** When using the 'fillEmptyWithDefault' option, this service will be used to construct the correct calendar for server submission */
/** @internal */
var FillEmptyWithDefaultService = /** @class */ (function () {
    function FillEmptyWithDefaultService(endAdjusterService, rangeFactory) {
        this.endAdjusterService = endAdjusterService;
        this.rangeFactory = rangeFactory;
    }
    FillEmptyWithDefaultService.prototype.fill = function (item, config) {
        var schedules = item.schedules;
        if (!schedules.length) {
            return [this.getEmptySchedule(item, config)];
        }
        return this.getFilledSchedules(schedules, config);
    };
    FillEmptyWithDefaultService.prototype.getEmptySchedule = function (item, config) {
        return this.rangeFactory.createRange(config, {
            day: item.day,
            start: 0,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getEndSchedule = function (lastSchedule, config) {
        return this.rangeFactory.createRange(config, {
            day: lastSchedule.day,
            start: lastSchedule.end,
            end: this.endAdjusterService.adjustEndForModel(config, config.maxValue),
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getStartSchedule = function (firstSchedule, config) {
        return this.rangeFactory.createRange(config, {
            day: firstSchedule.day,
            start: 0,
            end: firstSchedule.start,
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getFilledSchedulesForSingleSchedule = function (schedule, config) {
        if (this.shouldFillNullEnd(schedule, config)) {
            schedule.end = this.getNullEndValue(schedule, config);
        }
        var schedules = [schedule];
        if (!this.scheduleTouchesStart(schedule, config)) {
            schedules.push(this.getStartSchedule(schedule, config));
        }
        if (!this.scheduleTouchesEnd(schedule, config)) {
            schedules.push(this.getEndSchedule(schedule, config));
        }
        return this.getSortedSchedules(schedules);
    };
    FillEmptyWithDefaultService.prototype.getFilledSchedules = function (schedules, config) {
        schedules = this.getSortedSchedules(schedules);
        if (schedules.length === 1) {
            return this.getFilledSchedulesForSingleSchedule(schedules[0], config);
        }
        var len = schedules.length - 1;
        // 2 at a time
        for (var i = 0; i < len; i++) {
            var currentSchedule = schedules[i];
            var nextSchedule = schedules[i + 1];
            var isFirstLoop = i == 0;
            if (isFirstLoop && !this.scheduleTouchesStart(currentSchedule, config)) {
                var startSchedule = this.getStartSchedule(currentSchedule, config);
                schedules.push(startSchedule);
            }
            if (!this.schedulesTouch(currentSchedule, nextSchedule)) {
                var newSchedule = this.getNewSchedule(currentSchedule, nextSchedule, config);
                schedules.push(newSchedule);
            }
            var isLastLoop = i == len - 1;
            if (isLastLoop && !this.scheduleTouchesEnd(nextSchedule, config)) {
                var endSchedule = this.getEndSchedule(nextSchedule, config);
                schedules.push(endSchedule);
                break;
            }
        }
        return this.getSortedSchedules(schedules);
    };
    FillEmptyWithDefaultService.prototype.getNewSchedule = function (currentSchedule, nextSchedule, config) {
        return this.rangeFactory.createRange(config, {
            day: currentSchedule.day,
            start: currentSchedule.end,
            end: nextSchedule.start,
            value: config.defaultValue
        });
    };
    FillEmptyWithDefaultService.prototype.getNullEndValue = function (schedule, config) {
        return schedule.start + config.fillNullEnds;
    };
    FillEmptyWithDefaultService.prototype.getSortedSchedules = function (schedules) {
        return schedules.sort(function (a, b) { return a.start - b.start; });
    };
    FillEmptyWithDefaultService.prototype.schedulesTouch = function (earlierSchedule, laterSchedule) {
        return earlierSchedule.end === laterSchedule.start;
    };
    FillEmptyWithDefaultService.prototype.scheduleTouchesStart = function (schedule, config) {
        return schedule.start === 0;
    };
    FillEmptyWithDefaultService.prototype.scheduleTouchesEnd = function (schedule, config) {
        return schedule.end === this.endAdjusterService.adjustEndForModel(config, config.maxValue);
    };
    FillEmptyWithDefaultService.prototype.shouldFillNullEnd = function (schedule, config) {
        return schedule.end === null && config.nullEnds && config.fillNullEnds;
    };
    FillEmptyWithDefaultService.$name = 'brWeeklySchedulerFillEmptyWithDefaultService';
    FillEmptyWithDefaultService.$inject = [
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerRangeFactory'
    ];
    return FillEmptyWithDefaultService;
}());
exports.FillEmptyWithDefaultService = FillEmptyWithDefaultService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/fill-empty-with-default/module.ts":
/*!*******************************************************************!*\
  !*** ./src/ng-weekly-scheduler/fill-empty-with-default/module.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var FillEmptyWithDefaultService_1 = __webpack_require__(/*! ./FillEmptyWithDefaultService */ "./src/ng-weekly-scheduler/fill-empty-with-default/FillEmptyWithDefaultService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.fillEmptyWithDefault', [])
    .service(FillEmptyWithDefaultService_1.FillEmptyWithDefaultService.$name, FillEmptyWithDefaultService_1.FillEmptyWithDefaultService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/full-calendar/FullCalendarDirective.ts":
/*!************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/full-calendar/FullCalendarDirective.ts ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var FullCalendarDirective = /** @class */ (function () {
    function FullCalendarDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brFullCalendar) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    FullCalendarDirective.Factory = function () {
        var directive = function (validator) {
            return new FullCalendarDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerFullCalendarValidatorService'];
        return directive;
    };
    FullCalendarDirective.$name = 'brFullCalendar';
    return FullCalendarDirective;
}());
exports.FullCalendarDirective = FullCalendarDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/full-calendar/module.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/full-calendar/module.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var FullCalendarDirective_1 = __webpack_require__(/*! ./FullCalendarDirective */ "./src/ng-weekly-scheduler/full-calendar/FullCalendarDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.fullCalendar', [])
    .directive(FullCalendarDirective_1.FullCalendarDirective.$name, FullCalendarDirective_1.FullCalendarDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/ghost-slot/ghost-slot.ts":
/*!**********************************************************!*\
  !*** ./src/ng-weekly-scheduler/ghost-slot/ghost-slot.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var GhostSlotController = /** @class */ (function () {
    function GhostSlotController($element) {
        this.$element = $element;
    }
    GhostSlotController.$name = 'brGhostSlotController';
    GhostSlotController.$controllerAs = 'ghostSlotCtrl';
    GhostSlotController.$inject = [
        '$element'
    ];
    return GhostSlotController;
}());
exports.GhostSlotController = GhostSlotController;
/** @internal */
var GhostSlotComponent = /** @class */ (function () {
    function GhostSlotComponent() {
        this.controller = GhostSlotController.$name;
        this.controllerAs = GhostSlotController.$controllerAs;
        this.require = {
            multiSliderCtrl: '^brMultiSlider'
        };
        this.template = "\n        <ng-transclude class=\"fullWidth\"></ng-transclude>\n    ";
        this.transclude = true;
    }
    GhostSlotComponent.$name = 'brGhostSlot';
    return GhostSlotComponent;
}());
exports.GhostSlotComponent = GhostSlotComponent;


/***/ }),

/***/ "./src/ng-weekly-scheduler/ghost-slot/module.ts":
/*!******************************************************!*\
  !*** ./src/ng-weekly-scheduler/ghost-slot/module.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ghost_slot_1 = __webpack_require__(/*! ./ghost-slot */ "./src/ng-weekly-scheduler/ghost-slot/ghost-slot.ts");
exports.default = angular
    .module('rr.weeklyScheduler.ghostSlot', [])
    .component(ghost_slot_1.GhostSlotComponent.$name, new ghost_slot_1.GhostSlotComponent())
    .controller(ghost_slot_1.GhostSlotController.$name, ghost_slot_1.GhostSlotController)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/group-by/GroupService.ts":
/*!**********************************************************!*\
  !*** ./src/ng-weekly-scheduler/group-by/GroupService.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * We should be able to convert the schedules beforehand, pass just the schedules in and have this package build the items
 * This helps reduce code duplication in clients.
 * This is used as a substitute for lodash.groupBy to keep the footprint small
 */
/** @internal */
var GroupService = /** @class */ (function () {
    function GroupService() {
    }
    GroupService.prototype.groupSchedules = function (schedules) {
        var seed = {};
        var result = schedules.reduce(function (reducer, currentSchedule, index, array) {
            var key = currentSchedule.day;
            if (!reducer[key]) {
                reducer[key] = [];
            }
            reducer[key].push(currentSchedule);
            return reducer;
        }, seed);
        return result;
    };
    GroupService.$name = 'brWeeklySchedulerGroupService';
    return GroupService;
}());
exports.GroupService = GroupService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/group-by/module.ts":
/*!****************************************************!*\
  !*** ./src/ng-weekly-scheduler/group-by/module.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var GroupService_1 = __webpack_require__(/*! ./GroupService */ "./src/ng-weekly-scheduler/group-by/GroupService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.groupBy', [])
    .service(GroupService_1.GroupService.$name, GroupService_1.GroupService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/handle/HandleDirective.ts":
/*!***********************************************************!*\
  !*** ./src/ng-weekly-scheduler/handle/HandleDirective.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var HandleDirective = /** @class */ (function () {
    function HandleDirective($document, mouseTrackerService, touchService) {
        var _this = this;
        this.$document = $document;
        this.mouseTrackerService = mouseTrackerService;
        this.touchService = touchService;
        this.restrict = 'A';
        this.scope = {
            ondrag: '&',
            ondragstop: '&',
            ondragstart: '&',
            immediate: '<'
        };
        this.link = function (scope, element) {
            var $document = _this.$document;
            var mouseTrackerService = _this.mouseTrackerService;
            var touchService = _this.touchService;
            var x = 0;
            var mousedownEvent = 'mousedown touchstart';
            var mousemoveEvent = 'mousemove touchmove';
            var mouseupEvent = 'mouseup touchend';
            element.on(mousedownEvent, mousedown);
            function mousedown(event) {
                x = getPageX(event);
                // Prevent default dragging of selected content
                event.preventDefault();
                // Prevent multiple handlers from being fired if they are nested (only the one you directly interacted with should fire)
                event.stopPropagation();
                startDrag();
            }
            function fakeMousedown() {
                x = mouseTrackerService.getMousePosition().x;
                startDrag();
            }
            function getPageX(event) {
                return event.pageX || touchService.getPageX(event);
            }
            function mousemove(event) {
                var pageX = getPageX(event);
                var delta = pageX - x;
                if (angular.isFunction(scope.ondrag)) {
                    scope.$apply(scope.ondrag({ delta: delta }));
                }
            }
            function mouseup() {
                $document.unbind(mousemoveEvent, mousemove);
                $document.unbind(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstop)) {
                    scope.$apply(scope.ondragstop());
                }
            }
            function startDrag() {
                $document.on(mousemoveEvent, mousemove);
                $document.on(mouseupEvent, mouseup);
                if (angular.isFunction(scope.ondragstart)) {
                    scope.$applyAsync(scope.ondragstart());
                }
            }
            if (scope.immediate) {
                fakeMousedown();
            }
        };
    }
    HandleDirective.Factory = function () {
        var directive = function ($document, mouseTrackerService, touchService) { return new HandleDirective($document, mouseTrackerService, touchService); };
        directive.$inject = ['$document', 'brWeeklySchedulerMouseTrackerService', 'brWeeklySchedulerTouchService'];
        return directive;
    };
    HandleDirective.$name = 'brHandle';
    return HandleDirective;
}());
exports.HandleDirective = HandleDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/handle/module.ts":
/*!**************************************************!*\
  !*** ./src/ng-weekly-scheduler/handle/module.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var HandleDirective_1 = __webpack_require__(/*! ./HandleDirective */ "./src/ng-weekly-scheduler/handle/HandleDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.handle', [])
    .directive(HandleDirective_1.HandleDirective.$name, HandleDirective_1.HandleDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/hourly-grid/HourlyGridDirective.ts":
/*!********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/hourly-grid/HourlyGridDirective.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var HourlyGridDirective = /** @class */ (function () {
    function HourlyGridDirective(timeConstants) {
        var _this = this;
        this.timeConstants = timeConstants;
        this.restrict = 'E';
        this.require = '^brWeeklyScheduler';
        this.GRID_TEMPLATE = angular.element('<div class="grid-item"></div>');
        this.link = function (scope, element, attrs, schedulerCtrl) {
            if (schedulerCtrl.config) {
                _this.doGrid(scope, element, attrs, schedulerCtrl.config);
            }
        };
    }
    HourlyGridDirective.prototype.handleClickEvent = function (child, hourCount, idx, scope) {
        child.bind('click', function () {
            scope.$apply(function () {
                scope.$emit("brWeeklyScheduler.clickOnACell" /* CLICK_ON_A_CELL */, {
                    nbElements: hourCount,
                    idx: idx
                });
            });
        });
    };
    HourlyGridDirective.prototype.doGrid = function (scope, element, attrs, config) {
        // Calculate hour width distribution
        var tickcount = config.hourCount;
        var gridItemEl = this.GRID_TEMPLATE.clone();
        // Clean element
        element.empty();
        // Stripe it by hour
        element.addClass('striped');
        for (var i = 0; i < tickcount; i++) {
            var child = gridItemEl.clone();
            if (angular.isUndefined(attrs.noText)) {
                this.handleClickEvent(child, tickcount, i, scope);
                var currentHour = i % 12;
                var meridiem = i >= 12 ? 'p' : 'a';
                child.text("" + (currentHour || '12') + meridiem);
            }
            else {
                var numIntervalsInTick = this.timeConstants.SECONDS_IN_HOUR / config.interval;
                var intervalPercentage = 100 / numIntervalsInTick;
                for (var j = 0; j < numIntervalsInTick; j++) {
                    var grandChild = this.GRID_TEMPLATE.clone();
                    grandChild.attr('rel', ((i * numIntervalsInTick) + j) * config.interval);
                    grandChild.addClass('interval');
                    grandChild.css('width', intervalPercentage + '%');
                    child.append(grandChild);
                }
            }
            element.append(child);
        }
    };
    HourlyGridDirective.Factory = function () {
        var directive = function (timeConstants) { return new HourlyGridDirective(timeConstants); };
        directive.$inject = ['brWeeklySchedulerTimeConstantsService'];
        return directive;
    };
    HourlyGridDirective.$name = 'brHourlyGrid';
    return HourlyGridDirective;
}());
exports.HourlyGridDirective = HourlyGridDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/hourly-grid/module.ts":
/*!*******************************************************!*\
  !*** ./src/ng-weekly-scheduler/hourly-grid/module.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var HourlyGridDirective_1 = __webpack_require__(/*! ./HourlyGridDirective */ "./src/ng-weekly-scheduler/hourly-grid/HourlyGridDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.hourlyGrid', [])
    .directive(HourlyGridDirective_1.HourlyGridDirective.$name, HourlyGridDirective_1.HourlyGridDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/last-ghost-day/LastGhostDayService.ts":
/*!***********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/last-ghost-day/LastGhostDayService.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var LastGhostDayService = /** @class */ (function () {
    function LastGhostDayService() {
    }
    /**
     * When dragging ghosts across multiple days, if the user moves the mouse pointer out of one extreme and back into the last slot that rendered a ghost,
     * We should remove the ghost from that extreme. This will help grab the correct day
     */
    LastGhostDayService.prototype.getLastGhostDay = function (items) {
        var originIndex = this.getOriginIndex(items);
        var renderedGhostIndices = this.getRenderedGhostIndices(items);
        // determine if the other $renderGhost items are above or below the $isGhostOrigin item
        var above = renderedGhostIndices.every(function (i) { return i <= originIndex; });
        // take first item for above or last item for below
        var lastGhostDayIndex = above ? 0 : renderedGhostIndices.length - 1;
        return renderedGhostIndices[lastGhostDayIndex];
    };
    /** Get the index of the $isGhostOrigin item */
    LastGhostDayService.prototype.getOriginIndex = function (items) {
        var originIndex;
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var currentItem = items[i];
            if (currentItem.$isGhostOrigin) {
                originIndex = i;
                break;
            }
        }
        return originIndex;
    };
    /** Get all of the item indices that currently have ghosts rendered */
    LastGhostDayService.prototype.getRenderedGhostIndices = function (items) {
        var renderedGhostIndices = [];
        var len = items.length;
        for (var i = 0; i < len; i++) {
            var currentItem = items[i];
            if (currentItem.$renderGhost) {
                renderedGhostIndices.push(i);
            }
        }
        return renderedGhostIndices;
    };
    LastGhostDayService.$name = 'brWeeklySchedulerLastGhostDayService';
    return LastGhostDayService;
}());
exports.LastGhostDayService = LastGhostDayService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/last-ghost-day/module.ts":
/*!**********************************************************!*\
  !*** ./src/ng-weekly-scheduler/last-ghost-day/module.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var LastGhostDayService_1 = __webpack_require__(/*! ./LastGhostDayService */ "./src/ng-weekly-scheduler/last-ghost-day/LastGhostDayService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.lastGhostDay', [])
    .service(LastGhostDayService_1.LastGhostDayService.$name, LastGhostDayService_1.LastGhostDayService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/max-time-slot/MaxTimeSlotDirective.ts":
/*!***********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/max-time-slot/MaxTimeSlotDirective.ts ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var MaxTimeSlotDirective = /** @class */ (function () {
    function MaxTimeSlotDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brMaxTimeSlot) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    MaxTimeSlotDirective.Factory = function () {
        var directive = function (validator) {
            return new MaxTimeSlotDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerMaxTimeSlotValidatorService'];
        return directive;
    };
    MaxTimeSlotDirective.$name = 'brMaxTimeSlot';
    return MaxTimeSlotDirective;
}());
exports.MaxTimeSlotDirective = MaxTimeSlotDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/max-time-slot/module.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/max-time-slot/module.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var MaxTimeSlotDirective_1 = __webpack_require__(/*! ./MaxTimeSlotDirective */ "./src/ng-weekly-scheduler/max-time-slot/MaxTimeSlotDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.maxTimeSlot', [])
    .directive(MaxTimeSlotDirective_1.MaxTimeSlotDirective.$name, MaxTimeSlotDirective_1.MaxTimeSlotDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/minimum-separation/MinimumSeparationDirective.ts":
/*!**********************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/minimum-separation/MinimumSeparationDirective.ts ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var MinimumSeparationDirective = /** @class */ (function () {
    function MinimumSeparationDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brMinimumSeparation) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    MinimumSeparationDirective.Factory = function () {
        var directive = function (validator) {
            return new MinimumSeparationDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerMinimumSeparationValidatorService'];
        return directive;
    };
    MinimumSeparationDirective.$name = 'brMinimumSeparation';
    return MinimumSeparationDirective;
}());
exports.MinimumSeparationDirective = MinimumSeparationDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/minimum-separation/module.ts":
/*!**************************************************************!*\
  !*** ./src/ng-weekly-scheduler/minimum-separation/module.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var MinimumSeparationDirective_1 = __webpack_require__(/*! ./MinimumSeparationDirective */ "./src/ng-weekly-scheduler/minimum-separation/MinimumSeparationDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.minimumSeparation', [])
    .directive(MinimumSeparationDirective_1.MinimumSeparationDirective.$name, MinimumSeparationDirective_1.MinimumSeparationDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/missing-days/MissingDaysService.ts":
/*!********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/missing-days/MissingDaysService.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var MissingDaysService = /** @class */ (function () {
    function MissingDaysService(dayMap, itemFactory) {
        this.dayMap = dayMap;
        this.itemFactory = itemFactory;
    }
    /**
     * The scheduler should always show all days, even if it was not passed any schedules for that day
     */
    MissingDaysService.prototype.fillItems = function (config, items) {
        var _this = this;
        var result = [];
        angular.forEach(this.dayMap, function (day, stringKey) {
            var key = parseInt(stringKey, 10);
            var filteredItems = items.filter(function (item) { return item.day === key; });
            var item = filteredItems.length ? filteredItems[0] : null;
            if (!item) {
                result.push(_this.itemFactory.createItem(config, key, []));
            }
            else {
                // If the item DID exist just set the label
                item.label = day;
                result.push(item);
            }
        });
        return angular.copy(result).sort(function (a, b) { return a.day - b.day; });
    };
    MissingDaysService.$name = 'brWeeklySchedulerMissingDaysService';
    MissingDaysService.$inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerItemFactory'
    ];
    return MissingDaysService;
}());
exports.MissingDaysService = MissingDaysService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/missing-days/module.ts":
/*!********************************************************!*\
  !*** ./src/ng-weekly-scheduler/missing-days/module.ts ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var MissingDaysService_1 = __webpack_require__(/*! ./MissingDaysService */ "./src/ng-weekly-scheduler/missing-days/MissingDaysService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.missingDays', [])
    .service(MissingDaysService_1.MissingDaysService.$name, MissingDaysService_1.MissingDaysService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/mono-schedule/MonoScheduleDirective.ts":
/*!************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/mono-schedule/MonoScheduleDirective.ts ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var MonoScheduleDirective = /** @class */ (function () {
    function MonoScheduleDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brMonoSchedule) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    MonoScheduleDirective.Factory = function () {
        var directive = function (validator) {
            return new MonoScheduleDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerMonoScheduleValidatorService'];
        return directive;
    };
    MonoScheduleDirective.$name = 'brMonoSchedule';
    return MonoScheduleDirective;
}());
exports.MonoScheduleDirective = MonoScheduleDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/mono-schedule/module.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/mono-schedule/module.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var MonoScheduleDirective_1 = __webpack_require__(/*! ./MonoScheduleDirective */ "./src/ng-weekly-scheduler/mono-schedule/MonoScheduleDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.monoSchedule', [])
    .directive(MonoScheduleDirective_1.MonoScheduleDirective.$name, MonoScheduleDirective_1.MonoScheduleDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/mouse-tracker/MouseTrackerService.ts":
/*!**********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/mouse-tracker/MouseTrackerService.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var MouseTrackerService = /** @class */ (function () {
    function MouseTrackerService($document) {
        this.$document = $document;
    }
    MouseTrackerService.prototype.initialize = function () {
        var eventName = 'mousemove touchmove';
        var event = this.setMousePosition.bind(this);
        this.$document.unbind(eventName, event);
        this.$document.on(eventName, event);
    };
    MouseTrackerService.prototype.getMousePosition = function () {
        return this.mousePosition;
    };
    MouseTrackerService.prototype.setMousePosition = function (event) {
        this.mousePosition = { x: event.pageX, y: event.pageY };
    };
    MouseTrackerService.$name = 'brWeeklySchedulerMouseTrackerService';
    MouseTrackerService.$inject = ['$document'];
    return MouseTrackerService;
}());
exports.MouseTrackerService = MouseTrackerService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/mouse-tracker/module.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/mouse-tracker/module.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var MouseTrackerService_1 = __webpack_require__(/*! ./MouseTrackerService */ "./src/ng-weekly-scheduler/mouse-tracker/MouseTrackerService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.mouseTracker', [])
    .service(MouseTrackerService_1.MouseTrackerService.$name, MouseTrackerService_1.MouseTrackerService)
    .run([MouseTrackerService_1.MouseTrackerService.$name, function (mouseTrackerService) {
        mouseTrackerService.initialize();
    }])
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/multislider/module.ts":
/*!*******************************************************!*\
  !*** ./src/ng-weekly-scheduler/multislider/module.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var multislider_1 = __webpack_require__(/*! ./multislider */ "./src/ng-weekly-scheduler/multislider/multislider.ts");
exports.default = angular.module('rr.weeklyScheduler.multiSlider', [])
    .component(multislider_1.MultiSliderComponent.$name, new multislider_1.MultiSliderComponent())
    .controller(multislider_1.MultiSliderController.$name, multislider_1.MultiSliderController)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/multislider/multislider.html":
/*!**************************************************************!*\
  !*** ./src/ng-weekly-scheduler/multislider/multislider.html ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"ghost-wrapper\" br-handle ondragstart=\"multiSliderCtrl.onGhostWrapperMouseDown()\" ondragstop=\"multiSliderCtrl.onGhostWrapperMouseUp()\" ondrag=\"multiSliderCtrl.onGhostWrapperMouseMove()\">\r\n    <br-ghost-slot class=\"slot\"\r\n                   ng-if=\"multiSliderCtrl.item.canRenderGhost()\"\r\n                   ng-class=\"{\r\n                      active: multiSliderCtrl.item.$renderGhost,\r\n                      nullEnd: multiSliderCtrl.config.nullEnds\r\n                   }\"\r\n                   ng-style=\"{\r\n                      left: multiSliderCtrl.getSlotLeft(multiSliderCtrl.ghostValues.left),\r\n                      right: multiSliderCtrl.getSlotRight(multiSliderCtrl.ghostValues.left, multiSliderCtrl.ghostValues.right)\r\n                   }\">\r\n        <div class=\"slotWrapper\">\r\n            <div class=\"middle fullWidth\">\r\n                <span ng-if=\"!multiSliderCtrl.config.nullEnds\">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} - {{ multiSliderCtrl.ghostValues.right | brWeeklySchedulerTimeOfDay }}</span>\r\n                <span ng-if=\"multiSliderCtrl.config.nullEnds\">{{ multiSliderCtrl.ghostValues.left | brWeeklySchedulerTimeOfDay }} until</span>\r\n            </div>\r\n        </div>\r\n    </br-ghost-slot>\r\n\r\n    <br-weekly-slot class=\"slot {{ schedule.$class }}\"\r\n                config=\"multiSliderCtrl.config\"\r\n                get-delta=\"multiSliderCtrl.pixelToVal(pixel)\"\r\n                drag-schedule=\"multiSliderCtrl.dragSchedule\" \r\n                item=\"multiSliderCtrl.item\"\r\n                ng-class=\"{\r\n                    active: schedule.$isActive,\r\n                    disable: !multiSliderCtrl.item.canEditSchedule(schedule),\r\n                    nullEnd: schedule.end === null,\r\n                    pending: schedule.$isEditing\r\n                }\"\r\n                ng-repeat=\"schedule in multiSliderCtrl.item.schedules\"\r\n                ng-model=\"schedule\"\r\n                ng-style=\"{\r\n                    left: multiSliderCtrl.getSlotLeft(schedule.start),\r\n                    right: multiSliderCtrl.getSlotRight(schedule.start, schedule.end)\r\n                }\"\r\n                edit-schedule=\"multiSliderCtrl.editSchedule(schedule)\"\r\n    ></br-weekly-slot>\r\n</div>";

/***/ }),

/***/ "./src/ng-weekly-scheduler/multislider/multislider.ts":
/*!************************************************************!*\
  !*** ./src/ng-weekly-scheduler/multislider/multislider.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var MultiSliderController = /** @class */ (function () {
    function MultiSliderController($element, $q, $scope, elementOffsetService, endAdjusterService, mouseTrackerService, nullEndWidth, rangeFactory, valueNormalizationService) {
        this.$element = $element;
        this.$q = $q;
        this.$scope = $scope;
        this.elementOffsetService = elementOffsetService;
        this.endAdjusterService = endAdjusterService;
        this.mouseTrackerService = mouseTrackerService;
        this.nullEndWidth = nullEndWidth;
        this.rangeFactory = rangeFactory;
        this.valueNormalizationService = valueNormalizationService;
        this.element = this.$element[0];
    }
    MultiSliderController.prototype.$postLink = function () {
        var _this = this;
        this.$element.on('mouseenter', function () {
            _this.onMouseEnter();
        });
        this.$element.on('mouseleave', function () {
            _this.onMouseLeave();
        });
        this.$element.on('mouseup', function () {
            _this.onMouseUp();
        });
        this.$scope.$on("brWeeklyScheduler.commitGhost" /* COMMIT_GHOST */, function (event, ghostSchedule) {
            if (_this.item.$renderGhost) {
                _this.commitGhost(ghostSchedule);
            }
        });
        this.$scope.$on("brWeeklyScheduler.removeGhost" /* REMOVE_GHOST */, function (event, day) {
            if (!_this.item.$isGhostOrigin && _this.item.day === day) {
                _this.removeGhost();
            }
        });
        this.$scope.$on("brWeeklyScheduler.removeAllGhosts" /* REMOVE_ALL_GHOSTS */, function () {
            _this.removeGhost();
        });
    };
    MultiSliderController.prototype.onMouseEnter = function () {
        // If the cursor is moving BACK into an item that ALREADY has a ghost rendered, we'll want to remove the ghost from the item that was left
        if (this.item.$renderGhost) {
            this.$scope.$emit("brWeeklyScheduler.removeLastGhost" /* REMOVE_LAST_GHOST */);
        }
        if (this.dragSchedule) {
            this.addDragSchedule();
        }
        if (this.ghostValues && !this.item.$renderGhost) {
            this.createGhost();
        }
    };
    MultiSliderController.prototype.onMouseLeave = function () {
        if (this.dragSchedule) {
            this.removeDragSchedule();
        }
    };
    MultiSliderController.prototype.onMouseUp = function () {
        if (this.pendingSchedule) {
            this.commitDragSchedule();
        }
    };
    MultiSliderController.prototype.addDragSchedule = function () {
        this.dragSchedule.day = this.item.day;
        this.pendingSchedule = this.item.addSchedule(this.dragSchedule);
        this.pendingSchedule.$isActive = true;
    };
    MultiSliderController.prototype.removeDragSchedule = function () {
        this.item.removeSchedule(this.dragSchedule);
        this.ngModelCtrl.$setDirty();
        this.pendingSchedule = null;
    };
    MultiSliderController.prototype.commitDragSchedule = function () {
        this.pendingSchedule.$isActive = false;
        this.ngModelCtrl.$setDirty();
        this.item.mergeSchedule(this.pendingSchedule);
        this.pendingSchedule = null;
    };
    MultiSliderController.prototype.getScheduleForAdd = function (start, end) {
        start = this.valueNormalizationService.normalizeValue(start, 0, end);
        end = this.valueNormalizationService.normalizeValue(end, start, this.config.maxValue);
        if (this.config.nullEnds) {
            end = null;
        }
        var schedule = {
            day: this.item.day,
            start: start,
            end: end,
            value: this.config.defaultValue
        };
        return schedule;
    };
    MultiSliderController.prototype.openEditorForAdd = function (schedule) {
        if (this.item.canEdit()) {
            return this.config.editSlot(schedule);
        }
        else {
            return this.$q.when(schedule);
        }
    };
    /** Expand ghost while dragging in it */
    MultiSliderController.prototype.adjustGhost = function () {
        var point = this.mouseTrackerService.getMousePosition();
        var mouseValue = this.getValAtMousePosition(point.x);
        var existingLeftValue = this.startingGhostValues.left;
        var updatedLeftValue;
        var updatedRightValue;
        if (mouseValue < existingLeftValue) { // user is dragging left
            updatedLeftValue = mouseValue;
            updatedRightValue = existingLeftValue;
        }
        else { // user is dragging right
            updatedLeftValue = existingLeftValue;
            updatedRightValue = mouseValue;
        }
        var ghostValues = {
            left: this.normalizeGhostValue(updatedLeftValue),
            right: this.normalizeGhostValue(updatedRightValue)
        };
        this.setGhostValues({
            ghostValues: ghostValues
        });
    };
    /** Move ghost around while not dragging */
    MultiSliderController.prototype.positionGhost = function () {
        var point = this.mouseTrackerService.getMousePosition();
        var val = this.getValAtMousePosition(point.x);
        this.startingGhostValues = {
            left: val,
            right: this.config.nullEnds ? val + this.nullEndWidth : val + this.config.interval
        };
        this.setGhostValues({
            ghostValues: angular.copy(this.startingGhostValues)
        });
    };
    MultiSliderController.prototype.onGhostWrapperMouseDown = function () {
        if (!this.item.editable) {
            return;
        }
        this.item.$isGhostOrigin = true;
        this.createGhost();
    };
    MultiSliderController.prototype.onGhostWrapperMouseMove = function () {
        // nullEnds calendars don't need to do anything because the size of the slot doesn't really matter
        if (this.config.nullEnds) {
            this.positionGhost();
            return;
        }
        if (this.item.$renderGhost) {
            this.adjustGhost();
        }
    };
    MultiSliderController.prototype.onGhostWrapperMouseUp = function () {
        var _this = this;
        var ghostSchedule = this.getScheduleForAdd(this.ghostValues.left, this.ghostValues.right);
        this.openEditorForAdd(ghostSchedule).then(function (editedGhostSchedule) {
            _this.$scope.$emit("brWeeklyScheduler.ghostDragEnded" /* GHOST_DRAG_ENDED */, editedGhostSchedule);
        }).catch(function () {
            _this.$scope.$emit("brWeeklyScheduler.cancelGhost" /* CANCEL_GHOST */);
        });
    };
    MultiSliderController.prototype.createGhost = function () {
        this.item.$renderGhost = true;
        this.positionGhost();
    };
    MultiSliderController.prototype.commitGhost = function (ghostSchedule) {
        if (this.item.canAddSchedule()) {
            this.item.addScheduleAndMerge(ghostSchedule);
            this.ngModelCtrl.$setDirty();
            this.config.onChange();
        }
        this.removeGhost();
    };
    MultiSliderController.prototype.getMousePosition = function (pageX) {
        var elementOffsetX = this.elementOffsetService.left(this.$element);
        var left = pageX - elementOffsetX;
        return left;
    };
    MultiSliderController.prototype.getValAtMousePosition = function (pageX) {
        return this.pixelToVal(this.getMousePosition(pageX));
    };
    /**
     * Perform an external action to bring up an editor for a schedule
     */
    MultiSliderController.prototype.editSchedule = function (schedule) {
        var _this = this;
        if (this.item.canEdit()) {
            schedule.$isEditing = true;
            var originalSchedule_1 = angular.copy(schedule);
            this.config.editSlot(schedule).then(function (newSchedule) {
                var range = _this.rangeFactory.createRange(_this.config, newSchedule);
                if (_this.shouldDelete(range)) {
                    _this.item.removeSchedule(schedule);
                }
                else {
                    var premergeSchedule = angular.copy(range);
                    _this.item.mergeSchedule(range);
                    // If merging mutated the schedule further, then updateSchedule would have already been called
                    // This is so that edits that don't trigger merges still trigger onChange,
                    // but edits that do trigger merges don't trigger it twice
                    if (angular.equals(premergeSchedule, range)) {
                        // The 'schedule' variable has already been updated with the correct values.
                        // The range should be applied as an update to the originalSchedule so that onChange is triggered if necessary
                        originalSchedule_1.update(range);
                    }
                }
                _this.ngModelCtrl.$setDirty();
            }).catch(function () {
                // do nothing except eat the unhandled rejection error
            }).finally(function () {
                schedule.$isEditing = false;
            });
        }
    };
    MultiSliderController.prototype.getSlotLeft = function (start) {
        var underlyingInterval = this.getUnderlyingInterval(start);
        return underlyingInterval.offsetLeft + 'px';
    };
    MultiSliderController.prototype.getSlotRight = function (start, end) {
        // If there is a null end, place the end of the slot two hours away from the beginning.
        if (this.config.nullEnds && end === null) {
            end = start + this.nullEndWidth;
        }
        // An end of 0 should display allll the way to the right, up to the edge
        end = this.endAdjusterService.adjustEndForView(this.config, end);
        // We want the right side to go /up to/ the interval it represents, not cover it, so we must substract 1 interval
        var underlyingInterval = this.getUnderlyingInterval(end - this.config.interval);
        var offsetRight = underlyingInterval.offsetLeft + underlyingInterval.offsetWidth;
        var result = this.element.clientWidth - offsetRight;
        return result + 'px';
    };
    MultiSliderController.prototype.getUnderlyingInterval = function (val) {
        val = this.normalizeIntervalValue(val);
        return this.element.parentElement.querySelector("[rel='" + val + "']");
    };
    MultiSliderController.prototype.shouldDelete = function (schedule) {
        if (schedule.$isDeleting) {
            return true;
        }
        if (this.config.fillEmptyWithDefault && schedule.value === this.config.defaultValue) {
            return true;
        }
        return false;
    };
    MultiSliderController.prototype.pixelToVal = function (pixel) {
        var percent = pixel / this.element.clientWidth;
        return Math.floor(percent * (this.config.intervalCount) + 0.5) * this.config.interval;
    };
    MultiSliderController.prototype.normalizeIntervalValue = function (value) {
        // There is no interval to the right of the rightmost interval -- the last interval will not actually render with a "rel" value
        var rightmost = this.config.maxValue - this.config.interval;
        return this.valueNormalizationService.normalizeValue(value, 0, rightmost);
    };
    MultiSliderController.prototype.normalizeGhostValue = function (value) {
        return this.valueNormalizationService.normalizeValue(value, 0, this.config.maxValue);
    };
    MultiSliderController.prototype.removeGhost = function () {
        this.item.$isGhostOrigin = false;
        this.item.$renderGhost = false;
        this.setGhostValues(null);
    };
    MultiSliderController.$name = 'brMultiSliderController';
    MultiSliderController.$controllerAs = 'multiSliderCtrl';
    MultiSliderController.$inject = [
        '$element',
        '$q',
        '$scope',
        'brWeeklySchedulerElementOffsetService',
        'brWeeklySchedulerEndAdjusterService',
        'brWeeklySchedulerMouseTrackerService',
        'brWeeklySchedulerNullEndWidth',
        'brWeeklySchedulerRangeFactory',
        'brWeeklySchedulerValueNormalizationService'
    ];
    return MultiSliderController;
}());
exports.MultiSliderController = MultiSliderController;
/** @internal */
var MultiSliderComponent = /** @class */ (function () {
    function MultiSliderComponent() {
        this.bindings = {
            config: '<',
            dragSchedule: '<',
            ghostValues: '<',
            item: '=ngModel',
            setGhostValues: '&'
        };
        this.controller = MultiSliderController.$name;
        this.controllerAs = MultiSliderController.$controllerAs;
        this.require = {
            ngModelCtrl: 'ngModel'
        };
        this.template = __webpack_require__(/*! ./multislider.html */ "./src/ng-weekly-scheduler/multislider/multislider.html");
    }
    MultiSliderComponent.$name = 'brMultiSlider';
    return MultiSliderComponent;
}());
exports.MultiSliderComponent = MultiSliderComponent;


/***/ }),

/***/ "./src/ng-weekly-scheduler/null-end/NullEndDirective.ts":
/*!**************************************************************!*\
  !*** ./src/ng-weekly-scheduler/null-end/NullEndDirective.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var NullEndDirective = /** @class */ (function () {
    function NullEndDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                return _this.validator.validate(modelValue.schedules, modelValue.config);
            };
        };
        this.require = 'ngModel';
    }
    NullEndDirective.Factory = function () {
        var directive = function (validator) {
            return new NullEndDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerNullEndValidatorService'];
        return directive;
    };
    NullEndDirective.$name = 'brNullEnd';
    return NullEndDirective;
}());
exports.NullEndDirective = NullEndDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/null-end/module.ts":
/*!****************************************************!*\
  !*** ./src/ng-weekly-scheduler/null-end/module.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var NullEndDirective_1 = __webpack_require__(/*! ./NullEndDirective */ "./src/ng-weekly-scheduler/null-end/NullEndDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.nullEnd', [])
    .directive(NullEndDirective_1.NullEndDirective.$name, NullEndDirective_1.NullEndDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/overlap/OverlapDirective.ts":
/*!*************************************************************!*\
  !*** ./src/ng-weekly-scheduler/overlap/OverlapDirective.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var OverlapDirective = /** @class */ (function () {
    function OverlapDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                return _this.validator.validate(modelValue.schedules, modelValue.config);
            };
        };
        this.require = 'ngModel';
    }
    OverlapDirective.Factory = function () {
        var directive = function (validator) {
            return new OverlapDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerOverlapValidatorService'];
        return directive;
    };
    OverlapDirective.$name = 'brOverlap';
    return OverlapDirective;
}());
exports.OverlapDirective = OverlapDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/overlap/OverlapService.ts":
/*!***********************************************************!*\
  !*** ./src/ng-weekly-scheduler/overlap/OverlapService.ts ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var OverlapService = /** @class */ (function () {
    function OverlapService(endAdjusterService) {
        this.endAdjusterService = endAdjusterService;
    }
    OverlapService.prototype.getOverlapState = function (config, current, other) {
        var currentStart = current.start;
        var currentEnd = this.endAdjusterService.adjustEndForView(config, current.end);
        var otherStart = other.start;
        var otherEnd = this.endAdjusterService.adjustEndForView(config, other.end);
        if (otherEnd >= currentEnd && otherStart <= currentStart) {
            return 1 /* CurrentIsInsideOther */;
        }
        if (currentEnd >= otherEnd && currentStart <= otherStart) {
            return 2 /* CurrentCoversOther */;
        }
        if (otherEnd > currentStart && otherEnd <= currentEnd) {
            return 3 /* OtherEndIsInsideCurrent */;
        }
        if (otherStart >= currentStart && otherStart < currentEnd) {
            return 4 /* OtherStartIsInsideCurrent */;
        }
        if (otherEnd === currentStart && otherEnd <= currentEnd) {
            return 5 /* OtherEndIsCurrentStart */;
        }
        if (otherStart === currentEnd && otherStart <= currentEnd) {
            return 6 /* OtherStartIsCurrentEnd */;
        }
        return 0 /* NoOverlap */;
    };
    OverlapService.$name = 'brWeeklySchedulerOverlapService';
    OverlapService.$inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];
    return OverlapService;
}());
exports.OverlapService = OverlapService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/overlap/module.ts":
/*!***************************************************!*\
  !*** ./src/ng-weekly-scheduler/overlap/module.ts ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var OverlapDirective_1 = __webpack_require__(/*! ./OverlapDirective */ "./src/ng-weekly-scheduler/overlap/OverlapDirective.ts");
var OverlapService_1 = __webpack_require__(/*! ./OverlapService */ "./src/ng-weekly-scheduler/overlap/OverlapService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.overlap', [])
    .directive(OverlapDirective_1.OverlapDirective.$name, OverlapDirective_1.OverlapDirective.Factory())
    .service(OverlapService_1.OverlapService.$name, OverlapService_1.OverlapService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/purge-default/PurgeDefaultService.ts":
/*!**********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/purge-default/PurgeDefaultService.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** When using the 'fillEmptyWithDefault' option, this service will be used to delete the default schedules for correct display on the calendar */
/** @internal */
var PurgeDefaultService = /** @class */ (function () {
    function PurgeDefaultService() {
    }
    PurgeDefaultService.prototype.purge = function (schedules, config) {
        var lastIndex = schedules.length - 1;
        // loop in reverse to avoid messing up indices as we go
        for (var i = lastIndex; i >= 0; i--) {
            if (schedules[i].value === config.defaultValue) {
                schedules.splice(i, 1);
            }
        }
        return schedules;
    };
    PurgeDefaultService.$name = 'brWeeklySchedulerPurgeDefaultService';
    return PurgeDefaultService;
}());
exports.PurgeDefaultService = PurgeDefaultService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/purge-default/module.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/purge-default/module.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var PurgeDefaultService_1 = __webpack_require__(/*! ./PurgeDefaultService */ "./src/ng-weekly-scheduler/purge-default/PurgeDefaultService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.purgeDefault', [])
    .service(PurgeDefaultService_1.PurgeDefaultService.$name, PurgeDefaultService_1.PurgeDefaultService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/resize/ResizeService.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/resize/ResizeService.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ResizeServiceProvider = /** @class */ (function () {
    function ResizeServiceProvider() {
        this.customResizeEvents = [];
        this.serviceInitialized = false;
        this.$get.$inject = [
            '$rootScope',
            '$window'
        ];
    }
    ResizeServiceProvider.prototype.setCustomResizeEvents = function (events) {
        this.customResizeEvents = events;
    };
    ResizeServiceProvider.prototype.$get = function ($rootScope, $window) {
        var _this = this;
        return {
            initialize: function () {
                if (_this.serviceInitialized) {
                    return;
                }
                $window.addEventListener('resize', function () {
                    // addEventListener exists outside of angular so we have to $apply the change
                    $rootScope.$apply(function () {
                        $rootScope.$broadcast("brWeeklyScheduler.resized" /* RESIZED */);
                    });
                });
                if (_this.customResizeEvents) {
                    _this.customResizeEvents.forEach(function (event) {
                        $rootScope.$on(event, function () {
                            $rootScope.$broadcast("brWeeklyScheduler.resized" /* RESIZED */);
                        });
                    });
                }
                _this.serviceInitialized = true;
            }
        };
    };
    ResizeServiceProvider.$name = 'br.weeklyScheduler.resizeService';
    return ResizeServiceProvider;
}());
exports.ResizeServiceProvider = ResizeServiceProvider;


/***/ }),

/***/ "./src/ng-weekly-scheduler/resize/module.ts":
/*!**************************************************!*\
  !*** ./src/ng-weekly-scheduler/resize/module.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ResizeService_1 = __webpack_require__(/*! ./ResizeService */ "./src/ng-weekly-scheduler/resize/ResizeService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.resize', [])
    .provider(ResizeService_1.ResizeServiceProvider.$name, ResizeService_1.ResizeServiceProvider)
    .run([ResizeService_1.ResizeServiceProvider.$name, function (resizeService) { return resizeService.initialize(); }])
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/restriction-explanations/RestrictionExplanationsComponent.ts":
/*!**********************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/restriction-explanations/RestrictionExplanationsComponent.ts ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var RestrictionExplanationsController = /** @class */ (function () {
    function RestrictionExplanationsController($filter) {
        this.$filter = $filter;
        this.explanations = {};
    }
    RestrictionExplanationsController.prototype.$onInit = function () {
        var config = this.schedulerCtrl.config;
        if (config.maxTimeSlot) {
            var maxTimeSlot = this.$filter('brWeeklySchedulerSecondsAsText')(config.maxTimeSlot);
            this.explanations["maxTimeSlot" /* MaxTimeSlot */] = config.restrictionExplanations.maxTimeSlot(maxTimeSlot);
        }
        if (config.fullCalendar) {
            this.explanations["fullCalendar" /* FullCalendar */] = config.restrictionExplanations.fullCalendar;
        }
        if (config.monoSchedule) {
            this.explanations["monoSchedule" /* MonoSchedule */] = config.restrictionExplanations.monoSchedule;
        }
        if (config.nullEnds) {
            this.explanations["nullEnd" /* NullEnd */] = config.restrictionExplanations.nullEnds;
        }
        if (config.scheduleCountOptions && config.scheduleCountOptions.count) {
            this.explanations["scheduleCount" /* ScheduleCount */] = config.restrictionExplanations.scheduleCount(config.scheduleCountOptions);
        }
        if (config.minimumSeparation) {
            var minimumSeparation = this.$filter('brWeeklySchedulerSecondsAsText')(config.minimumSeparation);
            this.explanations["minimumSeparation" /* MinimumSeparation */] = config.restrictionExplanations.minimumSeparation(minimumSeparation);
        }
    };
    RestrictionExplanationsController.$controllerAs = 'restrictionExplanationsCtrl';
    RestrictionExplanationsController.$name = 'brWeeklySchedulerRestrictionExplanationsController';
    RestrictionExplanationsController.$inject = ['$filter'];
    return RestrictionExplanationsController;
}());
exports.RestrictionExplanationsController = RestrictionExplanationsController;
/** @internal */
var RestrictionExplanationsComponent = /** @class */ (function () {
    function RestrictionExplanationsComponent() {
        this.controller = RestrictionExplanationsController.$name;
        this.controllerAs = RestrictionExplanationsController.$controllerAs;
        this.require = {
            schedulerCtrl: '^brWeeklyScheduler'
        };
        this.template = "\n        <div class=\"srow explanations\" ng-class=\"{ violation: restrictionExplanationsCtrl.schedulerCtrl.formController.$error[key] }\" ng-repeat=\"(key, explanation) in restrictionExplanationsCtrl.explanations\">\n            {{ explanation }}\n        </div>\n    ";
    }
    RestrictionExplanationsComponent.$name = 'brRestrictionExplanations';
    return RestrictionExplanationsComponent;
}());
exports.RestrictionExplanationsComponent = RestrictionExplanationsComponent;


/***/ }),

/***/ "./src/ng-weekly-scheduler/restriction-explanations/module.ts":
/*!********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/restriction-explanations/module.ts ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var RestrictionExplanationsComponent_1 = __webpack_require__(/*! ./RestrictionExplanationsComponent */ "./src/ng-weekly-scheduler/restriction-explanations/RestrictionExplanationsComponent.ts");
exports.default = angular
    .module('rr.weeklyScheduler.restrictionExplanations', [])
    .component(RestrictionExplanationsComponent_1.RestrictionExplanationsComponent.$name, new RestrictionExplanationsComponent_1.RestrictionExplanationsComponent())
    .controller(RestrictionExplanationsComponent_1.RestrictionExplanationsController.$name, RestrictionExplanationsComponent_1.RestrictionExplanationsController)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/revalidate/RevalidateDirective.ts":
/*!*******************************************************************!*\
  !*** ./src/ng-weekly-scheduler/revalidate/RevalidateDirective.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Runs custom validators whenever the model changes
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var RevalidateDirective = /** @class */ (function () {
    function RevalidateDirective() {
        this.link = function (scope, element, attrs, ngModelCtrl) {
            scope.$watch(attrs.ngModel, function () {
                ngModelCtrl.$validate();
            }, true);
        };
        this.require = 'ngModel';
    }
    RevalidateDirective.Factory = function () {
        var directive = function () {
            return new RevalidateDirective();
        };
        return directive;
    };
    RevalidateDirective.$name = 'brRevalidate';
    return RevalidateDirective;
}());
exports.RevalidateDirective = RevalidateDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/revalidate/module.ts":
/*!******************************************************!*\
  !*** ./src/ng-weekly-scheduler/revalidate/module.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var RevalidateDirective_1 = __webpack_require__(/*! ./RevalidateDirective */ "./src/ng-weekly-scheduler/revalidate/RevalidateDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.revalidate', [])
    .directive(RevalidateDirective_1.RevalidateDirective.$name, RevalidateDirective_1.RevalidateDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-area-container/module.ts":
/*!*******************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-area-container/module.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var schedule_area_container_1 = __webpack_require__(/*! ./schedule-area-container */ "./src/ng-weekly-scheduler/schedule-area-container/schedule-area-container.ts");
exports.default = angular
    .module('rr.weeklyScheduler.scheduleAreaContainer', [])
    .component(schedule_area_container_1.ScheduleAreaContainerComponent.$name, new schedule_area_container_1.ScheduleAreaContainerComponent())
    .controller(schedule_area_container_1.ScheduleAreaContainerController.$name, schedule_area_container_1.ScheduleAreaContainerController)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-area-container/schedule-area-container.ts":
/*!************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-area-container/schedule-area-container.ts ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ScheduleAreaContainerController = /** @class */ (function () {
    function ScheduleAreaContainerController($element, $scope, scrollService, zoomService) {
        this.$element = $element;
        this.$scope = $scope;
        this.scrollService = scrollService;
        this.zoomService = zoomService;
    }
    ScheduleAreaContainerController.prototype.$postLink = function () {
        var _this = this;
        var element = this.$element[0]; // grab plain js, not jqlite
        this.scrollService.hijackScroll(element, 20);
        this.zoomService.resetZoom(element);
        this.$scope.$on("brWeeklyScheduler.clickOnACell" /* CLICK_ON_A_CELL */, function (e, data) {
            _this.zoomService.zoomInACell(element, e, data);
        });
        this.$scope.$on("brWeeklyScheduler.resetZoom" /* RESET_ZOOM */, function (e) {
            _this.zoomService.resetZoom(element);
        });
        this.$scope.$on("brWeeklyScheduler.zoomIn" /* ZOOM_IN */, function (e) {
            _this.zoomService.zoomIn(element);
        });
    };
    ScheduleAreaContainerController.$name = 'brWeeklySchedulerScheduleAreaContainerController';
    ScheduleAreaContainerController.$inject = [
        '$element',
        '$scope',
        'brWeeklySchedulerScrollService',
        'brWeeklySchedulerZoomService'
    ];
    return ScheduleAreaContainerController;
}());
exports.ScheduleAreaContainerController = ScheduleAreaContainerController;
/** @internal */
var ScheduleAreaContainerComponent = /** @class */ (function () {
    function ScheduleAreaContainerComponent() {
        this.controller = ScheduleAreaContainerController.$name;
        this.transclude = true;
        this.template = "<ng-transclude></ng-transclude>";
    }
    ScheduleAreaContainerComponent.$name = 'brScheduleAreaContainer';
    return ScheduleAreaContainerComponent;
}());
exports.ScheduleAreaContainerComponent = ScheduleAreaContainerComponent;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-count/ScheduleCountDirective.ts":
/*!**************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-count/ScheduleCountDirective.ts ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ScheduleCountDirective = /** @class */ (function () {
    function ScheduleCountDirective(validator) {
        var _this = this;
        this.validator = validator;
        this.link = function (scope, element, attrs, ngModelCtrl) {
            if (attrs.brScheduleCount) {
                ngModelCtrl.$validators[_this.validator.error] = function (modelValue) {
                    return _this.validator.validate(modelValue.schedules, modelValue.config);
                };
            }
        };
        this.require = 'ngModel';
    }
    ScheduleCountDirective.Factory = function () {
        var directive = function (validator) {
            return new ScheduleCountDirective(validator);
        };
        directive.$inject = ['brWeeklySchedulerScheduleCountValidatorService'];
        return directive;
    };
    ScheduleCountDirective.$name = 'brScheduleCount';
    return ScheduleCountDirective;
}());
exports.ScheduleCountDirective = ScheduleCountDirective;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-count/module.ts":
/*!**********************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-count/module.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ScheduleCountDirective_1 = __webpack_require__(/*! ./ScheduleCountDirective */ "./src/ng-weekly-scheduler/schedule-count/ScheduleCountDirective.ts");
exports.default = angular
    .module('rr.weeklyScheduler.scheduleCount', [])
    .directive(ScheduleCountDirective_1.ScheduleCountDirective.$name, ScheduleCountDirective_1.ScheduleCountDirective.Factory())
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/FullCalendarValidatorService.ts":
/*!************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/FullCalendarValidatorService.ts ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var FullCalendarValidatorService = /** @class */ (function () {
    function FullCalendarValidatorService() {
    }
    Object.defineProperty(FullCalendarValidatorService.prototype, "error", {
        get: function () {
            return "fullCalendar" /* FullCalendar */;
        },
        enumerable: true,
        configurable: true
    });
    FullCalendarValidatorService.prototype.validate = function (schedules, config) {
        if (!config.fullCalendar) {
            return true;
        }
        // When this option is true we should enforce that there are no gaps in the schedules
        var len = schedules.length;
        // If there are no schedules, it automatically fails.
        if (!len) {
            return false;
        }
        // If there was only one item we should check that it spans the whole range
        if (len === 1) {
            var schedule = schedules[0];
            return this.validateStartAtMinValue(schedule.start) && this.validateEndAtMaxValue(schedule.end, config);
        }
        // If more, compare two at a time until the end
        var loopLen = len - 1;
        var result = true;
        // Sort by start time first
        var sortedSchedules = schedules.sort(function (a, b) { return a.start > b.start ? 1 : -1; });
        for (var i = 0; i < loopLen; i++) {
            var current = schedules[i];
            var next = schedules[i + 1];
            // Validate that the first item lands at 0
            if (i === 0 && !this.validateStartAtMinValue(current.start)) {
                return false;
            }
            // Validate that the last item lands at maxValue
            if (i === loopLen - 1 && !this.validateEndAtMaxValue(next.end, config)) {
                return false;
            }
            result = result && current.end === next.start;
        }
        return result;
    };
    FullCalendarValidatorService.prototype.validateStartAtMinValue = function (start) {
        return start === 0;
    };
    FullCalendarValidatorService.prototype.validateEndAtMaxValue = function (end, config) {
        return (end || config.maxValue) === config.maxValue;
    };
    FullCalendarValidatorService.$name = 'brWeeklySchedulerFullCalendarValidatorService';
    return FullCalendarValidatorService;
}());
exports.FullCalendarValidatorService = FullCalendarValidatorService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/MaxTimeSlotValidatorService.ts":
/*!***********************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/MaxTimeSlotValidatorService.ts ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var MaxTimeSlotValidatorService = /** @class */ (function () {
    function MaxTimeSlotValidatorService(endAdjusterService) {
        this.endAdjusterService = endAdjusterService;
    }
    Object.defineProperty(MaxTimeSlotValidatorService.prototype, "error", {
        get: function () {
            return "maxTimeSlot" /* MaxTimeSlot */;
        },
        enumerable: true,
        configurable: true
    });
    MaxTimeSlotValidatorService.prototype.validate = function (schedules, config) {
        var _this = this;
        var maxTimeSlot = config.maxTimeSlot;
        if (!maxTimeSlot) {
            return true;
        }
        return !schedules.some(function (s) { return s.value !== config.defaultValue && _this.endAdjusterService.adjustEndForView(config, s.end) - s.start > maxTimeSlot; });
    };
    MaxTimeSlotValidatorService.$name = 'brWeeklySchedulerMaxTimeSlotValidatorService';
    MaxTimeSlotValidatorService.$inject = ['brWeeklySchedulerEndAdjusterService'];
    return MaxTimeSlotValidatorService;
}());
exports.MaxTimeSlotValidatorService = MaxTimeSlotValidatorService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/MinimumSeparationValidatorService.ts":
/*!*****************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/MinimumSeparationValidatorService.ts ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var MinimumSeparationValidatorService = /** @class */ (function () {
    function MinimumSeparationValidatorService() {
    }
    Object.defineProperty(MinimumSeparationValidatorService.prototype, "error", {
        get: function () {
            return "minimumSeparation" /* MinimumSeparation */;
        },
        enumerable: true,
        configurable: true
    });
    MinimumSeparationValidatorService.prototype.validate = function (schedules, config) {
        if (!config.minimumSeparation) {
            return true;
        }
        var len = schedules.length;
        if (len <= 1) {
            return true;
        }
        var loopLen = len - 1;
        schedules.sort(function (a, b) { return a.start - b.start; });
        for (var i = 0; i < loopLen; i++) {
            var currentSchedule = schedules[i];
            var nextSchedule = schedules[i + 1];
            if (nextSchedule.start - currentSchedule.end < config.minimumSeparation) {
                return false;
            }
        }
        return true;
    };
    MinimumSeparationValidatorService.$name = 'brWeeklySchedulerMinimumSeparationValidatorService';
    return MinimumSeparationValidatorService;
}());
exports.MinimumSeparationValidatorService = MinimumSeparationValidatorService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/MonoScheduleValidatorService.ts":
/*!************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/MonoScheduleValidatorService.ts ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var MonoScheduleValidatorService = /** @class */ (function () {
    function MonoScheduleValidatorService() {
    }
    Object.defineProperty(MonoScheduleValidatorService.prototype, "error", {
        get: function () {
            return "monoSchedule" /* MonoSchedule */;
        },
        enumerable: true,
        configurable: true
    });
    /** Important note -- this does not validate that only one schedule exists per item, but rather that only one NON-DEFAULT schedule exists per item. */
    MonoScheduleValidatorService.prototype.validate = function (schedules, config) {
        if (!config.monoSchedule) {
            return true;
        }
        // If a default value is defined, schedules with default values don't count -- one non-default schedule per item.
        var schedulesToValidate;
        if (angular.isDefined(config.defaultValue)) {
            schedulesToValidate = schedules.filter(function (schedule) { return schedule.value !== config.defaultValue; });
        }
        else {
            schedulesToValidate = schedules;
        }
        // only allowed empty or 1 schedule per item
        return !schedulesToValidate.length || schedulesToValidate.length === 1;
    };
    MonoScheduleValidatorService.$name = 'brWeeklySchedulerMonoScheduleValidatorService';
    return MonoScheduleValidatorService;
}());
exports.MonoScheduleValidatorService = MonoScheduleValidatorService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/NullEndValidatorService.ts":
/*!*******************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/NullEndValidatorService.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var NullEndScheduleValidatorService = /** @class */ (function () {
    function NullEndScheduleValidatorService() {
    }
    Object.defineProperty(NullEndScheduleValidatorService.prototype, "error", {
        get: function () {
            return "nullEnd" /* NullEnd */;
        },
        enumerable: true,
        configurable: true
    });
    NullEndScheduleValidatorService.prototype.validate = function (schedules, config) {
        if (config.nullEnds) {
            return schedules.length <= 1 && schedules.every(function (schedule) { return schedule.end === null; });
        }
        else {
            return schedules.every(function (schedule) { return schedule.end !== null; });
        }
    };
    NullEndScheduleValidatorService.$name = 'brWeeklySchedulerNullEndValidatorService';
    return NullEndScheduleValidatorService;
}());
exports.NullEndScheduleValidatorService = NullEndScheduleValidatorService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/OverlapValidatorService.ts":
/*!*******************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/OverlapValidatorService.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var OverlapValidatorService = /** @class */ (function () {
    function OverlapValidatorService(overlapService) {
        this.overlapService = overlapService;
    }
    Object.defineProperty(OverlapValidatorService.prototype, "error", {
        get: function () {
            return "overlap" /* Overlap */;
        },
        enumerable: true,
        configurable: true
    });
    OverlapValidatorService.prototype.validate = function (schedules, config) {
        // Compare two at a time until the end
        var len = schedules.length;
        var result = true;
        for (var i = 0; i < len - 1; i++) {
            var current = schedules[i];
            var next = schedules[i + 1];
            var valuesMatch = current.value === next.value;
            if (!valuesMatch) {
                var overlapState = this.overlapService.getOverlapState(config, current, next);
                result = result && [0 /* NoOverlap */, 6 /* OtherStartIsCurrentEnd */, 5 /* OtherEndIsCurrentStart */].indexOf(overlapState) > -1;
            }
        }
        return result;
    };
    OverlapValidatorService.$name = 'brWeeklySchedulerOverlapValidatorService';
    OverlapValidatorService.$inject = [
        'brWeeklySchedulerOverlapService'
    ];
    return OverlapValidatorService;
}());
exports.OverlapValidatorService = OverlapValidatorService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/ScheduleCountValidatorService.ts":
/*!*************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/ScheduleCountValidatorService.ts ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ScheduleCountValidatorService = /** @class */ (function () {
    function ScheduleCountValidatorService() {
    }
    Object.defineProperty(ScheduleCountValidatorService.prototype, "error", {
        get: function () {
            return "scheduleCount" /* ScheduleCount */;
        },
        enumerable: true,
        configurable: true
    });
    ScheduleCountValidatorService.prototype.validate = function (schedules, config) {
        if (!config.scheduleCountOptions.count) {
            return true;
        }
        if (config.scheduleCountOptions.exact) {
            return this.validateExactCount(schedules, config);
        }
        else {
            return this.validateMaxCount(schedules, config);
        }
    };
    ScheduleCountValidatorService.prototype.validateExactCount = function (schedules, config) {
        return schedules.length === config.scheduleCountOptions.count;
    };
    ScheduleCountValidatorService.prototype.validateMaxCount = function (schedules, config) {
        return schedules.length <= config.scheduleCountOptions.count;
    };
    ScheduleCountValidatorService.$name = 'brWeeklySchedulerScheduleCountValidatorService';
    return ScheduleCountValidatorService;
}());
exports.ScheduleCountValidatorService = ScheduleCountValidatorService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/schedule-validator/module.ts":
/*!**************************************************************!*\
  !*** ./src/ng-weekly-scheduler/schedule-validator/module.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var FullCalendarValidatorService_1 = __webpack_require__(/*! ./FullCalendarValidatorService */ "./src/ng-weekly-scheduler/schedule-validator/FullCalendarValidatorService.ts");
var MaxTimeSlotValidatorService_1 = __webpack_require__(/*! ./MaxTimeSlotValidatorService */ "./src/ng-weekly-scheduler/schedule-validator/MaxTimeSlotValidatorService.ts");
var MinimumSeparationValidatorService_1 = __webpack_require__(/*! ./MinimumSeparationValidatorService */ "./src/ng-weekly-scheduler/schedule-validator/MinimumSeparationValidatorService.ts");
var MonoScheduleValidatorService_1 = __webpack_require__(/*! ./MonoScheduleValidatorService */ "./src/ng-weekly-scheduler/schedule-validator/MonoScheduleValidatorService.ts");
var NullEndValidatorService_1 = __webpack_require__(/*! ./NullEndValidatorService */ "./src/ng-weekly-scheduler/schedule-validator/NullEndValidatorService.ts");
var OverlapValidatorService_1 = __webpack_require__(/*! ./OverlapValidatorService */ "./src/ng-weekly-scheduler/schedule-validator/OverlapValidatorService.ts");
var ScheduleCountValidatorService_1 = __webpack_require__(/*! ./ScheduleCountValidatorService */ "./src/ng-weekly-scheduler/schedule-validator/ScheduleCountValidatorService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.scheduleValidation', [])
    .service(FullCalendarValidatorService_1.FullCalendarValidatorService.$name, FullCalendarValidatorService_1.FullCalendarValidatorService)
    .service(MaxTimeSlotValidatorService_1.MaxTimeSlotValidatorService.$name, MaxTimeSlotValidatorService_1.MaxTimeSlotValidatorService)
    .service(MinimumSeparationValidatorService_1.MinimumSeparationValidatorService.$name, MinimumSeparationValidatorService_1.MinimumSeparationValidatorService)
    .service(MonoScheduleValidatorService_1.MonoScheduleValidatorService.$name, MonoScheduleValidatorService_1.MonoScheduleValidatorService)
    .service(NullEndValidatorService_1.NullEndScheduleValidatorService.$name, NullEndValidatorService_1.NullEndScheduleValidatorService)
    .service(OverlapValidatorService_1.OverlapValidatorService.$name, OverlapValidatorService_1.OverlapValidatorService)
    .service(ScheduleCountValidatorService_1.ScheduleCountValidatorService.$name, ScheduleCountValidatorService_1.ScheduleCountValidatorService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/scroll/ScrollService.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/scroll/ScrollService.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ScrollService = /** @class */ (function () {
    function ScrollService(zoomService) {
        this.zoomService = zoomService;
    }
    ScrollService.prototype.hijackScroll = function (element, delta) {
        var _this = this;
        element.addEventListener('mousewheel', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.ctrlKey) {
                _this.zoomService.zoomByScroll(element, event, delta);
            }
            else {
                if ((event.wheelDelta || event.detail) > 0) {
                    element.scrollLeft -= delta;
                }
                else {
                    element.scrollLeft += delta;
                }
            }
            return false;
        });
    };
    ScrollService.$name = 'brWeeklySchedulerScrollService';
    ScrollService.$inject = [
        'brWeeklySchedulerZoomService'
    ];
    return ScrollService;
}());
exports.ScrollService = ScrollService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/scroll/module.ts":
/*!**************************************************!*\
  !*** ./src/ng-weekly-scheduler/scroll/module.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ScrollService_1 = __webpack_require__(/*! ./ScrollService */ "./src/ng-weekly-scheduler/scroll/ScrollService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.scroll', [])
    .service(ScrollService_1.ScrollService.$name, ScrollService_1.ScrollService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/time-range/TimeRangeComponent.ts":
/*!******************************************************************!*\
  !*** ./src/ng-weekly-scheduler/time-range/TimeRangeComponent.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var TimeRangeComponent = /** @class */ (function () {
    function TimeRangeComponent() {
        this.bindings = {
            schedule: '<'
        };
        this.controller = TimeRangeController.$name;
        this.controllerAs = TimeRangeController.$controllerAs;
        this.template = "\n        <span ng-if=\"timeRangeCtrl.hasStart && timeRangeCtrl.hasEnd\">{{ timeRangeCtrl.schedule.start | brWeeklySchedulerTimeOfDay }}-{{ timeRangeCtrl.schedule.end | brWeeklySchedulerTimeOfDay }}</span>\n        <span ng-if=\"timeRangeCtrl.hasStart && !timeRangeCtrl.hasEnd\">{{ timeRangeCtrl.schedule.start | brWeeklySchedulerTimeOfDay }} until</span>\n    ";
    }
    TimeRangeComponent.$name = 'brTimeRange';
    return TimeRangeComponent;
}());
exports.TimeRangeComponent = TimeRangeComponent;
/** @internal */
var TimeRangeController = /** @class */ (function () {
    function TimeRangeController() {
    }
    TimeRangeController.prototype.$onInit = function () {
        this.hasStart = angular.isDefined(this.schedule.start);
        this.hasEnd = angular.isDefined(this.schedule.end) && this.schedule.end !== null;
    };
    TimeRangeController.$controllerAs = 'timeRangeCtrl';
    TimeRangeController.$name = 'brTimeRangeController';
    return TimeRangeController;
}());
exports.TimeRangeController = TimeRangeController;


/***/ }),

/***/ "./src/ng-weekly-scheduler/time-range/module.ts":
/*!******************************************************!*\
  !*** ./src/ng-weekly-scheduler/time-range/module.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var TimeRangeComponent_1 = __webpack_require__(/*! ./TimeRangeComponent */ "./src/ng-weekly-scheduler/time-range/TimeRangeComponent.ts");
exports.default = angular
    .module('rr.weeklyScheduler.timeRange', [])
    .component(TimeRangeComponent_1.TimeRangeComponent.$name, new TimeRangeComponent_1.TimeRangeComponent())
    .controller(TimeRangeComponent_1.TimeRangeController.$name, TimeRangeComponent_1.TimeRangeController)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/time/SecondsAsTextFilter.ts":
/*!*************************************************************!*\
  !*** ./src/ng-weekly-scheduler/time/SecondsAsTextFilter.ts ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var SecondsAsTextFilter = /** @class */ (function () {
    function SecondsAsTextFilter() {
    }
    SecondsAsTextFilter.Factory = function () {
        var factoryFunction = function (timeConstants) {
            return function (seconds) {
                var result = "";
                var hours = Math.floor(seconds / timeConstants.SECONDS_IN_HOUR);
                result = SecondsAsTextFilter.addHoursToResult(result, hours);
                seconds -= hours * timeConstants.SECONDS_IN_HOUR;
                var minutes = Math.floor(seconds / timeConstants.SECONDS_IN_MINUTE);
                result = SecondsAsTextFilter.addMinutesToResult(result, minutes);
                seconds -= minutes * timeConstants.SECONDS_IN_MINUTE;
                result = SecondsAsTextFilter.addSecondsToResult(result, seconds);
                if (!result) {
                    result = 'none';
                }
                return result;
            };
        };
        factoryFunction.$inject = ['brWeeklySchedulerTimeConstantsService'];
        return factoryFunction;
    };
    SecondsAsTextFilter.addHoursToResult = function (result, hours) {
        if (hours) {
            result += hours + " hours";
        }
        return result;
    };
    SecondsAsTextFilter.addMinutesToResult = function (result, minutes) {
        if (minutes) {
            if (result) {
                result += " ";
            }
            result += minutes + " minute" + (minutes > 1 ? 's' : '');
        }
        return result;
    };
    SecondsAsTextFilter.addSecondsToResult = function (result, seconds) {
        if (seconds) {
            if (result) {
                result += " ";
            }
            result += seconds + " second" + (seconds > 1 ? 's' : '');
        }
        return result;
    };
    SecondsAsTextFilter.$name = 'brWeeklySchedulerSecondsAsText';
    return SecondsAsTextFilter;
}());
exports.SecondsAsTextFilter = SecondsAsTextFilter;


/***/ }),

/***/ "./src/ng-weekly-scheduler/time/TimeConstantsService.ts":
/*!**************************************************************!*\
  !*** ./src/ng-weekly-scheduler/time/TimeConstantsService.ts ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var TimeConstantsService = /** @class */ (function () {
    function TimeConstantsService() {
    }
    Object.defineProperty(TimeConstantsService.prototype, "SECONDS_IN_DAY", {
        get: function () {
            return this.MINUTES_IN_DAY * this.SECONDS_IN_MINUTE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "SECONDS_IN_HOUR", {
        get: function () {
            return this.SECONDS_IN_MINUTE * this.MINUTES_IN_HOUR;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "SECONDS_IN_MINUTE", {
        get: function () {
            return 60;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "HOURS_IN_DAY", {
        get: function () {
            return 24;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "MINUTES_IN_DAY", {
        get: function () {
            return this.MINUTES_IN_HOUR * this.HOURS_IN_DAY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeConstantsService.prototype, "MINUTES_IN_HOUR", {
        get: function () {
            return 60;
        },
        enumerable: true,
        configurable: true
    });
    TimeConstantsService.$name = 'brWeeklySchedulerTimeConstantsService';
    return TimeConstantsService;
}());
exports.TimeConstantsService = TimeConstantsService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/time/TimeOfDayFilter.ts":
/*!*********************************************************!*\
  !*** ./src/ng-weekly-scheduler/time/TimeOfDayFilter.ts ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var TimeOfDayFilter = /** @class */ (function () {
    function TimeOfDayFilter() {
    }
    TimeOfDayFilter.Factory = function () {
        var factoryFunction = function (timeConstants) {
            return function (seconds) {
                var hours = Math.floor(seconds / timeConstants.SECONDS_IN_HOUR);
                var meridiem = hours > 11 && hours < 24 ? 'P' : 'A';
                seconds -= hours * timeConstants.SECONDS_IN_HOUR;
                var minutes = Math.floor(seconds / timeConstants.SECONDS_IN_MINUTE);
                seconds -= minutes * timeConstants.SECONDS_IN_MINUTE;
                var remainingMinutes = minutes.toString();
                if (remainingMinutes.length == 1) {
                    remainingMinutes = '0' + remainingMinutes;
                }
                var displayHours = hours % 12 || 12;
                if (!seconds) {
                    return displayHours + ":" + remainingMinutes + meridiem;
                }
                else {
                    return displayHours + ":" + remainingMinutes + ":" + seconds + meridiem;
                }
            };
        };
        factoryFunction.$inject = ['brWeeklySchedulerTimeConstantsService'];
        return factoryFunction;
    };
    TimeOfDayFilter.$name = 'brWeeklySchedulerTimeOfDay';
    return TimeOfDayFilter;
}());
exports.TimeOfDayFilter = TimeOfDayFilter;


/***/ }),

/***/ "./src/ng-weekly-scheduler/time/module.ts":
/*!************************************************!*\
  !*** ./src/ng-weekly-scheduler/time/module.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var SecondsAsTextFilter_1 = __webpack_require__(/*! ./SecondsAsTextFilter */ "./src/ng-weekly-scheduler/time/SecondsAsTextFilter.ts");
var TimeConstantsService_1 = __webpack_require__(/*! ./TimeConstantsService */ "./src/ng-weekly-scheduler/time/TimeConstantsService.ts");
var TimeOfDayFilter_1 = __webpack_require__(/*! ./TimeOfDayFilter */ "./src/ng-weekly-scheduler/time/TimeOfDayFilter.ts");
exports.default = angular
    .module('rr.weeklyScheduler.time', [])
    .filter(SecondsAsTextFilter_1.SecondsAsTextFilter.$name, SecondsAsTextFilter_1.SecondsAsTextFilter.Factory())
    .filter(TimeOfDayFilter_1.TimeOfDayFilter.$name, TimeOfDayFilter_1.TimeOfDayFilter.Factory())
    .service(TimeConstantsService_1.TimeConstantsService.$name, TimeConstantsService_1.TimeConstantsService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/touch/TouchService.ts":
/*!*******************************************************!*\
  !*** ./src/ng-weekly-scheduler/touch/TouchService.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var TouchService = /** @class */ (function () {
    function TouchService() {
    }
    TouchService.prototype.getTouches = function (event) {
        if (event.originalEvent) {
            if (event.originalEvent.touches && event.originalEvent.touches.length) {
                return event.originalEvent.touches;
            }
            else if (event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
                return event.originalEvent.changedTouches;
            }
        }
        if (!event.touches) {
            event.touches = [event.originalEvent];
        }
        return event.touches;
    };
    TouchService.prototype.getPageX = function (event) {
        var touches = this.getTouches(event);
        if (touches && touches.length && touches[0]) {
            return touches[0].pageX;
        }
        return null;
    };
    TouchService.$name = 'brWeeklySchedulerTouchService';
    return TouchService;
}());
exports.TouchService = TouchService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/touch/module.ts":
/*!*************************************************!*\
  !*** ./src/ng-weekly-scheduler/touch/module.ts ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var TouchService_1 = __webpack_require__(/*! ./TouchService */ "./src/ng-weekly-scheduler/touch/TouchService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.touch', [])
    .service(TouchService_1.TouchService.$name, TouchService_1.TouchService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/value-normalization/ValueNormalizationService.ts":
/*!**********************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/value-normalization/ValueNormalizationService.ts ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ValueNormalizationService = /** @class */ (function () {
    function ValueNormalizationService() {
    }
    ValueNormalizationService.prototype.normalizeValue = function (value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    };
    ValueNormalizationService.$name = 'brWeeklySchedulerValueNormalizationService';
    return ValueNormalizationService;
}());
exports.ValueNormalizationService = ValueNormalizationService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/value-normalization/module.ts":
/*!***************************************************************!*\
  !*** ./src/ng-weekly-scheduler/value-normalization/module.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ValueNormalizationService_1 = __webpack_require__(/*! ./ValueNormalizationService */ "./src/ng-weekly-scheduler/value-normalization/ValueNormalizationService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.valueNormalization', [])
    .service(ValueNormalizationService_1.ValueNormalizationService.$name, ValueNormalizationService_1.ValueNormalizationService)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-config/DayMap.ts":
/*!*******************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-config/DayMap.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** Ahhahhahh! Fighter of the NightMap! */
/** @internal */
var DayMap = /** @class */ (function () {
    function DayMap() {
    }
    DayMap.$name = 'brWeeklySchedulerDayMap';
    DayMap.value = (_a = {},
        _a[0 /* Monday */] = 'Mon',
        _a[1 /* Tuesday */] = 'Tue',
        _a[2 /* Wednesday */] = 'Wed',
        _a[3 /* Thursday */] = 'Thur',
        _a[4 /* Friday */] = 'Fri',
        _a[5 /* Saturday */] = 'Sat',
        _a[6 /* Sunday */] = 'Sun',
        _a);
    return DayMap;
}());
exports.DayMap = DayMap;
var _a;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-config/NullEndWidth.ts":
/*!*************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-config/NullEndWidth.ts ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var NullEndWidth = /** @class */ (function () {
    function NullEndWidth() {
    }
    NullEndWidth.$name = 'brWeeklySchedulerNullEndWidth';
    NullEndWidth.value = 7200;
    return NullEndWidth;
}());
exports.NullEndWidth = NullEndWidth;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-config/module.ts":
/*!*******************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-config/module.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var DayMap_1 = __webpack_require__(/*! ./DayMap */ "./src/ng-weekly-scheduler/weekly-scheduler-config/DayMap.ts");
var NullEndWidth_1 = __webpack_require__(/*! ./NullEndWidth */ "./src/ng-weekly-scheduler/weekly-scheduler-config/NullEndWidth.ts");
exports.default = angular
    .module('rr.weeklyScheduler.weeklySchedulerConfig', [])
    .constant(DayMap_1.DayMap.$name, DayMap_1.DayMap.value)
    .constant(NullEndWidth_1.NullEndWidth.$name, NullEndWidth_1.NullEndWidth.value)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItem.ts":
/*!******************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItem.ts ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** Provides common functionality for an item -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
var WeeklySchedulerItem = /** @class */ (function () {
    function WeeklySchedulerItem(config, item, fillEmptyWithDefaultService, overlapService, purgeDefaultService, rangeFactory) {
        this.config = config;
        this.fillEmptyWithDefaultService = fillEmptyWithDefaultService;
        this.overlapService = overlapService;
        this.purgeDefaultService = purgeDefaultService;
        this.rangeFactory = rangeFactory;
        this.day = item.day;
        this.editable = angular.isDefined(item.editable) ? item.editable : true;
        this.label = item.label;
        this.schedules = item.schedules.map(function (schedule) { return rangeFactory.createRange(config, schedule); });
    }
    WeeklySchedulerItem.prototype.addSchedule = function (schedule) {
        schedule.day = this.day;
        var range = this.rangeFactory.createRange(this.config, schedule);
        this.schedules.push(range);
        return range;
    };
    WeeklySchedulerItem.prototype.addScheduleAndMerge = function (schedule) {
        var range = this.addSchedule(schedule);
        this.mergeSchedule(range);
        return range;
    };
    WeeklySchedulerItem.prototype.canAddSchedule = function () {
        if (this.config.nullEnds) {
            return this.hasNoSchedules();
        }
        else {
            return true;
        }
    };
    /** Determine if the conditions allow for a pop-up editor */
    WeeklySchedulerItem.prototype.canEdit = function () {
        var hasEditFunction = angular.isFunction(this.config.editSlot);
        return this.editable && hasEditFunction;
    };
    /** Determine if a schedule is able to be modified */
    WeeklySchedulerItem.prototype.canEditSchedule = function (schedule) {
        var itemIsEditable = this.editable;
        var scheduleIsEditable = schedule.editable;
        return itemIsEditable && scheduleIsEditable;
    };
    /**
     * Rather than having to deal with modifying mergeOverlaps to handle nullEnds calendars,
     * just prevent the user from creating additional slots in nullEnds calendars unless there are no slots there already.
     */
    WeeklySchedulerItem.prototype.canRenderGhost = function () {
        // This one needs to come first, otherwise renderGhost being set to true would override the protection against addt'l slots in nullEnd calendars
        if (this.config.nullEnds) {
            return this.$renderGhost && this.hasNoSchedules();
        }
        return this.$renderGhost;
    };
    WeeklySchedulerItem.prototype.hasSchedule = function (schedule) {
        return this.schedules.indexOf(schedule) > -1;
    };
    WeeklySchedulerItem.prototype.hasNoSchedules = function () {
        return this.schedules.length === 0;
    };
    WeeklySchedulerItem.prototype.fillEmptySlotsWithDefaultSchedules = function () {
        this.schedules = this.fillEmptyWithDefaultService.fill(this, this.config);
    };
    WeeklySchedulerItem.prototype.forceNullEnds = function () {
        this.schedules.forEach(function (s) { return s.end = null; });
    };
    WeeklySchedulerItem.prototype.mergeOverlaps = function () {
        var _this = this;
        do {
            this.schedules.forEach(function (schedule) { return _this.mergeOverlapsForSchedule(schedule); });
        } while (this.needsOverlapsMerged());
    };
    WeeklySchedulerItem.prototype.mergeSchedule = function (schedule) {
        // We consider the schedule we were working with to be the most important, so handle its overlaps first.
        this.mergeOverlapsForSchedule(schedule);
        this.mergeOverlaps();
    };
    WeeklySchedulerItem.prototype.purgeDefaultSchedules = function () {
        this.schedules = this.purgeDefaultService.purge(this.schedules, this.config);
    };
    WeeklySchedulerItem.prototype.removeSchedule = function (schedule) {
        var schedules = this.schedules;
        schedules.splice(schedules.indexOf(schedule), 1);
        this.config.onRemove();
    };
    // Overlap handlers
    WeeklySchedulerItem.prototype.getOverlapHandler = function (overlapState) {
        var _this = this;
        var overlapHandlers = (_a = {},
            _a[0 /* NoOverlap */] = function (current, other) { return _this.handleNoOverlap(current, other); },
            _a[1 /* CurrentIsInsideOther */] = function (current, other) { return _this.handleCurrentIsInsideOther(current, other); },
            _a[2 /* CurrentCoversOther */] = function (current, other) { return _this.handleCurrentCoversOther(current, other); },
            _a[3 /* OtherEndIsInsideCurrent */] = function (current, other) { return _this.handleOtherEndIsInsideCurrent(current, other); },
            _a[4 /* OtherStartIsInsideCurrent */] = function (current, other) { return _this.handleOtherStartIsInsideCurrent(current, other); },
            _a[5 /* OtherEndIsCurrentStart */] = function (current, other) { return _this.handleOtherEndIsCurrentStart(current, other); },
            _a[6 /* OtherStartIsCurrentEnd */] = function (current, other) { return _this.handleOtherStartIsCurrentEnd(current, other); },
            _a);
        return overlapHandlers[overlapState];
        var _a;
    };
    WeeklySchedulerItem.prototype.handleCurrentCoversOther = function (current, other) {
        this.removeSchedule(other);
    };
    WeeklySchedulerItem.prototype.handleCurrentIsInsideOther = function (current, other) {
        if (current.hasSameValueAs(other)) {
            // Remove 'other' & make current expand to fit the other slot
            this.removeSchedule(other);
            current.update({
                day: other.day,
                start: other.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            // Just remove 'current'
            this.removeSchedule(current);
        }
    };
    WeeklySchedulerItem.prototype.handleNoOverlap = function (current, other) {
        // Do nothing
    };
    WeeklySchedulerItem.prototype.handleOtherEndIsInsideCurrent = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.removeSchedule(other);
            current.update({
                day: current.day,
                start: other.start,
                end: current.end,
                value: other.value
            });
        }
        else {
            other.update({
                day: other.day,
                start: other.start,
                end: current.start,
                value: current.value
            });
        }
    };
    WeeklySchedulerItem.prototype.handleOtherStartIsInsideCurrent = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.removeSchedule(other);
            current.update({
                day: current.day,
                start: current.start,
                end: other.end,
                value: other.value
            });
        }
        else {
            other.update({
                day: other.day,
                start: current.end,
                end: other.end,
                value: other.value
            });
        }
    };
    WeeklySchedulerItem.prototype.handleOtherEndIsCurrentStart = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.handleOtherEndIsInsideCurrent(current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    WeeklySchedulerItem.prototype.handleOtherStartIsCurrentEnd = function (current, other) {
        if (current.hasSameValueAs(other)) {
            this.handleOtherStartIsInsideCurrent(current, other);
        }
        else {
            // DO NOTHING, this is okay if the values don't match
        }
    };
    // End overlap handlers
    WeeklySchedulerItem.prototype.mergeOverlapsForSchedule = function (schedule) {
        var _this = this;
        var schedules = this.schedules;
        schedules.forEach(function (el) {
            if (!el.equals(schedule)) {
                var schedulesBothEditable = el.editable && schedule.editable;
                if (schedulesBothEditable) {
                    var overlapState = _this.overlapService.getOverlapState(_this.config, schedule, el);
                    var overlapHandler = _this.getOverlapHandler(overlapState);
                    overlapHandler(schedule, el);
                }
            }
        });
    };
    WeeklySchedulerItem.prototype.needsOverlapsMerged = function () {
        var len = this.schedules.length;
        // Compare two at a time
        for (var i = 0; i < len - 1; i += 1) {
            var current = this.schedules[i];
            var next = this.schedules[i + 1];
            var schedulesBothEditable = current.editable && next.editable;
            if (!schedulesBothEditable) {
                return false;
            }
            if (current.hasSameValueAs(next)) {
                var overlapState = this.overlapService.getOverlapState(this.config, current, next);
                return [5 /* OtherEndIsCurrentStart */, 6 /* OtherStartIsCurrentEnd */].indexOf(overlapState) > -1;
            }
        }
    };
    return WeeklySchedulerItem;
}());
exports.WeeklySchedulerItem = WeeklySchedulerItem;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItemFactory.ts":
/*!*************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItemFactory.ts ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var WeeklySchedulerItem_1 = __webpack_require__(/*! ../weekly-scheduler-item/WeeklySchedulerItem */ "./src/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItem.ts");
/** @internal */
var WeeklySchedulerItemFactory = /** @class */ (function () {
    function WeeklySchedulerItemFactory(dayMap, fillEmptyWithDefaultService, overlapService, purgeDefaultService, rangeFactory) {
        this.dayMap = dayMap;
        this.fillEmptyWithDefaultService = fillEmptyWithDefaultService;
        this.overlapService = overlapService;
        this.purgeDefaultService = purgeDefaultService;
        this.rangeFactory = rangeFactory;
    }
    WeeklySchedulerItemFactory.prototype.createItem = function (config, day, schedules) {
        var result;
        var builder = config.createItem(day, schedules);
        result = angular.extend(builder, { label: this.dayMap[day] });
        return new WeeklySchedulerItem_1.WeeklySchedulerItem(config, result, this.fillEmptyWithDefaultService, this.overlapService, this.purgeDefaultService, this.rangeFactory);
    };
    WeeklySchedulerItemFactory.$name = 'brWeeklySchedulerItemFactory';
    WeeklySchedulerItemFactory.$inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerFillEmptyWithDefaultService',
        'brWeeklySchedulerOverlapService',
        'brWeeklySchedulerPurgeDefaultService',
        'brWeeklySchedulerRangeFactory'
    ];
    return WeeklySchedulerItemFactory;
}());
exports.WeeklySchedulerItemFactory = WeeklySchedulerItemFactory;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-item/module.ts":
/*!*****************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-item/module.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var WeeklySchedulerItemFactory_1 = __webpack_require__(/*! ./WeeklySchedulerItemFactory */ "./src/ng-weekly-scheduler/weekly-scheduler-item/WeeklySchedulerItemFactory.ts");
exports.default = angular
    .module('rr.weeklyScheduler.weeklySchedulerItem', [])
    .service(WeeklySchedulerItemFactory_1.WeeklySchedulerItemFactory.$name, WeeklySchedulerItemFactory_1.WeeklySchedulerItemFactory)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRange.ts":
/*!********************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRange.ts ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** Provides common functionality for a schedule -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
var WeeklySchedulerRange = /** @class */ (function () {
    function WeeklySchedulerRange(config, schedule, endAdjusterService) {
        this.config = config;
        this.endAdjusterService = endAdjusterService;
        this.$class = schedule.$class;
        this.$isActive = schedule.$isActive;
        this.$isDeleting = schedule.$isDeleting;
        this.$isEditing = schedule.$isEditing;
        this.day = schedule.day;
        this.start = schedule.start;
        this.end = schedule.end;
        this.value = schedule.value;
        this.editable = angular.isDefined(schedule.editable) ? schedule.editable : true;
    }
    Object.defineProperty(WeeklySchedulerRange.prototype, "duration", {
        get: function () {
            return this.end - this.start;
        },
        enumerable: true,
        configurable: true
    });
    WeeklySchedulerRange.prototype.equals = function (other) {
        return angular.equals(this, other);
    };
    WeeklySchedulerRange.prototype.hasSameValueAs = function (other) {
        return this.value === other.value;
    };
    WeeklySchedulerRange.prototype.update = function (updatedSchedule) {
        var updatedStart = this.updateStart(updatedSchedule.start);
        var updatedEnd = this.updateEnd(updatedSchedule.end);
        if (updatedStart || updatedEnd) {
            this.config.onChange();
        }
    };
    WeeklySchedulerRange.prototype.updateEnd = function (updatedEnd) {
        if (this.canUpdateEnd(updatedEnd)) {
            this.end = this.endAdjusterService.adjustEndForModel(this.config, updatedEnd);
            return true;
        }
        return false;
    };
    WeeklySchedulerRange.prototype.updateStart = function (updatedStart) {
        if (this.canUpdateStart(updatedStart)) {
            this.start = updatedStart;
            return true;
        }
        return false;
    };
    WeeklySchedulerRange.prototype.canUpdateEnd = function (updatedEnd) {
        var changed = this.end !== updatedEnd;
        var newEndBeforeOrAtMax = updatedEnd <= this.config.maxValue;
        var newEndAfterOrAtExistingStart = this.endAdjusterService.adjustEndForView(this.config, updatedEnd) >= this.start + 1;
        return changed && newEndBeforeOrAtMax && newEndAfterOrAtExistingStart;
    };
    WeeklySchedulerRange.prototype.canUpdateStart = function (updatedStart) {
        var changed = this.start !== updatedStart;
        var newStartBeforeOrAtExistingEnd = updatedStart <= this.endAdjusterService.adjustEndForView(this.config, this.end) - 1;
        var newStartAfterOrAtMin = updatedStart >= 0;
        return changed && (this.config.nullEnds || newStartBeforeOrAtExistingEnd) && newStartAfterOrAtMin;
    };
    return WeeklySchedulerRange;
}());
exports.WeeklySchedulerRange = WeeklySchedulerRange;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRangeFactory.ts":
/*!***************************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRangeFactory.ts ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var WeeklySchedulerRange_1 = __webpack_require__(/*! ../weekly-scheduler-range/WeeklySchedulerRange */ "./src/ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRange.ts");
/** @internal */
var WeeklySchedulerRangeFactory = /** @class */ (function () {
    function WeeklySchedulerRangeFactory(endAdjusterService) {
        this.endAdjusterService = endAdjusterService;
    }
    WeeklySchedulerRangeFactory.prototype.createRange = function (config, schedule) {
        return new WeeklySchedulerRange_1.WeeklySchedulerRange(config, schedule, this.endAdjusterService);
    };
    WeeklySchedulerRangeFactory.$name = 'brWeeklySchedulerRangeFactory';
    WeeklySchedulerRangeFactory.$inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];
    return WeeklySchedulerRangeFactory;
}());
exports.WeeklySchedulerRangeFactory = WeeklySchedulerRangeFactory;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler-range/module.ts":
/*!******************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler-range/module.ts ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var WeeklySchedulerRangeFactory_1 = __webpack_require__(/*! ./WeeklySchedulerRangeFactory */ "./src/ng-weekly-scheduler/weekly-scheduler-range/WeeklySchedulerRangeFactory.ts");
exports.default = angular
    .module('rr.weeklyScheduler.weeklySchedulerRange', [])
    .service(WeeklySchedulerRangeFactory_1.WeeklySchedulerRangeFactory.$name, WeeklySchedulerRangeFactory_1.WeeklySchedulerRangeFactory)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler/module.ts":
/*!************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler/module.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var weekly_scheduler_1 = __webpack_require__(/*! ./weekly-scheduler */ "./src/ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.ts");
exports.default = angular
    .module('rr.weeklyScheduler.weeklyScheduler', [])
    .component(weekly_scheduler_1.WeeklySchedulerComponent.$name, new weekly_scheduler_1.WeeklySchedulerComponent())
    .controller(weekly_scheduler_1.WeeklySchedulerController.$name, weekly_scheduler_1.WeeklySchedulerController)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html":
/*!************************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div ng-if=\"!schedulerCtrl.invalidMessage\">\r\n  <div class=\"labels\">\r\n    <div class=\"srow dummy\"></div>\r\n    <div class=\"srow schedule-animate\" ng-repeat=\"item in schedulerCtrl.items track by item.day\">\r\n      {{ item.label }}\r\n    </div>\r\n  </div>\r\n\r\n  <br-schedule-area-container>\r\n    <div class=\"schedule-area\">\r\n\r\n      <div class=\"srow timestamps\">\r\n        <br-hourly-grid></br-hourly-grid>\r\n      </div>\r\n\r\n      <div class=\"srow calendar schedule-animate\" ng-repeat=\"item in schedulerCtrl.items track by item.day\">\r\n        <br-hourly-grid no-text></br-hourly-grid>\r\n        <br-multi-slider config=\"schedulerCtrl.config\"\r\n                        br-full-calendar=\"{{ schedulerCtrl.config.fullCalendar }}\"\r\n                        br-max-time-slot=\"{{ schedulerCtrl.config.maxTimeSlot }}\"\r\n                        br-minimum-separation=\"{{ schedulerCtrl.config.minimumSeparation }}\"\r\n                        br-mono-schedule=\"{{ schedulerCtrl.config.monoSchedule }}\"\r\n                        br-null-end=\"{{ schedulerCtrl.config.nullEnds }}\"\r\n                        br-schedule-count=\"{{ schedulerCtrl.config.scheduleCountOptions && schedulerCtrl.config.scheduleCountOptions.count }}\"\r\n                        br-overlap\r\n                        br-revalidate\r\n                        drag-schedule=\"schedulerCtrl.dragSchedule\"\r\n                        ghost-values=\"schedulerCtrl.ghostValues\"\r\n                        ng-model=\"item\"\r\n                        ng-model-options=\"{allowInvalid: true}\"\r\n                        set-ghost-values=\"schedulerCtrl.setGhostValues(ghostValues)\"\r\n        ></br-multi-slider>\r\n      </div>\r\n    </div>\r\n  </br-schedule-area-container>\r\n\r\n  <br-restriction-explanations></br-restriction-explanations>\r\n\r\n  <div class=\"srow buttons\">\r\n    <button ng-class=\"schedulerCtrl.config.buttonClasses\" type=\"button\" ng-click=\"schedulerCtrl.rollback()\" ng-disabled=\"!schedulerCtrl.formController.$dirty\">Reset</button>\r\n    <button ng-class=\"schedulerCtrl.config.buttonClasses\" type=\"button\" ng-click=\"schedulerCtrl.save()\" ng-disabled=\"!schedulerCtrl.formController.$dirty || !schedulerCtrl.formController.$valid\" ng-if=\"schedulerCtrl.config.saveScheduler\">Save</button>\r\n    <button ng-class=\"schedulerCtrl.config.buttonClasses\" type=\"button\" ng-click=\"schedulerCtrl.resetZoom()\">Zoom Out</button>\r\n    <button ng-class=\"schedulerCtrl.config.buttonClasses\" type=\"button\" ng-click=\"schedulerCtrl.zoomIn()\">Zoom In</button>\r\n  </div>\r\n</div>\r\n\r\n<div class=\"srow\" ng-if=\"schedulerCtrl.invalidMessage\">\r\n  {{ schedulerCtrl.invalidMessage }}\r\n</div>";

/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.ts":
/*!**********************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.ts ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var WeeklySchedulerController = /** @class */ (function () {
    function WeeklySchedulerController($element, $scope, $timeout, adapterService, configurationService, conflictingOptionsService, lastGhostDayService, missingDaysService) {
        this.$element = $element;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.adapterService = adapterService;
        this.configurationService = configurationService;
        this.conflictingOptionsService = conflictingOptionsService;
        this.lastGhostDayService = lastGhostDayService;
        this.missingDaysService = missingDaysService;
        this.invalidMessage = '';
    }
    WeeklySchedulerController.prototype.$onInit = function () {
        this.config = this.configurationService.getConfiguration(this.options);
        this.buildItemsFromAdapter();
        this.watchAdapter();
        this.watchHoverClass();
    };
    WeeklySchedulerController.prototype.$postLink = function () {
        var _this = this;
        this.$scope.$on("brWeeklyScheduler.slotDragged" /* SLOT_DRAGGED */, function (event, schedule) {
            _this.dragSchedule = schedule;
        });
        this.$scope.$on("brWeeklyScheduler.dragEnded" /* DRAG_ENDED */, function () {
            _this.dragSchedule = null;
        });
        this.$scope.$on("brWeeklyScheduler.ghostDragEnded" /* GHOST_DRAG_ENDED */, function (event, ghostSchedule) {
            _this.$scope.$broadcast("brWeeklyScheduler.commitGhost" /* COMMIT_GHOST */, ghostSchedule);
        });
        this.$scope.$on("brWeeklyScheduler.removeLastGhost" /* REMOVE_LAST_GHOST */, function () {
            var lastGhostDay = _this.lastGhostDayService.getLastGhostDay(_this.items);
            _this.$scope.$broadcast("brWeeklyScheduler.removeGhost" /* REMOVE_GHOST */, lastGhostDay);
        });
        this.$scope.$on("brWeeklyScheduler.cancelGhost" /* CANCEL_GHOST */, function () {
            _this.$scope.$broadcast("brWeeklyScheduler.removeAllGhosts" /* REMOVE_ALL_GHOSTS */);
        });
        this.$timeout(function () {
            _this.invalidMessage = _this.getInvalidMessage();
        });
    };
    WeeklySchedulerController.prototype.getInvalidMessage = function () {
        var conflictingOptions = this.conflictingOptionsService.getConflictingOptions(this.options);
        if (conflictingOptions) {
            return conflictingOptions;
        }
        if (this.hasInvalidSchedule()) {
            return 'One or more of the schedules is invalid! Please contact service.';
        }
    };
    WeeklySchedulerController.prototype.hasInvalidSchedule = function () {
        return this.formController.$invalid;
    };
    WeeklySchedulerController.prototype.buildItems = function (items) {
        this.items = this.missingDaysService.fillItems(this.config, items);
        this.items = this.purgeItems(this.items);
        this.items.forEach(function (item) { return item.mergeOverlaps(); });
        // keep a reference on the adapter so we can pull it out later
        this.adapter.items = this.items;
        // keep a copy of the items in case we need to rollback
        this._originalItems = angular.copy(this.items);
    };
    WeeklySchedulerController.prototype.buildItemsFromAdapter = function () {
        var items = this.adapterService.getItemsFromAdapter(this.config, this.adapter);
        return this.buildItems(items);
    };
    WeeklySchedulerController.prototype.purgeItems = function (items) {
        if (this.config.fillEmptyWithDefault) {
            for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                var item = items_1[_i];
                item.purgeDefaultSchedules();
                if (this.config.nullEnds) {
                    item.forceNullEnds();
                }
            }
        }
        return items;
    };
    WeeklySchedulerController.prototype.prepareItems = function (items) {
        if (this.config.fillEmptyWithDefault) {
            for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                var item = items_2[_i];
                item.fillEmptySlotsWithDefaultSchedules();
            }
        }
        return items;
    };
    WeeklySchedulerController.prototype.setGhostValues = function (ghostValues) {
        this.ghostValues = ghostValues;
    };
    WeeklySchedulerController.prototype.resetZoom = function () {
        this.$scope.$broadcast("brWeeklyScheduler.resetZoom" /* RESET_ZOOM */);
    };
    WeeklySchedulerController.prototype.zoomIn = function () {
        this.$scope.$broadcast("brWeeklyScheduler.zoomIn" /* ZOOM_IN */);
    };
    WeeklySchedulerController.prototype.rollback = function () {
        this.buildItems(this._originalItems);
        this.formController.$setPristine();
    };
    WeeklySchedulerController.prototype.save = function () {
        var _this = this;
        this.items = this.prepareItems(this.items);
        return this.config.saveScheduler().then(function () {
            _this.items = _this.purgeItems(_this.items);
            _this.formController.$setPristine();
        });
    };
    WeeklySchedulerController.prototype.watchAdapter = function () {
        var _this = this;
        this.$scope.$watch(function () {
            return _this.adapter;
        }, function () {
            _this.buildItemsFromAdapter();
        });
    };
    WeeklySchedulerController.prototype.watchHoverClass = function () {
        var _this = this;
        var pulseClass = 'pulse';
        var pulseSelector = "." + pulseClass;
        this.$scope.$watch(function () { return _this.hoverClass; }, function () {
            _this.$element.find(pulseSelector).removeClass(pulseClass);
            if (_this.hoverClass) {
                _this.$element.find("." + _this.hoverClass).addClass(pulseClass);
            }
        });
    };
    WeeklySchedulerController.$controllerAs = 'schedulerCtrl';
    WeeklySchedulerController.$name = 'brWeeklySchedulerController';
    WeeklySchedulerController.$inject = [
        '$element',
        '$scope',
        '$timeout',
        'brWeeklySchedulerAdapterService',
        'brWeeklySchedulerConfigurationService',
        'brWeeklySchedulerConflictingOptionsService',
        'brWeeklySchedulerLastGhostDayService',
        'brWeeklySchedulerMissingDaysService'
    ];
    return WeeklySchedulerController;
}());
exports.WeeklySchedulerController = WeeklySchedulerController;
/** @internal */
var WeeklySchedulerComponent = /** @class */ (function () {
    function WeeklySchedulerComponent() {
        this.bindings = {
            adapter: '<',
            hoverClass: '<',
            options: '='
        };
        this.controller = WeeklySchedulerController.$name;
        this.controllerAs = WeeklySchedulerController.$controllerAs;
        this.require = {
            formController: 'form'
        };
        this.template = __webpack_require__(/*! ./weekly-scheduler.html */ "./src/ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html");
    }
    WeeklySchedulerComponent.$name = 'brWeeklyScheduler';
    return WeeklySchedulerComponent;
}());
exports.WeeklySchedulerComponent = WeeklySchedulerComponent;
;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-slot/module.ts":
/*!*******************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-slot/module.ts ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var weekly_slot_1 = __webpack_require__(/*! ./weekly-slot */ "./src/ng-weekly-scheduler/weekly-slot/weekly-slot.ts");
exports.default = angular
    .module('rr.weeklyScheduler.weeklySlot', [])
    .component(weekly_slot_1.WeeklySlotComponent.$name, new weekly_slot_1.WeeklySlotComponent())
    .controller(weekly_slot_1.WeeklySlotController.$name, weekly_slot_1.WeeklySlotController)
    .name;


/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-slot/weekly-slot.html":
/*!**************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-slot/weekly-slot.html ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"slotWrapper\" title=\"{{weeklySlotCtrl.schedule.start | brWeeklySchedulerTimeOfDay}} - {{weeklySlotCtrl.schedule.end | brWeeklySchedulerTimeOfDay}}\">\r\n  <div class=\"handle left\" ondrag=\"weeklySlotCtrl.resizeStart(delta)\" ondragstart=\"weeklySlotCtrl.startResize()\" ondragstop=\"weeklySlotCtrl.endResize()\" br-handle ng-if=\"!weeklySlotCtrl.config.nullEnds\"></div>\r\n  <div class=\"middle\" ondrag=\"weeklySlotCtrl.drag(delta)\" ondragstart=\"weeklySlotCtrl.startDrag()\" ondragstop=\"weeklySlotCtrl.endDrag()\" br-handle immediate=\"weeklySlotCtrl.hasDragSchedule\">\r\n    <br-time-range schedule=\"weeklySlotCtrl.schedule\"></br-time-range>\r\n  </div>\r\n  <div class=\"handle right\" ondrag=\"weeklySlotCtrl.resizeEnd(delta)\" ondragstart=\"weeklySlotCtrl.startResize()\" ondragstop=\"weeklySlotCtrl.endResize()\" br-handle ng-if=\"!weeklySlotCtrl.config.nullEnds\"></div>\r\n</div>";

/***/ }),

/***/ "./src/ng-weekly-scheduler/weekly-slot/weekly-slot.ts":
/*!************************************************************!*\
  !*** ./src/ng-weekly-scheduler/weekly-slot/weekly-slot.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
/** @internal */
var WeeklySlotController = /** @class */ (function () {
    function WeeklySlotController($element, $rootScope, $scope, dragService) {
        this.$element = $element;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.dragService = dragService;
    }
    Object.defineProperty(WeeklySlotController.prototype, "hasDragSchedule", {
        get: function () {
            return angular.isDefined(this.dragSchedule) && this.dragSchedule != null;
        },
        enumerable: true,
        configurable: true
    });
    WeeklySlotController.prototype.getDragStartValues = function () {
        return this.dragService.getDragRangeFromSchedule(this.config, this.schedule);
    };
    WeeklySlotController.prototype.editSelf = function () {
        this.editSchedule({ schedule: this.schedule });
    };
    WeeklySlotController.prototype.drag = function (pixel) {
        var ui = this.schedule;
        var delta = this.getDelta({ pixel: pixel });
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        var newEnd = this.config.nullEnds ? null : Math.round(newStart + this.valuesOnDragStart.duration);
        this.schedule.update({
            day: ui.day,
            start: newStart,
            end: newEnd,
            value: ui.value
        });
    };
    WeeklySlotController.prototype.endDrag = function () {
        // If the schedule was moved to another item, the $scope hierarchy will have been broken, so we need to broadcast this to the whole app
        this.$rootScope.$broadcast("brWeeklyScheduler.dragEnded" /* DRAG_ENDED */);
        // Was the schedule moved to another item??
        if (!this.item.hasSchedule(this.schedule)) {
            return;
        }
        // Did the user actually move or resize the slot??
        var changed = !this.valuesOnDragStart.equals(this.getDragStartValues());
        this.schedule.$isActive = false;
        if (changed) {
            this.ngModelCtrl.$setDirty();
            this.item.mergeSchedule(this.schedule);
        }
        else {
            this.editSelf();
        }
    };
    WeeklySlotController.prototype.endResize = function () {
        // Did the user actually move or resize the slot??
        var changed = !this.valuesOnDragStart.equals(this.getDragStartValues());
        this.schedule.$isActive = false;
        if (changed) {
            this.ngModelCtrl.$setDirty();
            this.item.mergeSchedule(this.schedule);
        }
        else {
            this.editSelf();
        }
    };
    WeeklySlotController.prototype.resizeStart = function (pixel) {
        var delta = this.getDelta({ pixel: pixel });
        var newStart = Math.round(this.valuesOnDragStart.start + delta);
        if (this.schedule.updateStart(newStart)) {
            this.config.onChange();
        }
    };
    WeeklySlotController.prototype.resizeEnd = function (pixel) {
        var delta = this.getDelta({ pixel: pixel });
        var newEnd = Math.round(this.valuesOnDragStart.end + delta);
        if (this.schedule.updateEnd(newEnd)) {
            this.config.onChange();
        }
    };
    WeeklySlotController.prototype.startDrag = function () {
        if (!this.item.canEditSchedule(this.schedule)) {
            return;
        }
        this.$scope.$emit("brWeeklyScheduler.slotDragged" /* SLOT_DRAGGED */, this.schedule);
        this.schedule.$isActive = true;
        this.valuesOnDragStart = this.getDragStartValues();
    };
    WeeklySlotController.prototype.startResize = function () {
        if (!this.item.canEditSchedule(this.schedule)) {
            return;
        }
        this.schedule.$isActive = true;
        this.valuesOnDragStart = this.getDragStartValues();
    };
    WeeklySlotController.$name = 'weeklySlotController';
    WeeklySlotController.$controllerAs = 'weeklySlotCtrl';
    WeeklySlotController.$inject = [
        '$element',
        '$rootScope',
        '$scope',
        'brWeeklySchedulerDragService'
    ];
    return WeeklySlotController;
}());
exports.WeeklySlotController = WeeklySlotController;
/** @internal */
var WeeklySlotComponent = /** @class */ (function () {
    function WeeklySlotComponent() {
        this.bindings = {
            config: '<',
            dragSchedule: '<',
            item: '<',
            schedule: '=ngModel',
            editSchedule: '&',
            getDelta: '&'
        };
        this.controller = WeeklySlotController.$name;
        this.controllerAs = WeeklySlotController.$controllerAs;
        this.require = {
            ngModelCtrl: 'ngModel'
        };
        this.template = __webpack_require__(/*! ./weekly-slot.html */ "./src/ng-weekly-scheduler/weekly-slot/weekly-slot.html");
    }
    WeeklySlotComponent.$name = 'brWeeklySlot';
    return WeeklySlotComponent;
}());
exports.WeeklySlotComponent = WeeklySlotComponent;


/***/ }),

/***/ "./src/ng-weekly-scheduler/zoom/ZoomService.ts":
/*!*****************************************************!*\
  !*** ./src/ng-weekly-scheduler/zoom/ZoomService.ts ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var ZoomService = /** @class */ (function () {
    function ZoomService($rootScope) {
        this.$rootScope = $rootScope;
        this.selector = '.schedule-area';
    }
    ZoomService.prototype.broadcastZoomedInEvent = function () {
        this.$rootScope.$broadcast("brWeeklyScheduler.zoomedIn" /* ZOOMED_IN */);
    };
    ZoomService.prototype.broadcastZoomedOutEvent = function () {
        this.$rootScope.$broadcast("brWeeklyScheduler.zoomedOut" /* ZOOMED_OUT */);
    };
    ZoomService.prototype.getCurrentZoomWidth = function (element) {
        return parseInt(element.querySelector(this.selector).style.width, 10);
    };
    ZoomService.prototype.getZoomElement = function (container) {
        return container.querySelector(this.selector);
    };
    ZoomService.prototype.setZoomWidth = function (element, width) {
        this.getZoomElement(element).style.width = width;
    };
    ZoomService.prototype.resetZoom = function (element) {
        this.setZoomWidth(element, '100%');
        this.broadcastZoomedOutEvent();
    };
    ZoomService.prototype.zoomIn = function (element) {
        // get current zoom level from zoomed element as a percentage
        var zoom = this.getZoomElement(element).style.width;
        // parse to integer & double
        var level = parseInt(zoom, 10) * 2;
        // Convert back to percentage
        this.setZoomWidth(element, level + '%');
        this.broadcastZoomedInEvent();
    };
    ZoomService.prototype.zoomInACell = function (element, event, data) {
        var elementCount = data.nbElements;
        var i = data.idx;
        var containerWidth = element.offsetWidth;
        var boxesToDisplay = 5;
        var boxWidth = containerWidth / boxesToDisplay;
        var boxesToSkip = 2;
        var gutterSize = boxWidth * boxesToSkip;
        var scheduleAreaWidthPx = elementCount * boxWidth;
        var scheduleAreaWidthPercent = (scheduleAreaWidthPx / containerWidth) * 100;
        this.setZoomWidth(element, scheduleAreaWidthPercent + '%');
        // All cells of a line have the same size
        element.scrollLeft = i * boxWidth - gutterSize;
        this.broadcastZoomedInEvent();
    };
    ZoomService.prototype.zoomByScroll = function (element, event, delta) {
        var currentWidth = this.getCurrentZoomWidth(element);
        if ((event.wheelDelta || event.detail) > 0) {
            this.setZoomWidth(element, (currentWidth + 2 * delta) + '%');
            this.broadcastZoomedInEvent();
        }
        else {
            var width = currentWidth - 2 * delta;
            this.setZoomWidth(element, (width > 100 ? width : 100) + '%');
            this.broadcastZoomedOutEvent();
        }
    };
    ZoomService.$name = 'brWeeklySchedulerZoomService';
    ZoomService.$inject = ['$rootScope'];
    return ZoomService;
}());
exports.ZoomService = ZoomService;


/***/ }),

/***/ "./src/ng-weekly-scheduler/zoom/module.ts":
/*!************************************************!*\
  !*** ./src/ng-weekly-scheduler/zoom/module.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var angular = __webpack_require__(/*! angular */ "angular");
var ZoomService_1 = __webpack_require__(/*! ./ZoomService */ "./src/ng-weekly-scheduler/zoom/ZoomService.ts");
exports.default = angular
    .module('rr.weeklyScheduler.zoom', [])
    .service(ZoomService_1.ZoomService.$name, ZoomService_1.ZoomService)
    .name;


/***/ }),

/***/ "angular":
/*!**************************!*\
  !*** external "angular" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = angular;

/***/ })

/******/ });
//# sourceMappingURL=angular-weekly-scheduler.js.map