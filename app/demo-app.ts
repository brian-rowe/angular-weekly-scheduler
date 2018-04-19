declare var moment;

angular.module('demoApp', ['ngAnimate', 'weeklyScheduler', 'weeklySchedulerI18N'])

  .config(['weeklySchedulerLocaleServiceProvider', function (localeServiceProvider) {
    localeServiceProvider.configure({
      doys: { 'es-es': 4 },
      lang: { 'es-es': { weekNb: 'número de la semana', addNew: 'Añadir' } },
      localeLocationPattern: '/angular-locale_{{locale}}.js'
    });
  }])

  .controller('DemoController', ['$scope', '$timeout', 'weeklySchedulerLocaleService', '$log',
    function ($scope, $timeout, localeService, $log) {

      $scope.model = {
        locale: localeService.$locale.id,
        options: {/*monoSchedule: true*/ },
        items: [{
          label: 'Item 1',
          editable: false,
          schedules: [
            { start: moment('2015-12-27').toDate(), end: moment('2016-01-02').toDate() }
          ]
        },
        {
          label: 'Item 2',
          schedules: [
            { start: moment('2015-12-25').toDate(), end: moment('2016-01-01').toDate() }
          ]
        }, {
          label: 'Item 3',
          schedules: [
            { start: moment('2015-12-26').toDate(), end: moment('2015-12-31').toDate() }
          ]
        }]
      };

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        $log.debug('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };

      this.onLocaleChange = function () {
        $log.debug('The locale is changing to', $scope.model.locale);
        localeService.set($scope.model.locale).then(function ($locale) {
          $log.debug('The locale changed to', $locale.id);
        });
      };
    }]);
