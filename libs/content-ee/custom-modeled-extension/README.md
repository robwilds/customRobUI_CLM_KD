# Custom modeled extension library

The `custom-modeled-extension` library is addressed to support the [user actions](https://www.alfresco.com/abn/process-automation/docs/model/interfaces/#user-interface-modeling) that a modeler user can add to a [UI model](https://github.com/Alfresco/docs-activiti-enterprise/blob/master/docs/modeling/interfaces.md) of type `content`. This [user actions](https://www.alfresco.com/abn/process-automation/docs/model/interfaces/#user-interface-modeling) will be placed in a piece of JSON in the [UI model](https://github.com/Alfresco/docs-activiti-enterprise/blob/master/docs/modeling/interfaces.md) using the ADW's extension mechanism to achieve it.

In this library are included the necessary services to support the different [kind of actions](#supported-actions) that are available, [the components](#form-action-dialog-component) to visualize those actions, and some [rules](#rules) to provide more flexibility to the modeler user to create custom rules by aggregating them.

The extension modeled in the [_alfresco-modeling-app_](https://github.com/Alfresco/hxp-frontend-apps/blob/master/apps/studio-apa/README.md) will be added in ADW by using an [environment variable](#setting-the-APP_CONFIG_CUSTOM_MODELED_EXTENSION) called `APP_CONFIG_CUSTOM_MODELED_EXTENSION`.

For further information on how to create the [user actions](https://www.alfresco.com/abn/process-automation/docs/model/interfaces/#user-interface-modeling) in the [_alfresco-modeling-app_](https://github.com/Alfresco/hxp-frontend-apps/blob/master/apps/studio-apa/README.md), please see the [README](https://github.com/Alfresco/hxp-frontend-apps/blob/develop/libs/studio-apa/ui-editor/README.md) in the [UI library](https://github.com/Alfresco/hxp-frontend-apps/tree/develop/libs/studio-apa/ui-editor) in the [_hxp-frontend-apps_ repository](https://github.com/Alfresco/hxp-frontend-apps).

## Setting the APP_CONFIG_CUSTOM_MODELED_EXTENSION

This variable can be provided in different ways depending on the execution:

- **APA Deployed app**: When an project is deployed using the [_alfresco-deployment-service_](https://github.com/Alfresco/alfresco-deployment-service) in a Kubernete's cluster, the [_alfresco-deployment-service_](https://github.com/Alfresco/alfresco-deployment-service) set the variable to the pod containing ADW with the value of the attribute `extension` of the [UI model](https://github.com/Alfresco/docs-activiti-enterprise/blob/master/docs/modeling/interfaces.md) of type `content` if it is present (if it is not, then the environment variable `APP_CONFIG_CUSTOM_MODELED_EXTENSION` is not created). When the docker image of ADW starts, then the content of the environment variable is copied to the `assets/plugins/custom.modeled.extension.json` file. This copy is done in the `docker/docker-entrypoint.d/30-sed-on-appconfig.sh` [script](../../../docker/docker-entrypoint.d/30-sed-on-appconfig.sh).
- **Local development**: The `APP_CONFIG_CUSTOM_MODELED_EXTENSION` can be set in the `.env` file and the `setup.js` [script](../../../setup.js) will copy the content to the `libs/content-ee/custom-modeled-extension/assets/custom.modeled.extension.json` (this file is git-ignored). The content of the environment variable must be minified, for example;

```code
APP_CONFIG_CUSTOM_MODELED_EXTENSION = "{"$id":"ui-8a3757e3-ea0f-4a85-b4eb-7f9e91ec4254","$name":"test-app","$description":"This is a sample custom modeled extension","$version":"0.0.4","$vendor":"","$license":"","actions":[{"id":"sendNamedEventAction","type":"MODELED_EVENT","payload":{"eventName":"sendNamedEvent"}},{"id":"formAction","type":"MODELED_FORM","payload":{"formDefinitionId":"form-1acf5e67-9f10-482a-a80f-e911e1c4bf97","nodes":"$(context.selection.nodes)"}},{"id":"processAction","type":"MODELED_PROCESS","payload":{"processDefinitionKey":"Process_tYm60y23V","nodes":"$(context.selection.nodes)"}},{"id":"goToAlfresco","type":"MODELED_NAVIGATION","payload":{"target":"https://www.alfresco.com/"}},{"id":"openViewer","type":"MODELED_NAVIGATION","payload":{"target":"personal-files/(viewer:view/${nodes})?location=%2Fpersonal-files","nodes":"$(context.selection.nodes)"}}],"rules":[{"type":"core.every","id":"isContentSelected","parameters":[{"id":"91201c80-d139-45eb-ac35-61ee5fbcfec5","type":"rule","value":"app.selection.notEmpty"}]},{"type":"core.every","id":"isNotTrashCan","parameters":[{"id":"f7613abf-318b-4683-925f-908ea08bcfde","type":"rule","value":"app.navigation.isNotTrashcan"}]}],"features":{"toolbar":[{"title":"Event action","description":"Event action description","icon":"adjust","order":100,"disabled":false,"id":"d560e89f-6858-4f4f-9d83-4173247e65d7","actions":{"click":"sendNamedEventAction"}},{"id":"cb928f17-6466-487a-852e-95f8dda7c6c4","type":"separator","order":102},{"title":"Form action","description":"Form action description","icon":"power_input","order":102,"disabled":false,"id":"687af662-01b1-4685-8aa2-1d1921fafeag","actions":{"click":"formAction"},"rules":{"visible":"isContentSelected","enabled":"isNotTrashCan"}},{"title":"Process action","description":"Process action description","icon":"device_hub","order":103,"disabled":false,"id":"b02de9d4-801c-43b4-b2c0-7a881b9320dd","actions":{"click":"processAction"},"rules":{"visible":"isContentSelected","enabled":"isNotTrashCan"}},{"title":"External navigation action","description":"External navigation action description","icon":"open_in_browser","order":104,"disabled":false,"id":"ab55bb98-9dcb-4de3-908d-3300b3f1693c","actions":{"click":"goToAlfresco"}},{"title":"Internal navigation action","description":"Internal navigation action description","icon":"personal_video","order":105,"disabled":false,"id":"e524b2f6-8764-4e6a-b9f8-9e8403e87596","actions":{"click":"openViewer"},"rules":{"visible":"isContentSelected","enabled":"isNotTrashCan"}}]}}"
```

## Supported actions

There are currently 4 different types of actions that can be modeled in this [_alfresco-modeling-app_](https://github.com/Alfresco/hxp-frontend-apps/blob/master/apps/studio-apa/README.md). The meaning of each one of them is:

- **Navigation**: Will perform a navigation in the user bowser to the target URL. This navigation can be done in the same user tab or creating a new one.
- **Event**: When performed, an user event is thrown with the name of the action. This event can be managed in a [trigger](https://github.com/Alfresco/docs-activiti-enterprise/blob/master/docs/modeling/triggers.md) so an [action](https://github.com/Alfresco/docs-activiti-enterprise/blob/master/docs/modeling/triggers.md#actions) can be performed when it occurs.
- **Form**: When performed, a modal dialog containing the form selected will be displayed to the user. The submitting of the event can be managed in a [trigger](https://github.com/Alfresco/docs-activiti-enterprise/blob/master/docs/modeling/triggers.md), so an [action](https://github.com/Alfresco/docs-activiti-enterprise/blob/master/docs/modeling/triggers.md#actions) can be performed when it occurs.
- **Start process**: When performed, depending on the process:
  - _Start form is present_: If the process has an start form, then a modal dialog is displayed containing the start form. When this form is submitted successfully, a process instance of the process definition selected in the action is created.
  - _No start form_: A process instance of the process definition selected in the action is created.

The `custom-modeled-extension` provides the needed logic for these actions to be performed, but the backend support for all these actions is implemented in the [_alfresco-form-service_](https://github.com/Alfresco/alfresco-form-service).

## Form action dialog component

This library includes a [component](./src/lib/components/form-action-dialog/form-action-dialog.component.ts) to display a form in a modal dialog. The [component](./src/lib/components/form-action-dialog/form-action-dialog.component.ts) receives the form definition identifier and will ask the [_alfresco-form-service_](https://github.com/Alfresco/alfresco-form-service) for the content of that form.

## Rules

This library also provides some rules that can be used by the modeler user to compose his own custom rules by combining them with the other existing rules. For more information about how to create custom rules, please see the rules section in the [README](https://github.com/Alfresco/hxp-frontend-apps/blob/develop/libs/studio-apa/ui-editor/README.md) in the [UI library](https://github.com/Alfresco/hxp-frontend-apps/tree/develop/libs/studio-apa/ui-editor) in the [_hxp-frontend-apps_ repository](https://github.com/Alfresco/hxp-frontend-apps).

The rules available are:
| Name | Description | Arguments | Available operators |
| --- | --- | --- | --- | --- |
| selection.files.type | All the selected files are of the input type | -- | -- |
| selection.files.aspect | All the selected files have the input aspect | -- | -- |
| selection.files.property | All the selected files have the indicated property and their values satisfy the condition | The property to be checked | `equals`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `contains`, `matches` |
| selection.files.name | All the selected files match the condition in their name | -- | `equals`, `contains`, `matches` |
| selection.folders.type | All the selected folders are of the input type | -- | -- |
| selection.folders.aspect | All the selected folders have the input aspect | -- | -- |
| selection.folders.property | All the selected folders have the indicated property and their values satisfy the condition | The property to be checked | `equals`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `contains`, `matches` |
| selection.folders.name | All the selected folders match the condition in their name | -- | `equals`, `contains`, `matches` |
| selection.currentFolder.type | The current folder is of the input type | -- | -- |
| selection.currentFolder.aspect | The current folder has the input aspect | -- | -- |
| selection.currentFolder.property | The current folder has the indicated property and their values satisfy the condition | The property to be checked | `equals`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `contains`, `matches` |
| selection.currentFolder.name | The current folder matches the condition in their name | -- | `equals`, `contains`, `matches` |
