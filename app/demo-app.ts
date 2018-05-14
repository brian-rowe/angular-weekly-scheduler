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
          editSlot: function (schedule) {
            schedule.end += 15;

            return $timeout(() => schedule, 400);
          }
        }
      };

      $scope.adapter = new DemoAdapter([{
        day: Days.Saturday,
        start: 300,
        end: 900,
        value: true
      }]);

      $scope.rangeAdapter = new DemoRangeAdapter();

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        $scope.isDirty = true;

        console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };
    }]);

/** The data is already in an acceptable format for the demo so just pass it through */
class DemoAdapter implements IWeeklySchedulerAdapter<IWeeklySchedulerRange<boolean>, boolean> {
  public items: IWeeklySchedulerItem<boolean>[] = [];

  constructor(
    public initialData: IWeeklySchedulerRange<boolean>[],
  ) {
  }

  public getSnapshot() {
    return Array.prototype.concat.apply([], this.items.map(item => item.schedules.map(schedule => schedule)));
  }
}

/** Same here */
class DemoRangeAdapter implements IWeeklySchedulerRangeAdapter<IWeeklySchedulerRange<boolean>, boolean> {
  public adapt(range) {
    return range;
  }
}
