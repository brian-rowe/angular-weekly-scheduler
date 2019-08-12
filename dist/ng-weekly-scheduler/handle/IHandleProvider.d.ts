export interface IHandleProvider {
    getCursorPosition(): number;
    getPositionFromEvent(event: any): number;
    getStartHandleClass(): string;
    getEndHandleClass(): string;
}
