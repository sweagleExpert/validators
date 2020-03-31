// description: Check if a key that corresponds to a portNumber has a value within a range
// both limits of range are included in the range
// the key to search must be a regex, put between "^...$" to search for specific value

 var keysWithRange = {
  "^web_port$" : "5000-5003",
  "^env.db.port$" : "10000-65535"
};

var errorFound = false;
var errors = [];
var description = '';

// Here we can call our function with different search terms and thresholds
for (var obj in keysWithRange) {
  var regex = RegExp(obj);
  var range = keysWithRange[obj];
  var min = Number(range.substring(0,range.indexOf("-")));
  var max = Number(range.substring(range.indexOf("-")+1));
  //console.log("min="+min);
  //console.log("max="+max);
  searchport(metadataset, regex, min, max);
}

description = errors.join(', ');
return {description: description, result:!errorFound};



/**
 * searchport function searches the whole metadataset to find the given searchkey and compare it with the given range
 * mds must be the given metadataset, searchKey must be the key we want to check, rangeMin and rangeMax must be the numeric limit
 */
function searchport (mds, searchKey, rangeMin, rangeMax) {
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      searchport (mds[item], searchKey, rangeMin, rangeMax);
    } else {
      // check if the key equals to the search term
      if (searchKey.test(item)) {
        //console.log("search="+item);
        //console.log("value="+mds[item]);
        // check if the value is not above the given threshold
        if  (!(mds[item].length > 0 && Number(mds[item]) >= rangeMin && Number(mds[item]) <= rangeMax)) {
          errorFound = true;
          errors.push("*** Port ("+item+") has value ("+mds[item]+") not in approved range "+rangeMin+"-"+rangeMax);
        }
      }
    }
  }
}
