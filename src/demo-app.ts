// import * as angular from 'angular';
// import { Days } from './ng-weekly-scheduler/weekly-scheduler-config/Days';
// import { IWeeklySchedulerAdapter } from './ng-weekly-scheduler/adapter/IWeeklySchedulerAdapter';
// import { IWeeklySchedulerItem } from './ng-weekly-scheduler/weekly-scheduler-item/IWeeklySchedulerItem';
// import { IWeeklySchedulerOptions } from './ng-weekly-scheduler/weekly-scheduler-config/IWeeklySchedulerOptions';
// import { IWeeklySchedulerRange } from './ng-weekly-scheduler/weekly-scheduler-range/IWeeklySchedulerRange';

// angular.module('demoApp', ['br.weeklyScheduler', 'ngMaterial'])
//   .controller('DemoController', ['$q', '$scope', '$timeout', '$log', '$mdDialog',
//     function ($q: angular.IQService, $scope, $timeout, $log, $mdDialog) {

//       $scope.model = {
//         options: {
//           buttonClasses: ['wow!'],
//           createItem: (day, schedules) => {
//             return new DemoItem(day, schedules);
//           },
//           defaultValue: false,
//           editSlot: function (schedule) {
//             schedule.start += 60;
//             schedule.value = true;
//             return $q.when(schedule);
//           },
//           fillEmptyWithDefault: true,
//           interval: 60,
//           fillNullEnds: 1800,
//           maxTimeSlot: 7200,
//           minimumSeparation: 300,
//           onChange: (isValid) => {
//             console.log("changed!");
//           },
//           restrictionExplanations: {
//             maxTimeSlot: (value) => `Slots cannot be longer than ${value}!`
//           },
//           saveScheduler: () => {
//             $scope.result = $scope.adapter.getSnapshot();

//             return $q.when(true);
//           }
//         } as IWeeklySchedulerOptions<any>
//       }

//       $scope.adapter = new DemoAdapter([
//         {
//           day: Days.Saturday,
//           start: 3600,
//           end: 7200,
//           value: true
//         }
//       ]);
//     }]);

// /** @internal */
// class DemoItem implements IWeeklySchedulerItem<boolean> {
//   constructor(
//     public day: Days,
//     public schedules: IWeeklySchedulerRange<boolean>[]
//   ) {
//   }

//   get editable() {
//     return true;
//   }
// }

// /** The data is already in an acceptable format for the demo so just pass it through */
// /** @internal */
// class DemoAdapter implements IWeeklySchedulerAdapter<IWeeklySchedulerRange<boolean>, boolean> {
//   public items: DemoItem[] = [];

//   constructor(
//     public initialData: IWeeklySchedulerRange<boolean>[],
//   ) {
//   }

//   public getSnapshot() {
//     return Array.prototype.concat.apply([], this.items.map(item => {
//       return item.schedules.map(schedule => {
//         return {
//           day: schedule.day,
//           start: schedule.start,
//           end: schedule.end,
//           value: schedule.value
//         }
//       });
//     }));
//   }

//   public customModelToWeeklySchedulerRange(range) {
//     range.$class = 'test';

//     return range;
//   }
// }
