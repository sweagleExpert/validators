// description: This validator checks for duplicates across multiple CDS.
var res = true;
var arrayKeys = JSON.parse(arg);
var arrays = {};
var result = [];
// Store all the config datasets
var superCDS={};
// Root node string used to concatenate all CDS in superCDS
var rootNode="";

for (var i=0; i<cds.length; i++){
  rootNode = Object.keys(cds[i])[0];
  superCDS[rootNode] = cds[i][rootNode];
}

for (var i in arrayKeys) {
  arrays[arrayKeys[i]] = [];
}

function hasDuplicates(array) {
  if ((new Set(array)).size !== array.length) {
    result.push(index);
    return true;
  }
  return false;
}

function hasOwnDeepProperty(obj, searchkey) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (obj.hasOwnProperty(searchkey)) {
      arrays[searchkey].push(obj[searchkey]);
      //console.log(searchkey+"="+obj[searchkey]);
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        hasOwnDeepProperty(obj[key], searchkey);
      }
    }
  }
}
//Get all the values first into arrays first
for (var argIndex in arrayKeys) {
  for (var i=0; i<cds.length; i++) {
    hasOwnDeepProperty(cds[i], arrayKeys[argIndex]);
  }
}

//Examine the data gathered for duplicates
for (var index in arrays) {
  //console(index+"="+arrays[index]);
  if (hasDuplicates(arrays[index], index)) {
    res = false;
  }
}


if (res === true) {
  //console.log("all good", res);
  return {result:true, description:"All values are unique" };
} else {
  //console.log("Duplicates", result);
  return {result:false, description:"Contain duplicate values" };
}