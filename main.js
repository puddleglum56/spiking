class Neuron {
    id;

    constants;

    p_prev;
    p;
    p_in = 0.0; // just at this timestep

    p_synapse = 0;
    synapse_neurons = [];
    in_weights = {};

    presynaptic_spike_buffer = [];
    last_spike_t;

    constructor(id, constants, p_prev, p) {
        this.id = id;
        this.constants = constants;

        this.p_prev = p_prev;
        this.p = p;
    }

    tick() {
        this.p = this.calculate_p(this.p_prev, this.p_in, this.constants.p_min, this.constants.p_thresh, this.constants.p_rest, this.constants.p_refract, this.constants.d);
        if (this.p >= this.constants.p_thresh) {
            this.spike()
        }
        this.p_prev = this.p;
        this.p_in = 0.0;
        this.last_spike_t -= 1;
        this.presynaptic_spike_buffer.forEach((presynaptic_spike, i, presynaptic_spike_buffer) => presynaptic_spike_buffer[i].t -= 1);
    }

    spike() {
        this.p_synapse = 1;

        if (this.presynaptic_spike_buffer.length > 0 && this.last_spike_t) {
            this.update_weights();
            this.remove_old_spikes();
        } 
        this.last_spike_t = 0;
    }

    remove_old_spikes() {
        this.presynaptic_spike_buffer = this.presynaptic_spike_buffer.filter(presynaptic_spike => presynaptic_spike.t > this.last_spike_t);
    }

    update_weights() {
        // const presynaptic_spike = this.find_nearest_neighbor_spike();
        console.log('Presynaptic spike buffer at weight update', this.presynaptic_spike_buffer);
        console.log('Last spike time', this.last_spike_t);
        this.presynaptic_spike_buffer.forEach((presynaptic_spike) => {
            // const dt = presynaptic_spike.t - this.last_spike_t;
            const dt = this.last_spike_t - presynaptic_spike.t;
            console.log('Calculated delta t as', dt);
            const weight_delta = this.weight_delta(dt);
            console.log('Neuron', presynaptic_spike.id,'weight changed by',weight_delta)
            const w_old = this.in_weights[presynaptic_spike.id];
            const new_weight = this.new_weight(weight_delta, w_old);
            this.in_weights[presynaptic_spike.id] = new_weight;
        });
    }

    find_nearest_neighbor_spike() {
        // unused: too complicated, went for all-spike comparison instead
        return min_abs_diff(this.presynaptic_spike_buffer, this.last_spike_t);
    }

    weight_delta(dt) {
        if (dt <= -2) return this.constants.a_minus * Math.exp(dt / this.constants.tau_minus);
        else if (-2 < dt && dt < 2) return 0;
        else if (dt >= 2) return this.constants.a_plus * Math.exp(dt / this.constants.tau_plus);
    }

    new_weight(weight_delta, w_old) {
        if (weight_delta > 0) return w_old + this.constants.o * weight_delta * (this.constants.w_max - w_old);
        else if (weight_delta <= 0) return w_old + this.constants.o * weight_delta * (w_old - this.constants.w_min);
    }

    transmit_spikes() {
        if (this.p_synapse) {
            this.synapse_neurons.forEach((synapse_neuron) => {
                synapse_neuron.receive_spike(this.id, this.p_synapse)
            });
        }
        // reset synapse
        this.p_synapse = 0;
    }

    receive_spike(neuron_id, p_synapse) {
        this.p_in += this.in_weights[neuron_id] * p_synapse;
        this.presynaptic_spike_buffer.push({id: neuron_id, t: 0})
    }

    calculate_p(p_prev, p_in, p_min, p_thresh, p_rest, p_refract, d) {
        if (p_min < p_prev && p_prev < p_thresh){
            return p_in + p_prev - d; 
        } 
        else if (p_prev >= p_thresh) {
            return p_refract;
        }
        else if (p_prev <= p_min) return p_rest;
    }
}

function min_abs_diff(arr, value) {
    min = Math.abs(value - arr[0].t);
    min_i = 0;

    for (i = 1; i < arr.length; i++) {
        abs_diff = Math.abs(value - arr[i].t);
        if (abs_diff < min) {
            min_i = i;
            min = abs_diff;
        }
    }

    return arr[min_i];
}

function add_neuron(neurons) {
    neuron = new Neuron(neurons.length, constants, p_init, p_init);
    neurons.push(neuron);
}

function add_connection(neurons, connection) {
    neuron = neurons[connection[0]];
    synapse_neuron = neurons[connection[1]];
    neuron.synapse_neurons.push(synapse_neuron);
    synapse_neuron.in_weights[neuron.id] = generate_weight();
}

function build_neurons(num_neurons, connections, constants, p_init) {
    var neurons = [];

    for (i = 0; i < num_neurons; i++) {
        add_neuron(neurons);
    }

    connections.forEach((connection) => {
        add_connection(neurons, connection);
    });

    return neurons;
}

function generate_weight() {
    // default synapse weight
    return 1.0;
}

function setup_neurons(num_neurons, connections) {
   p_init = 0.0;
   constants = {
       // spiking parameters
       p_min: -1.0,
       p_thresh: 6.0,
       p_rest: 0.0,
       p_refract: -1.0,
       d: 0.1,

       // learning parameters
       a_plus: 0.2,
       a_minus: -0.6,
       tau_plus: 5,
       tau_minus: 5,
       w_min: 0.5,
       w_max: 3.0,
       o: 0.2,
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
    s.graph.edges().forEach((e) => {
        e.size = 3 * neurons[e.target].in_weights[e.source];
        e.label = neurons[e.target].in_weights[e.source];
    });
    
    s.refresh();
    // next, transmit spikes for the next tick
    neurons.forEach((neuron) => {
        neuron.transmit_spikes()
    });
}

window.onload = () => {
    console.log('Please read README.md!');

    num_neurons = 4;
    connections = [
        [0, 2],
        [1, 2],
        [2, 3],
    ];

    neurons = setup_neurons(num_neurons, connections);
    s = graph(neurons, connections);

    time_step = 500;
    setInterval(() => sim(neurons, s), time_step);
}
