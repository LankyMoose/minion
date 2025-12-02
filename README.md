# Minion

A little library for parsing and generating data similar to [TRON](https://tron-format.github.io/).

Aims to produce a more compact representation than TRON. Given the following value:

```js
{
  index: "ord-123",
  items: [
    { index: 1, name: "Widget", price: 19.99, quantity: 2 },
    { index: 2, name: "Gadget", price: 29.99, quantity: 1 },
    { index: 3, name: "Gizmo", price: 39.99, quantity: 1 },
  ],
  total: 109.96,
};
```

TRON's `stringify` produces:

```js
class A: index,name,price,quantity

{"index":"ord-123","items":[A(1,"Widget",19.99,2),A(2,"Gadget",29.99,1),A(3,"Gizmo",39.99,1)],"total":109.96}
// 147 characters
```

Minion's `stringify` currently produces:

```js
$A index,items,total
$B index,name,price,quantity
A("ord-123",[B(1,"Widget",19.99,2),B(2,"Gadget",29.99,1),B(3,"Gizmo",39.99,1)],109.96)
// 138 characters
```

## Questions & Answers

- Why?
  - I was bored.
- Is it faster than JSON?
  - No.
- Why isn't it faster than JSON?
  - Something something V8 optimizations blah blah blah.
- Why are there questions and answers?
  - Good question.
