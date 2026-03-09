import { beforeEach, describe, expect, it } from 'vitest';

import { hasOwnOrInherits } from '~/lib/utils';

describe('utils module', () => {
  describe('hasOwnOrInherits', () => {
    class ParentFoo {
      inheritedMethod() {}
      overwrittenMethod() {}
    }

    class ChildBar extends ParentFoo {
      ownMethod() {}
      overwrittenMethod() {}
    }

    const bar = new ChildBar();

    beforeEach(() => {
      bar.instanceProperty = 'baz';
    });

    it('returns true for inherited property', () => {
      expect(hasOwnOrInherits(bar, 'inheritedMethod')).toBe(true);
    });

    it('returns true for prototype property', () => {
      expect(hasOwnOrInherits(bar, 'ownMethod')).toBe(true);
    });

    it('returns true for instance property', () => {
      expect(hasOwnOrInherits(bar, 'instanceProperty')).toBe(true);
    });

    it('returns false for nonexistent property', () => {
      expect(hasOwnOrInherits(bar, 'nonexistentProperty')).toBe(false);

      delete bar.instanceProperty;
      expect(hasOwnOrInherits(bar, 'instanceProperty')).toBe(false);

      delete bar.ownMethod;
      expect(hasOwnOrInherits(bar, 'ownMethod')).toBe(true);

      delete bar.inheritedMethod;
      expect(hasOwnOrInherits(bar, 'inheritedMethod')).toBe(true);
    });
  });
});
