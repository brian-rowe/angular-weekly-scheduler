angular.module('demoApp', ['weeklyScheduler'])
  .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {

      $scope.model = {
        options: {
          editSlot: function() {
            alert('Editing slot');
          },
          fullCalendar: true
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
          // {
          //   label: 'Fri',
          //   defaultValue: false,
          //   schedules: [
          //     { start: 75, end: 120, value: false },
          //     { start: 0, end: 60, value: false }
          //   ]
          // },
          {
            label: 'Sat',
            schedules: [
              {
                value: 1,
                day: 0,
                end: 255,
                start: 0,
                $index: 0
              },
              {
                value: 0,
                day: 0,
                end: 360,
                start: 255,
                $index: 1
              },
              {
                value: 1,
                day: 0,
                end: 480,
                start: 360,
                $index: 2
              },
              {
                value: 0,
                day: 0,
                end: 1425,
                start: 480,
                $index: 3
              },
              {
                value: 2,
                day: 0,
                end: 0,
                start: 1425,
                $index: 4
              }
            ] 
          }
        ]
      };

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };
    }]);
