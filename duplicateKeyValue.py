# description: Check if there is no duplicate key value between conf and deployed instances
# duplicateKeyValue.py
#
# Inputs are: the keys list to search for duplicates
#    Input type: an object arg containing a string
# Outputs are: the list of keys which are duplicated
#    Output type: config datasets
#
# Creator: Cyrille
# Maintainer:
# Version:   0.9
# Support: Sweagle version >= 3.11

# IMPORT MODULES
# JSON module
import json
# RegEx module
#import re
# XML module
#import xml.etree.ElementTree as xml
# YAML module
#import yaml

# FUNCTIONS LIST
# Parse the object notation: check upon against the RegEx format
def objFormat(obj):
  keysList = ""
  # {"KeyNames" : ["key1","key2","key3"]}
  # JSON format
  # <KeyNames>Value</KeyNames>
  # XML format
  # ---
  # KeyNames: Value
  # YAML format
  if obj[0]=='{':
    # JSON
    jsonObj=json.loads(obj)
    keysList=jsonObj["KeysList"]
    return keysList
  # XML
  elif obj[0]=='<':
    #xmlObj=xml.fromstring(obj)
    #valueToCheck=xmlObj[0].text
    return keysList
  # YAML
  elif obj[0]=='-':
    #yamlObj=yaml.load(obj)
    #valueToCheck=yamlObj["KeysList"]
    return keysList
  else:
    global errorFound, errors
    errorFound = True
    errors.append("ERROR: Inputs unexpected!, please provide an object notation (arg). Inputs variables list (args[]) is deprecated.")

# Function to retrieve the key value of searched key
def getKeyValueByName(dataset, keyName):
  value = "ERROR: NOT FOUND"
  # If the current key equals the key name
  # Returns the key value for the current key name
  if keyName in dataset:
    return dataset[keyName]
  # Recursive search in the node
  for k, v in dataset.items():
      if isinstance(v,dict):
          value = getKeyValueByName(v, keyName)
          if value is not None:
            return value

# Function to check if the key & value equals tp search term
def checkKeyValueExists(dataset, keyname, keyvalue, path):
  # If the number of errors found is reached
  global errorFound, errors
  if len(errors) <= maxErrorDisplay:
    if keyname in dataset:
      keyvalue = dataset[keyname]
      errorFound = True
      errors.append("Key: "+path+keyname+" contains same value: "+keyvalue)
    # Recursive search in the node
    for k, v in dataset.items():
        if isinstance(v,dict):
            return checkKeyValueExists(v, keyname, keyvalue, path)

# HANDLERS
# Inputs parser and checker
def handlers(arg):
  if arg!=None and arg!="":
    # Input values in object notation
    # Checking the assigned config datasets and parse the node name from input values in object notation
    return objFormat(arg.strip())
  else:
    global errors
    errors.append("ERROR: No inputs provided! Please provide at least one cds and one arg in object notation.")
    # If no input is provided then return main cds (for retro compatibility)
    return cds[0]

# VARIABLES DEFINITION
# Store all the config datasets
superCDS = {}
# Root node string used to concatenate all CDS in superCDS
rootNode = ""
# Define keywords in key name that defines a password
keyNames = list()
# Defines if error must include full path of key found
includePath = True
# Errors variables
maxErrorDisplay = 3
errorFound = False
errors = list()
errors_description = ""
# Define the path
pathSeparator = "/"
# Define my value
myValue = ""

# MAIN
# If the key names have been correctly parsed without any error detected so far!
# CHECK IF ARG IS WELL DEFINED AND RETRIVE ITS CONTENT
keyNames=handlers(arg)
# MAIN ROUTINE
# here we call our function with different search terms
if keyNames is not None and errorFound is not True:
  for i in range(0, len(cds)):
    superCDS = cds[i]
  # For each key name in the list
  for k in range(0, len(keyNames)):
    myValue=getKeyValueByName(superCDS, keyNames[k])
    if myValue is not "ERROR: NOT FOUND":
        checkKeyValueExists(superCDS, keyNames[k], myValue, '')
  # Return the validation status
  global errors
  if len(errors) > 0:
    errorFound = True
    if len(errors) < maxErrorDisplay:
      errors_description = "ERRORS: " +', '.join(errors)
    else:
      errors_description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" +', '.join(errors)
  else:
    errors_description = "Validation passed successfully"
return {"description":errors_description, "result":errorFound}