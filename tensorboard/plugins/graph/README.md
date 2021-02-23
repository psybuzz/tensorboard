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

Communicating the inner workings of the Graph dashboard requires introducing
some dashboard-specific concepts used throughout the web frontend code. Much of
this terminology comes from
[existing literature](https://www.cs.ubc.ca/labs/imager/tr/2008/Archambault_GrouseFlocks_TVCG/grouseFlocksSub.pdf).

Glossary

-  **GraphDef**: Tied to TensorFlow's [graph.proto](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/core/framework/graph.proto)
-  **NodeDef / RawNode**: Tied to TensorFlow's [node_def.proto](https://github.com/tensorflow/tensorflow/blob/master/tensorflow/core/framework/node_def.proto)
-  **OpNode**: The result of 'normalizing' a raw NodeDef.
-  **BaseEdge**: An edge between two OpNodes.
-  **SlimGraph**: A lightweight structure containing OpNodes and BaseEdges.
-  **MetaNode**: A node that may contain other OpNodes or MetaNodes as children.
-  **MetaEdge**: An edge between two OpNode/MetaNodes.
-  **Hierarchy / GraphHierarchy / HierarchyImpl**: A heavy internal structure storing the graph's root, an index of all nodes/metanodes for quick lookup, and various other stats that are expensive to compute.
-  **Cluster**: This refers to a group of 'similar' OpNodes or MetaNodes, depending on the context. When discussing OpNodes only, this usually refers to a set of OpNodes which all share the same 'op' property. In other contexts, a cluster may be a group of MetaNodes who all have a similar subgraph structure.
-  **Level**: distance from the node to the artificial root node. Top-level metanodes have level 0, and going deeper increases the level. Can be determined from counting '/' slash occurences in a node name.
-  **Depth**: distance to the node to its bottom-most leaf descendant. A MetaNode, containing only 1 child OpNode, has depth 1.
-  **RenderHierarchy / RenderGraphInfo / RenderGraph**: A structure storing rendering information, including x/y coordinates for each node.
-  **SubHierarchy**: TODO
-  **BridgeGraph**: TODO

Special types
- Reference edge: an edge to an operation that takes a 'reference' to its input and changes its value. Examples: `Assign`, `AssignAdd`, `ScatterAdd`.
- Control dependency / Control edge: an edge to an operation that is a control dependency. In TF1, control dependencies are added manually by users to enforce the order of execution of 2 branches in a graph, when the order would otherwise be ambiguous. See this [example post](https://stackoverflow.com/questions/55094952/understanding-tensorflow-control-dependencies), official [docs](https://www.tensorflow.org/api_docs/python/tf/control_dependencies), and the [TF2 guide](https://www.tensorflow.org/guide/effective_tf2). In TF2, the framework automatically determines control dependencies without user annotations when using eager execution.
- Embedding node / in-embedding / out-embedding: nodes that TensorBoard considers visually less significant in the graph. In-embeddings refer to 'Const' op nodes, while Out-embeddings refers to 'Summary' op nodes. Both commonly appear in programs as a dangling input or output. TensorBoard's Graph dashboard automatically treats these nodes differently by making them visually smaller, and attaches them 'to the side' of their neighbor nodes.
