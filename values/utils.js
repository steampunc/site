
function HideAllOtherPages(page_selection) {

	$( "#ordering-page" ).hide();
	$( "#comparison-page" ).hide();
	$( "#analysis-page" ).hide();
	$( "#main-page" ).hide();
	$( "#comparison-instructions" ).hide();
	$( "#comparison-body" ).hide();
	
	page_selection.show();
}

function Download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function UpdateValues(comparing_values) {
	$( "#counter").text("You have " + (value_comparisons.length + 1) + " left.");
	$( "#left-value" ).text(comparing_values[0]);
	$( "#right-value" ).text(comparing_values[1]);	
	$("#left-centered").css({"top": "50%", "left": "50%"}); 
	$("#right-centered").css({"top": "50%", "left": "50%"}); 
	$("#left-centered").show();
	$("#right-centered").show();
}

function ReadFromList(list_object) {
	var element_array = [];
	elements = list_object.children()
	for (var i = 0; i < elements.length; i++) {
		element_array.push(elements[i].innerHTML);
	}
	return element_array;
}

function ShuffleArray(input_array) {
	var array = [...input_array];
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return array
}


function PopulateList(val_list, list_object) {
	list_object.empty();
	for (var i = 0; i < val_list.length; i++) {
		list_object.append("<li id=value>" + val_list[i] + "</li>");
	}
}


function GetCombinations(items) {
	var combination_array = [];
	for (var i = 0; i < items.length; i++) {
		for (var j = 0; j < i; j++) {
			if (i != j) {
				combination_array.push(ShuffleArray([items[i], items[j]]));
			}
		}

	}
	return combination_array;
}

function GetAllPermutations(list) {
	var permutations = [];	
	for (var i = 0; i < list.length; i++) {
		if (list.length == 1){
			return [list]; //[[]]
		}


		var element = list[i]; // ""
		var copied_list = [...list];
		copied_list.splice(i,1);

		var recursive_permutations = GetAllPermutations(copied_list); 
		for (var j = 0; j < recursive_permutations.length; j++) {
			recursive_permutations[j].push(element);
			permutations.push(recursive_permutations[j]);
		}
	}
	return permutations;
}


function TransitiveDistance(list1, list2) {
	var distance = 0;
	for (var i = 0; i < list1.length; i++) {
		for (var j = 0; j < list2.length; j++) {
			if (list1[i] == list2[j]) {
				distance += Math.atan((list1.length - i) * Math.abs(i - j));
			}
		
		}
	}
	return distance;
}

