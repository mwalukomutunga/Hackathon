const http = require('http');
const App = require('./App');

const port = process.env.PORT || 5000;
const server = http.createServer(App);

server.listen(port, console.log(`server started at port ${port}`));