class Neuron {
    id;

    constants;

    p_prev;
    p;
    p_in = 0.0; // just at this timestep

    p_synapse = 0;
    synapse_neurons = [];
    in_weights = {};

    constructor(id, constants, p_prev, p) {
        this.id = id;
        this.constants = constants;

        this.p_prev = p_prev;
        this.p = p;
    }

    tick() {
        this.p = this.calculate_p(this.p_prev, this.p_in, this.constants.p_min, this.constants.p_thresh, this.constants.p_rest, this.constants.p_refract, this.constants.d);
        if (this.p >= this.constants.p_thresh) this.spike()
        this.p_prev = this.p;
        this.p_in = 0.0;
    }

    spike() {
        console.log(this.id);
        this.p_synapse = 1;
    }

    transmit_spikes() {
        // no logic is required, p_synapse will be 0 until spiked, so blindly add
        if(this.p_synapse > 0) console.log('transmit');
        this.synapse_neurons.forEach((synapse_neuron) => {
            synapse_neuron.receive_spike(this.id, this.p_synapse)
        });
        // reset synapse
        this.p_synapse = 0;
    }

    receive_spike(neuron_id, p_synapse) {
        this.p_in += this.in_weights[neuron_id] * p_synapse;
        if(p_synapse > 0) {
            console.log(this.p_in);
        }
    }

    calculate_p(p_prev, p_in, p_min, p_thresh, p_rest, p_refract, d) {
        console.log(this.id, p_prev);
        if (p_min < p_prev && p_prev < p_thresh){
            return p_in + p_prev - d; 
        } 
        else if (p_prev >= p_thresh) {
            console.log('spiked');
            return p_refract;
        }
        else if (p_prev <= p_min) return p_rest;
    }
}

function generate_weight() {
    return 3.0;
}

function build_neurons(num_neurons, connections, constants, p_init) {
    var neurons = [];

    for (i = 0; i < num_neurons; i++) {
        neuron = new Neuron(i, constants, p_init, p_init);
        neurons.push(neuron);
    }

    connections.forEach((connection) => {
        neuron = neurons[connection[0]];
        synapse_neuron = neurons[connection[1]];
        neuron.synapse_neurons.push(synapse_neuron);
        synapse_neuron.in_weights[neuron.id] = generate_weight();
    });

    return neurons;
}

function setup_neurons(num_neurons, connections) {
   p_init = 0.0;
   constants = {
       p_min: -1.0,
       p_thresh: 2.0,
       p_rest: 0.0,
       p_refract: -1.0,
       d: 0.1
   }

   neurons = build_neurons(num_neurons, connections, constants, p_init);

   return neurons;
}

function sim(neurons, s) {
    // first, sum incoming potentials from last tick and decide whether to spike
    neurons.forEach((neuron) => {
        neuron.tick()
    });
    s.graph.nodes().forEach((n) => {
        if(neurons[n.id].p_synapse > 0) n.color = '#eee'
        else n.color = '#ec5148'
    });
    s.refresh();
    // next, transmit spikes for the next tick
    neurons.forEach((neuron) => {
        neuron.transmit_spikes()
    });
}

window.onload = () => {
    num_neurons = 8;
    connections = [
        [1, 0],
        [0, 2],
        [2, 3],
        [6, 3],
        [7, 6],
        [5, 7],
        [4, 5],
        [1, 4],
        [3, 1],
        [6, 4]
    ];

    neurons = setup_neurons(num_neurons, connections);
    s = graph(neurons, connections);

    time_step = 1000;
    setInterval(() => sim(neurons, s), time_step);
}
