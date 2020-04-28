// description: Check if a key that corresponds to a portNumber has a value within a range
// both limits of range are included in the range
// the key to search must be a regex, put between "^...$" to search for specific value

 var keysWithRange = {
  "^web_port$" : "5000-5003",
  "^env.db.port$" : "10000-65535"
};

// Defines if error must include full path of key found
var includePath = true;
var pathSeparator = '/';
// Defines the max number of errors to return
var maxErrorDisplay = 3;
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
  searchport(metadataset, regex, min, max, '');
}

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};



/**
 * searchport function searches the whole metadataset to find the given searchkey and compare it with the given range
 * mds must be the given metadataset, searchKey must be the key we want to check, rangeMin and rangeMax must be the numeric limit
 */
function searchport (mds, searchKey, rangeMin, rangeMax, path) {
  for (var item in mds) {
    // get out if we already reach max nb of errors to display
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      searchport (mds[item], searchKey, rangeMin, rangeMax, path+item+pathSeparator);
    } else {
      // check if the key equals to the search term
      if (searchKey.test(item)) {
        //console.log("search="+item);
        //console.log("value="+mds[item]);
        // check if the value is not above the given threshold
        if  (!(mds[item].length > 0 && Number(mds[item]) >= rangeMin && Number(mds[item]) <= rangeMax)) {
          errorFound = true;
          if (includePath) { errors.push("*** Port ("+path+item+") has value ("+mds[item]+") not in approved range "+rangeMin+"-"+rangeMax); }
          else { errors.push("*** Port ("+item+") has value ("+mds[item]+") not in approved range "+rangeMin+"-"+rangeMax); }
        }
      }
    }
  }
}
