
$(function(){
    var nd = new Pyk.newsDiscovery();
    nd.init();
});

var Pyk = {};
var id_tags;
var mapViewOn = false;

Pyk.newsDiscovery = function(){

    this.init = function(){
    
        var that = this;

        // Load Facets & Render
        $.getJSON("res/data/facet.json", function(json){
            that.facet = json;
            that.renderColHeadings();
        });
        var url = 'https://spreadsheets.google.com/feeds/list/1AYfKcWxL6YqMdQtC4kjt3kkCP5VM4YJ2saSgUDlDVS4/1/public/full?alt=json';

        $.ajax({
            url: url,
            // Work with the response
            success: function (response) {
                console.log('response', response.feed.entry); // server response
                var data = {
                    name: "contentItems",
                    children:[]
                }
                $.each(response.feed.entry, function( index, row ) {
                    data.children.push({
                        id: index,
                      title: row.gsx$apellido.$t + row.gsx$nombre.$t,
                      name: row.gsx$nombre.$t,
                      firstname: row.gsx$apellido.$t,
                        email: "YES",
                        email_url: row.gsx$direccióndecorreo.$t,
                        skills: [ row.gsx$aquétededicas.$t ],
                        city: "",
                        institution: row.gsx$compañíaorganización.$t,
                        github:"N/A",
                        github_url:"",
                        website: "YES",
                        website_url: row.gsx$website.$t,
                        pgp:"N/A",
                        pgp_url:"",
                        image_url: row.gsx$imagendeperfillinkaunaimagen.$t,
                        twitter_url: row.gsx$twitter.$t,
                        twitter: "YES"
               //       "country": "The Netherlands",
                      //"city": "Amsterdam",
              //        "institution": "LocalFocus",
              //        "github": "N/A",
              //        "github_url": "",
              //        "website": "YES",
              //        "website_url": "http://www.localfocus.nl",
              //        "email": "YES",
              //        "email_url": "yordi@localfocus.nl",
              //        "pgp": "N/A",
              //        "pgp_url": "",
              //        "skills": [
             //           "Data Journalist",
             //           "Designer"
             //       ],
             //         "image_url": "res/img/yordi_dam.png",
             //         "twitter_url": "http://www.twitter.com/yordidam",
             //         "twitter": "YES"
                    });

                });
                console.log(data);

                that.data = data;
                that.initCrossfilter();
                that.initMap();
                that.renderTags();
                that.initSearch();

            }
        });

        // Load Data, Create Crossfilter & Render
        //$.getJSON("res/data/data.json", function(json){
        //    that.data = json;
        //    that.initCrossfilter();
        //    that.initMap();
        //    that.renderTags();
        //    that.initSearch();
        //});

    };


    this.renderColHeadings = function(){
        var h4s = $(".tag-holder h4"); // Capture all the required <h4> tags
        var f = this.facet.children;  // Get the data that corresponds to it
        for(var i in f) $(h4s[i]).html(f[i].label);
    };


    this.initCrossfilter = function(){
    
        this.crossfilter = {};
        this.crossfilter.data = crossfilter(this.data.children);

        this.crossfilter.id_dimension = this.crossfilter.data.dimension(function(d){
            return d.id;
        });

        this.crossfilter.dd_dimension = this.crossfilter.data.dimension(function(d){
            return d.country;
        });

        this.crossfilter.ee_dimension = this.crossfilter.data.dimension(function(d){
            return d.city;
        });

        this.crossfilter.gg_dimension = this.crossfilter.data.dimension(function(d){
            return d.github;
        });
        
        this.crossfilter.ff_dimension = this.crossfilter.data.dimension(function(d){
            return d.institution;
        });

        // --  -- //
        // We need 2 identical dimensions for the numbers to update
        // See http://git.io/_IvVUw for details
        this.crossfilter.aa_dimension = this.crossfilter.data.dimension(function(d){
            return d.skills;
        });

        // This is the dimension that we'll use for rendering
        this.crossfilter.aar_dimension = this.crossfilter.data.dimension(function(d){
            return d.skills;
        });

        // Create empty filter roster
        this.activeFilters = {
            
            "gg": [],
            "ee": [],
            "ff": [],
            "dd": [],
            "aa": [],
            "id": []
        };
    };


    this.renderTags = function(){

        var that = this;        

        // Skills
        var aa_tags = this._aaReduce(this.crossfilter.aar_dimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value());
        var aa_list = d3.select("#table3").selectAll("li").data(aa_tags);
        aa_list.enter().append("li");
        aa_list
            .html(function(d){
                var link = "<a href='#'>" + d.key;
                link += "<span class='badge'>" + d.value + "</span>";
                link += "</a>";
                return link;
            })
            .classed("active", function(d){
                return that._isActiveFilter("aa", d.key);
            })
            .on("click", function(d){
                that.filter("aa", d.key);
            });
        aa_list.exit().remove();



        // Country
        var dd_tags = this._removeEmptyKeys(this.crossfilter.dd_dimension.group().all(), "dd");
        var dd_list = d3.select("#table1").selectAll("li").data(dd_tags);
        dd_list.enter().append("li");
        dd_list
            .html(function(d){
                var link = "<a href='#'>" + d.key;
                link += "<span class='badge'>" + d.value + "</span>";
                link += "</a>";
                return link;
            })
            .classed("active", function(d){
                return that._isActiveFilter("dd", d.key);
            })
            .on("click", function(d){
                that.filter("dd", d.key);
            });
        dd_list.exit().remove();



        // City
        var ee_tags = this._removeEmptyKeys(this.crossfilter.ee_dimension.group().all(), "ee");
        var ee_list = d3.select("#table6").selectAll("li").data(ee_tags);
        ee_list.enter().append("li");
        ee_list
            .html(function(d){
                var link = "<a href='#'>" + d.key;
                link += "<span class='badge'>" + d.value + "</span>";
                link += "</a>";
                return link;
            })
            .classed("active", function(d){
                return that._isActiveFilter("ee", d.key);
            })
            .on("click", function(d){
                that.filter("ee", d.key);
            });
        ee_list.exit().remove();



        // Institution
        var ff_tags = this._removeEmptyKeys(this.crossfilter.ff_dimension.group().all(), "ff");
        var ff_list = d3.select("#table2").selectAll("li").data(ff_tags);
        ff_list.enter().append("li");
        ff_list
            .html(function(d){
                var link = "<a href='#'>" + d.key;
                link += "<span class='badge'>" + d.value + "</span>";
                link += "</a>";
                return link;
            })
            .classed("active", function(d){
                return that._isActiveFilter("ff", d.key);
            })
            .on("click", function(d){
                that.filter("ff", d.key);
            });
        ff_list.exit().remove();



        // GitHub
        var gg_tags = this._removeEmptyKeys(this.crossfilter.gg_dimension.group().all(), "gg");
        var gg_list = d3.select("#table5").selectAll("li").data(gg_tags);
       	gg_list.enter().append("li");
        gg_list
            .html(function(d){
                var link = "<a href='#'>" + d.key;
                link += "<span class='badge'>" + d.value + "</span>";
                link += "</a>";
                return link;
            })
            .classed("active", function(d){
                return that._isActiveFilter("gg", d.key);
            })
            .on("click", function(d){
                that.filter("gg", d.key);
            });
        gg_list.exit().remove();


		// Before rendering the Grid, we have to clear the layerGroup in the map instance in order to display new markers
		clearLayers();

        // Title aka Full Name
        id_tags = this._removeEmptyKeys(this.crossfilter.id_dimension.group().all(), "id");
        var id_list = d3.select("#table4").selectAll("li").data(id_tags);
        id_list.enter().append("li");
        id_list
            .html(function(d){
                var article = that._findArticleById(d.key);
                var link = "<a href='#'>" + article.title;
                link += "<span class='badge'>" + d.value + "</span>";
                link += "</a>";                              
                
                return link;
            })
            .classed("active", function(d){
                return that._isActiveFilter("id", d.key);
            })
            .on("click", function(d){
                that.filter("id", d.key);
            });
        id_list.exit().remove();		

        // Grid at the bottom
        d3.select("#grid").selectAll("li").remove();
        var grid_list = d3.select("#grid").selectAll("li").data(id_tags);
        grid_list.enter()
            .append("li")
            .html(function(d,i){
                 
                // Get full info                        
                var article = that._findArticleById(d.key);   
                
                var lastOne = i==grid_list[0].length-1 ? true : false;                
                
         		// Place a marker on the map as well for each of the elements in the grid, specify if it is the last one to update map bounds.
				codeAddressFromArticle(that,article,lastOne);                                                                                                  
                
                // Return the HTML of the Card for this article                         
                return that._renderArticleCardHtml(article);
            })
            .on("mouseover", function(d){
                $(this).find(".panel").addClass("flip");
            })
            .on("mouseout", function(d){
                $(this).find(".panel").removeClass("flip");
            });
            
        grid_list.exit().remove();
    };

    this.filter = function(d, e){

        var that = this;

        var i = this.activeFilters[d].indexOf(e);
        if(i < 0){
            this.activeFilters[d].push(e);
        }else{
            this.activeFilters[d].splice(i, 1);
        }


        // RUN ALL THE FILTERS! :P
        
        this.crossfilter.ee_dimension.filterAll();
        if(this.activeFilters["ee"].length > 0){
            this.crossfilter.ee_dimension.filter(function(d){
                return that.activeFilters["ee"].indexOf(d) > -1;
            });
        }

        this.crossfilter.gg_dimension.filterAll();
        if(this.activeFilters["gg"].length > 0){
            this.crossfilter.gg_dimension.filter(function(d){
                return that.activeFilters["gg"].indexOf(d) > -1;
            });
        }

        this.crossfilter.dd_dimension.filterAll();
        if(this.activeFilters["dd"].length > 0){
            this.crossfilter.dd_dimension.filter(function(d){
                return that.activeFilters["dd"].indexOf(d) > -1;
            });
        }

        this.crossfilter.ff_dimension.filterAll();
        if(this.activeFilters["ff"].length > 0){
            this.crossfilter.ff_dimension.filter(function(d){
                return that.activeFilters["ff"].indexOf(d) > -1;
            });
        }

        this.crossfilter.id_dimension.filterAll();
        if(this.activeFilters["id"].length > 0){
            this.crossfilter.id_dimension.filter(function(d){
                return that.activeFilters["id"].indexOf(d) > -1;
            });
        }

        this.crossfilter.aa_dimension.filterAll();
        if(this.activeFilters["aa"].length > 0){
            this.crossfilter.aa_dimension.filter(function(d){
                // d is the data of the dataset
                // f is the filters that are applied
                var f = that.activeFilters["aa"];

                var filter = true;
                for(var i in f){
                    if(d.indexOf(f[i]) < 0) filter = false;
                }

                return filter;
            });
        }


        this.renderTags();
    };
    
    // Defines method for search and typeahead.
    this.initSearch = function(){
    
    	var that = this;  
    	
    	var searchFilterArray = this._buildSearchFilterArray(); 
	        
	    $('#search').typeahead({    
	    	    	           	    
		    source: function (query, process) {	    	       	        	  	       	       	  
		       	        
		       	var articleTitles = searchFilterArray.articleTitles 	   			       	
		        process(articleTitles);		    
	
		    },
		    updater: function (item) {
		        			        
		        var searchTerm = item;
			    var article = searchFilterArray[searchTerm];		  
			    if(article.filter){
			      	that.filter(article.filter,article.id);
			    }	
		        		        
	    		return item;
		        
		    },
		    matcher: function (item) {
		        
		        if (item.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
			        return true;
			    }
		        
		    },
		    sorter: function (items) {
		        
		        return items.sort();
		        
		    },
		    highlighter: function (item) {
		       
		       var regex = new RegExp( '(' + this.query + ')', 'gi' );
			   return item.replace( regex, "<strong>$1</strong>" );
			   
		    },
		});
		
		$('#clear_search_btn').click(function () { 

		  that.initCrossfilter();
          that.renderTags();
          $("#search").val("");
	      	      
	    });
	    	    
	    $('#mapToggle').click(function () { 
			
			mapViewOn = !mapViewOn;
			
			if (!mapViewOn){
			
				$('#mapToggle').text('Map View');
				
				$('#grid').show();
				$('#map').hide();
				
			}else{
			
				$('#mapToggle').text('Grid View');
				
				$('#grid').hide();
				$('#map').show();
			}
			
	      	      
	    });
    
    };
    
    // Defines method for search and typeahead.
    this.initMap = function(){
	    
    	initializeMap();
    	
    	$('#map').hide();
    }
    
     /*--------------------
      HELPERS
    --------------------*/
    
    // Generates the HTML content of the card representation of the articles on the grid
    this._renderArticleCardHtml = function(article){
    
    	var container = $("<div/>").addClass("panel");
        var front = $("<div/>").addClass("front");
        var back  = $("<div/>").addClass("back");
        front.html("<img class='thumbnail' src='"+article.image_url+"' width='117' height='130' /><br/>" + "<b>" + article.title + "</b>");
        var back_content = "";
        back_content += $("<div/>").addClass("name").html(article.title).get(0).outerHTML;
        back_content += $("<div/>").addClass("institution").html(article.institution).get(0).outerHTML;
        back_content += $("<div/>").addClass("city").html(article.city + ", " + article.country).get(0).outerHTML;
        back_content += $("<div/>").addClass("pgp").html("PGP: " + '<a href="' + article.pgp_url + '" target="_self">' + article.pgp + "</a>").get(0).outerHTML;

        back_content += $("<div/>").addClass("email").html("<br>" + '<i class="fa fa-envelope fa-lg"></i> ' + '<a href="' + "mailto:" + article.email_url + '">'  + article.email + "</a>").get(0).outerHTML;
        back_content += $("<div/>").addClass("twitter").html('<i class="fa fa-twitter fa-lg"></i> ' + '<a href="' + article.twitter_url + '" target="_blank">' + article.twitter + "</a>").get(0).outerHTML;    
        back_content += $("<div/>").addClass("github").html('<i class="fa fa-github fa-lg"></i> ' + '<a href="' + article.github_url + '" target="_blank">' + article.github + "</a>").get(0).outerHTML;
        back_content += $("<div/>").addClass("website").html('<i class="fa fa-globe fa-lg"></i> ' + '<a href="' + article.website_url + '" target="_blank">' + article.website + "</a>").get(0).outerHTML;    

        back.html(back_content);
        container.append(front);
        container.append(back);
        
        return container.get(0).outerHTML;
    
    }
    
    // Generates the HTML content of popups showed when clicking markers on the map
    this._renderArticlePopupHtml = function(article){
    
    	var container = $("<div/>").addClass("popup");
        var front = $("<div/>").addClass("front");
        var back  = $("<div/>").addClass("back");
        front.html("<img class='thumbnail' src='"+article.image_url+"' width='117' height='130' /><br/>" + "<b>" + article.title + "</b>");
        
        var back_content = "";
        back_content += $("<div/>").addClass("name").html(article.title).get(0).outerHTML;
        back_content += $("<div/>").addClass("institution").html(article.institution).get(0).outerHTML;
        back_content += $("<div/>").addClass("city").html(article.city + ", " + article.country).get(0).outerHTML;
        back_content += $("<div/>").addClass("pgp").html("PGP: " + '<a href="' + article.pgp_url + '" target="_self">' + article.pgp + "</a>").get(0).outerHTML;

        back_content += $("<div/>").addClass("email").html("<br>" + '<i class="fa fa-envelope fa-lg"></i> ' + '<a href="' + "mailto:" + article.email_url + '">'  + article.email + "</a>").get(0).outerHTML;
        back_content += $("<div/>").addClass("twitter").html('<i class="fa fa-twitter fa-lg"></i> ' + '<a href="' + article.twitter_url + '" target="_blank">' + article.twitter + "</a>").get(0).outerHTML;    
        back_content += $("<div/>").addClass("github").html('<i class="fa fa-github fa-lg"></i> ' + '<a href="' + article.github_url + '" target="_blank">' + article.github + "</a>").get(0).outerHTML;
        back_content += $("<div/>").addClass("website").html('<i class="fa fa-globe fa-lg"></i> ' + '<a href="' + article.website_url + '" target="_blank">' + article.website + "</a>").get(0).outerHTML;

        back.html(back_content);
        container.append(front);
        container.append(back);
        
        return container.get(0).outerHTML;
    
    }

    this._isActiveFilter = function(d,e){
        var i = this.activeFilters[d].indexOf(e);
        return i > -1;
    };

    // TODO Optimize this function, use Array.filter/reduce
    // Or create a hashmap of ids and their index in the array on init
    this._findArticleById = function(id){
        var articles = this.data.children;
        for(var i in articles) if(articles[i].id == id) return articles[i];
        return false;
    };    
    
    // Gets the list of titles from the articles
    this._buildSearchFilterArray = function(){
    
    	var that = this;
        	
    	//Define metadata Object, containing an array of titles for the autocompletion
    	var articleSearchFilter = new Object;  
    	articleSearchFilter.articleTitles = [];    	
    	
    	// Skills
    	var aa_tags = this._aaReduce(this.crossfilter.aar_dimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value());
        
        $.each(aa_tags, function( index, value ) {
	        articleSearchFilter[value["key"]] = new Object;			
			articleSearchFilter[value["key"]].filter = "aa";
			articleSearchFilter[value["key"]].id = value["key"];
			articleSearchFilter.articleTitles.push(value["key"]);  
		});
        
        // Country
        var dd_tags = this._removeEmptyKeys(this.crossfilter.dd_dimension.group().all(), "dd");
        
        $.each(dd_tags, function( index, value ) {	
	        articleSearchFilter[value["key"]] = new Object;		
			articleSearchFilter[value["key"]].filter = "dd";
			articleSearchFilter[value["key"]].id = value["key"];
			articleSearchFilter.articleTitles.push(value["key"]);  
		});
        
        // City
        var ee_tags = this._removeEmptyKeys(this.crossfilter.ee_dimension.group().all(), "ee");
        
        $.each(ee_tags, function( index, value ) {		
        	articleSearchFilter[value["key"]] = new Object;	
			articleSearchFilter[value["key"]].filter = "ee";
			articleSearchFilter[value["key"]].id = value["key"];
			articleSearchFilter.articleTitles.push(value["key"]);  
		});
		
        // Institution
        var ff_tags = this._removeEmptyKeys(this.crossfilter.ff_dimension.group().all(), "ff");
       
        $.each(ff_tags, function( index, value ) {	
        	articleSearchFilter[value["key"]] = new Object;		
			articleSearchFilter[value["key"]].filter = "ff";
			articleSearchFilter[value["key"]].id = value["key"];
			articleSearchFilter.articleTitles.push(value["key"]);  
		});
		
       	// GitHub
        /*var gg_tags = this._removeEmptyKeys(this.crossfilter.gg_dimension.group().all(), "gg");
       
        $.each(gg_tags, function( index, value ) {
			console.log(value["key"]);
			articleTitles.push(value["key"]);  
		});*/
		
        // Title aka Full Name
        //id_tags = this._removeEmptyKeys(this.crossfilter.id_dimension.group().all(), "id");
       
        $.each(id_tags, function( index, value ) {
        	var a = that._findArticleById(value["key"]);
        	articleSearchFilter[a.title] = new Object;
        	articleSearchFilter[a.title].filter = "id";
			articleSearchFilter[a.title].id = a.id;
			articleSearchFilter.articleTitles.push(a.title);  
        				
		});
            	
    	return articleSearchFilter;
        
    }; 

    // This function does two things:
    //  1. Removes keys if their values are 0
    //  2. Removes all the keys but one if a filter is
    //     selected on ff, dd or id
    this._removeEmptyKeys = function(d, dim){
        if(dim === "aa"){
            var a = [];
            for(var i in d) if(d[i].value !== 0) a.push(d[i]);
            return a;
        }

        var f = this.activeFilters[dim];
        if(f.length === 0){
            var a = [];
            for(var i in d) if(d[i].value !== 0) a.push(d[i]);
            return a;
        }else{
            var a = [];
            for(var i  in d) if(f.indexOf(d[i].key) > -1) a.push(d[i]);
            return a;
        }
    };


    // The value we get for ... is in a different
    // format. This function makes it the same
    this._aaReduce = function(d){
        var a = [];
        for(var i in d) a.push({"key": i, "value": d[i]});
        return a;
    };
    
  
};


/*------------------------------
Reduce functions for the arrays
of AA. 
------------------------------*/
function reduceAdd(p, v) {
  v.skills.forEach (function(val, idx) {
     p[val] = (p[val] || 0) + 1; //increment counts
  });
  return p;
}

function reduceRemove(p, v) {
  v.skills.forEach (function(val, idx) {
     p[val] = (p[val] || 0) - 1; //decrement counts
  });
  return p;

}

function reduceInitial() {
  return {};
}