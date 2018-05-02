interface IWeeklySchedulerRange<T> {
    $index?: number;

    /** This will indicate whether the item is currently considered active to the UI */
    $isActive?: boolean;

    start: number;
    end: number;

    value: T;
}
