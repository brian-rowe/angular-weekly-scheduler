import { IHandleProvider } from './IHandleProvider';
import { TouchService } from '../touch/TouchService';
import { MouseTrackerService } from '../mouse-tracker/MouseTrackerService';
export declare class HorizontalHandleProvider implements IHandleProvider {
    private mouseTrackerService;
    private touchService;
    constructor(mouseTrackerService: MouseTrackerService, touchService: TouchService);
    getCursorPosition(): number;
    getPositionFromEvent(event: any): any;
    getStartHandleClass(): string;
    getEndHandleClass(): string;
}
