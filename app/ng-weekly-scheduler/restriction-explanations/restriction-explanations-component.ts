/** @internal */
class RestrictionExplanationsController implements angular.IComponentController {
    static $controllerAs = 'restrictionExplanationsCtrl';
    static $name = 'brWeeklySchedulerRestrictionExplanationsController';

    static $inject = ['$filter'];

    private schedulerCtrl: WeeklySchedulerController;

    private explanations: string[] = [];

    constructor(private $filter: IWeeklySchedulerFilterService) {
    }

    $onInit() {
        let config = this.schedulerCtrl.config;

        if (config.maxTimeSlot) {
            let maxTimeSlot = this.$filter('brWeeklySchedulerMinutesAsText')(config.maxTimeSlot);
            this.explanations.push(`Max time slot length: ${maxTimeSlot}`);
        }

        if (config.fullCalendar) {
            this.explanations.push('For this calendar, every day must be completely full of schedules.')
        }

        if (config.monoSchedule) {
            this.explanations.push('This calendar may only have one time slot per day');
        }
    }
}

/** @internal */
class RestrictionExplanationsComponent implements angular.IComponentOptions {
    static $name = 'brRestrictionExplanations';

    controller = RestrictionExplanationsController.$name;
    controllerAs = RestrictionExplanationsController.$controllerAs;

    require = {
        schedulerCtrl: '^brWeeklyScheduler'
    };

    template = `
        <div class="srow explanations" ng-repeat="explanation in restrictionExplanationsCtrl.explanations">
            {{ explanation }}
        </div>
    `;
}

angular
    .module('br.weeklyScheduler')
    .component(RestrictionExplanationsComponent.$name, new RestrictionExplanationsComponent())
    .controller(RestrictionExplanationsController.$name, RestrictionExplanationsController);
