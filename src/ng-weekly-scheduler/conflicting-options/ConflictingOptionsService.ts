import * as angular from 'angular';
import { IWeeklySchedulerOptions } from '../weekly-scheduler-config/IWeeklySchedulerOptions';

/** @internal */
export class ConflictingOptionsService {
    static $name = 'brWeeklySchedulerConflictingOptionsService';

    public getConflictingOptions(options: IWeeklySchedulerOptions<any>) {
        if (options.nullEnds && options.scheduleCountOptions && options.scheduleCountOptions.count > 1) {
            return `A nullEnds calendar has a maximum scheduleCount of 1`;
        }

        if (options.fullCalendar && options.fillEmptyWithDefault) {
            return `Options 'fullCalendar' & 'fillEmptyWithDefault' are mutually exclusive.`;
        }

        if (options.fillEmptyWithDefault && !angular.isDefined(options.defaultValue)) {
            return `If using option 'fillEmptyWithDefault', you must also provide 'defaultValue.'`;
        }

        return '';
    }
}
