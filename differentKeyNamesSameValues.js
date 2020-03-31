// description: Check that the values of 2 different keyNames are the same

// differentKeyNamesSameValues.js
// Version:   1.1 - For Sweagle 2.23, handles new error format in JSON

var keyPairs = ["autocomplete=disabled"];
var keysFound =[];
var errorFound = false;
var errorMsg = "Validation passed successfully";

for (var i=0; i<keyPairs.length;i++) {
  var pair = keyPairs[i].split("=");
  findObjectKeys(metadataset,pair);
  if (keysFound.length === 2 ) {
    if (keysFound[0] !== keysFound[1]) {
      errorFound = true;
      errorMsg = "ERROR: Not same values for key pair: "+keyPairs[i].split("=");
      break;
    }
  } else {
      errorFound = true;
      errorMsg = "ERROR: More than 2 values were found for key pair: "+keyPairs[i].split("=");
      break;
  }
  keysFound =[];
}
return {"result":!errorFound,"description":errorMsg};

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
