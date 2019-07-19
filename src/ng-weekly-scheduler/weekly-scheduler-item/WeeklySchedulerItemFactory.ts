import * as angular from 'angular';
import { DayMap } from '../weekly-scheduler-config/DayMap';
import { FillEmptyWithDefaultService } from '../fill-empty-with-default/FillEmptyWithDefaultService';
import { IInternalWeeklySchedulerItem } from '../weekly-scheduler-item/IInternalWeeklySchedulerItem';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { IWeeklySchedulerItem } from '../weekly-scheduler-item/IWeeklySchedulerItem';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { OverlapService } from '../overlap/OverlapService';
import { PurgeDefaultService } from '../purge-default/PurgeDefaultService';
import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
import { WeeklySchedulerRangeFactory } from '../weekly-scheduler-range/WeeklySchedulerRangeFactory';

/** @internal */
export class WeeklySchedulerItemFactory {
    static $name = 'brWeeklySchedulerItemFactory';

    static $inject = [
        'brWeeklySchedulerDayMap',
        'brWeeklySchedulerFillEmptyWithDefaultService',
        'brWeeklySchedulerOverlapService',
        'brWeeklySchedulerPurgeDefaultService',
        'brWeeklySchedulerRangeFactory'
    ];

    private constructor(
        private dayMap: DayMap,
        private fillEmptyWithDefaultService: FillEmptyWithDefaultService,
        private overlapService: OverlapService,
        private purgeDefaultService: PurgeDefaultService,
        private rangeFactory: WeeklySchedulerRangeFactory
    ) {
    }

    public createItem(config: IWeeklySchedulerConfig<any>, day: number, schedules: IWeeklySchedulerRange<any>[]) {
        let result: IInternalWeeklySchedulerItem<any>;

        let builder: IWeeklySchedulerItem<any> = config.createItem(day, schedules);
    
        result = angular.extend(builder, { label: this.dayMap[day] });
    
        return new WeeklySchedulerItem(config, result, this.fillEmptyWithDefaultService, this.overlapService, this.purgeDefaultService, this.rangeFactory);
    }
}

angular
    .module('br.weeklyScheduler')
    .service(WeeklySchedulerItemFactory.$name, WeeklySchedulerItemFactory);

