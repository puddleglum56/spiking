function setup() {
    createCanvas(500, 500);
}

class Neuron {
    id;

    constants;

    p_prev;
    p;
    p_in = 0.0;

    spiked = false;
    synapse;
    weight;

    constructor(id, constants, p_prev, p, synapse, weight) {
        this.id = id;
        this.constants = constants;

        this.p_prev = p_prev;
        this.p = p;

        this.synapse = synapse;
        this.weight = weight;
    }

    tick() {
        this.p = p(this.p_prev, this.afferent_spikes, this.afferent_weights, this.constants.p_min, this.constants.p_thresh, this.constants.p_rest, this.constants.d);
        if (this.p >= this.constants.p_thresh) this.spike()
        this.p_prev = this.p;
    }

    spike() {
        this.spiked = true;
    }

    did_spike() {
        did_spike = this.spiked;
        this.spiked = false;
        return did_spike;
    }
}

function add_spikes(afferent_spikes, afferent_weights, p_prev, d) {
    return afferent_spikes.reduce(
        function(total, spike, i) {
            return total + spike * afferent_weights[i]
        }, p_prev - d)
}

function p(p_prev, afferent_spikes, afferent_weights, p_min, p_thresh, p_rest, d) {
    if (p_min < p_prev < p_thresh) return add_spikes(afferent_spikes, afferent_weights, p_prev, d);
    else if (p_prev >= p_thresh) p_refract;
    else if (p_prev <= p_min) return p_rest;
}

function build_neurons(num_neurons, connections, p_init, ) {
    var neurons = [];

    for (i = 0; i < num_neurons; i++) {
        neuron = Neuron(i, constants, )
        neurons.push()
        var afferents = [];
        connections.forEach(function(connection, index) {

        })

    }


}

function main() {
   let num_neurons = 4;
   let connections = [
       [0, 1],
       [0, 2],
       [2, 3],
       [3, 0]
   ]



}
