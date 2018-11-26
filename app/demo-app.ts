angular.module('demoApp', ['br.weeklyScheduler', 'ngMaterial'])
  .controller('DemoController', ['$q', '$scope', '$timeout', '$log', '$mdDialog',
    function ($q: angular.IQService, $scope, $timeout, $log, $mdDialog) {

      $scope.model = {
        options: {
          buttonClasses: ['wow!'],
          createItem: (day, schedules) => {
            return new DemoItem(day, schedules);
          },
          defaultValue: false,
          editSlot: function (schedule) {
            return $q.when(schedule);
          },
          interval: 60,
          minimumSeparation: 300,
          onChange: (isValid) => {
          },
          restrictionExplanations: {
            maxTimeSlot: (value) => `Slots cannot be longer than ${value}!`
          },
          scheduleCountOptions: {
            count: 2
          }
        } as br.weeklyScheduler.IWeeklySchedulerOptions<any>
      }

      $scope.model2 = angular.copy($scope.model);
      $scope.model2.options.fillEmptyWithDefault = true;
      $scope.model2.options.interval = 900;
      $scope.model2.options.maxTimeSlot = 54000;

      $scope.model2.options.saveScheduler = () => {
        $scope.adapterTwoResult = $scope.adapterTwo.getSnapshot();
        return $q.when();
      }

      $scope.model.options.nullEnds = true;

      // $scope.adapter = new DemoAdapter([
      //   // {
      //   //   day: Days.Saturday,
      //   //   start: 1380,
      //   //   end: null,
      //   //   value: true
      //   // },
      //   {
      //     day: br.weeklyScheduler.Days.Sunday,
      //     start: 600,
      //     end: null,
      //     value: true
      //   },
      //   {
      //     day: br.weeklyScheduler.Days.Monday,
      //     start: 720,
      //     end: null,
      //     value: true
      //   },
      //   {
      //     day: br.weeklyScheduler.Days.Tuesday,
      //     start: 60,
      //     end: null,
      //     value: true
      //   },
      //   {
      //     day: br.weeklyScheduler.Days.Wednesday,
      //     start: 30,
      //     end: null,
      //     value: true
      //   },
      //   {
      //     day: br.weeklyScheduler.Days.Friday,
      //     start: 0,
      //     end: null,
      //     value: true
      //   }
      // ]);

      $scope.adapterTwo = new DemoAdapter([
        {
          day: br.weeklyScheduler.Days.Sunday,
          start: 0,
          end: 43200,
          value: true,
          editable: false
        },
        {
          day: br.weeklyScheduler.Days.Sunday,
          start: 54000,
          end: 72000,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Monday,
          start: 0,
          end: 43200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Monday,
          start: 54000,
          end: 72000,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Tuesday,
          start: 0,
          end: 43200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Tuesday,
          start: 54000,
          end: 72000,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Wednesday,
          start: 0,
          end: 43200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Wednesday,
          start: 54000,
          end: 72000,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Thursday,
          start: 0,
          end: 43200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Thursday,
          start: 54000,
          end: 72000,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 0,
          end: 43200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 54000,
          end: 72000,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 0,
          end: 43200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 54000,
          end: 72000,
          value: true
        }
      ]);

      $scope.saveAll = function () {
        $scope.result = JSON.stringify($scope.adapter.getSnapshot()) + JSON.stringify($scope.adapterTwo.getSnapshot());
      }
    }]);

/** @internal */
class DemoItem implements br.weeklyScheduler.IWeeklySchedulerItem<boolean> {
  constructor(
    public day: br.weeklyScheduler.Days,
    public schedules: br.weeklyScheduler.IWeeklySchedulerRange<boolean>[]
  ) {
  }

  get editable() {
    return true;
  }
}

/** The data is already in an acceptable format for the demo so just pass it through */
/** @internal */
class DemoAdapter implements br.weeklyScheduler.IWeeklySchedulerAdapter<br.weeklyScheduler.IWeeklySchedulerRange<boolean>, boolean> {
  public items: DemoItem[] = [];

  constructor(
    public initialData: br.weeklyScheduler.IWeeklySchedulerRange<boolean>[],
  ) {
  }

  public getSnapshot() {
    return Array.prototype.concat.apply([], this.items.map(item => {
      return item.schedules.map(schedule => {
        return {
          day: schedule.day,
          start: schedule.start,
          end: schedule.end,
          value: schedule.value
        }
      });
    }));
  }

  public customModelToWeeklySchedulerRange(range) {
    range.$class = 'test';

    return range;
  }
}
