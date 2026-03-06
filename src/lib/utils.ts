export const hasOwnOrInherits = (target: object, prop: string): boolean => {
  if (target === null) return false;
  if (Object.hasOwn(target, prop)) return true;

  const proto = Object.getPrototypeOf(target);
  return hasOwnOrInherits(proto, prop);
};
