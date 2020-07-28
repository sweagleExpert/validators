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
  keysList = list()
  # {"KeysList" : ["key1","key2","key3"]}
  # JSON format
  # <KeysList>Value</KeysList>
  # XML format
  # ---
  # KeysList: Value
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
    global errors
    errors.append("ERROR: Inputs unexpected!, please provide an object notation (arg). Inputs variables list (args[]) is deprecated.")

# Function to find keys with duplicate values in CDS
def getDuplicateKeyValue(dataset, keyName):
  global errors
  value = "ERROR: NOT FOUND"
  flipped = {}
  # If the number of errors found is reached
  if len(errors) <= maxErrorDisplay:
    if keyName in dataset:
      # Once the key name found into the CDS, search all its values by flipping the dictionary
      for k, v in dataset.items():
        if v not in flipped:
          flipped[v] = [k]
        else:
          # Duplicated K/V found and return it
          flipped[v].append(k)
          errors.append("Key: "+keyName+" contains same value: "+str(flipped))  
    # Search into the CDS the key name
    for k, v in dataset.items():
      # Recursive search in the CDS   
      if isinstance(v,dict):
        item = getDuplicateKeyValue(v, keyName)
        if item is not None: return item
      else:
        return value

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
  global errors
  for i in range(0, len(cds)):
    superCDS = cds[i]
  # For each key name in the list
  for k in range(0, len(keyNames)):
    myValue=getDuplicateKeyValue(superCDS, keyNames[k])
    if myValue is "ERROR: NOT FOUND":
        errors.append(myValue)
  # Return the validation status
  if len(errors) > 0:
    errorFound = True
    if len(errors) < maxErrorDisplay:
      errors_description = "ERRORS: " +', '.join(errors)
    else:
      errors_description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" +', '.join(errors)
else:
   errors_description = "Validation passed successfully"
return {"description":errors_description, "result":not errorFound}