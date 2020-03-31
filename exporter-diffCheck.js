var result = { modified: [], missing: [] };
if (args.length !== 2) {
  return 'Please enter two paths!';
}
function findNodeByPath(pathSteps, metadataset) {

  var subset = {};
  var found1 = true;
  for (var i = 0; i < pathSteps.length; i++) {
    if (i === 0) {
      if (metadataset.hasOwnProperty(pathSteps[0])) {
        subset = metadataset[pathSteps[0]];
      }
      else {
        found1 = false;
        break;
      }
    }
    else {
      if (subset.hasOwnProperty(pathSteps[i])) {
        subset = subset[pathSteps[i]];
      }
      else {
        found1 = false;
        break;
      }
    }
  }

  if (found1 === false) {
    return { outcome: false };
  }
  else {
    return { outcome: true, data: subset };
  }
}

var path1Steps = args[0].split(',');
var path2Steps = args[1].split(',');
var firstNode = findNodeByPath(path1Steps, metadatasets[0]);
var secondNode = findNodeByPath(path2Steps, metadatasets[0]);


function hasOwnDeepPropertyWithPath(obj, objkey, path) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (obj.hasOwnProperty(objkey)) {
      return { res: true, path: path + "," + objkey };
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && hasOwnDeepPropertyWithPath(obj[key], objkey, path + "," + key).res) {
        return { res: true, path: hasOwnDeepPropertyWithPath(obj[key], objkey, path + "," + key).path };
      }
    }
  }
  return { res: false, path: path };
}
function deepValue(obj, path) {
  for (var i = 0, path = path.split(','), len = path.length; i < len; i++) {
    obj = obj[path[i]];
  };
  return obj;
};

function existsInArray(array, obj){
  var found = false;
  for (var entry in array){
      if (JSON.stringify(obj) === JSON.stringify(array[entry])) {
        found = true;
      }
  }
  return found;
}
function parseValuesWithPath(obj, path) {
  var nodeKeys = Object.keys(obj);
  for (var i = 0; i < nodeKeys.length; i++) {
    var check = hasOwnDeepPropertyWithPath(obj, nodeKeys[i], path);
    var val1 = deepValue(metadatasets[0], check.path);
    var path2 = "";
    if (check.path.includes(args[0])) {
      path2 = args[1] + check.path.split(args[0])[1];
    } else {
      path2 = args[0] + check.path.split(args[1])[1];
    }
    var val2 = deepValue(metadatasets[0], path2);
    if (typeof(val1) === "string" && typeof(val2) === "string" && val2 !== val1) {
      var resMod = { path1: check.path, val1: val1, path2: path2,val2: val2 };
      if (!existsInArray(result.modified, resMod)) {
        result.modified.push(resMod);
      }
    } else {
      if (typeof (val2) === "undefined") {
        var resMis = { path1: check.path, val1: val1, path2: path2, val2: "N/A" };
        if (!existsInArray(result.missing, resMis)) {
          result.missing.push(resMis);
        }
      }
    }

    if (typeof (obj[nodeKeys[i]]) === "object" && Object.keys(obj[nodeKeys[i]]).length > 0) {
      for (var j = 0; j < Object.keys(obj[nodeKeys[i]]).length; j++) {
        parseValuesWithPath(obj[nodeKeys[i]], path + "," + nodeKeys[i]);
      }
    }
  }
}

if (firstNode.outcome === true && secondNode.outcome === true) {

  parseValuesWithPath(firstNode.data, args[0]);
  parseValuesWithPath(firstNode.data, args[1]);

  return result;

} else if (firstNode.outcome === true && secondNode.outcome === false) {
  return 'Path of Node 2 is wrong!';
}
else if (firstNode.outcome === false && secondNode.outcome === true) {
  return 'Path of Node 1 is wrong!';
}
else if (firstNode.outcome === false && secondNode.outcome === false) {
  return 'Paths of both Nodes are wrong!';
}