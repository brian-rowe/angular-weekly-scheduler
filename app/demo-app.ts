angular.module('demoApp', ['br.weeklyScheduler'])
  .controller('DemoController', ['$scope', '$timeout', '$log',
    function ($scope, $timeout, $log) {

      $scope.isDirty = false;

      $scope.model = {
        options: {
          allowNullEnds: true,
          buttonClasses: ['wow!'],
          createItem: (day, schedules) => {
            return {
              day: day,
              schedules: schedules
            }
          },
          defaultValue: true,
          editSlot: function (schedule) {
            schedule.end += 15;

            return $timeout(() => schedule, 400);
          },
          maxTimeSlot: 300,
          monoSchedule: true
        }
      };

      $scope.adapter = new DemoAdapter([
        {
          day: Days.Saturday,
          start: 1380,
          end: null,
          value: true
        },
        {
          day: Days.Sunday,
          start: 600,
          end: null,
          value: true
        },
        {
          day: Days.Monday,
          start: 720,
          end: null,
          value: true
        },
        {
          day: Days.Tuesday,
          start: 60,
          end: null,
          value: true
        },
        {
          day: Days.Wednesday,
          start: 30,
          end: null,
          value: true
        },
        {
          day: Days.Thursday,
          start: 0,
          end: null,
          value: true
        },
        {
          day: Days.Friday,
          start: 0,
          end: null,
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
