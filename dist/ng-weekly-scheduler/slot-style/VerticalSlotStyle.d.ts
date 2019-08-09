/// <reference types="angular" />
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
export declare class VerticalSlotStyle implements ISlotStyle {
    private config;
    private $element;
    private nullEndWidth;
    private endAdjusterService;
    private valueNormalizationService;
    private element;
    constructor(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, nullEndWidth: number, endAdjusterService: EndAdjusterService, valueNormalizationService: ValueNormalizationService);
    getCss(schedule: IWeeklySchedulerRange<any>): {
        top: string;
        bottom: string;
    };
    private getSlotTop(start);
    private getSlotBottom(start, end);
    private getUnderlyingInterval(val);
    private normalizeIntervalValue(value);
}
