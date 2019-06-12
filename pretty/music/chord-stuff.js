
class Chordify {
	getNotes(chord) {
		switch (chord) {
			case "Ab": return ["Ab", "C", "Eb"]; break;
			case "A": return ["A", "C#", "E"]; break;
			case "A#": return ["A#", "D", "F"]; break;
			case "Bb": return ["Bb", "D", "F"]; break;
			case "B": return ["B", "D#", "F#"]; break;
			case "B#": return ["C", "E", "G"]; break;
			case "Cb": return ["B", "D", "F"]; break;
			case "C": return ["C", "E", "G"]; break;
			case "C#": return ["C#", "F", "G#"]; break;
			case "Db": return ["Db", "F", "Ab"]; break;
			case "D": return ["D", "F#", "A"]; break;
			case "D#": return ["D#", "G", "A#"]; break;
			case "Eb": return ["Eb", "G", "Bb"]; break;
			case "E": return ["E", "G#", "B"]; break;
			case "E#": return ["F", "A", "C"]; break;
			case "Fb": return ["E", "G#", "B"]; break;
			case "F": return ["F", "A", "C"]; break;
			case "F#": return ["F#", "A#", "C#"]; break;
			case "Gb": return ["Gb", "Bb", "Db"]; break;
			case "G": return ["G", "B", "D"]; break;
			case "G#": return ["G#", "C", "D#"]; break;

			// Minor
			case "Abm": return ["Ab", "B", "Eb"]; break;
			case "Am": return ["A", "C", "E"]; break;
			case "A#m": return ["A#", "Db", "F"]; break;
			case "Bbm": return ["Bb", "Db", "F"]; break;
			case "Bm": return ["B", "D", "F#"]; break;
			case "B#m": return ["C", "Eb", "G"]; break;
			case "Cbm": return ["B", "Db", "F"]; break;
			case "Cm": return ["C", "Eb", "G"]; break;
			case "C#m": return ["C#", "Fb", "G#"]; break;
			case "Dbm": return ["Db", "Fb", "Ab"]; break;
			case "Dm": return ["D", "F", "A"]; break;
			case "D#m": return ["D#", "Gb", "A#"]; break;
			case "Ebm": return ["Eb", "Gb", "Bb"]; break;
			case "Em": return ["E", "G", "B"]; break;
			case "E#m": return ["F", "Ab", "C"]; break;
			case "Fbm": return ["E", "G", "B"]; break;
			case "Fm": return ["F", "Ab", "C"]; break;
			case "F#m": return ["F#", "A", "C#"]; break;
			case "Gbm": return ["Gb", "A", "Db"]; break;
			case "Gm": return ["G", "Bb", "D"]; break;
			case "G#m": return ["G#", "Cb", "D#"]; break;
		}
	}

	noteToNumber(note) {
		var parsed_note = [];
		if (note[1] == "#" || note[1] == "b") {
			parsed_note[0] = note[0] + note[1];
		} else {
			parsed_note[0] = note[0];
		}
		parsed_note[1] = note[note.length - 1];
		var number = 12 * parsed_note[1];
		switch (parsed_note[0]) {
			case "C": number += 0; break;
			case "C#": number += 1; break;
			case "Db": number += 1; break;
			case "D": number += 2; break;
			case "D#": number += 3; break;
			case "Eb": number += 3; break;
			case "E": number += 4; break;
			case "E#": number += 5; break;
			case "Fb": number += 4; break;
			case "F": number += 5; break;
			case "F#": number += 6; break;
			case "Gb": number += 6; break;
			case "G": number += 7; break;
			case "G#": number += 8; break;
			case "Ab": number += 8; break;
			case "A": number += 9; break;
			case "A#": number += 10; break;
			case "Bb": number += 10; break;
			case "B": number += 11; break;
			case "B#": number += 12; break;
			case "Cb": number += 11; break;
		}
		return number;
	}

	closestNote(current_note, target) {
		var note_distances = {}
		var octave = current_note[current_note.length - 1];
		var less = target + (octave - 1);
		var same = target + (octave);
		var more = target + (parseInt(octave) + 1);

		note_distances[less] = Math.abs(this.getDistance(current_note, less));
		note_distances[same] = Math.abs(this.getDistance(current_note, same));
		note_distances[more] = Math.abs(this.getDistance(current_note, more));


		return Object.keys(note_distances).reduce(function(a, b){ return note_distances[a] < note_distances[b] ? a : b });

	}

	closestChordTone(current_note, chord) {
		var note_distances = {}
		for (var i = 0; i < chord.length; i++) {
			var closest = this.closestNote(current_note, chord[i]);
			note_distances[closest] = this.getDistance(current_note, closest);
		}

		console.log(note_distances);
		return Object.keys(note_distances).reduce(function(a, b){ return Math.abs(note_distances[a]) < Math.abs(note_distances[b]) ? a : b });
	}

	getDistance(note1, note2) {
		return this.noteToNumber(note1) - this.noteToNumber(note2);
	}
}
