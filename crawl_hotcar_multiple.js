/*
Practice casperjs with static DOM
Usage: casperjs crawl_hotcar.js
*/
var fs = require('fs');

var crawler = require('casper').create();
crawler.on('error', function(msg, backtrace){
	this.echo("Error: " + msg);
});

var home_url = "https://www.hotcar.com.tw";

var elements_to_crawl = {
	price_tag: '#ContentPlaceHolder1_lbSALAMT', 
	image_tag: 'img.rsTmb'
};

crawler.start(home_url, function(){
	this.echo("Open home page: " + this.getTitle());
});

var car_urls = [];
var num_of_items = 0;
crawler.then(get_carUrl);

crawler.then(function(){
	for(var index = 0; index < num_of_items; index++){
		//this.echo(index.toString());
		this.thenOpen(car_urls[index], function(){
			var currentUrl = this.getCurrentUrl();
			var id = currentUrl.slice(currentUrl.search("TSEQNO="), currentUrl.length);
			this.echo(id);
			
			var car_price = get_carPrice(id);
			var car_image = get_carImage(id);
			
			var JSON_obj = {
				'url': currentUrl,
				'price': car_price,
				'image': car_image
			};
			var JSON_str = JSON.stringify(JSON_obj);
			var path = "./carInfo/" + id + ".json";
			fs.write(path, JSON_str, 644);
		});
	}
});

function get_carUrl(){
	var carUrl_tag = "div.thumbnail.col-xs-12.col-md-12.col-lg-12 a"; //but the last 40 are not product items 
	if(this.exists(carUrl_tag)){
		//this.echo(carUrl_tag + " exists");
		var element_info = this.getElementsInfo(carUrl_tag);
		this.echo("num of items: " + element_info.length);
		num_of_items = element_info.length-40;
		for(var i = 0; i < element_info.length-40; i++) car_urls[i] = home_url+element_info[i].attributes.href;
		//require('utils').dump(car_urls);
	}
	else{
		throw carUrl_tag + " doesn't exist";
	}
}

function get_carPrice(id){
	var element_name = elements_to_crawl['price_tag'];
	var element_info = crawler.getElementInfo(element_name);
	var car_price = element_info.text;
	crawler.echo(car_price);
	
	return car_price;
}

function get_carImage(id){
	var element_name = elements_to_crawl['image_tag'];
	var element_info = crawler.getElementsInfo(element_name);
	var car_image = [];
	for(var j = 0; j < element_info.length; j++){
		car_image[j] = home_url+element_info[j].attributes.src;
		car_image[j] = car_image[j].replace("_S", "");
		//crawler.download(car_image[j], "./carImg/" + id + "/pic" + (j+1).toString() + ".jpg");
	}
	require('utils').dump(car_image);
	
	return car_image;
}

crawler.run();
