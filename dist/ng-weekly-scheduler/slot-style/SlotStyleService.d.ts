import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
import { EndAdjusterService } from '../end-adjuster/EndAdjusterService';
export declare class SlotStyleService {
    private endAdjusterService;
    private nullEndWidth;
    private valueNormalizationService;
    static $name: string;
    static $inject: string[];
    constructor(endAdjusterService: EndAdjusterService, nullEndWidth: number, valueNormalizationService: ValueNormalizationService);
    getSlotStart(config: IWeeklySchedulerConfig<any>, element: Element, start: number, offsetStrategy: (interval: HTMLElement) => number): string;
    getSlotEnd(config: IWeeklySchedulerConfig<any>, element: Element, start: number, end: number, strategy: (interval: HTMLElement) => number): string;
    /**
     * This relies on the html structure having the grid and the multislider
     * under the same div.
     */
    getUnderlyingInterval(config: IWeeklySchedulerConfig<any>, element: Element, val: number): HTMLElement;
    private normalizeIntervalValue(config, value);
}
