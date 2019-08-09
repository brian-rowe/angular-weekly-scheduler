import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { TouchService } from '../touch/TouchService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalHandleProvider } from './HorizontalHandleProvider';
import { VerticalHandleProvider } from './VerticalHandleProvider';
export declare class HandleProviderFactory {
    private mouseTrackerService;
    private touchService;
    static $name: string;
    static $inject: string[];
    constructor(mouseTrackerService: MouseTrackerService, touchService: TouchService);
    getHandleProvider(config: IWeeklySchedulerConfig<any>): HorizontalHandleProvider | VerticalHandleProvider;
}
