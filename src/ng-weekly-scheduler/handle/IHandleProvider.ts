export interface IHandleProvider {
    getCursorPosition(): number;
    getPositionFromEvent(event): number;
}
