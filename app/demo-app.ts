angular.module('demoApp', ['br.weeklyScheduler'])
  .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q: angular.IQService, $scope, $timeout, $log) {

      $scope.model = {
        options: {
          buttonClasses: ['wow!'],
          createItem: (day, schedules) => {
            return new DemoItem(day, schedules);
          },
          defaultValue: false,
          editSlot: function (schedule) {
            schedule.value = true;
            return $q.when(schedule);
          },
          interval: 1,
          onChange: (isValid) => {
          },
          restrictionExplanations: {
            maxTimeSlot: (value) => `Slots cannot be longer than ${value}!`
          },
          scheduleCountOptions: {
            count: 2,
            exact: true
          }
        } as br.weeklyScheduler.IWeeklySchedulerOptions<any>
      }

      $scope.model2 = angular.copy($scope.model);
      $scope.model2.options.fillEmptyWithDefault = true;
      $scope.model2.options.interval = 15;
      $scope.model2.options.maxTimeSlot = 900;

      $scope.model2.options.saveScheduler = () => {
        $scope.adapterTwoResult = $scope.adapterTwo.getSnapshot();
        return $q.when();
      }

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

      $scope.adapterTwo = new DemoAdapter([
        {
          day: br.weeklyScheduler.Days.Sunday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Sunday,
          start: 900,
          end: 1200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Monday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Monday,
          start: 900,
          end: 1200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Tuesday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Tuesday,
          start: 900,
          end: 1200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Wednesday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Wednesday,
          start: 900,
          end: 1200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Thursday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Thursday,
          start: 900,
          end: 1200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 900,
          end: 1200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 900,
          end: 1200,
          value: true
        }
      ]);
      
      $scope.saveAll = function () {
        $scope.result = JSON.stringify($scope.adapter.getSnapshot()) + JSON.stringify($scope.adapterTwo.getSnapshot());
      }
    }]);

class DemoItem implements br.weeklyScheduler.IWeeklySchedulerItem<boolean> {
  constructor(
    public day: br.weeklyScheduler.Days,
    public schedules: br.weeklyScheduler.IWeeklySchedulerRange<boolean>[]
  ) {
  }

  get editable() {
    return false;
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
    return range;
  }
}
