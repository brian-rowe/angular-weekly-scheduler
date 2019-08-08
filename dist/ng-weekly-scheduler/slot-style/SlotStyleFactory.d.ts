/// <reference types="angular" />
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { HorizontalSlotStyle } from './HorizontalSlotStyle';
export declare class SlotStyleFactory {
    private nullEndWidth;
    private endAdjusterService;
    private valueNormalizationService;
    static $name: string;
    static $inject: string[];
    constructor(nullEndWidth: number, endAdjusterService: EndAdjusterService, valueNormalizationService: ValueNormalizationService);
    getSlotStyle(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery): HorizontalSlotStyle;
}
