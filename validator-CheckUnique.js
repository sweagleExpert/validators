
var arrays = {};
var res = true;
var msg = "";

function hasOwnDeepProperty(obj, searchkey) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (typeof (arrays[searchkey]) === "undefined") {
      arrays[searchkey] = [];
    }
    if (obj.hasOwnProperty(searchkey)) {
      arrays[searchkey].push(obj[searchkey]);
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        hasOwnDeepProperty(obj[key], searchkey);
      }
    }
  }
}

for (var prop in metadatasets[1]["uniqueKeyNames-PRD"]) {
  hasOwnDeepProperty(metadatasets[0], prop);
}

console.log(arrays);
for (var entry in arrays) {
  if (arrays[entry].length > 1) {
    res = false;
    msg += ' Entry found more than once: '+entry+":"+JSON.stringify(arrays[entry]);
  } else if(arrays[entry].length === 0) {
    res = false;
    msg += ' Entry not found: '+entry+":"+JSON.stringify(arrays[entry]);
  }
}
if (res === true) {
  console.log('All values exist exactly one time');
  // return { 'result': true, 'description': 'All values exist exactly one time' };
} else {
  console.log(msg);
  // return { 'result': false, 'description': msg};
}

