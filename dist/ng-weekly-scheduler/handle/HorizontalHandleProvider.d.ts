import { IHandleProvider } from './IHandleProvider';
import { TouchService } from '../touch/TouchService';
import { CursorTrackerService } from '../cursor-tracker/CursorTrackerService';
export declare class HorizontalHandleProvider implements IHandleProvider {
    private cursorTrackerService;
    private touchService;
    constructor(cursorTrackerService: CursorTrackerService, touchService: TouchService);
    getCursorPosition(): number;
    getPositionFromEvent(event: any): number;
    getStartHandleClass(): string;
    getEndHandleClass(): string;
    getSlotWrapperClass(): string;
}
