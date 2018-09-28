/** @internal */
class LastGhostDayService {
    static $name = 'brWeeklySchedulerLastGhostDayService';

    /**
     * When dragging ghosts across multiple days, if the user moves the mouse pointer out of one extreme and back into the last slot that rendered a ghost,
     * We should remove the ghost from that extreme. This will help grab the correct day
     */
    public getLastGhostDay(items: WeeklySchedulerItem<any>[]) {
        // get the index of the $isGhostOrigin item
        let originIndex;
        let len = items.length;

        for (let i = 0; i < len; i++) {
            let currentItem = items[i];

            if (currentItem.$isGhostOrigin) {
                originIndex = i;
                break;
            }
        }

        // determine if the other $renderGhost items are above or below the $isGhostOrigin item
        let renderedGhostIndices = [];

        for (let i = 0; i < len; i++) {
            let currentItem = items[i];

            if (currentItem.$renderGhost) {
                renderedGhostIndices.push(i);
            }
        }

        let above = renderedGhostIndices.every(i => i <= originIndex);

        // take first item for above or last item for below
        let result;

        if (above) {
            result = renderedGhostIndices[0];
        } else {
            result = renderedGhostIndices[renderedGhostIndices.length - 1];
        }

        return result;
    }
}

angular
    .module('br.weeklyScheduler')
    .service(LastGhostDayService.$name, LastGhostDayService);
