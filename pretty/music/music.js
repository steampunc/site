

function Loop1(synth) {
}

$(document).ready(function() {
	var synth = new Tone.PolySynth().toMaster();

	const notes = ["C3", "Eb3", "G3", "Bb3"];

	// create a new sequence with the synth and notes
	const loop1 = new Tone.Sequence(
		function(time, note) {
			synth.triggerAttackRelease(note, "10hz", time);
		},
		notes,
		"4n"
	);

	// Setup the synth to be ready to play on beat 1
	synthPart.start();

	// Note that if you pass a time into the start method 
	// you can specify when the synth part starts 
	// e.g. .start('8n') will start after 1 eighth note

	// start the transport which controls the main timeline
	Tone.Transport.start();


	var part = new Tone.Part(function(time, note){
		synth.triggerAttackRelease(note, "8n", time);
	}, [[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]);
	part.start();
 

});

