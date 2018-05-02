angular.module('demoApp', ['weeklyScheduler'])
  .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {

      $scope.model = {
        options: {
          editSlot: function() {
            alert('Editing slot');
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
            label: 'Fri',
            schedules: [
              { start: 60, end: 105, value: false },
              { start: 0, end: 60, value: false }
            ]
          },
          {
            label: 'Sat',
            schedules: [
              { start: 45, end: 105, value: false },
              { start: 0, end: 60, value: true }
            ]
          }
        ]
      };

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };
    }]);
