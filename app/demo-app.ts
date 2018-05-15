angular.module('demoApp', ['br.weeklyScheduler'])
  .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {

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
          editSlot: function (schedule) {
            schedule.end += 15;

            return $timeout(() => schedule, 400);
          },
          monoSchedule: true,
        }
      };

      $scope.adapter = new DemoAdapter([
        {
          day: Days.Saturday,
          start: 0,
          end: 720,
          value: true
        },
        {
          day: Days.Sunday,
          start: 0,
          end: 1440,
          value: true
        },
        {
          day: Days.Monday,
          start: 0,
          end: 1440,
          value: true
        },
        {
          day: Days.Tuesday,
          start: 0,
          end: 1440,
          value: true
        },
        {
          day: Days.Wednesday,
          start: 0,
          end: 1440,
          value: true
        },
        {
          day: Days.Thursday,
          start: 0,
          end: 1440,
          value: true
        },
        {
          day: Days.Friday,
          start: 0,
          end: 1440,
          value: true
        }
      ]);

      $scope.rangeAdapter = new DemoRangeAdapter();

      this.doSomething = function (itemIndex, scheduleIndex, scheduleValue) {
        $scope.isDirty = true;

        console.log('The model has changed!', itemIndex, scheduleIndex, scheduleValue);
      };
    }]);

/** The data is already in an acceptable format for the demo so just pass it through */
/** @internal */
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
/** @internal */
class DemoRangeAdapter implements IWeeklySchedulerRangeAdapter<IWeeklySchedulerRange<boolean>, boolean> {
  public adapt(range) {
    return range;
  }
}
