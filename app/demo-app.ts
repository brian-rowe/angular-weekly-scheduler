declare var moment;

angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])

  .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
    localeServiceProvider.configure({
      doys: { 'es-es': 4 },
      lang: { 'es-es': { } },
      localeLocationPattern: '/angular-locale_{{locale}}.js'
    });
  }])

  .controller('DemoController', ['$scope', '$timeout', 'weeklySchedulerLocaleService', '$log',
    function ($scope, $timeout, localeService, $log) {

      $scope.model = {
        locale: localeService.$locale.id,
        options: {/*monoSchedule: true*/ },
        items: [
          {
            label: 'Sun',
            //editable: false,
            schedules: [
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
