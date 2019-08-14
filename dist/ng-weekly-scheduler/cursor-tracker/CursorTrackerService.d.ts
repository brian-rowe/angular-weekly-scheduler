import { IPoint } from '../point/IPoint';
/** @internal */
export declare class CursorTrackerService {
    private $document;
    static $name: string;
    static $inject: string[];
    private constructor();
    private cursorPosition;
    initialize(): void;
    getCursorPosition(): IPoint;
    private setCursorPosition(event);
}
