import 'jest';

import memoizeGetters from 'memoize-getters';

describe('memoizeClassGetters', () => {
  let MemoizedClass;

  beforeEach(() => {
    class Event {
      get date() {
        return new Date();
      }
    }

    MemoizedClass = memoizeGetters(Event);
  });

  it('returns a function', () => {
    expect(MemoizedClass).toBeInstanceOf(Function);
  });

  describe('instances', () => {
    let p1, p2;

    beforeEach(() => {
      p1 = new MemoizedClass();
      p2 = new MemoizedClass();
    });

    it('memoizes value of the getter', () => {
      expect(p1.date).toBe(p1.date);
    });

    it('has unique value for each object', () => {
      expect(p1.date).not.toBe(p2.date);
    });
  });

  describe('constructor', () => {
    it('supports class properties', () => {
      class MyClass {
        a = 'a'
        get capitalized() {
          return this.a.toUpperCase();
        }
      }
      let Model = memoizeGetters(MyClass);
      let m = new Model();
      expect(m).toHaveProperty('a', 'a');
      expect(m.constructor).toBe(MyClass);
    });
  });

  describe('inheritance', () => {
    class Event {
      get date() {
        return new Date();
      }
    }

    let classes = {
      ['MemoizedEvent']: class extends Event {}
    };
    
    let MemoizedEvent = memoizeGetters(classes.MemoizedEvent);

    let p1, p2, o1;

    beforeEach(() => {
      p1 = new MemoizedEvent();
      p2 = new MemoizedEvent();
      o1 = new Event();      
    });

    it('memoizes value of the getter', () => {
      expect(p1.date).toBe(p1.date);
    });

    it('has unique value for each object', () => {
      expect(p1.date).not.toBe(p2.date);
    });

    it('original class is not modified', () => {
      expect(o1.date).not.toBe(o1.date);
    });

    it('has name on MemoizedEvent', () => {
      expect(p1.constructor.name).toBe('MemoizedEvent');
    });
  });
});
