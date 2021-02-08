function setup() {
    createCanvas(500, 500);
}

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
        this.p = calculate_p(this.p_prev, this.p_in, this.constants.p_min, this.constants.p_thresh, this.constants.p_rest, this.constants.d);
        if (this.p >= this.constants.p_thresh) this.spike()
        this.p_prev = this.p;
        this.p_in = 0.0;
    }

    spike() {
        this.p_synapse = 1;
    }

    transmit_spikes() {
        // no logic is required, p_synapse will be 0 until spiked, so blindly add
        this.synapse_neurons.forEach(function(synapse_neuron){
            synapse_neuron.receive_spike(this.id, this.p_synapse)
        });
        // reset synapse
        this.p_synapse = 0;
    }

    receive_spike(neuron_id, p_synapse) {
        this.p_in += in_weights[neuron_id] * p_synapse;
    }

    calculate_p(p_prev, p_in, p_min, p_thresh, p_rest, d) {
        if (p_min < p_prev < p_thresh) return p_in + p_prev - d; 
        else if (p_prev >= p_thresh) p_refract;
        else if (p_prev <= p_min) return p_rest;
    }
}

function generate_weight() {
    return 1.0;
}

function build_neurons(num_neurons, connections, constants, p_init) {
    var neurons = [];

    for (i = 0; i < num_neurons; i++) {
        neuron = Neuron(i, constants, p_init, p_init);
        neurons.push();
    }

    connections.forEach(function(connection) {
        neuron = neurons[connection[0]];
        synapse_neuron = neurons[connection[1]];
        neuron.synapse_neurons.push(synapse_neuron);
        synapse_neuron.in_weights[neuron.id] = generate_weight();
    });

    return neurons;
}

function main() {
   let num_neurons = 4;
   let connections = [
       [0, 2],
       [0, 1],
       [2, 3],
       [3, 0]
   ];

   p_init = 100.0;
   constants = {
       p_min: 100.0,
       p_thresh: 160.0,
       p_rest: 80.0,
       d: 10.0
   }

   neurons = build_neurons(num_neurons, connections, constants, p_init);

   sim_time = 10000;

    for (i = 0; i < sim_time; i++) {
        // first, sum incoming potentials from last tick and decide whether to spike
        neurons.forEach(function(neuron){
            neuron.tick()
        });
        // next, transmit spikes for the next tick
        neurons.forEach(function(neuron){
            neuron.transmit_spikes()
        });
    }
}
