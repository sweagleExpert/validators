## SWEAGLE 
#### Introduction to the VALIDATION parserLogic

This capability allows to validate the content of a pending metadata set using a configurable logic, and return a status result. That logic is basically a javascript snippet that is executed when a validation request or create snapshot request is triggered.
> *validation logic + error description = output*

![](https://s3-us-west-2.amazonaws.com/media.forumbee.com/i/9e748637-e323-4261-96cb-0d8320c5f814/h/547.png)


#####Input
**Metadata set**

The parser logic is always applied on a metadata set. Note that this selection of the metadata set is for testing purpose only. You can switch between any of the assigned metadata sets to "test run" your validation logic. The resulting status is not stored.

The current stored snapshot of the metadata set is used. It is not possible to select an older snapshot version or the pending snapshot of a metadata set.

**Logic**

The supported logic is javascript. The editor provides basic javaScript syntax checking.

The parser logic is applied on a metadata set which is stored as a JSON object. In order to be able to export/access our data from a child node we use recursion. We have a set of parent nodes, we want to access their direct child nodes, then loop over that extended set to find the next level of child nodes, until we find no child nodes any more. That’s exactly what recursion is all about, automatically discovering how many steps need to be done.

**Error description**

The error message that is displayed as the error status for pending metadata sets. This allows you to set a custom error message for every validation logic that is being applied.

#####Output

The output is the result of the logic and must be a boolean (true / false).

It is best practice to apply proper error handling. The parserLogic execution will automatically stop long running javaScript processes (30 seconds).

#####Draft & published

every validation parser logic has 2 "versions": a "draft / editing" version and a "published version".
+ users can save a "work in progress" logic and return to it later. If there is a draft version, then this is automatically loaded when the user enters into the parser configuration screen.
+ published version of the validation parser logic. This is the logic that is applied at the pending metadata when the validation request is launched.

There is no history of published parser logics. When a parser logic gets published, it "overwrites" the current published parser logic and any new validation requests are immediately executed with the new published parser logic.




