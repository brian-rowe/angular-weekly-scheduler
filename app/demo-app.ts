angular.module('demoApp', ['weeklyScheduler'])
  .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {

      $scope.isDirty = false;

      $scope.model = {
        options: {
          createItem: (day, schedules) => {
            return {
              day: day,
              schedules: schedules
            }
          },
          editSlot: function(schedule) {
            schedule.end += 15;

            return $timeout(() => schedule, 400);
          }
        },
        items: [
          // {
          //   label: 'Sun',
          //   //editable: false,
          //   schedules: [
          //     { start: 315, end: 375 }
          //   ]
          // },
          // {
          //   label: 'Mon',
          //   //editable: false,
          //   schedules: [
          //     { start: 300, end: 1140 }
          //   ]
          // },
          // {
          //   label: 'Tue',
          //   schedules: [
          //     { start: 0, end: 240 },
          //     { start: 300, end: 360 }
          //   ]
          // },
          // {
          //   label: 'Wed',
          //   schedules: [
          //     { start: 120, end: 720 }
          //   ]
          // },
          // {
          //   label: 'Thur',
          //   editable: false,
          //   schedules: [
          //     { start: 300, end: 1140 }
          //   ]
          // },
          {
            day: Days.Saturday,
            schedules: [
              { start: 300, end: 900 }
            ]
          }
        ] as IWeeklySchedulerItem<any>[]
      };

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        $scope.isDirty = true;

        console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };
    }]);
