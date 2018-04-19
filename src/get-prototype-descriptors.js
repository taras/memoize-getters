import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

const { getPrototypeOf, assign } = Object;

export default function getPrototypeDescriptors(Class) {
  let prototype = getPrototypeOf(Class);
  if (prototype && prototype !== getPrototypeOf(Object)) {
    return assign({}, getPrototypeDescriptors(prototype), getOwnPropertyDescriptors(Class.prototype));
  } else {
    return getOwnPropertyDescriptors(Class.prototype);
  }
}