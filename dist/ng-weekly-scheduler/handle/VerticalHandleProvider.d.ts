import { IHandleProvider } from './IHandleProvider';
import { CursorTrackerService } from '../cursor-tracker/CursorTrackerService';
import { TouchService } from '../touch/TouchService';
export declare class VerticalHandleProvider implements IHandleProvider {
    private cursorTrackerService;
    private touchService;
    constructor(cursorTrackerService: CursorTrackerService, touchService: TouchService);
    getCursorPosition(): number;
    getPositionFromEvent(event: any): any;
    getStartHandleClass(): string;
    getEndHandleClass(): string;
    getSlotWrapperClass(): string;
}
