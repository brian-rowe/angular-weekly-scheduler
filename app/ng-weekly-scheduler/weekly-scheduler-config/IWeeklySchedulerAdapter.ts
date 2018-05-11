/**
 * Implement this on a client and then pass it in to the component.
 * T = external custom type
 */
interface IWeeklySchedulerAdapter<T> {
    /** Transform the data held within the component to the format you need it outside of the component. */
    getSnapshot(): T[];

    initialData: T[];
}
