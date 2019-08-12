import { DemoAdapter } from './DemoAdapter';
import { Days } from '../weekly-scheduler-config/Days';
import { IWeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';
import { DemoItem } from './DemoItem';

export class DemoController {
    static $name = 'DemoController';

    static $inject = ['$q', '$scope'];

    constructor(
        private $q: angular.IQService,
        private $scope: any
    ) {
    }

    $onInit() {
        this.$scope.model = {
            options: {
                buttonClasses: ['wow!'],
                createItem: (day, schedules) => {
                    return new DemoItem(day, schedules);
                },
                defaultValue: false,
                editSlot: (schedule) => {
                    schedule.start += 60;
                    schedule.value = true;
                    return this.$q.when(schedule);
                },
                fillEmptyWithDefault: true,
                interval: 60,
                fillNullEnds: 1800,
                maxTimeSlot: 7200,
                minimumSeparation: 300,
                onChange: (isValid) => {
                    console.log('changed!');
                },
                orientationOptions: {
                    defaultOrientation: 'vertical'
                },
                restrictionExplanations: {
                    maxTimeSlot: (value) => `Slots cannot be longer than ${value}!`
                },
                saveScheduler: () => {
                    this.$scope.result = this.$scope.adapter.getSnapshot();

                    return this.$q.when(true);
                }
            } as IWeeklySchedulerOptions<any>
        };
  
        this.$scope.adapter = new DemoAdapter([
            {
              day: Days.Saturday,
              start: 3600,
              end: 7200,
              value: true
            }
        ]);
    }
}
