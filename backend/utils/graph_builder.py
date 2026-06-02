def build_graph(architecture_data):

    layers = architecture_data["layers"]

    nodes = []

    edges = []

    for layer in layers:

        nodes.append(layer["name"])

    for i in range(len(nodes) - 1):

        edges.append([
            nodes[i],
            nodes[i + 1]
        ])

    return {
        "nodes": nodes,
        "edges": edges
    }
