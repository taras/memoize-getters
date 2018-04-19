# memoize-getters

Create React friendly ES6 class instances with cached getters.

## Installation

```bash
npm install --save memoize-getters
# or 
yarn add memoize-getters
```

## Use

```js
class Event {
  get date() {
    return new Date();
  }
}

let MemoizedEvent = memoizeGetters(class MemoizedEvent extends Event {});

let event = new MemoizedEvent();

event.date === event.date
```

## Background

You have to be very careful when working in ES6 class instances in React to not 
inadvertably introduce performance regressions and subtle bugs. This is in part caused
by the fact that ES6 classes were not designed for immutable environments that use 
strict equality for performance optimization. 

In immutable environments, properties of objects should not change without creating a new object. 
If you follow this rule and your object's getters are pure, you should be able to cache
the value returned by your getters. By caching getters, you're able to get performance improvements
from several perspectives. 

1. Lazy evaluation - delay execution of heavy tasks until the point that you need the computed value.  
2. Reuse computation - reduce unnecessary re-evaluation by returning previously computed value. 
3. Stable values - passing cached properties as props to pure and function components will eliminate unecessary re-renders.

Let's consider an example,

```js
export default class Products {
  constructor(products) {
    this.products = products;
  }

  get available() {
    return this.products.filter(product => product.isAvailable);
  }
}
```

```js
// React component
import Products from './products';

class Store extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    return {
      products: new Products(nextProps.products)
    }
  }

  render() {
    return (
      <ProductsList list={this.state.products.available} />
    )
  }
}
``` 

This this example we place an instance of Products class into the state of a React component. We would assume
that the `ProductsList` component only re-renders when a new list of products arrives via props. Unfortunately,
this is not the case because `available` getter returns a different object every time. The items contained in
the array might be the same, but the array reference is different. This happens because getters are re-evaluated
when they're read and not cached. To prevent the getter from being re-evaluted unnecessarily, 
you can use `memoize-getters` to wrap every getter in a memoize logic that causes the getter to be cached. 

Here is how you'd do this.

```js
import memoizeGetters from 'memoize-getters';

class Products {
  constructor(products) {
    this.products = products;
  }

  get available() {
    return this.products.filter(product => product.isAvailable);
  }
}

export default memoizeGetters(Products);
```

Now, whenever you create an instance of the exported class, all of the getters on that object will be memoized. 
To ensure that your getters are cached, try this

```js
class Event {
  get date() {
    return new Date();
  }
}

let CachedEvent = memoizeGetters(CachedEvent);

let event = new CachedEvent();

event.date === event.date
```

This should be true which means that the getter was computed and it returned the same value as previously. 
Otherwise, it'd create a new Date() object every time.

## How does it work?

`memoizeGetters` gathers all of the descriptors on the prototype chain and wraps every getter in a memoize function. 

It supports overloading getters from parents classes with getters of child classes. 
This also means that this function has to walk the prototype chain which can be slow when done repeatedly. 
To prevent unneccessary computations, I would recommend that you wrap the class one time in a module 
and export the wrapped class. Import the wrapped class in modules that need the class. 

## Avoiding mutation of the prototype

Ideally, `memoizeGetters(class MyClass{})` would return a new class. Unfortunately, this not possible(as far as I know). 
`memoizeGetters` will modify the prototype of the class that's passed into it. 

To avoid this, you can pass a class that extends from your original class. For example,

```js
export class Event {
  get date() {
    return new Date();
  }
}

export default memoizeGetters(class MemoizedEvent extends Event {});
```

Doing this will leave Event prototype unchanged and cache the getters that it took from `Event.prototype`.

## All getters are cached

This library is designed for scenarios where you're intentional to work with objects in an immutable way.
This library makes an assumption that all getters should be cached. If you need to only cache some of
the getters than you might want to consider using descriptors to annotate specific getters rather than 
using this library.