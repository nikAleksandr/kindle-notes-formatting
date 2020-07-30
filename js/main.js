var notes,
	clips,
	clipsObj = [];

function findBetween(text, start, end, charShift){
	if(isNaN(start)){
		var startNum = text.search(start) + start.length;	
	} else startNum = start;
	var endNum = (end==null) ? null : text.search(end) - startNum + charShift;
	if(end==null){
		var between = text.substr(startNum);
	} else var between = text.substr(startNum, endNum);
	//console.log(startNum, endNum, charShift);
	return between;
}

function sortByProperty(property){  
   return function(a,b){  
      if(a[property] > b[property])  
         return 1;  
      else if(a[property] < b[property])  
         return -1;  
  
      return 0;  
   }  
}

function getData(){
	$.get('My Clippings.txt', function(data) {
	    clips = data.replace(/"/g, "'");
	    //clips = '{"' + clips.replace(/==========/g, '"}{"') + '""}';

	    clips = clips.split("==========");
	})
	return;
};

function dataToObject(){
	setTimeout(() => {
		//separate each note out into indivudal note objects
		for(i=0; i <clips.length; i++){
			var j = (i == 0 | i == clips.length-1) ? 0 : 1;
			//console.log (i + " : " + j);


			clipsObj[i] = {};
			clipsObj[i].full = clips[i];
			//clipsObj[i].book = clips[i].substr(0, clips[i].search("\r\n"));
			clipsObj[i].arr = clips[i].split("\r\n"); 
			clipsObj[i].book = clipsObj[i].arr[j];
			
			//drop empty highlights
			if(clipsObj[i].arr.length<3){
				if (i==clips.length-1) break;
				clipsObj.splice(i,1);
				i--;
				console.log("dropped:" + i + clipsObj[i].arr);
				continue;
			}

			//Page and Location properties
			if(clipsObj[i].arr[j+1].search("page")>0)
			{
				clipsObj[i].page = findBetween(clipsObj[i].arr[j+1], "page ", "Added on", -3);
			}
			if(clipsObj[i].arr[j+1].search("Location")>0){
				clipsObj[i].location = findBetween(clipsObj[i].arr[j+1], "Location ", "Added on", -3);
				//in case it has a location AND a page
				if(clipsObj[i].arr[j+1].search("page")>0)
		    	{
		    		clipsObj[i].page = findBetween(clipsObj[i].arr[j+1], "page ", "Location", -3);
		    	}
			}
			if(clipsObj[i].hasOwnProperty('location')){
				clipsObj[i].locationStart = Number(findBetween(clipsObj[i].location, 0, "-", 0));
				clipsObj[i].locationEnd = Number(findBetween(clipsObj[i].location, "-", null, 0));
			} else {
				console.log(clipsObj[i]);
				clipsObj[i].locationStart = Number(findBetween(clipsObj[i].page, 0, "-", 0));
				clipsObj[i].locationEnd = Number(findBetween(clipsObj[i].page, "-", null, 0));
			}

			clipsObj[i].highlight = false;
			if(clipsObj[i].arr[j+1].search("Highlight")>0)
			{
				clipsObj[i].highlight = true;
			}
			clipsObj[i].date = findBetween(clipsObj[i].arr[j+1], "Added on ",null,0);
			clipsObj[i].note = clipsObj[i].arr[j+3];
		}
		//console.log(clipsObj);
		return;
	}, 2000);
};	
	
//recombine note objects into an array of objects sorted based on book and by locationStart
function sortAndDisplay(){
	setTimeout(() => {
		clipsObj.sort(sortByProperty("locationStart"));
		clipsObj.sort(sortByProperty("book"));

		console.log(clipsObj.length);

		for(i=0; i<clipsObj.length; i++){
			console.log("im here" + i);
			if(i==0 || clipsObj[i].book != clipsObj[i-1].book){
				$('body').append("<h1>"+ clipsObj[i].book +"</h1>");
			}

			$('body').append("<p>"+ clipsObj[i].note +"</p>");

		}
	}, 4000);
};

getData();
dataToObject();
sortAndDisplay();

//need to add handling for own notes - identify and some way to separate them out
//should add a anchored table of contents at the top
//should add some of the metadata (maybe at the book level)