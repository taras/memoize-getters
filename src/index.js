import getPrototypeDescriptors from 'get-prototype-descriptors';

const { assign, defineProperty } = Object;

export default function memoizeClassGetters(Class) {
    
  let descriptors = getPrototypeDescriptors(Class);

  for (let key in descriptors) {
    let descriptor = descriptors[key];
    if (descriptor.get) {
      defineProperty(Class.prototype, key, assign({}, descriptor, {
        get: function memoizedGetter() {
          let value = descriptor.get.call(this);
          defineProperty(this, key, { value });
          return value;
        }
      }));
    }
  } 
  
  return Class;
}