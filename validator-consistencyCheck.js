var res = true;
var errorMsg = '';
var arrays = {};
var result = [];
var finalCheck = {};
function AllEqual(obj) {
  for (var prop in obj){
    var foundEqual = true;
    for ( var i = 0 ; i < obj[prop].length ; i++ ) {
        if ( obj[prop][i] !== obj[prop][0]) {
            foundEqual = false;
        }
    }
    if (foundEqual === false) {
        result.push(prop);
    } 
    return foundEqual;
  }
}
function hasOwnDeepProperty(obj, searchkey) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (obj.hasOwnProperty(searchkey)) {
      if (typeof(arrays[searchkey]) === "undefined"){
        arrays[searchkey] = [];
      }
      arrays[searchkey].push(obj);
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        hasOwnDeepProperty(obj[key], searchkey);
      }
    }
  }
}
for (var prop in metadatasets[1].consistencyCheck) {
  if (metadatasets[1].consistencyCheck.hasOwnProperty(prop)) {
    var obj = metadatasets[1].consistencyCheck[prop];
    hasOwnDeepProperty(metadatasets[0], obj.whereKeyName);
  }
}
for (var prop in metadatasets[1].consistencyCheck) {
  if (metadatasets[1].consistencyCheck.hasOwnProperty(prop)) {
    obj = metadatasets[1].consistencyCheck[prop];
    //search through the objects containing the desired keyName
    for (var resobj in arrays[obj.whereKeyName]) {
      if (obj.whereKeyValueContains.includes(arrays[obj.whereKeyName][resobj][obj.whereKeyName])) {
        if (typeof(finalCheck[prop]) === "undefined"){
          finalCheck[prop] = [];
        }
        finalCheck[prop].push(arrays[obj.whereKeyName][resobj][obj.keyNameToBeConsistent]);
      }
    }
  }
}
res = AllEqual(finalCheck);
if (res === true) {
  console.log('All values are identical');
  // return { 'result': true, 'description': 'All values are identical' };
} else {
  console.log('No identical values:'+ JSON.stringify(finalCheck));
  // return { 'result': false, 'description': 'No identical values'+ result.toString()};
}
