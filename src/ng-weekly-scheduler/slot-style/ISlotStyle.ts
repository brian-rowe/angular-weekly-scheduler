import { IRange } from '../range/IRange';

export interface ISlotStyle {
    getCss(schedule: IRange): any;
}
