import { CursorTrackerService } from '../cursor-tracker/CursorTrackerService';
import { TouchService } from '../touch/TouchService';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { HorizontalHandleProvider } from './HorizontalHandleProvider';
import { VerticalHandleProvider } from './VerticalHandleProvider';
export declare class HandleProviderFactory {
    private cursorTrackerService;
    private touchService;
    static $name: string;
    static $inject: string[];
    constructor(cursorTrackerService: CursorTrackerService, touchService: TouchService);
    getHandleProvider(config: IWeeklySchedulerConfig<any>): HorizontalHandleProvider | VerticalHandleProvider;
}
