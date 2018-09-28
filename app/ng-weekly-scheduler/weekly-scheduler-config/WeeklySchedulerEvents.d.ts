declare const enum WeeklySchedulerEvents {
    CLICK_ON_A_CELL = 'clickOnACell',
    RESIZED = 'resized',
    ZOOMED_IN = 'zoomedIn', // ack
    ZOOMED_OUT = 'zoomedOut', //ack
    RESET_ZOOM = 'resetZoom', // command
    ZOOM_IN = 'zoomIn', // command

    SLOT_DRAGGED = 'slotDragged',
    DRAG_ENDED = 'dragEnded',

    GHOST_DRAG_ENDED = 'ghostDragEnded',
    COMMIT_GHOST = 'commitGhost',
    REMOVE_LAST_GHOST = 'removeLastGhost',
    REMOVE_GHOST = 'removeGhost'
}
