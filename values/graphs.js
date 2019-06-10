class Digraph {
	constructor() {
		this.nodes = {};
	}
	addNode(node) {
		this.nodes[node] = [];
	}

	addEdge(node1, node2) { // From node1 to node2
		if (!(node1 in this.nodes)) {
			this.nodes[node1] = [];
		}
		this.nodes[node1].push(node2);
		if (!(node2 in this.nodes)) {
			this.nodes[node2] = [];
		}
	}

	removeEdge(node1, node2) {
		if (node1 in this.nodes) {
			var new_nodes = [];
			for (let node of this.nodes[node1]) {
				if (node != node2) {
					new_nodes.push(node);
				}
			}
			this.nodes[node1] = new_nodes;
		}
	}

	removeNode(node) {
		var nodes = this.getNodes();
		for (var i = 0; i < nodes.length; i++) {
			if (this.getEdges(nodes[i]).includes(node)) {
				this.removeEdge(nodes[i], node);
			}
		}
		delete this.nodes[node];
	}

	getGraph() {
		return this.nodes;
	}

	getEdges(node) {
		return this.nodes[node];
	}

	getNodes() {
		return Object.keys(this.nodes);
	}


	display(canvas) {
		canvas = document.getElementById("graphdisplay");
		var ctx = canvas.getContext("2d");

		ctx.font = '20pt Calibri';
		ctx.fillStyle = 'black';
		ctx.textAlign = 'center';
		ctx.fillText("Quiz-Based Graph", canvas.width/2, 50);

		var node_keys = Object.keys(this.nodes);
		var radius = 250;
		var node_radius = 50;
		var angle_per_node = 2 * Math.PI / node_keys.length;

		var node_positions = {};
		for (var i = 0; i < node_keys.length; i++) {
			node_positions[node_keys[i]] = [parseInt((canvas.width / 2) + radius * Math.cos(i * angle_per_node)), parseInt((canvas.height / 2) + radius * Math.sin(i * angle_per_node))];
			ctx.beginPath();
			ctx.arc(node_positions[node_keys[i]][0],node_positions[node_keys[i]][1], node_radius, 0, 2 * Math.PI);
			var darkness = (this.getEdges(node_keys[i]).length + 1) * (205 / node_keys.length) + 50;
			ctx.fillStyle = 'rgb('+darkness+','+darkness+','+darkness+')';
			ctx.fill();

			ctx.stroke();
			ctx.font = '10pt Calibri';
			ctx.fillStyle = 'black';
			ctx.textAlign = 'center';
			ctx.fillText(node_keys[i], node_positions[node_keys[i]][0], node_positions[node_keys[i]][1]);


		}
		for (let node of this.getNodes()) {
			for (let edge of this.getEdges(node)) {
				canvas_arrow(ctx, node_positions[node][0], node_positions[node][1], node_positions[edge][0], node_positions[edge][1]);
				ctx.stroke();
			}

		}
	}


	findSubgraphs() {
		var graphs = [];
		var nodes = this.getNodes();
		for (var i = 0; i < nodes.length; i++) {
			var graph = new Digraph();
			for (var j = 0; j < nodes.length; j++) {
				this.getEdges(nodes[j]).forEach(function(edge) {
					graph.addEdge(nodes[j], edge);
				});
			}
			graph.removeNode(nodes[i]);
			graphs.push(graph);
		}
		return graphs;
	}

}

function canvas_arrow(context, fromx, fromy, tox, toy){
	var headlen = 10;   // length of head in pixels
	var ball_radius = 50;
	var angle = Math.atan2(toy-fromy,tox-fromx);
	context.moveTo(fromx + Math.cos(angle) * ball_radius, fromy + Math.sin(angle) * ball_radius);
	var finalx = tox - Math.cos(angle) * ball_radius; // RELIES ON RADIUS OF CIRCLE
	var finaly = toy - Math.sin(angle) * ball_radius;
	context.lineTo(finalx, finaly);
	context.lineTo(finalx-headlen*Math.cos(angle-Math.PI/6),finaly-headlen*Math.sin(angle-Math.PI/6));
	context.moveTo(finalx, finaly);
	context.lineTo(finalx-headlen*Math.cos(angle+Math.PI/6),finaly-headlen*Math.sin(angle+Math.PI/6));
}


function findCycles(input_graph) {

	var number_cycles = [];
	
	function backtrack(node, flag, s) {
		flag = false;

		point_stack.push(node);
		marked_stack.push(node);
		marked[node] = true;

		var edges = graph.getEdges(node);
		for (var i = 0; i < edges.length; i++) {
			var w = edges[i];
			if (w < s) {
				graph.removeEdge(node, w);
			} else if (w === s) {
				number_cycles.push([...point_stack]);
				flag = true;
			} else if (marked[w] == false) {
				var g_flag = false; 
				backtrack(w, g_flag, s);
				flag = flag || g_flag;
			}
		}
		if (flag) {
			while (marked_stack[marked_stack.length-1] != node) {
				var u = marked_stack.pop();
				marked[u] = false;
			}
			marked_stack.splice(marked_stack.indexOf(node), 1);
			marked[node] = false;
		}
		point_stack.splice(point_stack.indexOf(node), 1);
	}

	// Making copy of graph so that we can delete nodes later
	// Also, assigning numbers to each node in the graph because Tarjan's algorithm is easier to implement with a digraph composed of numbers for nodes.
	var nodes = input_graph.getNodes();
	var graph = new Digraph();
	var number_dict = {};
	var inverse_dict = {};
	for (var i = 0; i < nodes.length; i++) {
		number_dict[nodes[i]] = i;
		inverse_dict[i] = nodes[i]
	}

	for (var i = 0; i < nodes.length; i++) {
		input_graph.getEdges(nodes[i]).forEach(function(edge) {
			graph.addEdge(number_dict[nodes[i]], number_dict[edge]);
		});
	}

	// Setting up datastructures
	var flag = false;
	var marked = {};
	var point_stack = [];
	var marked_stack = [];

	var nodes = graph.getNodes();
	nodes.forEach(function(node) {
		marked[node] = false; 
	});

	for (var s = 0; s < nodes.length; s++) {
		backtrack(s, flag,  s);
		while (marked_stack.length > 0) {
			var u = marked_stack.pop();
			marked[u] = false;
		}
	}

	var cycles = [];


	for (var i = 0; i < number_cycles.length; i++) {
		cycles.push([]);
		for (var j = 0; j < number_cycles[i].length; j++) {
			cycles[i].push(inverse_dict[number_cycles[i][j]]);
		}
	}


	return cycles;
}



/*
$(document).ready(function() {
	testgraph = new Digraph();
	testgraph.addEdge("2", "1");
	testgraph.addEdge("3", "1");
	testgraph.addEdge("1", "4");
	testgraph.addEdge("3", "2");
	testgraph.addEdge("2", "4");
	testgraph.addEdge("4", "3");

	testgraph.display($("#graphdisplay"));
});
*/



