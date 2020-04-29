// description: This validator searches the primary CDS for forbidden key-value pairs (contained in the secondary CDS)
var res = true;
var list = [];

function hasOwnDeepPropertyWithVal(obj, forbiddenKey, forbiddenValue) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (obj.hasOwnProperty(forbiddenKey) && obj[forbiddenKey] === forbiddenValue) {
      return true;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && hasOwnDeepPropertyWithVal(obj[key], forbiddenKey, forbiddenValue)) {
        return true;
      }
    }
  }
  return false;
}

for (var attr in metadatasets[1].forbiddenKVpairs) {
  if (hasOwnDeepPropertyWithVal(metadatasets[0], attr, metadatasets[1].forbiddenKVpairs[attr])) {
    res = false;
    list.push(attr + metadatasets[1].forbiddenKVpairs[attr]);

  }
}

if (res === true) {
  // console.log("forbidden KV pairs do not exist");
    return { 'result': true, 'description': 'Forbidden KV pairs do not exist' };
} else {
  // console.log("Contains forbidden KV pairs", list);
    return { 'result': false, 'description': 'Contains forbidden KV pairs' };
}