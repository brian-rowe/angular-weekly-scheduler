namespace br.weeklyScheduler {
    export interface IWeeklySchedulerRange<T> {
        /** A css class to apply */
        $class?: string;

        /** This will indicate whether the item is currently considered active to the UI */
        $isActive?: boolean;

        /** If this is set to true while the user is editing an existing item, it will be removed when the edit promise is resolved */
        $isDeleting?: boolean;

        /** This will indicate whether the item is currently being edited by the user */
        $isEditing?: boolean;

        /** Not strictly necessary but makes things a whooole lot easier */
        day: br.weeklyScheduler.Days;

        start: number;
        end: number;

        value: T;
    }
}

/** Use this for properties you need access to but don't want exposed to clients */
/** @internal */
interface IInternalWeeklySchedulerRange<T> extends br.weeklyScheduler.IWeeklySchedulerRange<T> {

}

/** Provides common functionality for a schedule -- pass it in and the resulting object will allow you to operate on it */
/** @internal */
class WeeklySchedulerRange<T> implements IInternalWeeklySchedulerRange<T> {
    $class: string;
    $isActive: boolean;
    $isDeleting: boolean;
    $isEditing: boolean;

    day: br.weeklyScheduler.Days;
    start: number;
    end: number;
    value: T;

    constructor(
        schedule: IInternalWeeklySchedulerRange<T>
    ) {
        this.day = schedule.day;
        this.start = schedule.start;
        this.end = schedule.end;
        this.value = schedule.value;
    }

    public equals(other: WeeklySchedulerRange<T>) {
        return angular.equals(this, other);
    }

    public hasSameValueAs(other: WeeklySchedulerRange<T>) {
        return this.value === other.value;
    }
}
