/*
 * check that for a list of given keyNames, there is only 1 unique value for every keyName
 */
var keyNames = ["find.case.keys"];
var keysFound ={};
var errorFound = false;

function findObjectKeys(mds) {
  for (var item in mds) {
    if  (typeof (mds[item]) === "object") {
      findObjectKeys (mds[item]);
    }
    else{
      if (keyNames.includes(item)) {
        if (keysFound.hasOwnProperty(item)) {
          if (keysFound[item] !== mds[item]) {
            errorFound = true;
            break;
          }
        } else {
          keysFound[item] = mds[item];
        }
      }
    }
  }
}


findObjectKeys(metadataset);
return !errorFound;