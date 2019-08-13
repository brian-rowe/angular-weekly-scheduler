import { WeeklySchedulerItem } from '../weekly-scheduler-item/WeeklySchedulerItem';

/** @internal */
export class LastGhostDayService {
    static $name = 'rrWeeklySchedulerLastGhostDayService';

    /**
     * When dragging ghosts across multiple days, if the user moves the mouse pointer out of one extreme and back into the last slot that rendered a ghost,
     * We should remove the ghost from that extreme. This will help grab the correct day
     */
    public getLastGhostDay(items: WeeklySchedulerItem<any>[]) {
        let originIndex = this.getOriginIndex(items);
        let renderedGhostIndices = this.getRenderedGhostIndices(items);

        // determine if the other $renderGhost items are above or below the $isGhostOrigin item
        let above = renderedGhostIndices.every(i => i <= originIndex);

        // take first item for above or last item for below
        let lastGhostDayIndex = above ? 0 : renderedGhostIndices.length - 1;

        return renderedGhostIndices[lastGhostDayIndex];
    }

    /** Get the index of the $isGhostOrigin item */
    private getOriginIndex(items: WeeklySchedulerItem<any>[]) {
        let originIndex;
        let len = items.length;

        for (let i = 0; i < len; i++) {
            let currentItem = items[i];

            if (currentItem.$isGhostOrigin) {
                originIndex = i;
                break;
            }
        }

        return originIndex;
    }

    /** Get all of the item indices that currently have ghosts rendered */
    private getRenderedGhostIndices(items: WeeklySchedulerItem<any>[]) {
        let renderedGhostIndices = [];
        let len = items.length;

        for (let i = 0; i < len; i++) {
            let currentItem = items[i];

            if (currentItem.$renderGhost) {
                renderedGhostIndices.push(i);
            }
        }

        return renderedGhostIndices;
    }
}
