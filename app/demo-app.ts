angular.module('demoApp', ['br.weeklyScheduler'])
  .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q, $scope, $timeout, $log) {

      $scope.model = {
        options: {
          buttonClasses: ['wow!'],
          createItem: (day, schedules) => {
            return {
              day: day,
              schedules: schedules
            }
          },
          defaultValue: true,
          editSlot: function (schedule) {
            return $timeout(() => schedule, 0);
          },
          interval: 1,
          onChange: (isValid) => {
          }
        } as br.weeklyScheduler.IWeeklySchedulerOptions<any>
      }

      $scope.model2 = angular.copy($scope.model);
      $scope.model2.options.interval = 15;

      $scope.model.options.nullEnds = true;

      $scope.adapter = new DemoAdapter([
        // {
        //   day: Days.Saturday,
        //   start: 1380,
        //   end: null,
        //   value: true
        // },
        {
          day: br.weeklyScheduler.Days.Sunday,
          start: 600,
          end: null,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Monday,
          start: 720,
          end: null,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Tuesday,
          start: 60,
          end: null,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Wednesday,
          start: 30,
          end: null,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 0,
          end: null,
          value: true
        }
      ]);

      $scope.adapterTwo = new DemoAdapter(JSON.parse('[{"$class":"Unoccupied","day":3,"start":0,"end":135,"value":"Unoccupied"},{"$class":"Setpointd0f1df","day":3,"start":135,"end":195,"value":"Setpointd0f1df"},{"$class":"Unoccupied","day":3,"start":195,"end":225,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":225,"end":270,"value":"Unoccupied"},{"$class":"Setpointd0f1df","day":3,"start":270,"end":330,"value":"Setpointd0f1df"},{"$class":"Setpointd0f1df","day":3,"start":330,"end":360,"value":"Setpointd0f1df"},{"$class":"Setpointd0f1df","day":3,"start":360,"end":510,"value":"Setpointd0f1df"},{"$class":"Unoccupied","day":3,"start":510,"end":585,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":585,"end":630,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":630,"end":675,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":675,"end":690,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":690,"end":810,"value":"Unoccupied"},{"$class":"Unoccupied","day":3,"start":810,"end":0,"value":"Unoccupied"}]'));

      $scope.saveAll = function () {
        $scope.result = JSON.stringify($scope.adapter.getSnapshot()) + JSON.stringify($scope.adapterTwo.getSnapshot());
      }
    }]);

/** The data is already in an acceptable format for the demo so just pass it through */
/** @internal */
class DemoAdapter implements br.weeklyScheduler.IWeeklySchedulerAdapter<br.weeklyScheduler.IWeeklySchedulerRange<boolean>, boolean> {
  public items: br.weeklyScheduler.IWeeklySchedulerItem<boolean>[] = [];

  constructor(
    public initialData: br.weeklyScheduler.IWeeklySchedulerRange<boolean>[],
  ) {
  }

  public getSnapshot() {
    return Array.prototype.concat.apply([], this.items.map(item => item.schedules.map(schedule => schedule)));
  }

  public customModelToWeeklySchedulerRange(range) {
    return range;
  }
}
