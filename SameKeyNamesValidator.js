// description: Check unique values for a given keys list
// Version:   1.1 - For Sweagle 2.23, handles new error format in JSON

var keyNames = ["find.case.keys"];
var keysFound ={};
var errorFound = false;
var errorMsg = "";

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
            errorMsg = errorMsg+"ERROR: key "+item+" doesn't have unique value as expected.\n"
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
return {"result":!errorFound,"description":errorMsg};
