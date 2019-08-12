import { IHandleProvider } from './IHandleProvider';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
import { TouchService } from '../touch/TouchService';
export declare class VerticalHandleProvider implements IHandleProvider {
    private mouseTrackerService;
    private touchService;
    constructor(mouseTrackerService: MouseTrackerService, touchService: TouchService);
    getCursorPosition(): number;
    getPositionFromEvent(event: any): any;
    getStartHandleClass(): string;
    getEndHandleClass(): string;
    getSlotWrapperClass(): string;
}
