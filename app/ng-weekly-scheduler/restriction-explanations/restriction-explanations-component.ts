/** @internal */
class RestrictionExplanationsController implements angular.IComponentController {
    static $controllerAs = 'restrictionExplanationsCtrl';
    static $name = 'brWeeklySchedulerRestrictionExplanationsController';

    static $inject = ['$filter'];

    private schedulerCtrl: WeeklySchedulerController;

    private explanations: { [key in ValidationError]?: string } = {};
    private violations: { [key in ValidationError]?: boolean } = {};

    constructor(
        private $filter: IWeeklySchedulerFilterService
    ) {
    }

    $doCheck() {
        let errors = this.schedulerCtrl.validationErrors;

        this.violations = {
            [ValidationError.FullCalendarViolation]: angular.isDefined(this.schedulerCtrl.formController.$error.fullCalendar),
            [ValidationError.MaxTimeSlotViolation]: angular.isDefined(this.schedulerCtrl.formController.$error.maxTimeSlot),
            [ValidationError.MonoScheduleViolation]: angular.isDefined(this.schedulerCtrl.formController.$error.monoSchedule),
        };
    }

    $onInit() {
        let config = this.schedulerCtrl.config;

        if (config.maxTimeSlot) {
            let maxTimeSlot = this.$filter('brWeeklySchedulerMinutesAsText')(config.maxTimeSlot);
            this.explanations[ValidationError.MaxTimeSlotViolation] = `Max time slot length: ${maxTimeSlot}`;
        }

        if (config.fullCalendar) {
            this.explanations[ValidationError.FullCalendarViolation] = 'For this calendar, every day must be completely full of schedules.';
        }

        if (config.monoSchedule) {
            this.explanations[ValidationError.MonoScheduleViolation] = 'This calendar may only have one time slot per day';
        }

        if (config.nullEnds) {
            this.explanations[ValidationError.NullEndViolation] = 'Items in this calendar do not have end times. Scheduled events begin at the start time and end when they are finished.';
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
        <div class="srow explanations" ng-class="{ violation: restrictionExplanationsCtrl.violations[key] }" ng-repeat="(key, explanation) in restrictionExplanationsCtrl.explanations">
            {{ explanation }}
        </div>
    `;
}

angular
    .module('br.weeklyScheduler')
    .component(RestrictionExplanationsComponent.$name, new RestrictionExplanationsComponent())
    .controller(RestrictionExplanationsController.$name, RestrictionExplanationsController);
