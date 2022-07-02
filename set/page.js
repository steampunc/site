"use strict";

// 1 s r e 
// 2 o g #
// 3 d p f

var combos = [
	["1", "2", "3"],
	["r", "g", "p"],
	["s", "o", "d"],
	["e", "h", "f"]
]

function getSet(card1, card2) {
	if (card1.length != card2.length) {
		console.log("Card String Length Mismatch");
		console.log(card1);
		console.log(card2);
	}
	var result = "";
	for (let i = 0; i < card1.length; i++) {
		let c1 = card1[i];
		let c2 = card2[i];
		if (!combos[i].includes(c1) || !combos[i].includes(c2)) {
			console.log("problem with input");
		}
		if (c1 == c2) {
			result += c1;
		} else {
			for (let j = 0; j < 3; j++) {
				if (combos[i][j] != c1 && combos[i][j] != c2) {
					result += combos[i][j];
					break;
				}
			}
		}
	}
	return result;
}

function toCardStruct(cardString) {
	let card = [null, null, null, null];
	for (let i = 0; i < cardString.length; i++) {
		for (let j = 0; j < combos.length; j++) {
			if (combos[j].includes(cardString[i])) {
				card[j] = cardString[i];	
			}
		}
	}
	if (card.includes(null)) {
		return null;
	}
	let card_color = null;
	if (card[1] == "r") {
		card_color = "#ff0000";
	} else if (card[1] == "g") {
		card_color = "#00ff00";
	} else {
		card_color = "#990099";
	}

	return {num:parseInt(card[0]), color:card_color, shape:card[2], fill:card[3], char_color:card[1], inCurrSet:false};
}

let set_app = new Vue({
	el: "#set-app",
	data: {
		cardsInput: "1rdf, 2rsh, 1fgo, 3fro, 2sep, 2edr, 2goh, 1fsp, 3edg, 3hrs, 2eog, 3hsp",
		cards: [],
		sets: new Set(),
		setsArray: [],
		setIndex: 0,
	},
	methods: {
		setLeft() {
			if (this.sets.size != 0) {
				this.setIndex = (this.sets.size + this.setIndex - 1) % this.sets.size;
			}
			for (let i = 0; i < this.cards.length; i++) {
				this.cards[i]["inCurrSet"] = this.setsArray[this.setIndex].includes(i);
			}
		},
		setRight() {
			if (this.sets.size != 0) {
				this.setIndex = (this.setIndex + 1) % this.sets.size;
			}
			for (let i = 0; i < this.cards.length; i++) {
				this.cards[i]["inCurrSet"] = this.setsArray[this.setIndex].includes(i);
			}
				
			console.log(this.cards);
			console.log(this.setIndex);
		},
		updateCards: function(e) {
			this.cards = [];
			let card_list = [];
			let card_string_list = [];
			if (this.cardsInput) {
				card_list = this.cardsInput.replace(/\s/g, '').split(",");	
			}
			for (let i = 0; i < card_list.length; i++) {
				let struc = toCardStruct(card_list[i]);
				if (!!struc) {
					console.log(struc);
					this.cards.push(struc);
					let cardString = struc["num"] + struc["char_color"] + struc["shape"] + struc["fill"];
					card_string_list.push(cardString);
				}
			}
			console.log(card_string_list);

			this.sets = new Set();
			this.setsArray = [];
			let index1 = -1;
			while (index1 < card_string_list.length - 1) {
				index1 += 1;
				let index2 = index1 + 1;
				while (index2 < card_string_list.length) {
					if (index1 != index2) {
						let last_card = getSet(card_string_list[index1], card_string_list[index2]);
						if (card_string_list.includes(last_card)) {
							console.log(card_string_list[index1]);
							console.log(card_string_list[index2]);
							console.log(last_card);
							this.sets.add([index1, index2, card_string_list.indexOf(last_card)].sort().toString());
						}
					}
					index2 += 1;
				}
			}
			
			const setIterator = this.sets.values();
			for (const entry of setIterator) {
				let indexList = entry.replace(/\s/g, '').split(",");	
				for (let i = 0; i < indexList.length; i++) {
					indexList[i] = parseInt(indexList[i]);
				}
				this.setsArray.push(indexList);
			}
			console.log(this.setsArray);
		}, 
	},
	beforeMount() {
		this.updateCards();
	},
	
});
