var https = require('https'),
  http = require('http')
  connect = require('connect'),
  httpProxy = require('http-proxy'),
  fs = require('fs');
  maquilator = require('./maquilator.js');

var index = fs.readFileSync('./app/pdp_hackathon.html');

var httpsOpts = {
  key: fs.readFileSync('./www.mydomain.com.br.key', 'utf8'),
  cert: fs.readFileSync('./www.mydomain.com.br.crt', 'utf8')
};

var selects = [];

maquilator.init(selects);
maquilator.cleanHtml();
maquilator.lazyLoad();
maquilator.injecCode();
maquilator.changeLinks();

var app = connect();

var proxy = httpProxy.createProxyServer({
  //target: 'https://www.mydomain.com.br',
  //target: 'http://computer-database.gatling.io',
  target: 'http://localhost:9000',
  //target: 'http://computer-database.gatling.io',
  //ssl: httpsOpts,
  secure: false
})

console.log("Proxy: " + proxy);

app.use(require('harmon')([], selects));

app.use(
  function (req, res) {
    proxy.web(req, res);
  }
);


//http.createServer(httpsOpts, app).listen(8080);
http.createServer(app).listen(8080);

http.createServer(function(req, res){  
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
}).listen(9000);

console.log("app running on https://localhost:8080...");
//maquilator.treatImages();

