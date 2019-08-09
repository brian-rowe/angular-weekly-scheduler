/// <reference types="angular" />
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { ISlotStyle } from './ISlotStyle';
import { SlotStyleService } from './SlotStyleService';
export declare class SlotStyleFactory {
    private nullEndWidth;
    private endAdjusterService;
    private slotStyleService;
    private valueNormalizationService;
    static $name: string;
    static $inject: string[];
    constructor(nullEndWidth: number, endAdjusterService: EndAdjusterService, slotStyleService: SlotStyleService, valueNormalizationService: ValueNormalizationService);
    getSlotStyle(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery): ISlotStyle;
}
