interface IWeeklySchedulerRange<T> {
    start: number;
    end: number;

    /** This will indicate whether the item is currently considered active to the UI */
    isActive?: boolean;
}
