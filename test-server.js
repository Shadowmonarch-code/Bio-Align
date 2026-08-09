const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<html><body><h1>Test Server Works!</h1></body></html>');
});
server.listen(3001, () => console.log('Test server running on port 3001'));
