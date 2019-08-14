/// <reference types="angular" />
import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { SlotStyleService } from './SlotStyleService';
import { IRange } from '../range/IRange';
export declare class VerticalSlotStyle implements ISlotStyle {
    private config;
    private $element;
    private slotStyleService;
    private element;
    constructor(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, slotStyleService: SlotStyleService);
    getCss(schedule: IRange): {
        top: string;
        bottom: string;
    };
    private getSlotTop(start);
    private getSlotBottom(start, end);
}
