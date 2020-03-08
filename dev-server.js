const express = require('express'),
	app = express(),
	port = 3500;

app.use(express.static('./static'));
app.listen(port, () => console.log(`dev server listening on port ${port}`));

