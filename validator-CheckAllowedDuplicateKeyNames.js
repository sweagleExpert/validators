var arrays = {};
var res = true;
var msg = "";

function hasOwnDeepProperty(obj, key, searchkey, path) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (typeof (arrays[searchkey]) === "undefined") {
      arrays[searchkey] = [];
    }
    if (key !== "") {
      path = path + "," + key;
      if (path.charAt(0) ===",") {
        path = path.substring(1);
      }

    }
    if (obj.hasOwnProperty(searchkey)) {
      if (arrays[searchkey].filter(function(entry){ return entry === path }).length === 0) {
        arrays[searchkey].push(path);
      }
    }
    for (var subkey in obj) {
      if (obj.hasOwnProperty(subkey)) {
        hasOwnDeepProperty(obj[subkey], subkey, searchkey, path);
      }
    }
  }
}

function iterateKeys(obj, key) {
  if (typeof (obj) === 'string' && obj !== null && key && key !== "") {
    if (!(metadatasets[1]["allowedDuplicateKeyNames"].hasOwnProperty(key))) {
      hasOwnDeepProperty(metadatasets[0], "", key, "");
    }
  }
  if (typeof (obj) === 'object' && obj !== null) {
    for (var subkey in obj) {
      if (obj.hasOwnProperty(subkey)) {
        iterateKeys(obj[subkey], subkey);
      }
    }
  }
}

iterateKeys(metadatasets[0]);

for (var entry in arrays) {
  if (arrays[entry].length > 1) {
    res = false;
    msg += '\n\nEntry found more than once: '+entry+":"+JSON.stringify(arrays[entry]);
  }
}
if (res === true) {
  // console.log('All values exist exactly one time');
  return { 'result': true, 'description': 'All values exist exactly one time' };
} else {
  // console.log(msg);//todo needs rework for browser output
  return { 'result': false, 'description': msg};
}

