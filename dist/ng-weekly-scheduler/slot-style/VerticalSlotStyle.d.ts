/// <reference types="angular" />
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { SlotStyleService } from './SlotStyleService';
export declare class VerticalSlotStyle implements ISlotStyle {
    private config;
    private $element;
    private slotStyleService;
    private element;
    constructor(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, slotStyleService: SlotStyleService);
    getCss(schedule: IWeeklySchedulerRange<any>): {
        top: string;
        bottom: string;
    };
    private getSlotTop(start);
    private getSlotBottom(start, end);
}
