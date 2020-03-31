//checks if there are any CDI values with a white space at start or end
//the validation result shows the full path to the key(s) with such problem
//validation logic is only applied on the primary assigned config data set
var errorFound = false;
var errors = [];


function findAll(mds,path) {
	for (var item in mds) {
		if(typeof mds[item] === 'object') {
			findAll(mds[item], path + item +'/'); //recursive call in case of a node
		} else {
			if ( mds[item].startsWith(' ') || mds[item].endsWith(' ')) {
				var tempItem = 'value: ' + mds[item] + ", path: " + path;
				errors.push(tempItem);
              	errorFound = true;
			}
			
		}
	}
}

//metadataset is the buildin variable which contains the full CDS
//validation starts at the root level of the CDS
findAll(metadataset, '');

return {result:!errorFound, description: JSON.stringify(errors)};
