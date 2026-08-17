import { appEvents, APP_EVENTS } from '../events';

describe('appEvents', () => {
  it('calls a subscribed listener when the event is emitted', () => {
    const listener = jest.fn();
    appEvents.on('test:event', listener);
    appEvents.emit('test:event', { foo: 'bar' });
    expect(listener).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('calls multiple listeners for the same event', () => {
    const a = jest.fn();
    const b = jest.fn();
    appEvents.on('test:multi', a);
    appEvents.on('test:multi', b);
    appEvents.emit('test:multi', undefined);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('stops calling a listener after it unsubscribes', () => {
    const listener = jest.fn();
    const unsubscribe = appEvents.on('test:unsub', listener);
    unsubscribe();
    appEvents.emit('test:unsub', undefined);
    expect(listener).not.toHaveBeenCalled();
  });

  it('does not throw when emitting an event with no listeners', () => {
    expect(() => appEvents.emit('test:nobody-listening', undefined)).not.toThrow();
  });

  it('isolates a throwing listener so other listeners still run', () => {
    const good = jest.fn();
    appEvents.on('test:isolate', () => {
      throw new Error('boom');
    });
    appEvents.on('test:isolate', good);
    expect(() => appEvents.emit('test:isolate', undefined)).not.toThrow();
    expect(good).toHaveBeenCalledTimes(1);
  });

  it('exposes a stable achievementsRecheck event name', () => {
    expect(APP_EVENTS.achievementsRecheck).toBe('achievements:recheck');
  });
});
