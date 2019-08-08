/// <reference types="angular" />
import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
export declare class HorizontalSlotStyle implements ISlotStyle {
    private config;
    private $element;
    private nullEndWidth;
    private endAdjusterService;
    private valueNormalizationService;
    private element;
    constructor(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, nullEndWidth: number, endAdjusterService: EndAdjusterService, valueNormalizationService: ValueNormalizationService);
    getCss(schedule: IWeeklySchedulerRange<any>): {
        left: string;
        right: string;
    };
    private getSlotLeft(start);
    private getSlotRight(start, end);
    private getUnderlyingInterval(val);
    private normalizeIntervalValue(value);
}
