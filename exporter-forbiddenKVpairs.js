//This exporter searches the primary CDS for forbidden key-value pairs (contained in the secondary CDS)
var res = true;
var list = [];

function hasOwnDeepPropertyWithVal(obj, forbiddenKey, forbiddenValue, path) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (obj.hasOwnProperty(forbiddenKey) && obj[forbiddenKey] === forbiddenValue) {
      return { res: true, path: path+","+forbiddenKey};
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && hasOwnDeepPropertyWithVal(obj[key], forbiddenKey, forbiddenValue, path+","+key).res) {
        return { res: true, path: hasOwnDeepPropertyWithVal(obj[key], forbiddenKey, forbiddenValue, path+","+key).path};
      }
    }
  }
  return { res: false, path: path};
}

for (var attr in metadatasets[1].forbiddenKVpairs) {
  var check = hasOwnDeepPropertyWithVal(metadatasets[0], attr, metadatasets[1].forbiddenKVpairs[attr], "");
  if (check.res === true) {
    res = false;
    list.push({key: attr, value: metadatasets[1].forbiddenKVpairs[attr], path: check.path });
  }
}


return list;