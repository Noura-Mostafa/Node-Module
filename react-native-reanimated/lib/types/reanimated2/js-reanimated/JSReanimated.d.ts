import MapperRegistry from './MapperRegistry';
import MutableValue from './MutableValue';
import { NativeReanimated } from '../NativeReanimated/NativeReanimated';
import { Timestamp, NestedObjectValues, AnimatedKeyboardInfo } from '../commonTypes';
export default class JSReanimated extends NativeReanimated {
    _valueSetter?: <T>(value: T) => void;
    _renderRequested: boolean;
    _mapperRegistry: MapperRegistry<any>;
    _frames: ((timestamp: Timestamp) => void)[];
    timeProvider: {
        now: () => number;
    };
    constructor();
    pushFrame(frame: (timestamp: Timestamp) => void): void;
    getTimestamp(): number;
    maybeRequestRender(): void;
    _onRender(timestampMs: number): void;
    installCoreFunctions(valueSetter: <T>(value: T) => void): void;
    makeShareable<T>(value: T): T;
    makeMutable<T>(value: T): MutableValue<T>;
    makeRemote<T>(object?: {}): T;
    startMapper(mapper: () => void, inputs?: NestedObjectValues<MutableValue<unknown>>[], outputs?: NestedObjectValues<MutableValue<unknown>>[]): number;
    stopMapper(mapperId: number): void;
    registerEventHandler<T>(_: string, __: (event: T) => void): string;
    unregisterEventHandler(_: string): void;
    enableLayoutAnimations(): void;
    registerSensor(): number;
    unregisterSensor(): void;
    jestResetModule(): void;
    subscribeForKeyboardEvents(_: AnimatedKeyboardInfo): number;
    unsubscribeFromKeyboardEvents(_: number): void;
}
