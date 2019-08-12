export interface IHandleProvider {
    getCursorPosition(): number;
    getPositionFromEvent(event): number;
    getStartHandleClass(): string;
    getEndHandleClass(): string;
    getSlotWrapperClass(): string;
}
