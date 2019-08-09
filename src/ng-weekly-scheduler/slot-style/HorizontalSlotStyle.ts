import { ISlotStyle } from './ISlotStyle';
import { IWeeklySchedulerRange } from '../weekly-scheduler-range/IWeeklySchedulerRange';
import { IWeeklySchedulerConfig } from '../weekly-scheduler-config/IWeeklySchedulerConfig';
import { SlotStyleService } from './SlotStyleService';

export class HorizontalSlotStyle implements ISlotStyle {
  private element: Element;

  constructor(
    private config: IWeeklySchedulerConfig<any>,
    private $element: angular.IAugmentedJQuery,
    private slotStyleService: SlotStyleService,
  ) {
    this.element = this.$element[0];
  }

  getCss(schedule: IWeeklySchedulerRange<any>) {
    return {
      left: this.getSlotLeft(schedule.start),
      right: this.getSlotRight(schedule.start, schedule.end)
    };
  }

  private getSlotLeft(start: number) {
    return this.slotStyleService.getSlotStart(this.config, this.element, start, interval => interval.offsetLeft);
  }

  private getSlotRight(start: number, end: number) {
    return this.slotStyleService.getSlotEnd(this.config, this.element, start, end, interval => {
      return this.element.clientWidth - (interval.offsetLeft + interval.offsetWidth);
    })
  }
}
