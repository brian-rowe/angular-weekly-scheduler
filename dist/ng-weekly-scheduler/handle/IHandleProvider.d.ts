export interface IHandleProvider {
    getCursorPosition(): number;
    getPositionFromEvent(event: any): number;
}
