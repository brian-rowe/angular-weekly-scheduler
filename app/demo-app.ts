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
            schedule.$isDeleting = true;
            return $q.when(schedule);
          },
          fillEmptyWithDefault: true,
          interval: 60 * 15,
          maxTimeSlot: 3600,
          minimumSeparation: 300,
          onChange: (isValid) => {
          },
          restrictionExplanations: {
            maxTimeSlot: (value) => `Slots cannot be longer than ${value}!`
          },
          saveScheduler: () => {
            $scope.result = $scope.adapter.getSnapshot();

            return $q.when(true);
          }
        } as br.weeklyScheduler.IWeeklySchedulerOptions<any>
      }

      // $scope.model.options.nullEnds = true;

      $scope.adapter = new DemoAdapter([
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 0,
          end: 3600,
          value: false
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 3600,
          end: 5400,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 5400,
          end: 7200,
          value: true
        },
        {
          day: br.weeklyScheduler.Days.Saturday,
          start: 7200,
          end: 0,
          value: false
        }
      ]);
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
