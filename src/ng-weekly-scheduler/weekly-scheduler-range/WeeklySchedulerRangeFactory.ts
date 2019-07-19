import * as angular from 'angular';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { WeeklySchedulerRange } from '../weekly-scheduler-range/WeeklySchedulerRange';

/** @internal */
export class WeeklySchedulerRangeFactory {
    static $name = 'brWeeklySchedulerRangeFactory';

    static $inject = [
        'brWeeklySchedulerEndAdjusterService'
    ];

    private constructor(
        private endAdjusterService: EndAdjusterService
    ) {
    }

    public createRange(config: IWeeklySchedulerConfig<any>, schedule: br.weeklyScheduler.IWeeklySchedulerRange<any>) {
        return new WeeklySchedulerRange(config, schedule, this.endAdjusterService);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(WeeklySchedulerRangeFactory.$name, WeeklySchedulerRangeFactory);
