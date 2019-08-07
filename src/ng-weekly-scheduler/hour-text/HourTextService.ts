export class HourTextService {
    public static $name = 'rrWeeklySchedulerHourTextService';

    public generateHourText(hour: number) {
        let currentHour = hour % 12;
        let meridiem = hour >= 12 ? 'p' : 'a';

        return `${currentHour || '12'}${meridiem}`;
    }
}
