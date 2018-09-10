/*
 * check that the value of 2 different keyNames is the same
 */
var keyPairs = ["find.case.keys=find.case.values", "output.case.nodes=output.case.values"];
var keysFound =[];
var errorFound = false;

for (var i=0; i<keyPairs.length;i++) {
  var pair = keyPairs[i].split("=");
  findObjectKeys(metadataset,pair);
  if (keysFound.length === 2 ) {
    if (keysFound[0] !== keysFound[1]) {
      errorFound = true;
      break;
    } 
  }
  keysFound =[];
}
return !errorFound;

function findObjectKeys(mds, pair) {
  for (var item in mds) {
    if  (typeof (mds[item]) === "object") {
      findObjectKeys (mds[item], pair);
    }
    else{
      if (pair.includes(item)) {
        keysFound.push(mds[item]);
        pair = pair.splice( pair.indexOf(item), 1)
      }
     
    }
  }
}