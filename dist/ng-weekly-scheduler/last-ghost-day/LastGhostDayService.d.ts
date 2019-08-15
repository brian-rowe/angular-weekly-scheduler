import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';
/** @internal */
export declare class LastGhostDayService {
    static $name: string;
    /**
     * When dragging ghosts across multiple days, if the user moves the cursor out of one extreme and back into the last slot that rendered a ghost,
     * We should remove the ghost from that extreme. This will help grab the correct day
     */
    getLastGhostDay(items: WeeklySchedulerItem<any>[]): any;
    /** Get the index of the $isGhostOrigin item */
    private getOriginIndex(items);
    /** Get all of the item indices that currently have ghosts rendered */
    private getRenderedGhostIndices(items);
}
