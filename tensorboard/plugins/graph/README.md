# Graph Dashboard

The Graph dashboard provides a visual representation of a computation graph,
designed for understanding ML models.

## What are graphs?

Programs written with TensorFlow and other frameworks may transform the source
code into a computational graph first, before actually executing the operations.
To illustrate the idea, this short snippet:

```
w = 2
result = sqrt(w)
```

might be represented as a graph with

-   3 nodes: w, sqrt, result
-   2 edges: [w, sqrt], [sqrt, result]

Frameworks such as TF2 allow users to manually annotate functions with the
`@tf.function` decorator to indicate to TensorFlow that a graph should be
created. Other frameworks may require users to explicitly call a utility
function to write an implicitly created graph.

Notably, the graph itself does not contain variable values (e.g. weights),
assets, or signatures (e.g. input and output values).

### Creating a graph

For details guides on creating graphs, please see the docs for
[TensorFlow](https://www.tensorflow.org/guide/intro_to_graphs) or
[PyTorch](https://pytorch.org/docs/stable/tensorboard.html#torch.utils.tensorboard.writer.SummaryWriter.add_graph)

**Saving to an event file**

In TensorFlow 2, wrap a `@tf.function` decorated function with
`tf.summary.trace_on(graph=true)` and `tf.summary.trace_export()`. This will add
the graph data to the event files in the log directory.

```python
@tf.function
def my_func():
  return tf.random.uniform((3, 3))

writer = tf.summary.create_file_writer('logs')
tf.summary.trace_on(graph=True)

my_func()

with writer.as_default():
  tf.summary.trace_export(name="my_func", step=0)
```

In TensorFlow 1, the graph of a session is manually added with `add_graph()`.

```python
writer = tf.summary.FileWriter('logs')
with tf.Session() as sess:
  a = tf.placeholder(tf.float32, shape=(1, 2))

with writer.as_default():
  writer.add_graph(sess.graph)
```

**Saving to Protobuf text format (.pbtxt)**

When a `tf.Graph` or `tf.compat.v1.GraphDef` object is available, it can be
written directly to a file using TensorFlow's
[`tf.io.write_graph()`](See https://www.tensorflow.org/api_docs/python/tf/io/write_graph),
like so:

```python
tf.io.write_graph(graph_or_graphdef, '/tmp/dir', 'my_graph.pbtxt')
```

## Using the dashboard

Graphs can be loaded into TensorBoard by either:

-   Launching `tensorboard --logdir /dir/containing/written_graphs` at a logdir
    with event files containing a graph.
-   Launching TensorBoard, opening the "Graphs" tab, and clicking "Choose file"
    in the left sidepane to upload a *.pbtxt from the filesystem.

The dashboard offers a variety of features, including:

**Inspection**

-   Viewing details, attributes of a selected node by clicking it.
-   Searching for a node by name.
-   A "Trace inputs" mode to highlight all nodes that may have some effect on
    the selected node.
-   Node coloring modes: by structure, device, TPU compatibility, etc.
-   Indicating "size" of output tensors visually with thicker edges.

**Organization**

-   Expand and collapse group nodes.
-   Organize nodes automatically by name. TensorBoard uses the "/" forward slash
    in node names to determine node groups.
-   Manually extracting a node from the graph area by clicking 'Remove from main
    graph' in the info pane.
-   Automatically grouping repeated nodes into a single series node, e.g.
    "adder_1, adder_2, adder_3" into "adder_[1-3]".

## Technical details

Note: This section documents technical details for contributors. Implementation
is subject to change.

Readers interested in the history of the Graph dashboard may wish to read the
original
[publication](http://idl.cs.washington.edu/files/2018-TensorFlowGraph-VAST.pdf)
describing the motivations, research, and process behind it.

The `tensorboard/plugins/graph/tf_graph_*` directories contain the frontend
code, while most of the non-view related processing and core types are defined
in `tensorboard/plugins/graph/tf_graph_common`. This document is not exhaustive,
but will highlight important components of graph processing and cover the
following lifecycle:

-   Loading graph data into runtime
-   Parsing the graph data
-   Processing an internal representation
