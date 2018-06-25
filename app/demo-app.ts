angular.module('demoApp', ['br.weeklyScheduler'])
  .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q, $scope, $timeout, $log) {

      $scope.model = {
        options: {
          buttonClasses: ['wow!'],
          createItem: (day, schedules) => {
            return {
              day: day,
              schedules: schedules,
            }
          },
          defaultValue: false,
          editSlot: function (schedule) {
            schedule.value = true;
            return $timeout(() => schedule, 0);
          },
          interval: 1,
          onChange: (isValid) => {
          }
        } as br.weeklyScheduler.IWeeklySchedulerOptions<any>
      }

      $scope.model2 = angular.copy($scope.model);
      $scope.model2.options.interval = 15;
      $scope.model2.options.maxTimeSlot = 900;

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
          day: br.weeklyScheduler.Days.Monday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Tuesday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Wednesday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Thursday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 0,
          end: 720,
          value: true
        }
      ]);
      
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
