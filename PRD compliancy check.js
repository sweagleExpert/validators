
var unwantedSubstrings = ["localhost", "root"];
var mandatoryKeys = ["db.userpassword", "db.username"];
var node = "infra";


var errorFound = false;
var exists = {};
var ipFound = false;
var regEx = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g;

function prdSubstring(mds, substring) {
	for (var item in mds) {
		if (typeof (mds[item]) === 'object') {
			prdSubstring (mds[item], substring);
		}
		else {
			if (mds[item].includes(substring)){
				errorFound = true;
				break;
			}
		}

	}


}

function prdKeys (mds, searchKey) {
	if (exists.hasOwnProperty(searchKey) === false) {
		exists[searchKey] = [];
	}
	for (var item in mds) {
		if (typeof (mds[item]) === 'object') {
			prdKeys (mds[item], searchKey);
		}
		else {
			if (item === searchKey) {
				exists[searchKey].push(mds[item]);
			}
		}
	}
}

function prdIpv4 (mds) {
	for (var item in mds) {
		if (typeof (mds[item]) === 'object') {
			if (item !== node) {
				prdIpv4 (mds[item]);
			}
		}
		else {
			if (mds[item].match(regEx) !== null) {
				ipFound = true;
			} 
		}
	}
}


prdIpv4(metadataset);

for (var i=0; i<unwantedSubstrings.length; i++ ){
	prdSubstring(metadataset, unwantedSubstrings[i]);
}

for (var i = 0; i<mandatoryKeys.length; i++ ){
	prdKeys (metadataset,mandatoryKeys[i]);
}



if (ipFound === true ) {
	return false;
}
if (errorFound === true) {
	return false;
}

for (var obj in exists) {
	if (exists[obj].length > 0) {
		for (var i = 0; i < exists[obj].length; i++ ) {
			if (exists[obj][i] === "") {
				return false;
			}
		}
	}
	else {
		return false;
	} 

}
return true;


