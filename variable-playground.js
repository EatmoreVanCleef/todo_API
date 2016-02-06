var person = {
  name: 'Loser',
  age: 32
};

function updateObjectFail(obj) {
  obj = {
    name: 'Winner',
    age: 33
  }
}

function updateObjectWin(obj) {
    obj.name = 'Winner';
    obj.age = 33;
}

updateObjectFail(person);
console.log("Object Fail: ");
console.log(person);
updateObjectWin(person);
console.log("Object Win: ");
console.log(person);

// Array Example

var array = [15, 37];

function arrayUpdateFail(arr) {
  arr = [15, 37, 42];
}

function arrayUpdateWin(arr) {
  arr.push(42);
}

function altArrayWin(arr) {
  arr = ["return", "for", "the", "win!"];
  return arr;
}

arrayUpdateFail(array);
console.log("Array Fail: " + array);
arrayUpdateWin(array);
console.log("Array Win: " + array);
array = altArrayWin(array);
console.log("Alt Array Win: " + array);
