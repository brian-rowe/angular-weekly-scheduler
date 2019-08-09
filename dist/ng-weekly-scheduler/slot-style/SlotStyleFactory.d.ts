/// <reference types="angular" />
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { ISlotStyle } from './ISlotStyle';
import { SlotStyleService } from './SlotStyleService';
export declare class SlotStyleFactory {
    private slotStyleService;
    static $name: string;
    static $inject: string[];
    constructor(slotStyleService: SlotStyleService);
    getSlotStyle(config: IWeeklySchedulerConfig<any>, $element: angular.IAugmentedJQuery): ISlotStyle;
}
