function graph(neurons, connections) {
    x = 0
    y = 0

    data = {
        nodes: [],
        edges: []
    }

    neurons.forEach((neuron) => {
        data.nodes.push(
            {
                id: neuron.id,
                label: neuron.id,
                x: Math.random(),
                y: Math.random(),
                size: 3
            }
        )
        x += 1;
        y += 1;
    });

    e = 1;

    connections.forEach((connection) => {
        data.edges.push(
            {
                id: e,
                source: connection[0],
                target: connection[1],
                type: 'arrow',
                size: 3
            }
        )
        e += 1;
    });

    s = new sigma(
        {
            graph: data,
            container: 'graph-container',
            settings: {
                defaultNodeColor: '#ec5148',
            }
        }
    );

    s.bind('clickNode', (e) => {
        node_id = e.data.node.id;
        neurons[node_id].spike();
    });

    return s;
}