// Initializing all the data storage variables
var comparison_value_graph = new Digraph();

var value_list = [];
const personal_value_list = ["Authenticity", "Curiosity", "Responsibility", "Knowledgeability", "Wiseness", "Activeness", "Positivity", "Lovingness"];
const political_value_list = ["Environment","Healthcare","Immigration","Education","Trade", "High Tax"];


var draggable_comparison = []; 

var value_comparisons = []; 
var past_value_comparisons = [];

var need_to_save_values = false;
var have_saved_values = false;
var have_taken_quiz = false;
var started_comparison = false;
var upload_vh = false;

function HandleRadioButton() {
	var radioValue = $("input[name='value-type']:checked").val();

	switch (radioValue) {
		case "personal": 
			value_list = personal_value_list;
			break;
		case "political": 
			value_list = political_value_list;
			break;
		default: 
			alert("Something went wrong! Please reload the page.");
			break;
	}
	if (draggable_comparison.length == 0) {
		draggable_comparison = ShuffleArray(value_list);
	}
	if (value_comparisons.length == 0) {
		value_comparisons = ShuffleArray(GetCombinations(value_list));
	}
}

$(document).ready(function() {

	$( ".completed-dragging" ).hide();
	$( ".completed-comparison" ).hide();
	$( ".completed-both" ).hide();

	var vh_list = $( "#dragging-list" );
	vh_list.sortable();
	vh_list.disableSelection();

	HideAllOtherPages($( "#main-page"));
		

	$( ".ordering-test" ).click(function () {
		HandleRadioButton();
		UpdateButtons();
		need_to_save_values = true;
		have_saved_values = true;
		HideAllOtherPages($( "#ordering-page"));

		PopulateList(draggable_comparison, vh_list);
		
	});

	$( ".comparison-test" ).click(function () {
		HandleRadioButton();
		UpdateButtons();
		HideAllOtherPages($( "#comparison-instructions"));
		$( "#comparison-page" ).show();
		if (need_to_save_values) {
			draggable_comparison = ReadFromList(vh_list);
			need_to_save_values = false;
		}
		
		
	});

	$( ".back-to-main" ).click(function () {
		UpdateButtons();
		HideAllOtherPages($( "#main-page" ));
		if (need_to_save_values) {
			draggable_comparison = ReadFromList(vh_list);
			need_to_save_values = false;
		}
	});

	$( ".export" ).click(function () {
		Download("compared_values.json", JSON.stringify(comparison_value_graph.getGraph()));
	});

	$( ".begin-comparison-test" ).click(function () {
		UpdateButtons();

		upload_vh = confirm("If you click ok, you consent to anonymously uploading your value hierarchy to a database so we can perform interesting analysis. If you hit cancel, we won't do anything with your data, and you can still take the test. Either way, it's anonymous.");

		HideAllOtherPages($( "#comparison-body"));
		$( "#comparison-page" ).show();
		started_comparison = true;
		have_taken_quiz = true;

		value_comparison = ShuffleArray(value_comparisons.pop());
		UpdateValues(value_comparison);
			
			
	});

	$( ".go-to-analysis" ).click(function() {
		UpdateButtons();
	
		HideAllOtherPages($( "analysis-page"));
		Analysis();
	});

});

$(document).keydown(function(e) {
	if (started_comparison) {
		switch(e.which) {
			case 37: 
				HandleComparison("L");
				break;
			case 38:
				HandleComparison("U");
				break;
			case 39: 
				HandleComparison("R");
				break;
			case 40: 
				HandleComparison("D");
				break;
			case 72: 
				HandleComparison("L");
				break;
			case 74: 
				HandleComparison("D");
				break;
			case 75:
				HandleComparison("U");
				break;
			case 76: 
				HandleComparison("R");
				break;


			default: return; // exit this handler for other keys
		}
	}
	e.preventDefault(); // prevent the default action (scroll / move caret)
});

// var value_comparisons;
// var past_value_comparisons = [];

var value_comparison = [];

function HandleComparison(user_choice) {
	var reverse = false;
	switch (user_choice) {
		case "L":
			comparison_value_graph.addEdge(value_comparison[0], value_comparison[1]);
			break;
		case "R":
			comparison_value_graph.addEdge(value_comparison[1], value_comparison[0]);
			break;
		case "D":
			break;
		case "U":
			reverse = true;

			break;
		default:
			break;
	}

	if (reverse && past_value_comparisons.length != 0) {
		value_comparisons.push(value_comparison);
		value_comparison = past_value_comparisons.pop();
		comparison_value_graph.removeEdge(value_comparison[0], value_comparison[1])
		comparison_value_graph.removeEdge(value_comparison[1], value_comparison[0])
	} else {
		if (value_comparisons.length == 0) {
			started_comparison = false;


			Analysis();

		} else {
			past_value_comparisons.push(value_comparison);
			value_comparison = ShuffleArray(value_comparisons.pop());
		}
	}

	AnimateSelection(user_choice);
}

function UpdateButtons() {
	if (have_saved_values && !have_taken_quiz) {
		$( ".incomplete-comparison" ).show();
		$( ".completed-dragging" ).show();
		$( ".completed-comparison" ).hide();
		$( ".completed-both" ).hide();
	} else if (!have_saved_values && have_taken_quiz) {
		$( ".incomplete-comparison" ).hide();
		$( ".completed-dragging" ).hide();
		$( ".completed-comparison" ).show();
		$( ".completed-both" ).hide();
	} else if (have_saved_values && have_taken_quiz) {
		$( ".incomplete-comparison" ).hide();
		$( ".completed-both" ).show();
		$( ".completed-comparison" ).hide();
		$( ".completed-dragging" ).hide();
	
	}
}

function SendGraph() {
	$.ajax({
		type: "POST",
		url: "http://finnboire.xyz",
		dataType: "json",
		data:comparison_value_graph.getGraph()
	});
}

function Analysis() {
	$( "#comparison-page" ).hide();
	$( "#analysis-page" ).show();
	UpdateButtons();

	var canvas = document.getElementById("graphdisplay");	
	comparison_value_graph.display(canvas);

	// First way of forming a transitive list from the comparison graph:
	var node_lengths_dict = {};
	for (let node of comparison_value_graph.getNodes()) {
		node_lengths_dict[node] = comparison_value_graph.getEdges(node).length;
	}

	var node_lengths = Object.keys(node_lengths_dict).map(function(node) {
		return [node, node_lengths_dict[node]];
	});	

	node_lengths.sort(function(node1, node2) {
		return node2[1] - node1[1]; 
	});

	var transitive_comparison = [];
	for (let node of node_lengths) {
		transitive_comparison.push(node[0]);
	}

	if (upload_vh) {
		SendGraph();
	}

	PopulateList(transitive_comparison, $(".compare-chart"));
	PopulateList(draggable_comparison, $(".drag-chart"));

	$( "#distance" ).html("Using a <b>completely</b> subjective distance metric, these hierarchies are " + TransitiveDistance(transitive_comparison, draggable_comparison) + " far apart.");

	var cycles = findCycles(comparison_value_graph);
	if (cycles.length > 0) {
		$( ".inconsistencies" ).empty();
		for (var i = 0; i < cycles.length; i++) {
			var cycle = cycles[i];

			$( ".inconsistencies" ).append("<p>Found Inconsistency between:<ul class='inconsistency" + i + "'></ul></p>");

			PopulateList(cycle, $( ".inconsistency" + i ));

		}

		$( ".inconsistencies" ).append("<p>You should think more about what these values mean to you, and decide whether or not to resolve these cycles.</p>");
		$( ".inconsistencies" ).show();
		$( ".no-inconsistencies" ).hide();
	} else {
		$( ".inconsistencies" ).hide();
		$( ".no-inconsistencies" ).show();
	}
}

function AnimateSelection(user_choice) {
	var pos = 0;
	var id = setInterval(frame, 5);
	function frame() {
		if (pos >= 35) {
			clearInterval(id);
			UpdateValues(value_comparison);
		} else {
			pos++; 
			switch (user_choice) {
				case "L":
					$("#left-centered").css({"top": "50%", "left": (50 - pos) + "%"}); 
					break;
				case "R":
					$("#right-centered").css({"top": "50%", "left": 50 +pos + "%"}); 
					break;
				case "D":
					$("#left-centered").css({"top": 50 + pos + "%", "left": "50%"}); 
					$("#right-centered").css({"top": 50 + pos + "%", "left": "50%"}); 
					break;
				case "U":
					$("#left-centered").css({"top": 50 - pos + "%", "left": "50%"}); 
					$("#right-centered").css({"top": 50 - pos + "%", "left": "50%"}); 
					break;

			}
		}
	}

}
