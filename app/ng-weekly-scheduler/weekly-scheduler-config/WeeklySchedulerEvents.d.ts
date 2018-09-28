declare const enum WeeklySchedulerEvents {
    CLICK_ON_A_CELL = 'brWeeklyScheduler.clickOnACell',
    RESIZED = 'brWeeklyScheduler.resized',
    ZOOMED_IN = 'brWeeklyScheduler.zoomedIn', // ack
    ZOOMED_OUT = 'brWeeklyScheduler.zoomedOut', //ack
    RESET_ZOOM = 'brWeeklyScheduler.resetZoom', // command
    ZOOM_IN = 'brWeeklyScheduler.zoomIn', // command

    SLOT_DRAGGED = 'brWeeklyScheduler.slotDragged',
    DRAG_ENDED = 'brWeeklyScheduler.dragEnded',

    GHOST_DRAG_ENDED = 'brWeeklyScheduler.ghostDragEnded',
    COMMIT_GHOST = 'brWeeklyScheduler.commitGhost',
    REMOVE_LAST_GHOST = 'brWeeklyScheduler.removeLastGhost',
    REMOVE_GHOST = 'brWeeklyScheduler.removeGhost'
}
