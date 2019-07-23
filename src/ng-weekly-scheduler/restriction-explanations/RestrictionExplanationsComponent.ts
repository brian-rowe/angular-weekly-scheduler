import * as angular from 'angular';
import { WeeklySchedulerController } from '../weekly-scheduler/weekly-scheduler';
import { ValidationError } from '../weekly-scheduler-config/ValidationErrors';
import { IWeeklySchedulerFilterService } from '../weekly-scheduler-config/IWeeklySchedulerFilterService';

/** @internal */
export class RestrictionExplanationsController implements angular.IComponentController {
    static $controllerAs = 'restrictionExplanationsCtrl';
    static $name = 'brWeeklySchedulerRestrictionExplanationsController';

    static $inject = ['$filter'];

    private schedulerCtrl: WeeklySchedulerController;

    private explanations: { [key in ValidationError]?: string } = {};

    constructor(
        private $filter: IWeeklySchedulerFilterService
    ) {
    }

    $onInit() {
        let config = this.schedulerCtrl.config;

        if (config.maxTimeSlot) {
            let maxTimeSlot = this.$filter('brWeeklySchedulerSecondsAsText')(config.maxTimeSlot);
            this.explanations[ValidationError.MaxTimeSlot] = config.restrictionExplanations.maxTimeSlot(maxTimeSlot);
        }

        if (config.fullCalendar) {
            this.explanations[ValidationError.FullCalendar] = config.restrictionExplanations.fullCalendar;
        }

        if (config.monoSchedule) {
            this.explanations[ValidationError.MonoSchedule] = config.restrictionExplanations.monoSchedule;
        }

        if (config.nullEnds) {
            this.explanations[ValidationError.NullEnd] = config.restrictionExplanations.nullEnds;
        }

        if (config.scheduleCountOptions && config.scheduleCountOptions.count) {
            this.explanations[ValidationError.ScheduleCount] = config.restrictionExplanations.scheduleCount(config.scheduleCountOptions);
        }

        if (config.minimumSeparation) {
            let minimumSeparation = this.$filter('brWeeklySchedulerSecondsAsText')(config.minimumSeparation);
            this.explanations[ValidationError.MinimumSeparation] = config.restrictionExplanations.minimumSeparation(minimumSeparation);
        }
    }
}

/** @internal */
export class RestrictionExplanationsComponent implements angular.IComponentOptions {
    static $name = 'brRestrictionExplanations';

    controller = RestrictionExplanationsController.$name;
    controllerAs = RestrictionExplanationsController.$controllerAs;

    require = {
        schedulerCtrl: '^brWeeklyScheduler'
    };

    template = `
        <div class="srow explanations" ng-class="{ violation: restrictionExplanationsCtrl.schedulerCtrl.formController.$error[key] }" ng-repeat="(key, explanation) in restrictionExplanationsCtrl.explanations">
            {{ explanation }}
        </div>
    `;
}
