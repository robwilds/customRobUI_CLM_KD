This folder is used to store all assets that are going to be used in the rob-plugin plugin. The assets are going to be copied to the dist folder when the application is built.

The configuration for assets is located in the `project.json` file of the application:

```
{
    "input": "libs/plugins/rob-plugin/assets",
    "output": "assets/rob-plugin",
    "glob": "**/*"
}
```

In order to use an asset, you need to add it to this folder and reference it by path `assets/rob-plugin/<asset-name>`. For example, an image 'example-image.png' should be referenced as `assets/rob-plugin/example-image.png`.

You can also create your own subfolders to organize your assets, but you need to remember to reference them correctly in the path.
