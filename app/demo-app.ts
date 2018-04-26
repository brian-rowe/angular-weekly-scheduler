angular.module('demoApp', ['ngAnimate', 'weeklyScheduler'])
  .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {

      $scope.model = {
        options: {/*monoSchedule: true*/ },
        items: [
          {
            label: 'Sun',
            //editable: false,
            schedules: [
              { start: 315, end: 375 }
            ]
          },
          {
            label: 'Mon',
            //editable: false,
            schedules: [
              { start: 300, end: 1140 }
            ]
          },
          {
            label: 'Tue',
            schedules: [
              { start: 0, end: 240 },
              { start: 300, end: 360 }
            ]
          },
          {
            label: 'Wed',
            schedules: [
              { start: 120, end: 720 }
            ]
          },
          {
            label: 'Thur',
            editable: false,
            schedules: [
              { start: 300, end: 1140 }
            ]
          },
          {
            label: 'Fri',
            schedules: [
              { start: 720, end: 780 }
            ]
          },
          {
            label: 'Sat',
            schedules: [
            ]
          }
        ]
      };

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };

      this.onLocaleChange = function () {
        $log.debug('The locale is changing to', $scope.model.locale);
        localeService.set($scope.model.locale).then(function ($locale) {
          $log.debug('The locale changed to', $locale.id);
        });
      };
    }]);
