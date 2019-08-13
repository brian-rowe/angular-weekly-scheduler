export const enum WeeklySchedulerEvents {
    CLICK_ON_A_CELL = 'rrWeeklyScheduler.clickOnACell',
    RESIZED = 'rrWeeklyScheduler.resized',
    ZOOMED_IN = 'rrWeeklyScheduler.zoomedIn', // ack
    ZOOMED_OUT = 'rrWeeklyScheduler.zoomedOut', //ack
    RESET_ZOOM = 'rrWeeklyScheduler.resetZoom', // command
    ZOOM_IN = 'rrWeeklyScheduler.zoomIn', // command

    SLOT_DRAGGED = 'rrWeeklyScheduler.slotDragged',
    DRAG_ENDED = 'rrWeeklyScheduler.dragEnded',

    GHOST_DRAG_ENDED = 'rrWeeklyScheduler.ghostDragEnded',
    CANCEL_GHOST = 'rrWeeklyScheduler.cancelGhost',
    COMMIT_GHOST = 'rrWeeklyScheduler.commitGhost',
    REMOVE_ALL_GHOSTS = 'rrWeeklyScheduler.removeAllGhosts',
    REMOVE_LAST_GHOST = 'rrWeeklyScheduler.removeLastGhost',
    REMOVE_GHOST = 'rrWeeklyScheduler.removeGhost'
}
