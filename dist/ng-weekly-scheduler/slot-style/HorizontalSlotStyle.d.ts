/// <reference types="angular" />
import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { SlotStyleService } from './SlotStyleService';
export declare class HorizontalSlotStyle implements ISlotStyle {
    private config;
    private $element;
    private slotStyleService;
    private element;
    constructor(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, slotStyleService: SlotStyleService);
    getCss(schedule: IWeeklySchedulerRange<any>): {
        left: string;
        right: string;
    };
    private getSlotLeft(start);
    private getSlotRight(start, end);
}
