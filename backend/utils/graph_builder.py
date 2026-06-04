def build_graph(architecture_data):

    nodes = []

    edges = []

    layers = architecture_data["layers"]

    for layer in layers:

        nodes.append({

            "name": layer["name"],

            "components": layer["components"]
        })

    for i in range(len(nodes) - 1):

        edges.append([
            nodes[i]["name"],
            nodes[i + 1]["name"]
        ])

    return {

        "nodes": nodes,

        "edges": edges
    }