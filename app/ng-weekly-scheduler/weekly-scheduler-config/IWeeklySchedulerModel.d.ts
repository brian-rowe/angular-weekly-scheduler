interface IWeeklySchedulerModel<T> {
    locale: any; /* TODO type */
    options: IWeeklySchedulerOptions;
    items: IWeeklySchedulerItem<T>[];
}