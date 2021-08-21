// function main() {
//     return new Promise( resolve => {
//       console.log(3);
//       resolve("test");
//       console.log(5);
//     });
//   }
  
//   async function f(){
//       console.log(2);
//       let r = await main();
//       console.log(r);
//       console.log(typeof r);
//   }
  
//   console.log(1);
//   f();
//   console.log(6);

import cal from "./module_test";

let result = cal(1,2);

console.log(result);