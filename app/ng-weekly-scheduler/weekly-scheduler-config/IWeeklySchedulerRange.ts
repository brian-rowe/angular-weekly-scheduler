interface IWeeklySchedulerRange<T> {
    /** A css class to apply */
    $class?: string;

    /** This will indicate whether the item is currently considered active to the UI */
    $isActive?: boolean;

    /** This will indicate whether the item is currently being edited by the user */
    $isEditing?: boolean;

    start: number;
    end: number;

    value: T;
}
