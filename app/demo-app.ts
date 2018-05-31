angular.module('demoApp', ['br.weeklyScheduler'])
  .controller('DemoController', ['$q', '$scope', '$timeout', '$log',
    function ($q, $scope, $timeout, $log) {

      $scope.isDirty = false;

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
            return $timeout(() => schedule, 400);
          },
          interval: 1,
          maxTimeSlot: 600,
          monoSchedule: true,
          onChange: (isValid) => {
            $scope.isDirty = true;
            $scope.isValid = isValid;

            console.log('The model has changed!');
          }
        } as br.weeklyScheduler.IWeeklySchedulerOptions<any>
      }

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
          end: 900,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Monday,
          start: 720,
          end: 1020,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Tuesday,
          start: 60,
          end: 180,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Wednesday,
          start: 30,
          end: 300,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 0,
          end: 60,
          value: true
        }
      ]);

      $scope.adapterTwo = new DemoAdapter([
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 0,
          end: 360,
          value: false
        },
        {
          day: br.weeklyScheduler.Days.Friday,
          start: 360,
          end: 1440,
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
