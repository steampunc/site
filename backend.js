// Backend for my website - this handles all the requests for pages and stuff.

const express = require("express");
const app = express();

app.use(express.static(__dirname));

app.get("/", function(request, response) {
	response.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/chord-tool", function(request, response) {

	response.sendFile(path.join(__dirname + "/chord-tool/index.html"));
});

app.get("/resume.pdf", function(request, response) {

	response.sendFile(path.join(__dirname + "/resume.pdf"));
});

app.listen(8080);
console.log("Listening on 8080");
