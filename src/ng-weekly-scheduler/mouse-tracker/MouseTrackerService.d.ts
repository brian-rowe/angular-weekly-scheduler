import { IPoint } from '../point/IPoint';
/** @internal */
export declare class MouseTrackerService {
    private $document;
    static $name: string;
    static $inject: string[];
    private constructor();
    private mousePosition;
    initialize(): void;
    getMousePosition(): IPoint;
    private setMousePosition(event);
}
