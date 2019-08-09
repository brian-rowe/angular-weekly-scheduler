import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { ValueNormalizationService } from '../value-normalization/ValueNormalizationService';
export declare class SlotStyleService {
    private valueNormalizationService;
    static $name: string;
    static $inject: string[];
    constructor(valueNormalizationService: ValueNormalizationService);
    /**
     * This relies on the html structure having the grid and the multislider
     * under the same div.
     */
    getUnderlyingInterval(config: IWeeklySchedulerConfig<any>, element: Element, val: number): HTMLElement;
    private normalizeIntervalValue(config, value);
}
