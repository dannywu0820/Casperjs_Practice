/*
Give an URL of a product like this: https://www.hotcar.com.tw/CWA/CWA060.aspx?TSEQNO=147377
Usage: casperjs crawl_hotcar.js --url=[Your URL]
*/
var crawler = require('casper').create({
	verbose: true,
	logLevel: "debug"
});
crawler.on('error', function(msg, backtrace){
	this.echo("Error: " + msg);
});

var home_url = "https://www.hotcar.com.tw";
var cli_url = crawler.cli.get("url");
if(cli_url == '' || cli_url == undefined) throw "invalid url";

var elements_to_crawl = {
	price_tag:'#ContentPlaceHolder1_lbSALAMT',
	image_tag:'img.rsTmb'
};

crawler.start(cli_url, function(){
	this.echo("The page has been loaded");
});

crawler.then(function(){
	//get car price
	var element_name = elements_to_crawl.price_tag;
	var element_info = this.getElementInfo(element_name);
	var car_price = element_info.text;
	this.echo("The car price is "+car_price);
});

crawler.then(function(){
	//get car image
	var element_name = elements_to_crawl.image_tag;
	var element_info = this.getElementsInfo(element_name);
	var car_image = [];
	for(var j = 0; j < element_info.length; j++){
		car_image[j] = element_info[j].attributes.src;
	    var pos = car_image[j].search("_S");
	    car_image[j] = home_url+car_image[j].slice(0, pos)+".jpg";
	}
	
	this.echo("The car image sources are");
	require('utils').dump(car_image);
});

crawler.run();