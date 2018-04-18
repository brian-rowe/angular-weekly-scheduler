angular.module('ngWeeklySchedulerTemplates', ['ng-weekly-scheduler/multislider/multislider.html', 'ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html', 'ng-weekly-scheduler/weekly-slot/weekly-slot.html']);

angular.module('ng-weekly-scheduler/multislider/multislider.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/multislider/multislider.html',
    '<div class="slot ghost" ng-show="item.editable !== false && (!schedulerCtrl.config.monoSchedule || !item.schedules.length)">{{schedulerCtrl.config.labels.addNew || \'Add New\'}}</div><weekly-slot class=slot ng-class="{disable: item.editable === false}" ng-repeat="schedule in item.schedules" ng-model=schedule ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></weekly-slot>');
}]);

angular.module('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/weekly-scheduler/weekly-scheduler.html',
    '<div class=labels><div class="srow text-right">{{schedulerCtrl.config.labels.month || \'Month\'}}</div><div class="srow text-right">{{schedulerCtrl.config.labels.weekNb || \'Week number\'}}</div><div class=schedule-animate ng-repeat="item in schedulerCtrl.items" inject></div></div><div class=schedule-area-container><div class=schedule-area><div class="srow timestamps"><monthly-grid class=grid-container></monthly-grid></div><div class="srow timestamps"><weekly-grid class=grid-container></weekly-grid></div><div class="srow schedule-animate" ng-repeat="item in schedulerCtrl.items"><weekly-grid class="grid-container striped" no-text></weekly-grid><multi-slider index={{$index}}></multi-slider></div></div></div>');
}]);

angular.module('ng-weekly-scheduler/weekly-slot/weekly-slot.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('ng-weekly-scheduler/weekly-slot/weekly-slot.html',
    '<div title="{{schedule.start | date}} - {{schedule.end | date}}"><div class="handle left" ondrag=resize ondragstart=startResizeStart ondragstop=endDrag handle></div><div ondrag=drag ondragstart=startDrag ondragstop=endDrag handle>{{schedule.start | date}} - {{schedule.end | date}}</div><div class="handle right" ondrag=resize ondragstart=startResizeEnd ondragstop=endDrag handle></div><div class=remove><span class="glyphicon glyphicon-remove"></span></div></div>');
}]);
