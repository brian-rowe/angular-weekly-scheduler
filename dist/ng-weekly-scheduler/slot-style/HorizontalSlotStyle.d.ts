/// <reference types="angular" />
import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { SlotStyleService } from './SlotStyleService';
import { IRange } from '../range/IRange';
export declare class HorizontalSlotStyle implements ISlotStyle {
    private config;
    private $element;
    private slotStyleService;
    private element;
    constructor(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery, slotStyleService: SlotStyleService);
    getCss(schedule: IRange): {
        left: string;
        right: string;
    };
    private getSlotLeft(start);
    private getSlotRight(start, end);
}
