# Developing a TensorBoard plugin

## Overview

You know (and, we hope, love!) TensorBoard’s core features like the scalar dashboard, the graph explorer, and the embedding projector. However, in every TensorBoard user’s life, there comes a time when they want some cool new visualization that just…doesn’t exist yet. That’s what the TensorBoard plugin system is for.

This document will explain high level concepts using the example plugin and provide guidelines on plugin authorship. To get started with an example, jump to the [Local Development](#local-development) section.

A plugin is comprised of three components:

  - The **Backend** is where you write Python code that does post-processing of your data and serves the data to your plugin frontend in the browser.
  - The **Frontend** is where your custom visualization lives.
  - The optional **Summary** component is how users of your plugins will write data that your plugin can read from their TensorFlow programs.

### Backend: How the plugin processes data, and sends it to the browser

Here are concepts related to plugin loading:
  - `TBPlugin`: 
  - `TBLoader`: return None to make TensorBoard ignore this Plugin
  
Plugin definition

class MyPlugin(TBPlugin)
  __init__(self, TBContext):
  override get_plugin_apps, is_active, frontend_metadata
class MyPlugin(TBLoader)
  override define_flags, fix_flags
  override load(context): # create and return TBPlugin instance



Plugin lifecycle

Discovery
Optional: Instantiate the loader, Parse & Fix flags
Plugin load, route setup
---Web browser session created---
plugin.frontend_metadata(), plugin.is_active()
---plugin opened via user gesture, if not already---
frontend creates iframe, loads module, calls render()
your custom FE requests data at your defined routes (/greetings)
---backend: your plugin handles the request for data---
tensor_util.make_ndarray((self._multiplexer.Tensors(run, tag)).tensor_proto)





User runs `tensorboard --logdir=...`
Scans for Python entry points with key 'tensorboard_plugins'
For each spec,
if TBLoader instance,
if TBLoader class, construct an instance
if TBPlugin class, nothing
Now we have a loader.

Configure plugins
if a Loader was defined,
  loader.define_flags(serve_parser)
  @param {serve_parser}
  see https://docs.python.org/library/argparse.html#adding-arguments
  It's recommended that plugins call the `parser.add_argument_group(plugin_name)`

  apply flags / use the flag parser

  loader.fix_flags(flags)
  Ideally used to force TensorBoard to quit (e.g. parser found invalid values)
    Allows flag values to be corrected or validated after parsing.
    Args:
      flags: The parsed argparse.Namespace object.
    Raises:
      base_plugin.FlagsError: If a flag is invalid or a required
          flag is not passed.



Start server
for each plugin
if it was a TBLoader
  plugin = loader.load(TBContext)
elif TBPlugin
  plugin = TBPlugin_class(TBContext)
TB ignores if result is None

wsgi_app = plugin.get_plugin_apps()
# setup routes

What can a plugin do?  How does it actually get data from log files?
TBContext.multiplexer
  PluginRunToTagToContent(plugin_name)
    @param plugin_name
    @return tag_to_content Dict<>
  SummaryMetadata(run, tag)
    @param run string
    @param tag string
    @return {summary_description: ???}
  Runs
    @return List of 
  Tensors
    @param run string
    @param tag string
    @return event {tensor_proto: ???}

TBContext.logdir as string



"I just want scalars"
Turns out /scalars can return json or csv!  Why CSV???
Oh, when downloading from UI, users can request CSV format

Really, it's [Wall time, Step, value]

Scalars works by:
if data_provider
  data_provider.read_scalars().get(run, {}).get(tag, None)
elif db_provider
  cursor = db_provider().execute()
  [...]
else
  multiplexer.Tensors(run, tag)
  [...]











Each time a user opens a new tab or reloads a TB browser session, the frontend requests plugins

on request, backend will say,
for each plugin,
data = plugin.frontend_metadata()
    disable_reload: Whether to disable the reload button and
        auto-reload timer. A `bool`; defaults to `False`.

    # TODO drop this one
    element_name: For legacy plugins, name of the custom element
        defining the plugin frontend: e.g., `"tf-scalar-dashboard"`.
        A `str` or `None` (for iframed plugins). Mutually exclusive
        with `es_module_path`.

    es_module_path: ES module to use as an entry point to this plugin.
        A `str` that is a key in the result of `get_plugin_apps()`, or
        `None` for legacy plugins bundled with TensorBoard as part of
        `webfiles.zip`. Mutually exclusive with legacy `element_name`
    remove_dom: Whether to remove the plugin DOM when switching to a
        different plugin, to trigger the Polymer 'detached' event.
        A `bool`; defaults to `False`.
    tab_name: Name to show in the menu item for this dashboard within
        the navigation bar. May differ from the plugin name: for
        instance, the tab name should not use underscores to separate
        words. Should be a `str` or `None` (the default; indicates to
        use the plugin name as the tab name).


data.enabled = plugin.is_active()

On the frontend, if inactive, it will not be shown by default in the tab strip




Normally, TB has both a data provider and a multiplexer





Definitions can be found in [base_plugin.py](https://github.com/tensorflow/tensorboard/blob/master/tensorboard/plugins/base_plugin.py)

TBLoader
- define_flags
- fix_flags

`BasicLoader`

Defining a custom loader is optional. Loaders can define command-line flags that can be parsed by your plugin when users call `tensorboard --logdir=<logdir> --custom_flag=<foo>`

```python
class MyLoader(TBLoader):
  @optional
  def define_flags(self, parser):

  @optional
  def fix_flags(self, flags):

  def load(self, context):
```

or

```python
class MyPlugin(TBPlugin):
  def __init__(self):
  def define_flags(self, parser):
  def fix_flags(self, flags):
```

TensorBoard detects plugins using the [Python `entry_points` mechanism][entrypoints-spec]; see [the example plugin’s `setup.py`][entrypoints-declaration] for an example of how to declare a plugin to TensorBoard. The plugin backend is responsible for providing information about its frontend counterpart, serving frontend resources, and surfacing necessary data to the frontend by implementing routes (endpoints). You can start building the backend by subclassing `TBPlugin` in [`base_plugin.py`] (if your plugin does non-trivial work at the load time, consider using `TBLoader`). It must have a `plugin_name` (please refer to [naming](#guideline_on_naming_and_branding) section for naming your plugin) class attribute and implement the following methods:

  - `is_active`: This should return whether the plugin is active (whether there exists relevant data for the plugin to process). TensorBoard will hide inactive plugins from the main navigation bar. We strongly recommend this to be a cheap operation.
  - `get_plugin_apps`: This should return a `dict` mapping route paths to WSGI applications: e.g., `"/tags"` might map to `self._serve_tags`.
  - `define_flags`: Optional method needed to expose command-line flags. Please prefix flags with the name of the plugin to avoid collision.
  - `fix_flags`: Optional method needed to fix or sanitize command-line flags.

If active, it is active the entire session, whether dashboard is visible or not?


[entrypoints-spec]: https://packaging.python.org/specifications/entry-points/
[entrypoints-declaration]: https://github.com/tensorflow/tensorboard/blob/373eb09e4c5d2b3cc2493f0949dc4be6b6a45e81/tensorboard/plugins/example/setup.py#L31-L35
[`base_plugin.py`]: https://github.com/tensorflow/tensorboard/blob/master/tensorboard/plugins/base_plugin.py

On instantiation, a plugin is provided a [`PluginEventMultiplexer`] object from which to read data. The `PluginRunToTagToContent` method on the multiplexer returns a dictionary containing all run–tag pairs and associated summary metadata for your plugin. For more information about summaries, please refer to the relevant section below.

Plugins are not technically restricted from arbitrary file system and network access, but we strongly recommend using the multiplexer exclusively. This abstracts over the filesystem (local or remote), provides a consistent user experience for runs and tags across plugins, and is optimized for TensorBoard read patterns.

[`PluginEventMultiplexer`]: https://github.com/tensorflow/tensorboard/blob/master/tensorboard/backend/event_processing/plugin_event_multiplexer.py

### Frontend: How the plugin visualizes your new data

Now that we have an API, it’s time for the cool part: adding a visualization.

TensorBoard does not impose any framework/tool requirements for building a frontend—you can use React, Vue.js, jQuery, DOM API, or any new famous frameworks and use, for example, Webpack to create a JavaScript bundle. TensorBoard only requires an [ES Module] that is an entry point to your frontend ([example ES module][example-es-module]). Do note that all frontend resources have to be served by the plugin backend ([example backend][example-backend])

[ES Module]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/
[example-es-module]: https://github.com/tensorflow/tensorboard/blob/373eb09e4c5d2b3cc2493f0949dc4be6b6a45e81/tensorboard/plugins/example/tensorboard_plugin_example/static/index.js#L16
[example-backend]: https://github.com/tensorflow/tensorboard/blob/373eb09e4c5d2b3cc2493f0949dc4be6b6a45e81/tensorboard/plugins/example/tensorboard_plugin_example/plugin.py#L45

Consistency in user interface and experience, we believe, is important for happy users; for example, a run selection should be consistent for all plugins in TensorBoard. TensorBoard will provide a library that helps you build a dashboard like Scalars dashboard by providing UI components. Below are components we _will_ provide as a library that can be bundled into your frontend binary (please follow [issue #2357][dynamic-plugin-tracking-bug] for progress):

[dynamic-plugin-tracking-bug]: https://github.com/tensorflow/tensorboard/issues/2357

- `tf-dashboard-layout`: A custom element that makes it easy to set up a sidebar section and main section within TensorBoard. The sidebar should hold configuration options, and the run selector.
- `tf-runs-selector`: A custom element to enable or disable various runs in the TensorBoard frontend.

### Summaries: How the plugin gets data

Your plugin will need to provide a way for users to log **summaries**, which are the mechanism for getting data from a TensorFlow model to disk and eventually into your TensorBoard plugin for visualization. For example, the example plugin provides a novel [“greeting” TensorFlow op][greeting-op] that writes greeting summaries. A summary is a protocol buffer with the following information:

  - tag: A string that uniquely identifies a data series, often supplied by the user (e.g., “loss”).
  - step: A temporal index (an integer), often batch number of epoch number.
  - tensor: The actual value for a tag–step combination, as a tensor of arbitrary shape and dtype (e.g., `0.123`, or `["one", "two"]`).
  - metadata: Specifies [which plugin owns the summary][owner-identifier], and provides an arbitrary plugin-specific payload.

[greeting-op]: https://github.com/tensorflow/tensorboard/blob/373eb09e4c5d2b3cc2493f0949dc4be6b6a45e81/tensorboard/plugins/example/tensorboard_plugin_example/summary_v2.py#L28-L48
[owner-identifier]: https://github.com/tensorflow/tensorboard/blob/373eb09e4c5d2b3cc2493f0949dc4be6b6a45e81/tensorboard/plugins/example/tensorboard_plugin_example/summary_v2.py#L64

## Guideline on naming and branding

We recommend that your plugin have an intuitive name that reflects the functionality—users, seeing the name, should be able to identify that it is a TensorBoard plugin and its function. Also, we recommend that you include the name of the plugin as part of the Pip package. For instance, a plugin `foo` should be distributed in a Pip package named `tensorboard_plugin_foo`.

A predictable package naming scheme not only helps users find your plugin, but also helps you find a unique plugin name by surveying PyPI. TensorBoard requires that all loaded plugins kave unique names. However, the plugin name can differ from the [user-facing display name][display-name]; display names are not strictly required to be unique.

[display-name]: https://github.com/tensorflow/tensorboard/blob/373eb09e4c5d2b3cc2493f0949dc4be6b6a45e81/tensorboard/plugins/base_plugin.py#L35-L39

Lastly, when distributing a custom plugin of TensorBoard, we recommend that it be branded as “Foo for TensorBoard” (rather than “TensorBoard Foo”). TensorBoard is distributed under the Apache 2.0 license, but the name itself is a trademark of Google LLC.

## Local Development

To get started right away, copy the directory `tensorboard/examples/plugins/example_basic` into a desired folder and, in a virtualenv with TensorBoard installed, run:

```
python setup.py develop
```

This will link the plugin into your virtualenv. Then, just run

```
tensorboard --logdir /tmp/whatever
```

and open TensorBoard to see the plugin’s “hello world” screen.

After making changes to the Python code, you must restart TensorBoard for your changes to take effect. The example plugin serves web assets at runtime, so changes reflected upon reloading the page.

To uninstall, you can run

```
python setup.py develop --uninstall
```

to unlink the plugin from your virtualenv, after which you can also delete the `tensorboard_plugin_example.egg-info/` directory that the original `setup.py` invocation created.

## Distribution

A plugin should be distributed as a Pip package, and may be uploaded to PyPI. Please follow the [PyPI distribution archive upload guide][pypi-upload] for more information.

[pypi-upload]: https://packaging.python.org/tutorials/packaging-projects/#uploading-the-distribution-archives
