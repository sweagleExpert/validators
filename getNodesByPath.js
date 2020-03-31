//var args = ["devtest2", "infra", "env6-s2", "deployed"]; Path as an array
args.map(field => {
    metadataset = metadataset[field];
});
return Object.keys(metadataset);
