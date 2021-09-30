### Javascript Spiking Neural Network

Demo: [here](https://puddleglum56.github.io/spiking/)

This is a spiking neural network simulator in Javascript, which simulates the two main components of a spiking neural network:
1. spiking summation and transmission
2. spike timing dependent plasticity

The reason I chose this project was because I wanted to understand the basic neural mechanisms that underpin such large-scale characteristics as memory and learning. I learned that synapses (at least two neurons) themselves are synthetic agents, which can receive input, process it according to synapse weights and membrane potential, and generate output in the form of a spike. I hope this project is a simple demonstration of that.

#### References
This paper helped with a simple implementation of leaky integrate-and-fire (without differential equations) and STDP:
https://link.springer.com/article/10.1186/s13640-015-0059-4

This paper gave me some more understanding of STDP and different methods of approximating it:
https://www.hindawi.com/journals/aans/2016/1746514/

This paper introduces treating neurons as agents in reinforcement learning:
https://arxiv.org/abs/2003.11642


#### Agent description:
Input is carried out by clicking the cell body of one of the neurons. This causes that neuron to spike, and transmit the spike to downstream neurons. Note that you may need to spike multiple times before the downstream neuron spikes.

Learning is implemented in the downstream neuron at every spike *on the last spike*. The reason it is implemented on the last spike is because a given postsynaptic spike has to know about presynaptic spikes leading up to itself (for potentiation) and presynaptic spikes after itself (for depression).

#### Agent behaviors (some things to try):
- You can experiment with potentiation by repeatedly stimulating a neuron until its downstream neuron spikes twice. On the second spike, the weight of the synaptic connection will increase, which is represented by a 'thicker' edge on the graph.
- You can experiment with depression by increasing a weight through potentiation (as above), then repeatedly stimulating a downstream neuron, then stimulating its presynaptic neuron. The weight of the connection will slowly decrease.

#### Modifying the simulation:
The following parameters can be modified in `main.js`, some of the parameters are best understood in the context of [this paper](https://link.springer.com/article/10.1186/s13640-015-0059-4):
- `num_neurons`: Number of neurons in the simulation
- `connection`: List of neural synapses in the format `[presynaptic, postsynaptic]`
- `time_step`: Milliseconds for each frame of the simulation

- `generate_weight`: Initial weight of each synapse
- `p_init`: Initial potential of each neuron
- `p_min`: Minimum neuron potential
- `p_thresh`: Threshold potential beyond which the neuron spikes
- `p_rest`: Resting potential the neuron returns to after refracting
- `p_refract`: Potential the neuron goes to after spiking
- `d`: Potential decreases by this amount every time step

- `a_plus`: Scaling factor for potentiation
- `a_minus`: Scaling factor for depression
- `tau_plus`: Time constant for potentiation
- `tau_minus`: Time constant for depresssion
- `w_min`: Minimum synaptic weight
- `w_max`: Maximum synaptic weight
- `o`: Synaptic weight change scaling factor

#### Bugs:
Sometimes the weight can get very big. I'm not sure why this happens. If this happens, just refresh (restart the simulation).

#### Future directions:
- Interactive network building: ie. click to add neuron, drag for edges
- Interactive parameter changing: ie. a slider for threshold potential
- API: attach network to an embodied agent
- Speed: Optimize and port to WebAssembly, also move things to matrices/GPU


