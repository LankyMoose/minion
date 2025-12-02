import MINION from "../index.js";

const parsed = MINION.parse(`$Order index,items,total
$Product index,name,price,quantity
Order("ord-123",[Product(1,"Widget",19.99,2),Product(2,"Gadget",29.99,1),Product(3,"Gizmo",39.99,1)],109.96)`);

console.log(parsed);

const stringified = MINION.stringify(parsed);

console.log(stringified);
