/*! ImpactStory - v0.0.1-SNAPSHOT - 2013-11-01
 * http://impactstory.org
 * Copyright (c) 2013 ImpactStory;
 * Licensed MIT
 */
angular.module('app', [
  'services.loading',
  'services.i18nNotifications',
  'services.uservoiceWidget',
  'security',
  'directives.crud',
  'templates.app',
  'templates.common',
  'signup',
  'infopages', // comes before profile, so '/about' isn't routed as a user named About.
  'profileProduct',
  'profile',
  'settings'
]);

angular.module('app').constant('TEST', {
  baseUrl: 'http://localhost:5000/',
  otherKey: 'value'
});


angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.otherwise({
    template:'<div class="no-page"><h2>Whoops!</h2><p>Sorry, this page doesn\'t exist. Perhaps the URL is mistyped?</p></div>'
  });
}]);


angular.module('app').run(['security', function(security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();
}]);


angular.module('app').controller('AppCtrl', function($scope, i18nNotifications, localizedMessages, $rootScope, UservoiceWidget, $location, Loading) {

  $scope.notifications = i18nNotifications;
  $scope.loading = Loading;
  $rootScope.showHeaderAndFooter = true;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
  });

  $scope.$on('$routeChangeSuccess', function(next, current){
    UservoiceWidget.updateTabPosition($location.path())
    $rootScope.showHeaderAndFooter = true;

  })

});


angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'httpRequestTracker',
  function ($scope, $location, $route, security, httpRequestTracker) {

  $scope.location = $location;
  $scope.isAuthenticated = security.isAuthenticated;

  $scope.home = function () {
    console.log("home!")
    if (security.isAuthenticated()) {
      $location.path('/' + security.requestCurrentUser().url_slug);
    } else {
      $location.path('/');
    }
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
}]);

angular.module('importers.allTheImporters', [
  'importers.importer'
])

angular.module('importers.allTheImporters')
.factory('AllTheImporters', function(){

  var importedProducts = []
  var importers = [
    {
      displayName: "GitHub",
      inputType: "username",
      inputNeeded: "username",
      url: 'http://github.com',
      descr: "GitHub is an online code repository emphasizing community collaboration features.",
      help: "Your GitHub account ID is at the top right of your screen when you're logged in."
    },
    {
      displayName: "ORCID",
      inputType: "username",
      inputNeeded: "ID",
      url: 'http://orcid.org',
      signupUrl: 'http://orcid.org/register',
      descr: "ORCID is an open, non-profit, community-based effort to create unique IDs for researchers, and link these to research products. It's the preferred way to import products into ImpactStory.",
      help: "You can find your ID at top left of your ORCID page, beneath your name (make sure you're logged in).",
      placeholder: "http://orcid.org/xxxx-xxxx-xxxx-xxxx",
      extra: "If ORCID has listed any of your products as 'private,' you'll need to change them to 'public' to be imported."
    },
    {
      displayName: "Slideshare",
      inputType: "username",
      inputNeeded: "username",
      url:'http://slideshare.net',
      descr: "Slideshare is community for sharing presentations online.",
      help: "Your username is right after \"slideshare.net/\" in your profile's URL."
    },
    {
      displayName: "Google Scholar",
      inputType: "file",
      inputNeeded: "BibTeX file",
      url: 'http://scholar.google.com/citations',
      descr: "Google Scholar profiles find and show researchers' articles as well as their citation impact.",
      extra: '<h3>How to import your Google Scholar profile:</h3>'
        + '<ol>'
          + '<li>Visit (or <a target="_blank" href="http://scholar.google.com/intl/en/scholar/citations.html">make</a>) your Google Scholar Citations <a target="_blank" href="http://scholar.google.com/citations">author profile</a>.</li>'
          + '<li>In the green bar above your articles, find the white dropdown box that says <code>Actions</code>.  Change this to <code>Export</code>. </li>'
          + '<li>Click <code>Export all my articles</code>, then save the BibTex file.</li>'
          + '<li>Return to ImpactStory. Click "upload" in this window, select your previously saved file, and upload.'
        + '</ol>'
    },
    {
      displayName: "figshare",
      inputType: "idList",
      inputNeeded: "DOIs",
      endpoint: "dois",
      url: "http://figshare.com",
      descr: "Figshare is a repository where users can make all of their research outputs available in a citable, shareable and discoverable manner.",
      help: "You can find Figshare DOIs on each dataset's figshare webpage; it's inside the 'cite' section.",
      placeholder: "http://dx.doi.org/10.6084/m9.figshare.example"
    },
    {
      displayName: "Dryad",
      inputType: "idList",
      inputNeeded: "DOIs",
      endpoint: "dois",
      url: 'http://dryad.org',
      descr: "The Dryad Digital Repository is a curated resource that makes the data underlying scientific publications discoverable, freely reusable, and citable.",
      help: "You can find Dryad DOIs on each dataset's individual Dryad webpage, inside the <strong>\"please cite the Dryad data package\"</strong> section.",
      placeholder: "doi:10.5061/dryad.example"
    },
    {
      displayName: "Dataset DOIs",
      inputType: "idList",
      inputNeeded: "",
      endpoint: "dois",
      descr: "Datasets can often be identified by their DOI, a unique ID assigned by the repository to a given dataset.",
      help: "You can often find dataset DOIs (when they exist; alas, often they don't) on their repository pages.",
      placeholder: "http://doi.org/10.example/example"
    },
    {
      displayName: "Article DOIs",
      inputType: "idList",
      inputNeeded: "",
      endpoint: "dois",
      descr: "Articles can often be identified by their DOI: a unique ID most publishers assign to the articles they publish.",
      help: "You can (generally) find article DOIs wherever the publishers have made the articles available online.",
      placeholder: "http://doi.org/10.example/example"
    },
    {
      displayName: "PubMed IDs",
      inputType: "idList",
      inputNeeded: "",
      endpoint: "pmids",
      url:'http://www.ncbi.nlm.nih.gov/pubmed',
      descr: "PubMed is a large database of biomedical literature. Every article in PubMed has a unique PubMed ID.",
      placeholder: "123456789",
      help: "You can find PubMed IDs (PMIDs) beneath each article's abstract on the PubMed site."
    },
    {
      displayName: "Webpages",
      inputType: "idList",
      inputNeeded: "URLs",
      endpoint: "urls",
      descr: "You can import any webpages. If it has a DOI or PubMed ID, though, use those more specific importers instead of this one; you'll get better results."
    }

  ]


  var makeLogoPath = function(displayName) {
    var urlStyleName = displayName.toLowerCase().replace(" ", "-")
    return '/static/img/logos/' + urlStyleName + '.png';
  }

  var makeEndpoint = function(importer) {
    if (importer.endpoint) {
      return importer.endpoint
    }
    else {
      return makeName(importer.displayName)
    }
  }
          
  var makeName = function(importerName) {
    var words = importerName.split(" ");
    var capitalizedWords = _.map(words, function(word){
      return word.charAt(0).toUpperCase() + word.toLowerCase().slice(1)
    })
    capitalizedWords[0] = capitalizedWords[0].toLowerCase()
    return capitalizedWords.join("");

  }
           

  return {
    addProducts: function(products) {
      importedProducts = importedProducts.concat(products)
}   ,
    getProducts: function(){
      return importedProducts
    },
    get: function(){
      var importersWithAllData = _.map(importers, function(importer){
        importer.name = makeName(importer.displayName)
        importer.logoPath = makeLogoPath(importer.displayName)
        importer.endpoint = makeEndpoint(importer)

        return importer
      })

      return _.sortBy(importersWithAllData, function(importer){
        return importer.displayName.toLocaleLowerCase();
      })

    }


  }



})
angular.module('importers.importer', [
  'directives.forms',
  'services.loading',
  'resources.products'
])
angular.module('importers.importer')
.factory('Importer', function(){

})


.controller('importerCtrl', function($scope, Products, NewProfile, UsersProducts, Importer, Loading){

  $scope.showImporterWindow = function(){
    if (!$scope.importerHasRun) { // only allow one import for this importer.
      $scope.importWindowOpen = true;
    }
  }
  $scope.hideImportWindow = function(){
    $scope.importWindowOpen = false;
  }
  $scope.products = []
  $scope.importerHasRun = false

  $scope.onCancel = function(){
    console.log("onCancel!")
    $scope.importWindowOpen = false;
  }
  $scope.onImport = function(){
    Loading.start()
    var profileId = NewProfile.getId()
    console.log("now calling /importer/" + $scope.importer.endpoint)
    console.log("here's the profile ID we'll update:", profileId)

    // import the new products
    Products.save(
      {importerName: $scope.importer.endpoint},
      {input: $scope.importer.input},
      function(resp, headers){
        var tiids;

        if (resp.error){
          tiids = []
        }
        else {
          tiids = _.keys(resp.products)
        }

        // store our new products in this importer's scope
        console.log("here are the tiids:", tiids);
        $scope.products = tiids;

        // add the new products to the user's profile on the server
        UsersProducts.patch(
          {id: profileId},
          {"tiids": tiids},
          function(){
            Loading.finish()
          }
        )

        // close the window
        $scope.hideImportWindow()
        $scope.importerHasRun = true
      }
    )
  }
  Loading.finish()
})

angular.module( 'infopages', [
    ])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider

            .when('/', {
                      templateUrl: 'infopages/landing.tpl.html',
                      controller: 'landingPageCtrl'
                  })
            .when('/faq', {
                      templateUrl: 'infopages/faq.tpl.html',
                      controller: 'faqPageCtrl'
                  })
            .when('/about', {
                      templateUrl: 'infopages/about.tpl.html',
                      controller: 'aboutPageCtrl'
                  })
    }])

    .controller( 'landingPageCtrl', function landingPageCtrl ( $scope ) {
                     $scope.thisControllerBeRunning = true

                 })

    .controller( 'faqPageCtrl', function faqPageCtrl ( $scope ) {
                     $scope.thisControllerBeRunning = true

                 })

    .controller( 'aboutPageCtrl', function aboutPageCtrl ( $scope ) {
                     $scope.thisControllerBeRunning = true

                 })

;

angular.module('product.award', []);
angular.module('product.award').factory('Award', function() {

  return {

    // [noun_form, display_order]
    config: {
      "viewed":["views", 1],
      "discussed": ["discussion", 2],
      "saved": ["saves", 3],
      "cited": ["citation", 4],
      "recommended": ["recommendation", 5]
    }


    ,make: function(audience, engagementType, metrics){

      return {
        engagementTypeNoun: this.config[engagementType][0]
        ,engagementType: engagementType
        ,audience: audience
        ,displayOrder: this.config[engagementType][1]
        ,topMetric: this.getTopMetric(metrics)
        ,isHighly: this.calculateIsHighly(metrics)
        ,displayAudience: audience.replace("public", "the public")
        ,metrics: metrics
      }
    }

    ,makeForSingleMetric: function(audience, engagementType, metric){
      return {
        engagementTypeNoun: this.config[engagementType][0]
        ,engagementType: engagementType
        ,audience: audience
        ,displayOrder: this.config[engagementType][1]
        ,isHighly: this.calculateIsHighly([metric])
        ,displayAudience: audience.replace("public", "the public")
      }

    }


    ,calculateIsHighly: function(metrics){

      return _.some(metrics, function(metric){
        if (typeof metric.percentiles === "undefined") {
          return false
        }
        else if (metric.percentiles.CI95_lower >= 75 && metric.actualCount >= metric.minForAward) {
          return true
        }
        else {
          return false
        }
      })
    }


    ,getTopMetric: function(metrics) {
      // sort by CI95, then by the raw count if CI95 is tied

      var maxCount = _.max(metrics, function(x) {
        return x.actualCount;
      }).actualCount;

      var topMetric = _.max(metrics, function(x){

        var rawCountContribution =  (x.actualCount / maxCount - .0001) // always < 1
        if (typeof x.percentiles == "undefined") {
          return rawCountContribution;
        }
        else {
          return x.percentiles.CI95_lower + rawCountContribution;
        }
      });

      return topMetric
    }
  }
});

angular.module('product.product', ['product.award'])
angular.module('product.product')



  .factory('Product', function(Award) {


  var itemOmitUndefinedv = function(obj) { return _.omit(obj, "undefined")}


  /* the metricInfo keys are mapped to the metricInfo array to save space;
   *  the finished dict looks like this:
   *  {
   *      "topsy:tweets": {name: "topsy:tweets", audience: "public", ... },
   *      "mendeley:groups": {name: "mendeley:groups", audience: "scholars",...},
   *      ...
   *  }
   */
  var metricInfoKeys = ["name", "audience", "engagementType", "display", "minForAward"]
  var metricInfo = _.object(
    _.map([
            ["citeulike:bookmarks", "scholars", "saved", "badge", 3],
            ["crossref:citations", "scholars", "cited", "badge", 3],
            ["delicious:bookmarks", "public", "saved", "badge", 3],
            ["dryad:most_downloaded_file"],
            ["dryad:package_views", "scholars", "viewed", "badge", 3],
            ["dryad:total_downloads", "scholars", "viewed", "badge", 3],
            ["figshare:views", "scholars", "viewed", "badge", 3],
            ["figshare:downloads", "scholars", "viewed", "badge", 3],
            ["figshare:shares", "scholars", "discussed", "badge", 3],
            ["facebook:shares", "public", "discussed", "badge", 3],
            ["facebook:comments", "public", "discussed", "badge", 3],
            ["facebook:likes", "public", "discussed", "badge", 3],
            ["facebook:clicks", "public", "discussed", "badge", 3],
            ["github:forks", "public", "cited", "badge", 3],
            ["github:stars", "public", "recommended", "badge", 3],
            ["github:watchers", "public", "saved", "badge", 3],  // depricate this later
            ["mendeley:career_stage"],
            ["mendeley:country"],
            ["mendeley:discipline"],
            ["mendeley:student_readers"], // display later
            ["mendeley:developing_countries"], // display later
            ["mendeley:groups"],
            ["mendeley:readers", "scholars", "saved", "badge", 3],
            ["pmc:pdf_downloads"],
            ["pmc:abstract_views"],
            ["pmc:fulltext_views"],
            ["pmc:unique_ip_views"],
            ["pmc:figure_views"],
            ["pmc:suppdata_views"],
            ["plosalm:crossref" ],                    // figure it out
            ["plosalm:html_views", "public", "viewed", "badge", 3],
            ["plosalm:pdf_views", "scholars", "viewed", "badge", 3],
            ["plosalm:pmc_abstract"],
            ["plosalm:pmc_figure"],
            ["plosalm:pmc_full-text"],
            ["plosalm:pmc_pdf"],
            ["plosalm:pmc_supp-data"],
            ["plosalm:pmc_unique-ip"],
            ["plosalm:pubmed_central"],
            ["plosalm:scopus"],                      // figure it out
            ["plossearch:mentions", "scholars", "cited", "badge", 3],
            ["pubmed:f1000", "scholars", "recommended", "badge", 1],
            ["pubmed:pmc_citations", "scholars", "cited", "badge", 3],
            ["pubmed:pmc_citations_editorials"],
            ["pubmed:pmc_citations_reviews"],
            ["scienceseeker:blog_posts", "scholars", "discussed", "badge", 3],
            ["scopus:citations", "scholars", "cited", "badge", 3],
            ["researchblogging:blogs", "scholars", "discussed"],
            ["slideshare:comments", "public", "discussed", "badge", 3],
            ["slideshare:downloads", "public", "viewed", "badge", 3],
            ["slideshare:favorites", "public", "recommended", "badge", 3],
            ["slideshare:views", "public", "viewed", "badge", 3],
            ["topsy:influential_tweets", "public", "discussed", "zoom", 0],
            ["topsy:tweets", "public", "discussed", "badge", 3],
            ["wikipedia:mentions", "public", "cited", "badge", 3]
          ],
          function(metric){ // second arg in map() call
            return[ metric[0], _.object(metricInfoKeys, metric )]
          })
  )






  return {

    makeMetrics: function(itemData){
      var metrics = itemData.metrics
      metrics = this.addMetricsInfoDataToMetrics(metrics)
      metrics = _.filter(metrics, function(metric){
        return typeof metric.audience !== "undefined"
      })
      metrics = this.expandMetricMetadta(metrics, itemData.biblio.year)
      metrics = this.getMetricPercentiles(metrics)

      _.each(metrics, function(metric){
        console.log("metric: ", metric)
        metric.award = Award.makeForSingleMetric(metric.audience, metric.engagementType, metric)
      })

      console.log("metrics!", metrics)
      return metrics
    }

    ,getGenre: function(itemData) {
      if (itemData.biblio) {
        return itemData.biblio.genre;
      }
      else if (itemData.headingValue) {
        return itemData.headingValue;
      }
    }

    ,getBadgeCount: function(itemData) {
      if (itemData.biblio) {
        return this.makeAwards(itemData).length;
      }
      return 0;
    }

    ,makeBiblio: function(itemData) {
      var biblio = itemData.biblio
      biblio.url = (itemData.aliases.url) ?  itemData.aliases.url[0] : false
      biblio.title = biblio.title || "no title"
      if (biblio.authors) {
        // screws up names w/ commas in them
        var auths = biblio.authors.split(",", 3).join(",") // first 3 authors
        if (auths.length < biblio.authors.length) auths += " et al."
        biblio.authors = auths
      }

      return biblio
    }

  ,makeAwards: function(itemData) {

      var metrics = this.makeMetrics(itemData)
      
      var awards = []
      var audiencesObj = itemOmitUndefinedv(_.groupBy(metrics, "audience"))
      _.each(audiencesObj, function(audienceMetrics, audienceName) {

        var engagementTypesObj = itemOmitUndefinedv(_.groupBy(audienceMetrics, "engagementType"))
        _.each(engagementTypesObj, function(engagementType, engagementTypeName) {
          var awardDict = Award.make(audienceName, engagementTypeName, engagementType)
          awards.push(awardDict)
        })
      })

      return awards
    }





    // developing countries as per IMF 2012, plus Cuba and North Korea (not IMF members)
    // see http://www.imf.org/external/pubs/ft/weo/2012/01/pdf/text.pdf
    ,developing_countries: "Afghanistan|Albania|Algeria|Angola|Antigua and Barbuda|Argentina|Armenia|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burma|Burundi|Cambodia|Cameroon|Cape Verde|Central African Republic|Chad|Chile|China|Colombia|Comoros|Cuba|Democratic Republic of the Congo|Republic of the Congo|Costa Rica|C\u00F4te d Ivoire|Croatia|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Ethiopia|Fiji|Gabon|The Gambia|Georgia|Ghana|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hungary|India|Indonesia|Iran|Iraq|Jamaica|Jordan|Kazakhstan|Kenya|Kiribati|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Lithuania|Macedonia|Madagascar|Malawi|Malaysia|Maldives|Mali|Marshall Islands|Mauritania|Mauritius|Mexico|Federated States of Micronesia|Moldova|Mongolia|Montenegro|Morocco|Mozambique|Namibia|Nauru|Nepal|Nicaragua|Niger|Nigeria|North Korea|Oman|Pakistan|Palau|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|S\u00E3o Tom\u00E9 and Pr\u00EDncipe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Solomon Islands|Somalia|South Africa|South Sudan|Sri Lanka|Sudan|Suriname|Swaziland|Syria|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|Uruguay|Uzbekistan|Vanuatu|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe"


    ,addMetricsInfoDataToMetrics: function(metrics) {
      _.map(metrics, function(metric, metricName){
        _.extend(metric, metricInfo[metricName])
      })
      return metrics
    }

    ,get_mendeley_percent: function(metricDict, key_substring) {

      if (metricDict == undefined) {
        return 0
      }

      // values.raw holds an array of {name:<name>, value: <value>} objects.
      // this gets just ones where key_substring is a substring of <name>
      var re = new RegExp(key_substring, 'i');
      var mendeleyRelevantKeys = metricDict.values.raw.filter(function(x) {return x["name"].match(re)})
      if (typeof mendeleyRelevantKeys[0] == "undefined") {
        // no students or developing countries or whatever
        return(0)
      }

      // list the percent scores for values whose names match our substring
      var mendeleyPercentages = mendeleyRelevantKeys.map(function(x) {return x["value"]})
      if (typeof mendeleyPercentages[0] == "undefined") {  // not sure if this needs to be here?
        return(0)
      }

      sum = eval(mendeleyPercentages.join("+")) // dangerous, replace
      return(sum)
    }


    ,mendeley_reader_subset_count: function(metricsDict, subset_type){
      var percent

      // given all the metrics, gets the count of a certain subset of readers by type
      if (typeof metricsDict["mendeley:readers"] == "undefined") {
        // can't get a subset of readers if there are no readers
        return(0)
      }

      if (subset_type == "student") {
        percent = this.get_mendeley_percent(
          metricsDict["mendeley:career_stage"],
          "student"
        )
      }
      if (subset_type == "developing_countries") {
        percent = this.get_mendeley_percent(
          metricsDict["mendeley:country"],
          this.developing_countries
        )
      }

      total_mendeley_readers = metricsDict["mendeley:readers"].values.raw

      // here we figure actual number from percentage
      total = Math.round(total_mendeley_readers * percent / 100)

      return(total)
    }


    ,update_metric: function(metric, display_name, value) {
      metric["static_meta"]["display_name"] = display_name
      metric["values"] = {}
      metric["values"]['raw'] = value
      return(metric)
    }


    ,add_derived_metrics: function(metricsDict) {
      var templateMetric
      var newMetric

      // mendeley student readers
      var total = this.mendeley_reader_subset_count(metricsDict, "student")
      if (total > 0) {
        templateMetric = $.extend(true, {}, metricsDict["mendeley:readers"])
        newMetric = this.update_metric(templateMetric,
                                           "readers: students",
                                           total)
        metricsDict["mendeley:student_readers"] = newMetric
      }

      // mendeley developing countries
      var total = this.mendeley_reader_subset_count(metricsDict, "developing_countries")
      if (total > 0) {
        templateMetric = $.extend(true, [], metricsDict["mendeley:readers"])
        newMetric = this.update_metric(templateMetric,
                                           "readers: developing countries",
                                           total)
        metricsDict["mendeley:developing_countries"] = newMetric
      }

      return(metricsDict)
    }


    ,getMetricPercentiles: function(metricsDict) {
      for (var metricName in metricsDict) {
        for (var normRefSetName in metricsDict[metricName].values) {
          if (normRefSetName.indexOf("raw") == -1) {
            metricsDict[metricName].percentiles = metricsDict[metricName].values[normRefSetName]
            metricsDict[metricName].topPercent =
              100 - metricsDict[metricName].percentiles.CI95_lower

            // hacky short-term way to determine which reference set was used
            var refSet
            if (normRefSetName == "WoS") {
              refSet = "Web of Science"
              storageVerb = "indexed by"
            }
            else if (normRefSetName == "dryad"){
              refSet = "Dryad"
              storageVerb = "added to"
            }
            else if (normRefSetName == "figshare"){
              refSet = "figshare"
              storageVerb = "added to"
            }
            else if (normRefSetName == "github"){
              refSet = "GitHub"
              storageVerb = "added to"
            }
            metricsDict[metricName].refSet = refSet
            metricsDict[metricName].referenceSetStorageVerb = storageVerb
          }
        }
      }
      return metricsDict
    }


    ,expandMetricMetadta: function(metrics, year) {
      var interactionDisplayNames = {
        "f1000": "recommendations",
        "pmc_citations": "citations"
      }

      _.map(metrics, function(metric) {
        metric.displayCount = metric.values.raw

        // deal with F1000's troublesome "count" of "Yes." Can add others later.
        metric.actualCount = (metric.values.raw == "Yes") ? 1 : metric.values.raw

        var plural = metric.actualCount > 1

        // add the environment and what's the user did:
        metric.environment = metric.static_meta.provider
        var interaction = metric.name.split(":")[1].replace("_", " ")
        if (interactionDisplayNames[interaction]){
          interaction = interactionDisplayNames[interaction]
        }

        metric.displayInteraction = (plural) ? interaction : interaction.slice(0, -1)


        // other things
        metric.referenceSetYear = year
      })


      return metrics
    }



  };
})

  .controller('productCtrl', function ($scope, Product, $location, security) {

      if (!$scope.product.isHeading){ // deal with hacky "heading products" that aren't real products.
        $scope.biblio = Product.makeBiblio($scope.product)
        $scope.metrics = Product.makeMetrics($scope.product)
        $scope.awards = Product.makeAwards($scope.product)
      }

      $scope.hasMetrics = function(){
        return _.size($scope.metrics);
      }
      $scope.getProductPageUrl = function(){
        return $location.path() + "/product/" + $scope.product._id
      }

  })


  .directive('productBiblio', function(Product) {
    return {
      restrict: 'A',
      link: function(scope, elem, atts) {

      }
    }


  })



































function ItemView($) {

  this.sortByMetricValueDesc = function(metric1, metric2){
    if (typeof metric1.value != "number")
      return 1
    if (typeof metric2.value != "number")
      return -1
    if (metric1.value < metric2.value)
      return 1;
    if (metric1.value > metric2.value)
      return -1;
    return 0;
  }



  this.findBarLabelOffsets = function(start, end) {
    var minWidth = 27
    if (end == 100) {
      minWidth = 32
    }

    var width = end - start
    if (width < minWidth) {
      var widthToAdd = width - minWidth
      var offset = widthToAdd / 2
    }
    else {
      var offset = 0
    }

    return offset
  }

  this.findBarMargins = function(CIstart, CIend) {
    var minWidth = 7
    var leftMargin = CIstart
    var rightMargin = 100 - CIend

    var amountLessThanMinWidth = minWidth - (CIend - CIstart)
    if (amountLessThanMinWidth > 0) {
      leftMargin -= amountLessThanMinWidth / 2
      rightMargin -= amountLessThanMinWidth / 2
    }


    return [leftMargin, rightMargin]
  }


  this.renderZoom = function(awards) {
    // first make this into a 2-D array
    var engagementTable = {}
    engagementTable.audiences = _.chain(awards)
      .groupBy("audience")
      .map(function(awards, audienceName) {
             return {
               audience: audienceName,
               cells:_.sortBy(awards, function(x){ return x.displayOrder})
             }
           })
      .sortBy(function(x){ return x.audience})
      .reverse()
      .value()

    var zoom$ = $(ich.zoomTable(engagementTable, true))

    var thisThing = this
    zoom$.find("div.metric-perc-range.ci").each(function(){

      // where does the bar go?
      var ciStartValue = $(this).find("span.endpoint.start span.value").text()
      var ciEndValue = $(this).find("span.endpoint.end span.value").text()

      var offset = thisThing.findBarLabelOffsets(ciStartValue, ciEndValue)

      var margins = thisThing.findBarMargins(ciStartValue, ciEndValue)

      $(this).css(
        {
          "margin-left":margins[0]+"%",
          "margin-right":margins[1]+"%"
        })
        .find("span.endpoint.start").css("left", offset+"px")
        .end()
        .find("span.endpoint.end").css("right", offset+"px")
    })
    zoom$.find("ul.metrics div.meta img").tooltip()
    zoom$.find("ul.metrics div.metric-perc-range").tooltip()
    return zoom$
  }

  this.renderBadges = function(awards) {

    awards = _.sortBy(awards, "audience").reverse()
    var awardsForRendering = _(awards).groupBy("isHighly")
    var badges$ = $(ich.badges({
                                 big: awardsForRendering["true"],
                                 any:awardsForRendering["false"]
                               }), true)
    badges$.find(".ti-badge").popover({
                                        trigger:"hover",
                                        placement:"bottom",
                                        html:"true"
                                      })
    return badges$
  }

  this.render = function(item){
    var item$ = ich.displayItem(item)

    var url = (item.aliases.url) ?  item.aliases.url[0] : false
    var biblio$ = this.renderBiblio(item.biblio, url)
    item$.find("div.biblio").append(biblio$)

    if (item.awards.length > 0) {
      var zoom$ = this.renderZoom(item.awards, true)
      item$.find("div.zoom").append(zoom$)

      var badges$ = this.renderBadges(item.awards)
      item$.find("div.badges").append(badges$)
    }
    else {
      item$.find("div.zoom").append(
        "<span>We weren't able to find any impact data for this item</span>")
      item$.addClass("no-data")

    }

    return item$
  }
}


angular.module("profileProduct", [
    'resources.users',
    'product.product',
    'services.loading',
    'ui.bootstrap',
    'security'
  ])



  .config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when("/:url_slug/product/:tiid", {
      templateUrl:'profile-product/profile-product-page.tpl.html',
      controller:'ProfileProductPageCtrl'
    });

  }])

  .controller('ProfileProductPageCtrl', function ($scope, $routeParams, $modal, security, UsersProduct, UsersAbout, Product, Loading) {

    var slug = $routeParams.url_slug
    Loading.start()

    $scope.userSlug = slug
    $scope.loading = Loading

    $scope.profileAbout = UsersAbout.get({
        id: slug,
        idType: "url_slug"
    })
    $scope.openInfoModal = function(){
      $modal.open({templateUrl: "profile-product/percentilesInfoModal.tpl.html"})
    }


    $scope.product = UsersProduct.get({
      id: slug,
      tiid: $routeParams.tiid,
      idType: "url_slug"
    },
    function(data){
      console.log("data", data)
      $scope.biblio = Product.makeBiblio(data)
      $scope.metrics = Product.makeMetrics(data)
      Loading.finish()
    }
    )
  })

  .controller('modalCtrl')

angular.module("profile", [
  'resources.users',
  'product.product',
  'ui.bootstrap',
  'security'
])


.factory('UserProfile', function(UsersAbout, security){
  return {
    filterProducts: function(products, filterBy) {
      var productsWithMetrics = _.filter(products, function(x){return _.size(x.metrics); });
      var productsWitoutMetrics = _.filter(products, function(x){return x.metrics && _.size(x.metrics)==0; });
      var pseudoProducts = _.filter(products, function(x){return !x.metrics; });

      if (filterBy == "withMetrics") {
        return productsWithMetrics;
      }
      else if (filterBy === "withoutMetrics") {
        return productsWitoutMetrics;
      }
      else {
        return productsWithMetrics.concat(productsWitoutMetrics);
      }
    },
    getUser: function($scope, slug) {
      console.log("getUser")
      return UsersAbout.get(
        {
          id: slug,
          idType: "url_slug"
        },
        function(resp) {}, // success callback
        function(resp) {
          if (resp.status == 404) {
            $scope.userExists = false;
            $scope.slug = slug;
          }
        }
      );
    },
    slugIsCurrentUser: function(slug){
      if (!security.currentUser) return false;
      return (security.currentUser.url_slug == slug);
    }
  }
})



.config(['$routeProvider', function ($routeProvider) {

  $routeProvider.when("/:url_slug", {
    templateUrl:'profile/profile.tpl.html',
    controller:'ProfileCtrl'
  })
}])







.controller('ProfileCtrl', function ($scope, $routeParams, $http, UsersProducts, Product, UserProfile)
  {
    var userSlug = $routeParams.url_slug;
    $scope.userExists = true;
    $scope.showProductsWithoutMetrics = false;
    $scope.filterProducts =  UserProfile.filterProducts;
    $scope.user = UserProfile.getUser($scope, userSlug);
    $scope.currentUserIsProfileOwner = UserProfile.slugIsCurrentUser(userSlug);



    $scope.getBadgeCount = function(product) {
      return Product.getBadgeCount(product) * -1;
    }

    $scope.getGenre = function(product) {
      return Product.getGenre(product);
    }

    $scope.products = UsersProducts.query({
      id: userSlug,
      includeHeadingProducts: true,
      idType: "url_slug"
    });

});



angular.module("settings.pageDescriptions", [])
angular.module('settings.pageDescriptions')
.factory('SettingsPageDescriptions', function(){
           
  var settingsPageDisplayNames = [
    "Profile",
    "Custom URL",
    "Email",
    "Password"
  ]

  var urlPathFromDisplayName = function(displayName){
    return "/settings/" + displayName.replace(" ", "-").toLowerCase();
  }           
  var templatePathFromDisplayName = function(displayName){
    return urlPathFromDisplayName(displayName).substring(1) + "-settings.tpl.html";
  }

  var settingsPageDescriptions = [];
           
  // make a list of objects, each describing one our our settings pages.
  _.each(settingsPageDisplayNames, function(pageDisplayName) {
   var settingsPageObj = {
     displayName: pageDisplayName,
     urlPath: urlPathFromDisplayName(pageDisplayName),
     templatePath: templatePathFromDisplayName(pageDisplayName)
   };
    settingsPageDescriptions.push(settingsPageObj);
  })
           
  return {
    get: function(){
      return settingsPageDescriptions;
    }
    ,getDescrFromPath: function(path){
      return _.findWhere(settingsPageDescriptions, {urlPath: path})
    }
  };

})
angular.module('settings', [
    'resources.users',
    'services.loading',
    'directives.spinner',
    'settings.pageDescriptions',
    'services.i18nNotifications',
    'security',
    'directives.forms'])

  .config(function ($routeProvider) {

    $routeProvider.when('/settings/:page',
      {
        templateUrl:'settings/settings.tpl.html',
        controller: "settingsCtrl",
        resolve:{
          authenticatedUser:function (security) {
            return security.requestCurrentUser();
          }
        }
      }
    )
  })

  .controller('settingsCtrl', function ($scope, $location, authenticatedUser, SettingsPageDescriptions, $routeParams, Loading) {

    $scope.resetUser = function(){
      $scope.user = angular.copy(authenticatedUser)
    }
    $scope.home = function(){
      $location.path('/' + authenticatedUser.url_slug);
    }
    $scope.isCurrentPath = function(path) {
      return path == $location.path();
    }

    $scope.onCancel = function(){
      $scope.resetUser();
      $scope.home();
    }

    $scope.testClick = function(formCtrl){
      formCtrl.$setPristine()
    }

    var currentPageDescr = SettingsPageDescriptions.getDescrFromPath($location.path());
    console.log(currentPageDescr)

    $scope.resetUser()
    Loading.finish()
    $scope.include =  currentPageDescr.templatePath;
    $scope.authenticatedUser = authenticatedUser;
    $scope.pageDescriptions = SettingsPageDescriptions.get();

  })

  .controller('profileSettingsCtrl', function ($scope, UsersAbout, security, i18nNotifications, Loading) {
    $scope.onSave = function() {
      Loading.start()
      UsersAbout.patch(
        $scope.user.id,
        {about: $scope.user},
        function(resp) {
          security.currentUser = resp.about; // update the current authenticated user.
          i18nNotifications.pushForNextRoute('settings.profile.change.success', 'success');
          $scope.home();
        }
      )
    };
  })

  .controller('passwordSettingsCtrl', function ($scope, UsersPassword, security, i18nNotifications, Loading) {

    $scope.showPassword = false;

    $scope.onSave = function() {
      Loading.start()

      UsersPassword.save(
        {id: $scope.user.id},
        $scope.user,
        function(resp) {
          i18nNotifications.pushForNextRoute('settings.password.change.success', 'success');
          $scope.home()
        },
        function(resp) {
          i18nNotifications.pushForCurrentRoute('settings.password.change.error.unauthenticated', 'danger');
          Loading.finish()
          $scope.resetUser();  // reset the form
          $scope.wrongPassword = true;
          scroll(0,0)
        }
      )
    };
  })



  .controller('urlSettingsCtrl', function ($scope, UsersAbout, security, $location, i18nNotifications, Loading) {

     $scope.onSave = function() {
       Loading.start()
      UsersAbout.patch(
        $scope.user.id,
        {about: $scope.user},
        function(resp) {
          security.currentUser = resp.about; // update the current authenticated user.
          i18nNotifications.pushForNextRoute('settings.url.change.success', 'success');
          $location.path('/' + resp.about.url_slug)
        }
      )
    };
  })



  .controller('emailSettingsCtrl', function ($scope, UsersAbout, security, $location, i18nNotifications, Loading) {

     $scope.onSave = function() {
      Loading.start()
      UsersAbout.patch(
        $scope.user.id,
        {about: $scope.user},
        function(resp) {
          security.currentUser = resp.about; // update the current authenticated user.
          i18nNotifications.pushForNextRoute(
            'settings.email.change.success',
            'success',
            {email: resp.about.email}
          );
          $location.path('/' + resp.about.url_slug)
        }
      )
    };
  })

angular.module( 'signup', [
    'services.slug',
    'resources.users',
    'update.update',
    'security.service',
    'importers.allTheImporters',
    'importers.importer'
    ])
  .factory("Signup", function($rootScope, $location, NewProfile, Users, Update, $modal){

    var signupSteps = [
      "name",
      "url",
      "products",
      "password"
    ]
    var currentSignupStepRegex = /^\/signup\/(\w+)$/;
    var getCurrentStep = function(){
      var res = currentSignupStepRegex.exec($location.path())
      if (res && res[1]) {
        return res[1];
      }
      else {
        return undefined;
      }

    }
    var getIndexOfCurrentStep = function(){
       return _.indexOf(signupSteps, getCurrentStep())
    }


    var showUpdateModalThenRedirectWhenDone = function(){
       Update.showUpdate(
         NewProfile.getId(),
         function(){
           $location.path("/" + NewProfile.getSlug())
         })
     }


    return {
      init: function(){
        $rootScope.showHeaderAndFooter = false;
      },
      signupSteps: function(){
        return signupSteps;
      },
      onSignupStep: function(step){
        return $location.path().indexOf("/signup/"+step.toLowerCase()) === 0;
      },

      goToNextSignupStep: function() {
        if (NewProfile.readyToCreateOnServer()) {
          Users.save(
            {id: NewProfile.about.url_slug, idType: "url_slug"},
            NewProfile.about,
            function(resp, headers){
              NewProfile.setId(resp.user.id)

              console.log("set NewProfile.getId(): ", NewProfile.getId())
          })
        }

        NewProfile.setEmail()
        NewProfile.setPassword()

        var nextPage = signupSteps[getIndexOfCurrentStep() + 1]
        if (typeof nextPage === "undefined") {
          showUpdateModalThenRedirectWhenDone()
        }
        else {
          $location.path("/signup/" + nextPage)
        }
      },

      isBeforeCurrentSignupStep: function(stepToCheck) {
        var indexOfStepToCheck = _.indexOf(signupSteps, stepToCheck)
        return getIndexOfCurrentStep() > -1 && indexOfStepToCheck < getIndexOfCurrentStep()
      },
      getTemplatePath: function(){
        return "signup/signup-" + getCurrentStep() + '.tpl.html';
      }
    }
  })

  .factory("NewProfile", function(Slug, UsersAbout, UsersPassword, security){
    var about = {}
    var products = []
    var id
    return {
      makeSlug: function(){
        about.url_slug = Slug.make(about.givenName, about.surname)
      },
      readyToCreateOnServer: function(){
        return about.url_slug && !id;
      },
      setEmail: function() {
        if (about.email) {
          UsersAbout.patch(
            {"id": id},
            {about: {email: about.email}},
            function(resp) {
              console.log("updated creds", resp)
            }
          )
        }
      },

      setPassword: function(){
        if (about.password && about) {
          UsersPassword.save(
            {"id": id},
            {newPassword: about.password},
            function(data){ // runs on successful password set.
              console.log("we set the password successfully. logging the user in")
              var user = security.requestCurrentUser()
              console.log("we found this user: ", user)
            }
          )
        }
      },
      setId: function(newId){id = newId},
      getId: function(){return id},
      getSlug: function(){return about.url_slug},
      "about": about
    }


  })

.config(['$routeProvider', function($routeProvider) {

  $routeProvider
    .when("/signup/:step", {
      templateUrl: 'signup/signup.tpl.html',
      controller: 'signupCtrl'
    })
    .when('/signup', {redirectTo: '/signup/name'});

}])

  .controller('signupCtrl', function($scope, Signup, NewProfile){
    Signup.init()

    $scope.signupSteps = Signup.signupSteps();
    $scope.isStepCurrent = Signup.onSignupStep;
    $scope.isStepCompleted = Signup.isBeforeCurrentSignupStep;
    $scope.goToNextStep = Signup.goToNextSignupStep;

    $scope.profileAbout = NewProfile.about

    $scope.include =  Signup.getTemplatePath();
    $scope.inputCtrl =  Signup.getTemplatePath();
    $scope.pristineOk =  true;


  })

  .controller( 'signupNameCtrl', function ( $scope, Signup ) {
  })

  .controller( 'signupUrlCtrl', function ( $scope, Signup, NewProfile) {
    NewProfile.makeSlug()
  })

  .controller( 'signupProductsCtrl', function ( $scope, Signup, AllTheImporters ) {
    $scope.importers = AllTheImporters.get()
    $scope.pristineOk =  true;

  })

  .controller( 'signupPasswordCtrl', function ( $scope, Signup ) {
  })

  .controller( 'signupCreatingCtrl', function ( $scope, $timeout, $location, NewProfile, UsersProducts ) {

    $scope.updateStatus = {
      numDone: 0,
      numNotDone: 0
    }

    (function tick() {
      console.log("Tick! NewProfile.getId(): ", NewProfile.getId());


      UsersProducts.query(
        {id: NewProfile.getId()},
//        {id:183},
        function(resp){
          console.log("i got some products!", resp);

          if (numDone(resp, false) == 0) {
            var profilePath = "/"+NewProfile.getSlug();
            console.log("redirecting to path", profilePath);
            $location.path(profilePath);
            $timeout.cancel(signupPoll);
          }

          $scope.numDone = numDone(resp, true)
          $scope.numNotDone = numDone(resp, false)

          var signupPoll = $timeout(tick, 500);

        }
      )
    })();


  })

;

angular.module( 'update.update', [
    'resources.users'
  ])
  .factory("Update", function($rootScope, $location, UsersProducts, $timeout, $modal){

    var updateStatus = {
      numDone: null,
      numNotDone: null,
      percentComplete: null
    }
    var firstCheck = true

    var keepPolling = function(userId, onFinish){


      if (firstCheck || updateStatus.numNotDone > 0) {
        firstCheck = false
        UsersProducts.query(
          {id: userId},
          function(resp){
            updateStatus.numDone = numDone(resp, true)
            updateStatus.numNotDone = numDone(resp, false)
            updateStatus.percentComplete = updateStatus.numDone * 100 / (updateStatus.numDone + updateStatus.numNotDone)

            $timeout(function(){keepPolling(userId, onFinish)}, 500);
          })
      }
      else {

        onFinish()
      }
    }

    var numDone = function(products, completedStatus){
       var productsDone =  _.filter(products, function(product){
         return !product.currently_updating
       })

       if (completedStatus) {
         return productsDone.length
       }
       else {
         return products.length - productsDone.length
       }
    };

    var update = function(userId, onFinish){
      var modal = $modal.open({
        templateUrl: 'update/update-progress.tpl.html',
        controller: 'updateProgressModalCtrl',
        backdrop:"static",
        keyboard: false
      });

      keepPolling(userId, function(){
        modal.close()
        onFinish()
      })

    }


    return {
      showUpdate: update,
      'updateStatus': updateStatus
    }
  })
  .controller("updateProgressModalCtrl", function($scope, Update){
    $scope.updateStatus = Update.updateStatus
  })

angular.module('directives.crud', ['directives.crud.buttons', 'directives.crud.edit']);

angular.module('directives.crud.buttons', [])

.directive('crudButtons', function () {
  return {
    restrict:'E',
    replace:true,
    template:
      '<div>' +
      '  <button type="button" class="btn btn-primary save" ng-disabled="!canSave()" ng-click="save()">Save</button>' +
      '  <button type="button" class="btn btn-warning revert" ng-click="revertChanges()" ng-disabled="!canRevert()">Revert changes</button>'+
      '  <button type="button" class="btn btn-danger remove" ng-click="remove()" ng-show="canRemove()">Remove</button>'+
      '</div>'
  };
});
angular.module('directives.crud.edit', [])

// Apply this directive to an element at or below a form that will manage CRUD operations on a resource.
// - The resource must expose the following instance methods: $saveOrUpdate(), $id() and $remove()
.directive('crudEdit', ['$parse', function($parse) {
  return {
    // We ask this directive to create a new child scope so that when we add helper methods to the scope
    // it doesn't make a mess of the parent scope.
    // - Be aware that if you write to the scope from within the form then you must remember that there is a child scope at the point
    scope: true,
    // We need access to a form so we require a FormController from this element or a parent element
    require: '^form',
    // This directive can only appear as an attribute
    link: function(scope, element, attrs, form) {
      // We extract the value of the crudEdit attribute
      // - it should be an assignable expression evaluating to the model (resource) that is going to be edited
      var resourceGetter = $parse(attrs.crudEdit);
      var resourceSetter = resourceGetter.assign;
      // Store the resource object for easy access
      var resource = resourceGetter(scope);
      // Store a copy for reverting the changes
      var original = angular.copy(resource);

      var checkResourceMethod = function(methodName) {
        if ( !angular.isFunction(resource[methodName]) ) {
          throw new Error('crudEdit directive: The resource must expose the ' + methodName + '() instance method');
        }
      };
      checkResourceMethod('$saveOrUpdate');
      checkResourceMethod('$id');
      checkResourceMethod('$remove');

      // This function helps us extract the callback functions from the directive attributes
      var makeFn = function(attrName) {
        var fn = scope.$eval(attrs[attrName]);
        if ( !angular.isFunction(fn) ) {
          throw new Error('crudEdit directive: The attribute "' + attrName + '" must evaluate to a function');
        }
        return fn;
      };
      // Set up callbacks with fallback
      // onSave attribute -> onSave scope -> noop
      var userOnSave = attrs.onSave ? makeFn('onSave') : ( scope.onSave || angular.noop );
      var onSave = function(result, status, headers, config) {
        // Reset the original to help with reverting and pristine checks
        original = result;
        userOnSave(result, status, headers, config);
      };
      // onRemove attribute -> onRemove scope -> onSave attribute -> onSave scope -> noop
      var onRemove = attrs.onRemove ? makeFn('onRemove') : ( scope.onRemove || onSave );
      // onError attribute -> onError scope -> noop
      var onError = attrs.onError ? makeFn('onError') : ( scope.onError || angular.noop );

      // The following functions should be triggered by elements on the form
      // - e.g. ng-click="save()"
      scope.save = function() {
        resource.$saveOrUpdate(onSave, onSave, onError, onError);
      };
      scope.revertChanges = function() {
        resource = angular.copy(original);
        resourceSetter(scope, resource);
      };
      scope.remove = function() {
        if(resource.$id()) {
          resource.$remove(onRemove, onError);
        } else {
          onRemove();
        }
      };

      // The following functions can be called to modify the behaviour of elements in the form
      // - e.g. ng-disable="!canSave()"
      scope.canSave = function() {
        return form.$valid && !angular.equals(resource, original);
      };
      scope.canRevert = function() {
        return !angular.equals(resource, original);
      };
      scope.canRemove = function() {
        return resource.$id();
      };
      /**
       * Get the CSS classes for this item, to be used by the ng-class directive
       * @param {string} fieldName The name of the field on the form, for which we want to get the CSS classes
       * @return {object} A hash where each key is a CSS class and the corresponding value is true if the class is to be applied.
       */
      scope.getCssClasses = function(fieldName) {
        var ngModelContoller = form[fieldName];
        return {
          error: ngModelContoller.$invalid && !angular.equals(resource, original),
          success: ngModelContoller.$valid && !angular.equals(resource, original)
        };
      };
      /**
       * Whether to show an error message for the specified error
       * @param {string} fieldName The name of the field on the form, of which we want to know whether to show the error
       * @param  {string} error - The name of the error as given by a validation directive
       * @return {Boolean} true if the error should be shown
       */
      scope.showError = function(fieldName, error) {
        return form[fieldName].$error[error];
      };
    }
  };
}]);
angular.module('directives.gravatar', [])

// A simple directive to display a gravatar image given an email
.directive('gravatar', ['md5', function(md5) {

  return {
    restrict: 'E',
    template: '<img ng-src="http://www.gravatar.com/avatar/{{hash}}{{getParams}}"/>',
    replace: true,
    scope: {
      email: '=',
      size: '=',
      defaultImage: '=',
      forceDefault: '='
    },
    link: function(scope, element, attrs) {
      scope.options = {};
      scope.$watch('email', function(email) {
        if ( email ) {
          scope.hash = md5(email.trim().toLowerCase());
        }
      });
      scope.$watch('size', function(size) {
        scope.options.s = (angular.isNumber(size)) ? size : undefined;
        generateParams();
      });
      scope.$watch('forceDefault', function(forceDefault) {
        scope.options.f = forceDefault ? 'y' : undefined;
        generateParams();
      });
      scope.$watch('defaultImage', function(defaultImage) {
        scope.options.d = defaultImage ? defaultImage : undefined;
        generateParams();
      });
      function generateParams() {
        var options = [];
        scope.getParams = '';
        angular.forEach(scope.options, function(value, key) {
          if ( value ) {
            options.push(key + '=' + encodeURIComponent(value));
          }
        });
        if ( options.length > 0 ) {
          scope.getParams = '?' + options.join('&');
        }
      }
    }
  };
}])

.factory('md5', function() {
  function md5cycle(x, k) {
    var a = x[0],
      b = x[1],
      c = x[2],
      d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);

  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function md51(s) {
    txt = '';
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) {
        tail[i] = 0;
      }
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  /* there needs to be support for Unicode here,
   * unless we pretend that we can redefine the MD-5
   * algorithm for multi-byte characters (perhaps
   * by adding every four 16-bit characters and
   * shortening the sum to 32 bits). Otherwise
   * I suggest performing MD-5 as if every character
   * was two bytes--e.g., 0040 0025 = @%--but then
   * how will an ordinary MD-5 sum be matched?
   * There is no way to standardize text to something
   * like UTF-8 before transformation; speed cost is
   * utterly prohibitive. The JavaScript standard
   * itself needs to look at this: it should start
   * providing access to strings as preformed UTF-8
   * 8-bit unsigned value arrays.
   */

  function md5blk(s) { /* I figured global was faster.   */
    var md5blks = [],
      i; /* Andy King said do it this way. */
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  var hex_chr = '0123456789abcdef'.split('');

  function rhex(n) {
    var s = '', j = 0;
    for (; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
    }
    return s;
  }

  function hex(x) {
    for (var i = 0; i < x.length; i++) {
      x[i] = rhex(x[i]);
    }
    return x.join('');
  }

  function md5(s) {
    return hex(md51(s));
  }

  /* this function is much faster,
  so if possible we use it. Some IEs
  are the only ones I know of that
  need the idiotic second function,
  generated by an if clause.  */

  add32 = function(a, b) {
    return (a + b) & 0xFFFFFFFF;
  };

  if (md5('hello') !== '5d41402abc4b2a76b9719d911017c592') {
    add32 = function (x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF),
        msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    };
  }

  return md5;
});
angular.module('directives.modal', []).directive('modal', ['$parse',function($parse) {
  var backdropEl;
  var body = angular.element(document.getElementsByTagName('body')[0]);
  var defaultOpts = {
    backdrop: true,
    escape: true
  };
  return {
    restrict: 'ECA',
    link: function(scope, elm, attrs) {
      var opts = angular.extend(defaultOpts, scope.$eval(attrs.uiOptions || attrs.bsOptions || attrs.options));
      var shownExpr = attrs.modal || attrs.show;
      var setClosed;

      if (attrs.close) {
        setClosed = function() {
          scope.$apply(attrs.close);
        };
      } else {
        setClosed = function() {
          scope.$apply(function() {
            $parse(shownExpr).assign(scope, false);
          });
        };
      }
      elm.addClass('modal');

      if (opts.backdrop && !backdropEl) {
        backdropEl = angular.element('<div class="modal-backdrop"></div>');
        backdropEl.css('display','none');
        body.append(backdropEl);
      }

      function setShown(shown) {
        scope.$apply(function() {
          model.assign(scope, shown);
        });
      }

      function escapeClose(evt) {
        if (evt.which === 27) { setClosed(); }
      }
      function clickClose() {
        setClosed();
      }

      function close() {
        if (opts.escape) { body.unbind('keyup', escapeClose); }
        if (opts.backdrop) {
          backdropEl.css('display', 'none').removeClass('in');
          backdropEl.unbind('click', clickClose);
        }
        elm.css('display', 'none').removeClass('in');
        body.removeClass('modal-open');
      }
      function open() {
        if (opts.escape) { body.bind('keyup', escapeClose); }
        if (opts.backdrop) {
          backdropEl.css('display', 'block').addClass('in');
          backdropEl.bind('click', clickClose);
        }
        elm.css('display', 'block').addClass('in');
        body.addClass('modal-open');
      }

      scope.$watch(shownExpr, function(isShown, oldShown) {
        if (isShown) {
          open();
        } else {
          close();
        }
      });
    }
  };
}]);

angular.module('directives.pwMatch', [])
  // from http://blog.brunoscopelliti.com/angularjs-directive-to-check-that-passwords-match


  .directive('pwMatch', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwMatch;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = (elem.val()===$(firstPassword).val());
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
  }]);
angular.module("directives.spinner", ['services.loading'])
angular.module("directives.spinner")

  .directive("spinner", function(Loading){
    return {
     restrict: 'E',
     template: '<div class="working help-block" ng-show="loading.is()">' +
       '<i class="icon-refresh icon-spin"></i>' +
       '<span class="text">{{ msg }}...</span>' +
       '</div>',
     link: function(scope, elem, attr, ctrl){
       if (attr.msg) {
         scope.msg = attr.msg;
       }
       else {
         scope.msg = "Loading"
       }

     }

    }
    })
angular.module('directives.forms', [])
.directive('prettyCheckbox', function(){
  // mostly from http://jsfiddle.net/zy7Rg/6/
  return {
    template: '<div class="checkmark-and-text"><i class="icon-check" ng-show=value></i>' +
      '<i class="icon-check-empty" ng-show=!value></i>' +
      '<span class="text">{{ text }}</span></div>',
    restrict: "E",
    replace: true,
    scope: {
      value: "=" // mirror the scope that was passed in...
    },
    link: function(scope, elem, attrs){
      scope.text = attrs.text;
      elem.bind('click', function() {
        scope.$apply(function(){
          scope.value = !scope.value
        });
      });
    }
  }
})

.directive('saveButtons', function(){
  return {
    templateUrl: 'forms/save-buttons.tpl.html',
    replace: true,
    scope: true,
    require: "^form",
    restrict: "E",
    link:function(scope, elem, attr, formController){
      console.log("attr: ", attr)
      scope.action = (attr.action) ? attr.action : "Save";

      scope.isValid = function() {
        return formController.$valid;
      }
    }

  }

})


.directive('requireUnique', function($http, $q, Loading) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {

      var canceler = $q.defer()
      var modelParts =  attr.ngModel.split(".")
      var userModelName = modelParts[0]
      var userPropertyToCheck = modelParts[1];

      var initialValue = scope[userModelName][userPropertyToCheck]

      scope.$watch(attr.ngModel, function(value) {
        ctrl.$setValidity('checkingUnique', false);
        ctrl.$setValidity('requireUnique', true);

        canceler.resolve()

        if (!attr.checkInitialValue && value == initialValue){
          ctrl.$setPristine();
          ctrl.$setValidity('requireUnique', true);
          ctrl.$setValidity('checkingUnique', true);

          Loading.finish();
          return true;
        }

        canceler = $q.defer()
        Loading.start();
        var url = '/user/' + value + '/about?id_type=' + userPropertyToCheck;

        $http.get(url, {timeout: canceler.promise})
        .success(function(data) {
          ctrl.$setValidity('requireUnique', false);
          ctrl.$setValidity('checkingUnique', true);
          ctrl.$dirty = true;
          Loading.finish()
        })
        .error(function(data) {
          if (data) {
            ctrl.$setValidity('requireUnique', true);
            ctrl.$setValidity('checkingUnique', true);
            ctrl.$dirty = true;
            Loading.finish()
          }
        })
      })
    }
  }
})
angular.module('resources.products',['ngResource'])

.factory('Products', function ($resource) {

  return $resource(
   "/importer/:importerName",
   {}
  )
})


angular.module('resources.users',['ngResource'])

  .factory('Users', function ($resource) {

    return $resource(
      "/user/:id?id_type=:idType",
      {idType: "userid"}
    )
  })

  .factory('UsersProducts', function ($resource) {

    return $resource(
      "/user/:id/products?id_type=:idType&include_heading_products=:includeHeadingProducts",
      {
        idType: "userid",
        includeHeadingProducts: false
      },
      {
        update:{
          method: "PUT"
        },
        patch: {
          method: "PATCH"
        }
      }
    )
  })
  .factory('UsersProduct', function ($resource) {

    return $resource(
      "/user/:id/product/:tiid?id_type=:idType",
      {
        idType: "userid"
      },
      {
        update:{
          method: "PUT"
        }
      }
    )
  })

  .factory('UsersAbout', function ($resource) {

    return $resource(
      "/user/:id/about?id_type=:idType",
      {idType: "userid"},
      {
        patch:{
          method: "PATCH",
          params:{id:"@about.id"}
        }
      }
    )
  })

  .factory('UsersPassword', function ($resource) {

    return $resource(
      "/user/:id/password?id_type=:idType",
      {idType: "userid"}
    )
  })

angular.module('security.authorization', ['security.service'])

// This service provides guard methods to support AngularJS routes.
// You can add them as resolves to routes to require authorization levels
// before allowing a route change to complete
.provider('securityAuthorization', {

  requireAdminUser: ['securityAuthorization', function(securityAuthorization) {
    return securityAuthorization.requireAdminUser();
  }],

  requireAuthenticatedUser: ['securityAuthorization', function(securityAuthorization) {
    return securityAuthorization.requireAuthenticatedUser();
  }],

  $get: ['security', 'securityRetryQueue', function(security, queue) {
    var service = {

      // Require that there is an authenticated user
      // (use this in a route resolve to prevent non-authenticated users from entering that route)
      requireAuthenticatedUser: function() {
        var promise = security.requestCurrentUser().then(function(userInfo) {
          if ( !security.isAuthenticated() ) {
            return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
          }
        });
        return promise;
      },

      // Require that there is an administrator logged in
      // (use this in a route resolve to prevent non-administrators from entering that route)
      requireAdminUser: function() {
        var promise = security.requestCurrentUser().then(function(userInfo) {
          if ( !security.isAdmin() ) {
            return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
          }
        });
        return promise;
      }

    };

    return service;
  }]
});
// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security', [
  'security.service',
  'security.interceptor',
  'security.login',
  'security.authorization']);

angular.module('security.interceptor', ['security.retryQueue'])

// This http interceptor listens for authentication failures
.factory('securityInterceptor', ['$injector', 'securityRetryQueue', function($injector, queue) {
  return function(promise) {
    // Intercept failed requests
    return promise.then(null, function(originalResponse) {
      if(originalResponse.status === 401) {
        // The request bounced because it was not authorized - add a new request to the retry queue
        promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
          // We must use $injector to get the $http service to prevent circular dependency
          return $injector.get('$http')(originalResponse.config);
        });
      }
      return promise;
    });
  };
}])

// We have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.responseInterceptors.push('securityInterceptor');
}]);
angular.module('security.login.form', ['services.localizedMessages', 'ui.bootstrap'])

// The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('LoginFormController', function($scope, security, localizedMessages, $modalInstance) {
  // The model for this form 
  $scope.user = {};

  // Any error message from failing to login
  $scope.authError = null;

  $scope.login = function () {
    // Clear any previous security errors
    $scope.authError = null;

    // Try to login
    security.login($scope.user.email, $scope.user.password).then(function(loggedIn) {

      console.log("this is what we got from the security.login promise: ", loggedIn)

      if (loggedIn) {
        $modalInstance.close($scope.user);
      }
      else {
        // If we get here then the login failed due to bad credentials
        console.log("we fired an authError")
        $scope.authError = localizedMessages.get('login.error.invalidCredentials');
      }
    },
    function(x) {
      // If we get here then there was a problem with the login request to the server
        console.log("server error")
      $scope.authError = localizedMessages.get('login.error.serverError', { exception: x });
    });


  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


});
angular.module('security.login', ['security.login.form', 'security.login.toolbar']);
angular.module('security.login.toolbar', [
  'ui.bootstrap'
  ])

// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user
.directive('loginToolbar', ['security', function(security) {
  var directive = {
    templateUrl: 'security/login/toolbar.tpl.html',
    restrict: 'E',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
      $scope.isAuthenticated = security.isAuthenticated;
      $scope.login = security.showLogin;
      $scope.logout = security.logout;
      $scope.$watch(function() {
        return security.currentUser;
      }, function(currentUser) {
        $scope.currentUser = currentUser;
      });
    }
  };
  return directive;
}]);
angular.module('security.retryQueue', [])

// This is a generic retry queue for security failures.  Each item is expected to expose two functions: retry and cancel.
.factory('securityRetryQueue', ['$q', '$log', function($q, $log) {
  var retryQueue = [];
  var service = {
    // The security service puts its own handler in here!
    onItemAddedCallbacks: [],
    
    hasMore: function() {
      return retryQueue.length > 0;
    },
    push: function(retryItem) {
      retryQueue.push(retryItem);
      // Call all the onItemAdded callbacks
      angular.forEach(service.onItemAddedCallbacks, function(cb) {
        try {
          cb(retryItem);
        } catch(e) {
          $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
        }
      });
    },
    pushRetryFn: function(reason, retryFn) {
      // The reason parameter is optional
      if ( arguments.length === 1) {
        retryFn = reason;
        reason = undefined;
      }

      // The deferred object that will be resolved or rejected by calling retry or cancel
      var deferred = $q.defer();
      var retryItem = {
        reason: reason,
        retry: function() {
          // Wrap the result of the retryFn into a promise if it is not already
          $q.when(retryFn()).then(function(value) {
            // If it was successful then resolve our deferred
            deferred.resolve(value);
          }, function(value) {
            // Othewise reject it
            deferred.reject(value);
          });
        },
        cancel: function() {
          // Give up on retrying and reject our deferred
          deferred.reject();
        }
      };
      service.push(retryItem);
      return deferred.promise;
    },
    retryReason: function() {
      return service.hasMore() && retryQueue[0].reason;
    },
    cancelAll: function() {
      while(service.hasMore()) {
        retryQueue.shift().cancel();
      }
    },
    retryAll: function() {
      while(service.hasMore()) {
        retryQueue.shift().retry();
      }
    }
  };
  return service;
}]);

// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
  'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
  'security.login',         // Contains the login form template and controller
  'ui.bootstrap'     // Used to display the login form as a modal dialog.
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$modal', function($http, $q, $location, queue, $modal) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || '/';
    $location.path(url);
  }

  // Login form dialog stuff
  var loginDialog = null;
  function openLoginDialog() {
    console.log("openLoginDialog() fired.")
    loginDialog = $modal.open({
      templateUrl: "security/login/form.tpl.html",
      controller: "LoginFormController"
    });
    loginDialog.result.then();
  }

  // The public API of the service
  var service = {

    // Show the modal login dialog
    showLogin: function() {
      openLoginDialog();
    },

    // Attempt to authenticate a user by the given email and password
    login: function(email, password) {
      var request = $http.post('/user/login', {email: email, password: password})

      request
        .success(function(data, status) {
            service.currentUser = data.user;
            console.log("we've got a current user now", service.currentUser)
          })
        .error(function(data, status, headers, config){
          console.log("oh crap, an error: ", status);
        }
      );

      return request;

    },

    // Logout the current user and redirect
    logout: function(redirectTo) {
      $http.post('/user/logout').then(function() {
        service.currentUser = null;
        redirect(redirectTo);
      });
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      } else {
        return $http.get('/user/current').then(function(response) {
          service.currentUser = response.data.user;
          return service.currentUser;
        });
      }
    },

    // Information about the current user
    currentUser: null,

    // Is the current user authenticated?
    isAuthenticated: function(){
      return !!service.currentUser;
    },
    
    // Is the current user an adminstrator?
    isAdmin: function() {
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  return service;
}]);
angular.module('services.breadcrumbs', []);
angular.module('services.breadcrumbs').factory('breadcrumbs', ['$rootScope', '$location', function($rootScope, $location){

  var breadcrumbs = [];
  var breadcrumbsService = {};

  //we want to update breadcrumbs only when a route is actually changed
  //as $location.path() will get updated imediatelly (even if route change fails!)
  $rootScope.$on('$routeChangeSuccess', function(event, current){

    var pathElements = $location.path().split('/'), result = [], i;
    var breadcrumbPath = function (index) {
      return '/' + (pathElements.slice(0, index + 1)).join('/');
    };

    pathElements.shift();
    for (i=0; i<pathElements.length; i++) {
      result.push({name: pathElements[i], path: breadcrumbPath(i)});
    }

    breadcrumbs = result;
  });

  breadcrumbsService.getAll = function() {
    return breadcrumbs;
  };

  breadcrumbsService.getFirst = function() {
    return breadcrumbs[0] || {};
  };

  return breadcrumbsService;
}]);
angular.module('services.crud', ['services.crudRouteProvider']);
angular.module('services.crud').factory('crudEditMethods', function () {

  return function (itemName, item, formName, successcb, errorcb) {

    var mixin = {};

    mixin[itemName] = item;
    mixin[itemName+'Copy'] = angular.copy(item);

    mixin.save = function () {
      this[itemName].$saveOrUpdate(successcb, successcb, errorcb, errorcb);
    };

    mixin.canSave = function () {
      return this[formName].$valid && !angular.equals(this[itemName], this[itemName+'Copy']);
    };

    mixin.revertChanges = function () {
      this[itemName] = angular.copy(this[itemName+'Copy']);
    };

    mixin.canRevert = function () {
      return !angular.equals(this[itemName], this[itemName+'Copy']);
    };

    mixin.remove = function () {
      if (this[itemName].$id()) {
        this[itemName].$remove(successcb, errorcb);
      } else {
        successcb();
      }
    };

    mixin.canRemove = function() {
      return item.$id();
    };

    /**
     * Get the CSS classes for this item, to be used by the ng-class directive
     * @param {string} fieldName The name of the field on the form, for which we want to get the CSS classes
     * @return {object} A hash where each key is a CSS class and the corresponding value is true if the class is to be applied.
     */
    mixin.getCssClasses = function(fieldName) {
      var ngModelContoller = this[formName][fieldName];
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
        success: ngModelContoller.$valid && ngModelContoller.$dirty
      };
    };

    /**
     * Whether to show an error message for the specified error
     * @param {string} fieldName The name of the field on the form, of which we want to know whether to show the error
     * @param  {string} error - The name of the error as given by a validation directive
     * @return {Boolean} true if the error should be shown
     */
    mixin.showError = function(fieldName, error) {
      return this[formName][fieldName].$error[error];
    };

    return mixin;
  };
});

angular.module('services.crud').factory('crudListMethods', ['$location', function ($location) {

  return function (pathPrefix) {

    var mixin = {};

    mixin['new'] = function () {
      $location.path(pathPrefix+'/new');
    };

    mixin['edit'] = function (itemId) {
      $location.path(pathPrefix+'/'+itemId);
    };

    return mixin;
  };
}]);
(function() {

  function crudRouteProvider($routeProvider) {

    // This $get noop is because at the moment in AngularJS "providers" must provide something
    // via a $get method.
    // When AngularJS has "provider helpers" then this will go away!
    this.$get = angular.noop;

    // Again, if AngularJS had "provider helpers" we might be able to return `routesFor()` as the
    // crudRouteProvider itself.  Then we would have a much cleaner syntax and not have to do stuff
    // like:
    //
    // ```
    // myMod.config(function(crudRouteProvider) {
    //   var routeProvider = crudRouteProvider.routesFor('MyBook', '/myApp');
    // });
    // ```
    //
    // but instead have something like:
    //
    //
    // ```
    // myMod.config(function(crudRouteProvider) {
    //   var routeProvider = crudRouteProvider('MyBook', '/myApp');
    // });
    // ```
    //
    // In any case, the point is that this function is the key part of this "provider helper".
    // We use it to create routes for CRUD operations.  We give it some basic information about
    // the resource and the urls then it it returns our own special routeProvider.
    this.routesFor = function(resourceName, urlPrefix, routePrefix) {
      var baseUrl = urlPrefix + '/' + resourceName.toLowerCase();
      routePrefix = routePrefix || urlPrefix;
      var baseRoute = '/' + routePrefix + '/' + resourceName.toLowerCase();

      // Create the templateUrl for a route to our resource that does the specified operation.
      var templateUrl = function(operation) {
        return baseUrl + '/' + resourceName.toLowerCase() +'-'+operation.toLowerCase()+'.tpl.html';
      };
      // Create the controller name for a route to our resource that does the specified operation.
      var controllerName = function(operation) {
        return resourceName + operation +'Ctrl';
      };

      // This is the object that our `routesFor()` function returns.  It decorates `$routeProvider`,
      // delegating the `when()` and `otherwise()` functions but also exposing some new functions for
      // creating CRUD routes.  Specifically we have `whenList(), `whenNew()` and `whenEdit()`.
      var routeBuilder = {
        // Create a route that will handle showing a list of items
        whenList: function(resolveFns) {
          routeBuilder.when(baseRoute, {
            templateUrl: templateUrl('List'),
            controller: controllerName('List'),
            resolve: resolveFns
          });
          return routeBuilder;
        },
        // Create a route that will handle creating a new item
        whenNew: function(resolveFns) {
          routeBuilder.when(baseRoute +'/new', {
            templateUrl: templateUrl('Edit'),
            controller: controllerName('Edit'),
            resolve: resolveFns
          });
          return routeBuilder;
        },
        // Create a route that will handle editing an existing item
        whenEdit: function(resolveFns) {
          routeBuilder.when(baseRoute+'/:itemId', {
            templateUrl: templateUrl('Edit'),
            controller: controllerName('Edit'),
            resolve: resolveFns
          });
          return routeBuilder;
        },
        // Pass-through to `$routeProvider.when()`
        when: function(path, route) {
          $routeProvider.when(path, route);
          return routeBuilder;
        },
        // Pass-through to `$routeProvider.otherwise()`
        otherwise: function(params) {
          $routeProvider.otherwise(params);
          return routeBuilder;
        },
        // Access to the core $routeProvider.
        $routeProvider: $routeProvider
      };
      return routeBuilder;
    };
  }
  // Currently, v1.0.3, AngularJS does not provide annotation style dependencies in providers so,
  // we add our injection dependencies using the $inject form
  crudRouteProvider.$inject = ['$routeProvider'];

  // Create our provider - it would be nice to be able to do something like this instead:
  //
  // ```
  // angular.module('services.crudRouteProvider', [])
  //   .configHelper('crudRouteProvider', ['$routeProvider, crudRouteProvider]);
  // ```
  // Then we could dispense with the $get, the $inject and the closure wrapper around all this.
  angular.module('services.crudRouteProvider', []).provider('crudRoute', crudRouteProvider);
})();
angular.module('services.exceptionHandler', ['services.i18nNotifications']);

angular.module('services.exceptionHandler').factory('exceptionHandlerFactory', ['$injector', function($injector) {
  return function($delegate) {

    return function (exception, cause) {
      // Lazy load notifications to get around circular dependency
      //Circular dependency: $rootScope <- notifications <- i18nNotifications <- $exceptionHandler
      var i18nNotifications = $injector.get('i18nNotifications');

      // Pass through to original handler
      $delegate(exception, cause);

      // Push a notification error
      i18nNotifications.pushForCurrentRoute('error.fatal', 'error', {}, {
        exception:exception,
        cause:cause
      });
    };
  };
}]);

angular.module('services.exceptionHandler').config(['$provide', function($provide) {
  $provide.decorator('$exceptionHandler', ['$delegate', 'exceptionHandlerFactory', function ($delegate, exceptionHandlerFactory) {
    return exceptionHandlerFactory($delegate);
  }]);
}]);

angular.module('services.httpRequestTracker', []);
angular.module('services.httpRequestTracker').factory('httpRequestTracker', ['$http', function($http){

  var httpRequestTracker = {};
  httpRequestTracker.hasPendingRequests = function() {
    return $http.pendingRequests.length > 0;
  };

  return httpRequestTracker;
}]);
angular.module('services.i18nNotifications', ['services.notifications', 'services.localizedMessages']);
angular.module('services.i18nNotifications').factory('i18nNotifications', ['localizedMessages', 'notifications', function (localizedMessages, notifications) {



  var prepareNotification = function(msgKey, type, interpolateParams, otherProperties) {
     return angular.extend({
       message: localizedMessages.get(msgKey, interpolateParams),
       type: type
     }, otherProperties);
  };

  var I18nNotifications = {
    pushSticky:function (msgKey, type, interpolateParams, otherProperties) {
      return notifications.pushSticky(prepareNotification(msgKey, type, interpolateParams, otherProperties));
    },
    pushForCurrentRoute:function (msgKey, type, interpolateParams, otherProperties) {
      return notifications.pushForCurrentRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
    },
    pushForNextRoute:function (msgKey, type, interpolateParams, otherProperties) {
      return notifications.pushForNextRoute(prepareNotification(msgKey, type, interpolateParams, otherProperties));
    },
    getCurrent:function () {
      return notifications.getCurrent();
    },
    remove:function (notification) {
      return notifications.remove(notification);
    }
  };

  return I18nNotifications;
}]);
angular.module("services.loading", [])
angular.module("services.loading")
.factory("Loading", function(){
  var loading = false;

  return {
    is: function(){return loading},
    set: function(setLoadingTo) {
      loading = !!setLoadingTo;
      return loading
    },
    start: function(){loading = true;},
    finish:function(){loading = false}
  }
})
angular.module('services.localizedMessages', []).factory('localizedMessages', function ($interpolate) {


  var i18nmessages = {
    'errors.route.changeError':'Route change error',
    'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
    'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
    'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
    'crud.user.save.error':"Something went wrong when saving a user...",
    'crud.project.save.success':"A project with id '{{id}}' was saved successfully.",
    'crud.project.remove.success':"A project with id '{{id}}' was removed successfully.",
    'crud.project.save.error':"Something went wrong when saving a project...",
    'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
    'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
    'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
    'login.error.serverError': "There was a problem with authenticating: {{exception}}.",
    'test.first': "This is a test of the notification system...",
    'settings.password.change.success': "Password changed.",
    'settings.password.change.error.unauthenticated': "Sorry, looks like you typed your password wrong.",
    'settings.profile.change.success': "Your profile's been updated.",
    'settings.url.change.success': "Your profile URL has been updated.",
    'settings.email.change.success': "Your email has been updated to {{email}}."

  };

  var handleNotFound = function (msg, msgKey) {
    return msg || '?' + msgKey + '?';
  };

  return {
    get : function (msgKey, interpolateParams) {
      var msg =  i18nmessages[msgKey];
      if (msg) {
        return $interpolate(msg)(interpolateParams);
      } else {
        return handleNotFound(msg, msgKey);
      }
    }
  };
});
angular.module('services.notifications', []).factory('notifications', ['$rootScope', function ($rootScope) {

  var notifications = {
    'STICKY' : [],
    'ROUTE_CURRENT' : [],
    'ROUTE_NEXT' : []
  };
  var notificationsService = {};

  var addNotification = function (notificationsArray, notificationObj) {
    if (!angular.isObject(notificationObj)) {
      throw new Error("Only object can be added to the notification service");
    }
    notificationsArray.push(notificationObj);
    return notificationObj;
  };

  $rootScope.$on('$routeChangeSuccess', function () {
    notifications.ROUTE_CURRENT.length = 0;

    notifications.ROUTE_CURRENT = angular.copy(notifications.ROUTE_NEXT);
    notifications.ROUTE_NEXT.length = 0;
  });

  notificationsService.getCurrent = function(){
    return [].concat(notifications.STICKY, notifications.ROUTE_CURRENT);
  };

  notificationsService.pushSticky = function(notification) {
    return addNotification(notifications.STICKY, notification);
  };

  notificationsService.pushForCurrentRoute = function(notification) {
    return addNotification(notifications.ROUTE_CURRENT, notification);
  };

  notificationsService.pushForNextRoute = function(notification) {
    return addNotification(notifications.ROUTE_NEXT, notification);
  };

  notificationsService.remove = function(notification){
    angular.forEach(notifications, function (notificationsByType) {
      var idx = notificationsByType.indexOf(notification);
      if (idx>-1){
        notificationsByType.splice(idx,1);
      }
    });
  };

  notificationsService.removeAll = function(){
    angular.forEach(notifications, function (notificationsByType) {
      notificationsByType.length = 0;
    });
  };

  return notificationsService;
}]);
angular.module('services.slug', [])
angular.module('services.slug')
.factory('Slug', function(){
  var removeDiacritics =function(str) {
   // many thanks to https://github.com/backbone-paginator/backbone.paginator/blob/master/plugins/diacritic.js

    var defaultDiacriticsRemovalMap = [
      {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
      {'base':'AA','letters':/[\uA732]/g},
      {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
      {'base':'AO','letters':/[\uA734]/g},
      {'base':'AU','letters':/[\uA736]/g},
      {'base':'AV','letters':/[\uA738\uA73A]/g},
      {'base':'AY','letters':/[\uA73C]/g},
      {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
      {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
      {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
      {'base':'DZ','letters':/[\u01F1\u01C4]/g},
      {'base':'Dz','letters':/[\u01F2\u01C5]/g},
      {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
      {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
      {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
      {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
      {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
      {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
      {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
      {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
      {'base':'LJ','letters':/[\u01C7]/g},
      {'base':'Lj','letters':/[\u01C8]/g},
      {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
      {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
      {'base':'NJ','letters':/[\u01CA]/g},
      {'base':'Nj','letters':/[\u01CB]/g},
      {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
      {'base':'OI','letters':/[\u01A2]/g},
      {'base':'OO','letters':/[\uA74E]/g},
      {'base':'OU','letters':/[\u0222]/g},
      {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
      {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
      {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
      {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
      {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
      {'base':'TZ','letters':/[\uA728]/g},
      {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
      {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
      {'base':'VY','letters':/[\uA760]/g},
      {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
      {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
      {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
      {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
      {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
      {'base':'aa','letters':/[\uA733]/g},
      {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
      {'base':'ao','letters':/[\uA735]/g},
      {'base':'au','letters':/[\uA737]/g},
      {'base':'av','letters':/[\uA739\uA73B]/g},
      {'base':'ay','letters':/[\uA73D]/g},
      {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
      {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
      {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
      {'base':'dz','letters':/[\u01F3\u01C6]/g},
      {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
      {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
      {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
      {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
      {'base':'hv','letters':/[\u0195]/g},
      {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
      {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
      {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
      {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
      {'base':'lj','letters':/[\u01C9]/g},
      {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
      {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
      {'base':'nj','letters':/[\u01CC]/g},
      {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
      {'base':'oi','letters':/[\u01A3]/g},
      {'base':'ou','letters':/[\u0223]/g},
      {'base':'oo','letters':/[\uA74F]/g},
      {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
      {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
      {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
      {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
      {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
      {'base':'tz','letters':/[\uA729]/g},
      {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
      {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
      {'base':'vy','letters':/[\uA761]/g},
      {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
      {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
      {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
      {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
    ];

    for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
      str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
    }

    return str;

  }

  return {
    make: function(givenName, surname) {
      var slug = removeDiacritics(givenName) + removeDiacritics(surname);

      if (/^\w+$/.test(slug)) { // our slug is an ASCII string
        return slug;
      }
      else {
        // we failed to find an ASCII slug that could sorta represent the user's name.
        // so we make a random one, instead.
        var randomInt = (Math.random() + "").substr(2, 5)
        return "user" +  randomInt
      }



    }
  }








})
angular.module("services.uservoiceWidget", [])
angular.module("services.uservoiceWidget")
.factory("UservoiceWidget", function(){

  var tabSettings = {
    "primary": {
      tabColor: '#ff4d00',
      tabPosition: "middle-right"
    },
    "secondary": {
      tabColor: '#999999',
      tabPosition: "bottom-left"
    }
  }

  var uservoiceTabIsInPrimaryPosition = false;

  return {
    updateTabPosition: function(path) {
      if (path.indexOf('/signup/') === 0) {
        this.pushTab("secondary");
      }
      else {
        this.pushTab("primary");
      }
    },

    pushTab: function(settingsKey) {
      try {
        UserVoice.push(['showTab', 'classic_widget', {
          mode: 'full',
          primary_color: '#cc6d00',
          link_color: '#007dbf',
          default_mode: 'feedback',
          forum_id: 166950,
          tab_label: 'Feedback & Support',
          tab_color: tabSettings[settingsKey].tabColor,
          tab_position: tabSettings[settingsKey].tabPosition,
          tab_inverted: false
        }]);
      }
      catch (e) {
        // UserVoice throws this error when you load it again from /signup.
        // not sure what it is, but everything seems to still work, so ignore it.

        var errorsToIgnore = [
          "Cannot read property 'transitionDuration' of null",
          "Cannot read property 'style' of undefined"
        ]

        if (!_.contains(errorsToIgnore, e.message)){
          throw e
        }
      }
    }

  }


})
angular.module('templates.app', ['footer.tpl.html', 'header.tpl.html', 'importers/import-buttons.tpl.html', 'importers/importer.tpl.html', 'infopages/about.tpl.html', 'infopages/faq.tpl.html', 'infopages/landing.tpl.html', 'notifications.tpl.html', 'product/badges.tpl.html', 'product/biblio.tpl.html', 'product/metrics-table.tpl.html', 'profile-product/percentilesInfoModal.tpl.html', 'profile-product/profile-product-page.tpl.html', 'profile/profile.tpl.html', 'settings/custom-url-settings.tpl.html', 'settings/email-settings.tpl.html', 'settings/password-settings.tpl.html', 'settings/profile-settings.tpl.html', 'settings/settings.tpl.html', 'signup/signup-creating.tpl.html', 'signup/signup-name.tpl.html', 'signup/signup-password.tpl.html', 'signup/signup-products.tpl.html', 'signup/signup-url.tpl.html', 'signup/signup.tpl.html', 'update/update-progress.tpl.html']);

angular.module("footer.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("footer.tpl.html",
    "<div id=\"footer\">\n" +
    "   <div class=\"wrapper\">\n" +
    "      <div id=\"footer-branding\" class=\"footer-col\">\n" +
    "         <a class=\"brand\" href=\"/\"><img src=\"/static/img/impactstory-logo.png\" alt=\"ImpactStory\" /></a>\n" +
    "\n" +
    "         <p>We're your impact profile on the web, revealing diverse impacts of your articles, datasets, software, and more.</p>\n" +
    "         <p class=\"license\">\n" +
    "            <!--<a rel=\"license\" href=\"http://creativecommons.org/licenses/by/2.0/\"><img alt=\"Creative Commons License\" style=\"border-width:0\" src=\"http://i.creativecommons.org/l/by/2.0/80x15.png\" /></a>-->\n" +
    "            <span class=\"text\">Except where otherwise noted, content on this site is licensed under the\n" +
    "               <a rel=\"license\" href=\"http://creativecommons.org/licenses/by/2.0/\">CC-BY license</a>.\n" +
    "            </span>\n" +
    "         </p>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "      <div id=\"footer-follow\" class=\"footer-col\">\n" +
    "         <h3>Follow</h3>\n" +
    "         <ul>\n" +
    "            <li><a href=\"http://twitter.com/#!/ImpactStory\">Twitter</a></li>\n" +
    "            <li><a href=\"http://twitter.com/#!/ImpactStory_now\">Site status</a></li>\n" +
    "            <li><a href=\"http://blog.impactstory.org\">Blog</a></li>\n" +
    "            <li><a href=\"https://groups.google.com/forum/?fromgroups#!forum/total-impact\">Newsgroup</a></li>\n" +
    "            <li><a href=\"https://github.com/total-impact\">GitHub</a></li>\n" +
    "\n" +
    "         </ul>\n" +
    "      </div>\n" +
    "\n" +
    "      <div id=\"footer-about\" class=\"footer-col\">\n" +
    "         <h3>About</h3>\n" +
    "         <ul>\n" +
    "            <li><a href=\"/about\">About us</a></li>\n" +
    "            <li><a href=\"http://feedback.impactstory.org\" target=\"_blank\">Feedback</a></li>\n" +
    "            <li>\n" +
    "               <a href=\"javascript:void(0)\" data-uv-lightbox=\"classic_widget\" data-uv-mode=\"full\" data-uv-primary-color=\"#cc6d00\" data-uv-link-color=\"#007dbf\" data-uv-default-mode=\"support\" data-uv-forum-id=\"166950\">Support</a>\n" +
    "            </li>\n" +
    "\n" +
    "\n" +
    "            <li><a href=\"/api-docs\">API/embed</a></li>\n" +
    "            <li><a href=\"/faq\">FAQ</a></li>\n" +
    "            <!--<li><a href=\"/about#contact\">Contact us</a></li>-->\n" +
    "            <li><a href=\"/faq#tos\">Terms of use</a></li>\n" +
    "         </ul>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "      <div id=\"footer-funders\" class=\"footer-col\">\n" +
    "         <h3>Supported by</h3>\n" +
    "         <a href=\"http://sloan.org/\" id=\"footer-sloan-link\">\n" +
    "            <img src=\"/static/img/sloan-logo.png\"  width=\"200\"/>\n" +
    "         </a>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "   </div>\n" +
    "</div> <!-- end footer -->\n" +
    "");
}]);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div class=\"main-header\">\n" +
    "   <div class=\"navbar site-nav\">\n" +
    "      <div class=\"navbar-inner\">\n" +
    "         <a class=\"brand\" href=\"/\"><img src=\"/static/img/impactstory-logo.png\" alt=\"ImpactStory\" /></a>\n" +
    "\n" +
    "            <ul class=\"nav\" ng-show=\"isAuthenticated()\">\n" +
    "               <li ng-class=\"{active:isNavbarActive('projects')}\"><a href=\"/projects\">My Projects</a></li>\n" +
    "               <li class=\"dropdown\" ng-class=\"{active:isNavbarActive('admin'), open:isAdminOpen}\" ng-show=\"isAdmin()\">\n" +
    "                  <a id=\"adminmenu\" role=\"button\" class=\"dropdown-toggle\" ng-click=\"isAdminOpen=!isAdminOpen\">Admin<b class=\"caret\"></b></a>\n" +
    "                  <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"adminmenu\">\n" +
    "                     <li><a tabindex=\"-1\" href=\"/admin/projects\" ng-click=\"isAdminOpen=false\">Manage Projects</a></li>\n" +
    "                     <li><a tabindex=\"-1\" href=\"/admin/users\" ng-click=\"isAdminOpen=false\">Manage Users</a></li>\n" +
    "                  </ul>\n" +
    "               </li>\n" +
    "            </ul>\n" +
    "            <ul class=\"nav pull-right\" ng-show=\"hasPendingRequests()\">\n" +
    "               <li class=\"divider-vertical\"></li>\n" +
    "               <li><a href=\"#\"><img src=\"/static/img/spinner.gif\"></a></li>\n" +
    "            </ul>\n" +
    "\n" +
    "            <!-- this is where most of the login mgt work is done -->\n" +
    "            <login-toolbar></login-toolbar>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("importers/import-buttons.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("importers/import-buttons.tpl.html",
    "<div class=\"buttons-group import-buttons\">\n" +
    "   <div class=\"buttons\" ng-show=\"!isLoading()\">\n" +
    "      <button\n" +
    "              class=\"btn btn-primary\"\n" +
    "              ng-disabled=\"!isValid()\"\n" +
    "              type=\"submit\">\n" +
    "         Save\n" +
    "      </button>\n" +
    "      <button\n" +
    "              class=\"btn btn-default\"\n" +
    "              ng-click=\"onCancel()\">\n" +
    "         Cancel\n" +
    "      </button>\n" +
    "   </div>\n" +
    "   <div class=\"working\" ng-show=\"isWorking()\">\n" +
    "      <i class=\"icon-refresh icon-spin\"></i>\n" +
    "      <span class=\"text\">Importing...</span>\n" +
    "   </div>\n" +
    "</div>");
}]);

angular.module("importers/importer.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("importers/importer.tpl.html",
    "\n" +
    "\n" +
    "<div class=\"importer-tile\"\n" +
    "     ng-click=\"showImporterWindow()\"\n" +
    "     ng-class=\"{'has-run': importerHasRun, 'not-run': !importerHasRun}\">\n" +
    "\n" +
    "   <div class=\"importer-name\"><img ng-src=\"{{ importer.logoPath }}\"></div>\n" +
    "   <div class=\"imported-products-count\">\n" +
    "      <span class=\"count\">{{ products.length }}</span>\n" +
    "      <span class=\"descr\">products imported</span>\n" +
    "   </div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"overlay\"\n" +
    "     ng-click=\"hideImportWindow()\"\n" +
    "     ng-if=\"importWindowOpen\"\n" +
    "     ng-animate=\"{enter: 'animated fadeIn', leave: 'animated fadeOut'}\"></div>\n" +
    "\n" +
    "<div class=\"import-window\"\n" +
    "     ng-if=\"importWindowOpen\"\n" +
    "     ng-animate=\"{enter: 'animated slideInRight', leave: 'animated slideOutRight'}\">\n" +
    "   <div class=\"content\">\n" +
    "      <h2 class=\"importer-name\" ng-show=\"!importer.url\"><img ng-src=\"{{ importer.logoPath }}\" /> </h2>\n" +
    "      <h2 class=\"importer-name\" ng-show=\"importer.url\">\n" +
    "         <a class=\"logo\" href=\"{{ importer.url }}\" target=\"_blank\"><img ng-src=\"{{ importer.logoPath }}\" /></a>\n" +
    "         <a class=\"visit\" href=\"{{ importer.url }}\" target=\"_blank\">Visit<i class=\"icon-chevron-right\"></i></a>\n" +
    "      </h2>\n" +
    "\n" +
    "      <div class=\"descr\">{{ importer.descr }}</div>\n" +
    "\n" +
    "      <form name=\"{{ importer.name }}ImporterForm\" novalidate class=\"form\" ng-submit=\"onImport()\">\n" +
    "\n" +
    "         <div class=\"form-group\">\n" +
    "            <label class=\"control-label\">\n" +
    "               {{ importer.displayName }} {{ importer.inputNeeded }}\n" +
    "               <i class=\"icon-question-sign\" ng-show=\"importer.help\" tooltip-html-unsafe=\"{{ importer.help }}\"></i>\n" +
    "               <span class=\"one-per-line\" ng-show=\"importer.inputType=='idList'\">(one per line)</span>\n" +
    "            </label>\n" +
    "            <div class=\"importer-input\" ng-switch on=\"importer.inputType\">\n" +
    "               <input class=\"form-control input-lg\" ng-model=\"importer.input\" type=\"text\" ng-switch-when=\"username\" placeholder=\"{{ importer.placeholder }}\">\n" +
    "               <textarea placeholder=\"{{ importer.placeholder }}\" class=\"form-control\" ng-model=\"importer.input\" ng-switch-when=\"idList\"></textarea>\n" +
    "               <!-- todo: add file upload, see https://github.com/danialfarid/angular-file-upload -->\n" +
    "            </div>\n" +
    "         </div>\n" +
    "\n" +
    "\n" +
    "         <save-buttons action=\"Import\"></save-buttons>\n" +
    "\n" +
    "\n" +
    "      </form>\n" +
    "\n" +
    "      <div class=\"extra\" ng-show=\"importer.extra\" ng-bind-html-unsafe=\"importer.extra\"></div>\n" +
    "\n" +
    "\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("infopages/about.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("infopages/about.tpl.html",
    "<div class=\"main infopage\" id=\"about\">\n" +
    "\n" +
    "   <div class=\"wrapper\">\n" +
    "      <h2 class=\"infopage-heading\">About</h2>\n" +
    "\n" +
    "\n" +
    "      <p>ImpactStory is an open-source, web-based tool that helps researchers explore and share the diverse impacts of all their research products&mdash;from traditional ones like journal articles, to emerging products like blog posts, datasets, and software. By helping researchers tell data-driven stories about their impacts, we're helping to build a new scholarly reward system that values and encourages web-native scholarship. We’re funded by the Alfred P. Sloan Foundation and incorporated as a nonprofit corporation.\n" +
    "\n" +
    "      <p>ImpactStory delivers <em>open metrics</em>, with <em>context</em>, for <em>diverse products</em>:</p>\n" +
    "      <ul>\n" +
    "         <li><b>Open metrics</b>: Our <a href=\"http://impactstory.org/api-docs\">data</a> (to the extent allowed by providers’ terms of service), <a href=\"https://github.com/total-impact\">code</a>, and <a href=\"http://blog.impactstory.org/2012/03/01/18535014681/\">governance</a> are all open.</li>\n" +
    "         <li><b>With context</b>: To help researcher move from raw <a href=\"http://altmetrics.org/manifesto/\">altmetrics</a> data to <a href=\"http://asis.org/Bulletin/Apr-13/AprMay13_Piwowar_Priem.html\">impact profiles</a> that tell data-driven stories, we sort metrics by <em>engagement type</em> and <em>audience</em>. We also normalize based on comparison sets: an evaluator may not know if 5 forks on GitHub is a lot of attention, but they can understand immediately if their project ranked in the 95th percentile of all GitHub repos created that year.</li>\n" +
    "         <li><b>Diverse products</b>: Datasets, software, slides, and other research products are presented as an integrated section of a comprehensive impact report, alongside articles&mdash;each genre a first-class citizen, each making its own kind of impact.</li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <h3 id=\"team\">team</h3>\n" +
    "      <div class=\"team-member first\">\n" +
    "         <img src=\"/static/img/hat.jpg\" height=100/>\n" +
    "         <p><strong>Jason Priem</strong> is a cofounder of ImpactStory and a doctoral student in information science at the University of North Carolina-Chapel Hill. Since <a href=\"https://twitter.com/jasonpriem/status/25844968813\">coining the term \"altmetrics,\"</a> he's remained active in the field, organizing the annual <a href=\"http:altmetrics.org/altmetrics12\">altmetrics workshops</a>, giving <a href=\"http://jasonpriem.org/cv/#invited\">invited talks</a>, and publishing <a href=\"http://jasonpriem.org/cv/#refereed\">peer-reviewed altmetrics research.</a></p>\n" +
    "\n" +
    "         <p>Jason has contributed to and created several open-source software projects, including <a href=\"http://www.zotero.org\">Zotero</a> and <a href=\"http://feedvis.com\">Feedvis</a>, and has experience and training in art, design, and information visualisation.  Sometimes he writes on a <a href=\"http://jasonpriem.org/blog\">blog</a> and <a href=\"https://twitter.com/#!/jasonpriem\">tweets</a>.</p>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"team-member second\">\n" +
    "         <img src=\"/static/img/heather.jpg\" height=100/>\n" +
    "         <p><strong>Heather Piwowar</strong> is a cofounder of ImpactStory and a leading researcher in the area of research data availability and data reuse. She wrote one of the first papers to measure the <a href=\"http://www.plosone.org/article/info:doi/10.1371/journal.pone.0000308\">citation benefit of publicly available research data</a> and has studied  <a href=\"http://www.plosone.org/article/info:doi/10.1371/journal.pone.0018657\">patterns in public deposition of datasets</a>, <a href=\"https://peerj.com/preprints/1/\">patterns of data reuse</a>, and the <a href=\"http://researchremix.wordpress.com/2010/10/12/journalpolicyproposal\">impact of journal data sharing policies</a>.</p>\n" +
    "\n" +
    "         <p>Heather has a bachelor’s and master’s degree from MIT in electrical engineering, 10 years of experience as a software engineer in small companies, and a Ph.D. in Biomedical Informatics from the University of Pittsburgh.  She is an <a href=\"http://www.slideshare.net/hpiwowar\">frequent speaker</a> on research data archiving, writes a well-respected <a href=\"http://researchremix.wordpress.com\">research blog</a>, and is active on twitter (<a href=\"http://twitter.com/researchremix\">@researchremix</a>). </p>\n" +
    "      </div>\n" +
    "      <div class=\"clearfix\"></div>\n" +
    "\n" +
    "\n" +
    "      <h3 id=\"history\">history</h3>\n" +
    "      <p>ImpactStory began life as total-impact, a hackathon project at the Beyond Impact workshop in 2011. As the hackathon ended, a few of us migrated into a hotel hallway to continue working, eventually completing a 24-hour coding marathon to finish a prototype. Months of spare-time development followed, then funding.  We’ve got the same excitement for ImpactStory today.</p>\n" +
    "\n" +
    "      <p>In early 2012, ImpactStory was given £17,000 through the <a href=\"http://www.beyond-impact.org/\">Beyond Impact project</a> from the <a href=\"http://www.soros.org/\">Open Society Foundation</a>.  Today ImpactStory is funded by the <a href=\"http://sloan.org/\">Alfred P. Sloan Foundation</a>, first through <a href=\"http://blog.impactstory.org/2012/03/29/20131290500/\">a $125,000 grant</a> in mid 2012 and then <a href=\"http://blog.impactstory.org/2013/06/17/sloan/\">a two-year grant for $500,000</a> starting in 2013.</p>\n" +
    "\n" +
    "      <h3 id=\"why\">philosophy</h3>\n" +
    "      <p>As a philanthropically-funded not-for-profit, we're in this because we believe open altmetrics are key for building the coming era of Web-native science. We're committed to:</p> <ul>\n" +
    "      <li><a href=\"https://github.com/total-impact\">open source</a></li>\n" +
    "      <li><a href=\"http://blog.impactstory.org/2012/06/08/24638498595/\">free and open data</a>, to the extent permitted by data providers</li>\n" +
    "      <li><a href=\"http://en.wikipedia.org/wiki/Radical_transparency\">Radical transparency</a> and <a href=\"http://blog.impactstory.org\">open communication</a></li>\n" +
    "   </ul>\n" +
    "\n" +
    "      <div id=\"contact\">\n" +
    "         <h3>Contact and FAQ</h3>\n" +
    "         <p>We'd love to hear your feedback, ideas, or just chat! Reach us at <a href=\"mailto:team@impactstory.org\">team@impactstory.org</a>, on <a href=\"http://twitter.com/#!/ImpactStory\">Twitter</a>, or via our <a href=\"http://feedback.impactstory.org\">help forum.</a> Or if you've got questions, check out our <a href=\"/faq\">FAQ</a>.</p>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "   </div><!-- end wrapper -->\n" +
    "</div>");
}]);

angular.module("infopages/faq.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("infopages/faq.tpl.html",
    "<div class=\"main infopage\" id=\"faq\"><div class=\"wrapper\">\n" +
    "   <h2 class=\"infopage-heading\">FAQ</h2>\n" +
    "\n" +
    "   <div id=\"toc\"></div>\n" +
    "\n" +
    "   <h3 id=\"what\" class=\"first\">what is ImpactStory?</h3>\n" +
    "\n" +
    "   <p>ImpactStory is an open-source, web-based tool that helps researchers expore and share the diverse impacts of all their research products&mdash;from traditional ones like journal articles, to emerging products like blog posts, datasets, and software. By helping researchers tell data-driven stories about their impacts, we're helping to build a new scholarly reward system that values and encourages web-native scholarship. We’re funded by the Alfred P. Sloan Foundation and incorporated as a nonprofit corporation.\n" +
    "\n" +
    "   <p>ImpactStory delivers <em>open metrics</em>, with <em>context</em>, for <em>diverse products</em>:</p>\n" +
    "   <ul>\n" +
    "      <li><b>Open metrics</b>: Our <a href=\"http://impactstory.org/api-docs\">data</a> (to the extent allowed by providers’ terms of service), <a href=\"https://github.com/total-impact\">code</a>, and <a href=\"http://blog.impactstory.org/2012/03/01/18535014681/\">governance</a> are all open.</li>\n" +
    "      <li><b>With context</b>: To help researcher move from raw <a href=\"http://altmetrics.org/manifesto/\">altmetrics</a> data to <a href=\"http://asis.org/Bulletin/Apr-13/AprMay13_Piwowar_Priem.html\">impact profiles</a> that tell data-driven stories, we sort metrics by <em>engagement type</em> and <em>audience</em>. We also normalize based on comparison sets: an evaluator may not know if 5 forks on GitHub is a lot of attention, but they can understand immediately if their project ranked in the 95th percentile of all GitHub repos created that year.</li>\n" +
    "      <li><b>Diverse products</b>: Datasets, software, slides, and other research products are presented as an integrated section of a comprehensive impact report, alongside articles--each genre a first-class citizen, each making its own kind of impact.</li>\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"audience\">who is it for?</h3>\n" +
    "\n" +
    "   <ul>\n" +
    "      <li><b>researchers</b> who want to know how many times their work has been downloaded, bookmarked, and blogged\n" +
    "      <li><b>research groups</b> who want to look at the broad impact of their work and see what has demonstrated interest\n" +
    "      <li><b>funders</b> who want to see what sort of impact they may be missing when only considering citations to papers\n" +
    "      <li><b>repositories</b> who want to report on how their research products are being discussed\n" +
    "      <li><b>all of us</b> who believe that people should be rewarded when their work (no matter what the format) makes a positive impact (no matter what the venue). Aggregating evidence of impact will facilitate appropriate rewards, thereby encouraging additional openness of useful forms of research output.\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"uses\">how should it be used?</h3>\n" +
    "\n" +
    "   <p>ImpactStory data can be:</p>\n" +
    "   <ul>\n" +
    "      <li>highlighted as indications of the <em>minimum</em> impact a research product has made on the community\n" +
    "      <li>explored more deeply to see who is citing, bookmarking, and otherwise using your work\n" +
    "      <li>run to collect usage information for mention in biosketches\n" +
    "      <li>included as a link in CVs\n" +
    "      <li>analyzed by downloading detailed metric information\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"pooruses\">how <em>shouldn’t</em> it be used?</h3>\n" +
    "\n" +
    "   <p>Some of these issues relate to the early-development phase of ImpactStory, some reflect our <a href=\"http://www.mendeley.com/groups/586171/altmetrics/papers/\">early-understanding of altmetrics</a>, and some are just common sense.  ImpactStory reports shouldn't be used:\n" +
    "\n" +
    "   <ul>\n" +
    "      <li><b>as indication of comprehensive impact</b>\n" +
    "         <p>ImpactStory is in early development. See <a href=\"#limitations\">limitations</a> and take it all with a grain of salt.\n" +
    "\n" +
    "            <li><b>for serious comparison</b>\n" +
    "               <p>ImpactStory is currently better at collecting comprehensive metrics for some products than others, in ways that are not clear in the report. Extreme care should be taken in comparisons. Numbers should be considered minimums. Even more care should be taken in comparing collections of products, since some ImpactStory is currently better at identifying products identified in some ways than others. Finally, some of these metrics can be easily gamed. This is one reason we believe having many metrics is valuable.\n" +
    "\n" +
    "                  <li><b>as if we knew exactly what it all means</b>\n" +
    "                     <p>The meaning of these metrics are not yet well understood; see <a href=\"#meaning\">section</a> below.\n" +
    "\n" +
    "                        <li><b>as a substitute for personal judgement of quality</b>\n" +
    "         <p>Metrics are only one part of the story. Look at the research product for yourself and talk about it with informed colleagues.\n" +
    "\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"meaning\">what do these number actually mean?</h3>\n" +
    "\n" +
    "   <p>The short answer is: probably something useful, but we’re not sure what. We believe that dismissing the metrics as “buzz” is short-sited: surely people bookmark and download things for a reason. The long answer, as well as a lot more speculation on the long-term significance of tools like ImpactStory, can be found in the nascent scholarly literature on “altmetrics.”\n" +
    "\n" +
    "   <p><a href=\"http://altmetrics.org/manifesto/\">The Altmetrics Manifesto</a> is a good, easily-readable introduction to this literature. You can check out the shared <a href=\"http://www.mendeley.com/groups/586171/altmetrics/papers/\">altmetrics library</a> on Mendeley for a growing list of relevant research.\n" +
    "\n" +
    "      {{ which_artifacts|safe() }}\n" +
    "\n" +
    "   <h3 id=\"whichmetrics\">which metrics are measured?</h3>\n" +
    "\n" +
    "   <p>Metrics are computed based on the following data sources (column names for CSV export are in parentheses):</p>\n" +
    "\n" +
    "   <ul id=\"providers-metadata\"> <!-- list of providers -->\n" +
    "      {% for provider_name, provider in provider_metadata.iteritems() %}\n" +
    "         {% if provider.metrics %}\n" +
    "            <li> <!-- the provider -->\n" +
    "               <a href=\"{{ provider.url }}\">{{ provider_name }}</a> <span class=\"descr\">{{ provider.descr|safe() }}</span>\n" +
    "               <ul> <!-- list of metrics supplied by this provider -->\n" +
    "                  {% for metric_name, metric in provider.metrics.iteritems() %}\n" +
    "                     <li> <!-- information about a particular metric -->\n" +
    "                        <img src=\"{{ metric.icon }}\" width=\"16\" height=\"16\" />\n" +
    "                        <strong>{{ metric.display_name }}</strong>\n" +
    "                        <span class=\"metric-descr\">{{ metric.description }}</span>\n" +
    "                        <span class=\"csv-name\">({{ provider_name }}:{{ metric_name }})</span>\n" +
    "                     </li>\n" +
    "                  {% endfor %}\n" +
    "               </ul>\n" +
    "            </li>\n" +
    "         {% endif %}\n" +
    "      {% endfor %}\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"whereisif\">where is the journal impact factor?</h3>\n" +
    "\n" +
    "   <p>We do not include the Journal Impact Factor (or any similar proxy) on purpose. As has been <a href=\"https://www.zotero.org/groups/impact_factor_problems/items\">repeatedly shown</a>, the Impact Factor is not appropriate for judging the quality of individual research products. Individual article citations reflect much more about how useful papers actually were. Better yet are article-level metrics, as initiated by PLoS, in which we examine traces of impact beyond citation. ImpactStory broadens this approach to reflect <b>product-level metrics</b>, by inclusion of preprints, datasets, presentation slides, and other research output formats.\n" +
    "\n" +
    "   <h3 id=\"similar\">where is my other favourite metric?</h3>\n" +
    "\n" +
    "   <p>We only include open metrics here, and so far only a selection of those. We welcome contributions of plugins. Write your own and tell us about it.\n" +
    "\n" +
    "   <p>Not sure ImpactStory is your cup of tea?  Check out these similar tools:\n" +
    "   <ul>\n" +
    "      <li><a href=\"http://altmetric.com\">altmetric.com</a>\n" +
    "      <li><a href=\"http://www.plumanalytics.com/\">Plum Analytics</a>\n" +
    "      <li><a href=\"http://code.google.com/p/alt-metrics/\">PLoS Article-Level Metrics application</a>\n" +
    "      <li><a href=\"http://sciencecard.org/\">Science Card</a>\n" +
    "      <li><a href=\"http://citedin.org/\">CitedIn</a>\n" +
    "      <li><a href=\"http://readermeter.org/\">ReaderMeter</a>\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"you-are-not-geting-all-my-citations\">you're not getting all my citations!</h3>\n" +
    "   <p>We'd love to display citation information from Google Scholar and Thomson Reuter's Web of Science in ImpactStory, but sadly neither Google Scholar nor Web of Science allow us to do this. We're really pleased that Scopus has been more open with their data, allowing us to display their citation data on our website.  PubMed and Crossref are exemplars of open data: we display their citation counts on our website, in ImpactStory widgets, and through our API.  As more citation databases open up, we'll include their data as fully as we can.</p>\n" +
    "\n" +
    "   <p>Each source of citation data gathers citations in its own ways, with their own strengths and limitations.  Web of Science gets  citation counts by manually gathering citations from a relatively small set of \"core\" journals.  Scopus and Google Scholar crawl a much more expansive set of publisher webpages, and Google also examines papers hosted elsewhere on the web.  PubMed looks at the reference sections of papers in PubMed Central, and CrossRef by looking at the reference lists that they see.  Google Scholar's scraping techniques and citation criteria are the most inclusive; the number of citations found by Google Scholar is typically the highest, though the least curated. A lot of folks have looked into the differences between citation counts from different providers, comparing Google Scholar, Scopus, and Web of Science and finding many differences; if you'd like to learn more, you might start with <a href=\"http://eprints.rclis.org/8605/\">this article.</a></p>\n" +
    "\n" +
    "\n" +
    "   <h3 id=\"limitations\">what are the current limitations of the system?</h3>\n" +
    "\n" +
    "   <p>ImpactStory is in early development and has many limitations. Some of the ones we know about:\n" +
    "\n" +
    "   <h4>gathering IDs sometimes misses products</h4>\n" +
    "   <ul>\n" +
    "      <li>ORCID and BibTex import sometimes can't parse or locate all objects.\n" +
    "   </ul>\n" +
    "\n" +
    "   <h4>products are sometimes missing metrics</h4>\n" +
    "   <ul>\n" +
    "      <li>doesn’t display metrics with a zero value\n" +
    "      <li>sometimes the products were received without sufficient information to use all metrics. For example, the system sometimes can't figure out all URLs from a DOI.\n" +
    "   </ul>\n" +
    "\n" +
    "   <h4>metrics sometimes have values that are too low</h4>\n" +
    "   <ul>\n" +
    "      <li>some sources have multiple records for a given product. ImpactStory only identifies one copy and so only reports the impact metrics for that record. It makes no current attempt to aggregate across duplications within a source.\n" +
    "   </ul>\n" +
    "\n" +
    "   <h4>other</h4>\n" +
    "   <ul>\n" +
    "      <li>the number of items on a report is currently limited.\n" +
    "   </ul>\n" +
    "\n" +
    "   Tell us about bugs! <a href=\"http://twitter.com/#!/ImpactStory\">@ImpactStory</a> (or via email to team@impactstory.org)\n" +
    "\n" +
    "   <h3 id=\"isitopen\">is this data Open?</h3>\n" +
    "\n" +
    "   <p>We’d like to make all of the data displayed by ImpactStory available under CC0. Unfortunately, the terms-of-use of most of the data sources don’t allow that. We're trying to figure out how to handle this.\n" +
    "   <p>An option to restrict the displayed reports to Fully Open metrics — those suitable for commercial use — is on the To Do list.\n" +
    "   <p>The ImpactStory software itself is fully open source under an MIT license. <a href=\"https://github.com/total-impact\">GitHub</a>\n" +
    "\n" +
    "   <h3 id=\"api\">does ImpactStory have an api?</h3>\n" +
    "\n" +
    "   <p>yes! ImpactStory is built on its own api, and others may build on it too.\n" +
    "   <p>We also have javascript to make embedding ImpactStory data very easy.  We'll document it soon: contact us for details in the meantime.\n" +
    "\n" +
    "\n" +
    "   <h3 id=\"who\">who developed ImpactStory?</h3>\n" +
    "\n" +
    "   <p>Concept originally hacked at the <a href=\"http://www.beyond-impact.org/\">Beyond Impact Workshop</a>, part of the Beyond Impact project funded by the Open Society Foundations <a href=\"https://github.com/mhahnel/Total-Impact/contributors\">(initial contributors)</a>.  Here's the <a href=\"/about\">current team</a>.\n" +
    "\n" +
    "   <h3 id=\"funding\">who funds ImpactStory?</h3>\n" +
    "\n" +
    "   <p>Early development was done on personal time, plus some discretionary time while funded through <a href=\"http://dataone.org\">DataONE</a> (Heather Piwowar) and a <a href=\"http://gradschool.unc.edu/programs/royster\">UNC Royster Fellowship</a> (Jason Priem).\n" +
    "\n" +
    "   <p>In early 2012, ImpactStory was given £17,000 through the <a href=\"http://www.beyond-impact.org/\">Beyond Impact project</a> from the <a href=\"http://www.soros.org/\">Open Society Foundation</a>.  As of May 2012, ImpactStory is funded through a $125k grant from the <a href=\"http://sloan.org/\">Alfred P. Sloan Foundation. </a>\n" +
    "\n" +
    "   <h3 id=\"learned\">what have you learned?</h3>\n" +
    "\n" +
    "   <ul>\n" +
    "      <li>the multitude of IDs for a given product is a bigger problem than we guessed. Even articles that have DOIs often also have urls, PubMed IDs, PubMed Central IDs, Mendeley IDs, etc. There is no one place to find all synonyms, yet the various APIs often only work with a specific one or two ID types. This makes comprehensive impact-gathering time consuming and error-prone.\n" +
    "      <li>some data is harder to get than we thought (wordpress stats without requesting consumer key information)\n" +
    "      <li>some data is easier to get than we thought (vendors willing to work out special agreements, permit web scraping for particular purposes, etc)\n" +
    "      <li>lack of an author-identifier makes us reliant on user-populated systems like Mendeley for tracking author-based work (we need ORCID and we need it now!)\n" +
    "      <li>API limits like those on PubMed Central (3 request per second) make their data difficult to incorporate in this sort of application\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"howhelp\">how can I help?</h3>\n" +
    "\n" +
    "   <ul>\n" +
    "      <li><b>do you have data?</b> If it is already available in some public format, let us know so we can add it. If it isn’t, either please open it up or contact us to work out some mutually beneficial way we can work together.\n" +
    "      <li><b>do you have money?</b> We need money :) We need to fund future development of the system and are actively looking for appropriate opportunities.\n" +
    "      <li><b>do you have ideas?</b> Maybe enhancements to ImpactStory would fit in with a grant you are writing, or maybe you want to make it work extra-well for your institution’s research outputs. We’re interested: please get in touch (see bottom).\n" +
    "      <li><b>do you have energy?</b> We need better “see what it does” documentation, better lists of collections, etc. Make some and tell us, please!\n" +
    "      <li><b>do you have anger that your favourite data source is missing?</b> After you confirm that its data isn't available for open purposes like this, write to them and ask them to open it up... it might work. If the data is open but isn't included here, let us know to help us prioritize.\n" +
    "      <li><b>can you email, blog, post, tweet, or walk down the hall to tell a friend?</b> See the <a href=\"#cool\">this is so cool</a> section for your vital role....\n" +
    "   </ul>\n" +
    "\n" +
    "   <h3 id=\"cool\">this is so cool.</h3>\n" +
    "\n" +
    "   <p>Thanks! We agree :)\n" +
    "   <p>You can help us.  Demonstrating the value of ImpactStory is key to receiving future funding.\n" +
    "   <p>Buzz and testimonials will help. Tweet your reports. Blog, send email, and show off ImpactStory at your next group meeting to help spread the word.\n" +
    "   <p>Tell us how cool it is at <a href=\"http://twitter.com/#!/ImpactStory\">@ImpactStory</a> (or via email to team@impactstory.org) so we can consolidate the feedback.\n" +
    "\n" +
    "   <h3 id=\"suggestion\">I have a suggestion!</h3>\n" +
    "\n" +
    "   <p><b>We want to hear it.</b> Send it to us at <a href=\"http://twitter.com/#!/ImpactStory\">@ImpactStory</a> (or via email to team@impactstory.org).\n" +
    "\n" +
    "   <h3 id=\"tos\">terms of use</h3>\n" +
    "   <p>Due to agreements we have made with data providers, you may not scrape this website.  Use our <a href=\"/api-docs\">JavaScript widget or API</a> instead.</p>\n" +
    "\n" +
    "\n" +
    "</div><!-- end wrapper -->\n" +
    "</div><!-- end faq -->\n" +
    "</div>");
}]);

angular.module("infopages/landing.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("infopages/landing.tpl.html",
    "<div class=\"main infopage landing\">\n" +
    "   <div id=\"tagline\">\n" +
    "      <div class=\"wrapper\">\n" +
    "         <h1>Share the full story of your <br>research impact.</h1>\n" +
    "         <p class=\"subtagline\">ImpactStory is your impact profile on the web: we reveal the diverse impacts of your articles, datasets, software, and more.</p>\n" +
    "         <div id=\"call-to-action\">\n" +
    "            <a href=\"/signup\" class=\"btn btn-large btn-primary primary-action\" id=\"create-collection\">Make my impact profile</a>\n" +
    "            <a href=\"/CarlBoettiger\" class=\"btn btn-large btn-primary secondary-action\" id=\"view-sample-collection\">View a sample profile</a>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "   <div id=\"selling-points\">\n" +
    "      <ul class=\"wrapper\" >\n" +
    "         <li>\n" +
    "            <h3 id=\"metrics-in-seconds\"><i class=\"icon-time icon-2x\"></i><span class=\"text\">View metrics in seconds</span></h3>\n" +
    "            <p>Point us to your slides, code, datasets, and articles. In a few seconds, you'll have a report detailing your impacts: citations, bookmarks, downloads, tweets, and more.</p>\n" +
    "         </li>\n" +
    "         <li class=\"middle\">\n" +
    "            <h3 id=\"embed-metrics-anywhere\"><i class=\"icon-suitcase icon-2x\"></i><span class=\"text\">Embed them anywhere</span></h3>\n" +
    "            <p>Drop ImpactStory's embeddable <a href=\"/api-docs\">Javascript widget</a> into your own online CV or website to show the impacts of your projects.</p>\n" +
    "         </li>\n" +
    "         <li>\n" +
    "            <h3 id=\"its-open\"><i class=\"icon-wrench icon-2x\"></i><span class=\"text\">Open data,<br> open source.</span></h3>\n" +
    "            <p>Our data, like our <a href=\"http://github.com/total-impact\">source code</a>, is wide open.  As a non-profit, we're built around supporting open tools to nurture Web-native scholarship.</p>\n" +
    "         </li>\n" +
    "      </ul>\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "   <div id=\"sources\">\n" +
    "      <div class=\"wrapper\">\n" +
    "         <h2>Uncover your impacts from all across the Web: </h2>\n" +
    "         <ul id=\"source-logos\">\n" +
    "            <li><img src=\"/static/img/logos/citeulike.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/crossref.jpg\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/delicious.jpg\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/dryad.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/f1000.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/figshare.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/github.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/mendeley.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/orcid.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/plos.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/pmc.gif\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/pubmed.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/scienceseeker.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/scopus.jpg\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/slideshare.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/twitter.png\" /></li>\n" +
    "            <li><img src=\"/static/img/logos/wikipedia.png\" /></li>\n" +
    "         </ul>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("notifications.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("notifications.tpl.html",
    "<ul class=\"notifications\">\n" +
    "   <li ng-class=\"['alert', 'alert-'+notification.type]\" ng-repeat=\"notification in notifications.getCurrent()\">\n" +
    "       <button class=\"close\" ng-click=\"removeNotification(notification)\">&times;</button>\n" +
    "       {{notification.message}}\n" +
    "   </li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("product/badges.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("product/badges.tpl.html",
    "<ul class=\"ti-badges\">\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "   <li ng-repeat=\"award in awards | orderBy:['!isHighly', 'displayOrder']\" class=\"award\">\n" +
    "\n" +
    "      <span href=\"#\"\n" +
    "            class=\"ti-badge lil-badge {{award.audience}} {{award.engagementType}}\"\n" +
    "            ng-show=\"!award.isHighly\"\n" +
    "            popover-trigger=\"mouseenter\"\n" +
    "            popover-placement=\"bottom\"\n" +
    "            popover-title=\"{{award.engagementType}} by {{award.displayAudience}}\"\n" +
    "            popover=\"This item has {{award.topMetric.actualCount}} {{award.topMetric.environment}}\n" +
    "            {{award.topMetric.displayInteraction}}, suggesting it's been\n" +
    "            {{award.engagementType}} by {{award.displayAudience}}.\n" +
    "            Click to learn more.\">\n" +
    "         <span class=\"engagement-type\">{{award.engagementType}}</span>\n" +
    "         <span class=\"audience\">by {{award.audience}}</span>\n" +
    "       </span>\n" +
    "\n" +
    "      <span href=\"#\"\n" +
    "            class=\"ti-badge big-badge {{award.audience}} {{award.engagementType}}\"\n" +
    "            ng-show=\"award.isHighly\"\n" +
    "            popover-trigger=\"mouseenter\"\n" +
    "            popover-placement=\"bottom\"\n" +
    "            popover-title=\"Highly {{award.engagementType}} by {{award.displayAudience}}\"\n" +
    "            popover=\"This item has {{award.topMetric.actualCount}} {{award.topMetric.environment}}\n" +
    "            {{award.topMetric.displayInteraction}}. That's better than\n" +
    "            {{award.topMetric.percentiles.CI95_lower}}% of items\n" +
    "            {{award.topMetric.referenceSetStorageVerb}} {{award.topMetric.refSet}} in {{award.topMetric.referenceSetYear}},\n" +
    "            suggesting it's highly {{award.engagementType}} by {{award.displayAudience }}.\n" +
    "            Click to learn more.\">\n" +
    "\n" +
    "         <span class=\"modifier\">highly</span>\n" +
    "         <span class=\"engagement-type\">{{award.engagementType}}</span>\n" +
    "         <span class=\"audience\">by {{award.audience}}</span>\n" +
    "      </span>\n" +
    "\n" +
    "      <span class=\"metrics\">\n" +
    "         <img ng-repeat=\"metric in award.metrics\" ng-src=\"{{ metric.static_meta.icon }}\">\n" +
    "      </span>\n" +
    "\n" +
    "   </li>\n" +
    "</ul>");
}]);

angular.module("product/biblio.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("product/biblio.tpl.html",
    "<h5 class=\"title\" xmlns=\"http://www.w3.org/1999/html\">\n" +
    "   <a class=\"title-text\" href=\"{{ getProductPageUrl() }}\">{{biblio.title}}</a>\n" +
    "   <a ng-if=\"biblio.url\" class=\"linkout url title\" target=\"_blank\" href=\"{{ biblio.url }}\">\n" +
    "      <i class=\"icon-external-link-sign\"></i>\n" +
    "   </a>\n" +
    "</h5>\n" +
    "<div class=\"optional-biblio\">\n" +
    "   <span ng-if=\"biblio.year\" class=\"year\">({{ biblio.year }})</span>\n" +
    "   <span ng-if=\"biblio.authors\" class=\"authors\">{{ biblio.authors }}</span>\n" +
    "   <span ng-if=\"biblio.repository\" class=\"repository\">{{ biblio.repository }}</span>\n" +
    "   <span ng-if=\"biblio.journal\" class=\"repository\">{{ biblio.journal }}</span>\n" +
    "   <span ng-if=\"biblio.description\" class=\"repository\">{{ biblio.description }}</span>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("product/metrics-table.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("product/metrics-table.tpl.html",
    "<ul class=\"metric-details-list\">\n" +
    "   <li ng-repeat=\"metric in metrics\" class=\"metric-detail\">\n" +
    "\n" +
    "      <span class=\"badge-container\">\n" +
    "         <span href=\"#\"\n" +
    "               class=\"ti-badge lil-badge {{metric.award.audience}} {{metric.award.engagementType}}\"\n" +
    "               ng-show=\"!metric.award.isHighly\"\n" +
    "               popover-trigger=\"mouseenter\"\n" +
    "               popover-placement=\"bottom\"\n" +
    "               popover-title=\"{{metric.award.engagementType}} by {{metric.award.displayAudience}}\"\n" +
    "               popover=\"This item has {{metric.actualCount}} {{metric.environment}}\n" +
    "               {{metric.displayInteraction}}, suggesting it's been\n" +
    "               {{metric.award.engagementType}} by {{metric.award.displayAudience}}.\">\n" +
    "            <span class=\"engagement-type\">{{metric.award.engagementType}}</span>\n" +
    "            <span class=\"audience\">by {{metric.award.audience}}</span>\n" +
    "          </span>\n" +
    "\n" +
    "         <span href=\"#\"\n" +
    "               class=\"ti-badge big-badge {{metric.award.audience}} {{metric.award.engagementType}}\"\n" +
    "               ng-show=\"metric.award.isHighly\"\n" +
    "               popover-trigger=\"mouseenter\"\n" +
    "               popover-placement=\"bottom\"\n" +
    "               popover-title=\"Highly {{metric.award.engagementType}} by {{metric.award.displayAudience}}\"\n" +
    "               popover=\"This item has {{metric.actualCount}} {{metric.environment}}\n" +
    "               {{metric.displayInteraction}}. That's better than\n" +
    "               {{metric.percentiles.CI95_lower}}% of items\n" +
    "               {{metric.referenceSetStorageVerb}} {{metric.refSet}} in {{metric.referenceSetYear}},\n" +
    "               suggesting it's highly {{metric.award.engagementType}} by {{metric.award.displayAudience }}.\">\n" +
    "            <span class=\"modifier\">highly</span>\n" +
    "            <span class=\"engagement-type\">{{metric.award.engagementType}}</span>\n" +
    "            <span class=\"audience\">by {{metric.award.audience}}</span>\n" +
    "         </span>\n" +
    "\n" +
    "      </span>\n" +
    "      <span class=\"text\">\n" +
    "         <a class=\"value-and-name\"\n" +
    "            href=\"\"\n" +
    "            popover-trigger='mouseenter'\n" +
    "            popover-placement=\"bottom\"\n" +
    "            popover=\"{{ metric.static_meta.description }}. Click to see more details on {{ metric.environment }}.\">\n" +
    "            <img ng-src=\"{{ metric.static_meta.icon }}\">\n" +
    "            <span class=\"raw-value\">{{ metric.actualCount }}</span>\n" +
    "            <span class=\"environment\">{{ metric.environment }}</span>\n" +
    "            <span class=\"interaction\">{{ metric.displayInteraction }}</span>\n" +
    "            <i class=\"icon-external-link-sign\"></i>\n" +
    "         </a>\n" +
    "         <span class=\"percentile\" ng-show=\"metric.percentiles\">\n" +
    "            <span class=\"values\">\n" +
    "               <span class=\"lower\">{{ metric.percentiles.CI95_lower }}</span>\n" +
    "               <span class=\"dash\">-</span>\n" +
    "               <span class=\"upper\">{{ metric.percentiles.CI95_upper }}</span>\n" +
    "               <span class=\"unit\">percentile</span>\n" +
    "               <i class=\"icon-info-sign\" ng-click=\"openInfoModal()\"></i>\n" +
    "            </span>\n" +
    "            <span class=\"descr\">of {{ biblio.genre }}s published in {{ biblio.year }}</span>\n" +
    "         </span>\n" +
    "      </span>\n" +
    "\n" +
    "   </li>\n" +
    "</ul>");
}]);

angular.module("profile-product/percentilesInfoModal.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("profile-product/percentilesInfoModal.tpl.html",
    "<div class=\"modal-header\">\n" +
    "   <button type=\"button\" class=\"close\" ng-click=\"$close()\">&times;</button>\n" +
    "   <h3>What do these numbers mean?</h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "   <p>ImpactStory classifies metrics along two dimensions: <strong>audience</strong> (<em>scholars</em> or the <em>public</em>) and <strong>type of engagement</strong> with research (<em>view</em>, <em>discuss</em>, <em>save</em>, <em>cite</em>, and <em>recommend</em>).</p>\n" +
    "\n" +
    "   <p>For each metric, the coloured bar shows its percentile relative to all articles indexed in the Web of Science that year.  The bars show a range, representing the 95% confidence interval around your percentile (and also accounting for ties).  Along with ranges, we show “Highly” badges for metrics above the 75th percentile that exceed a minimum frequency.</p>\n" +
    "\n" +
    "   <p>Each metric's raw count is shown to the left of its name.  Click the raw count to visit that metric source's external page for the item; there, you can explore the engagement in more detail.</p>\n" +
    "\n" +
    "   <p>For more information, see these blog posts and <a href=\"{{ url_for('faq') }}\">FAQ</a> sections:</p>\n" +
    "\n" +
    "   <ul>\n" +
    "      <li><a href=\"http://blog.impactstory.org/2012/09/10/31256247948/\">What do we expect?</a></li>\n" +
    "      <li><a href=\"http://blog.impactstory.org/2012/09/14/31524247207/\">Our framework for classifying altmetrics</a></li>\n" +
    "      <li>Reference sets: <a href=\"http://blog.impactstory.org/2012/09/13/31461657926/\">Motivation</a>; Choosing Web of Science (TBA)</li>\n" +
    "      <li>Percentiles: <a href=\"http://blog.impactstory.org/2012/09/11/31342582590/\">Part 1</a>, <a href=\"http://blog.impactstory.org/2012/09/12/31408899657/\">Part 2</a>, and <a href=\"http://blog.impactstory.org/2012/09/12/31411187588/\">Part 3</a></li>\n" +
    "      <li>Why <a href=\"{{ url_for('faq') }}#toc_3_9\">citation counts may not be what you expect</a></li>\n" +
    "      <li>Sampling and 95% confidence (TBA)</li>\n" +
    "   </ul>\n" +
    "</div>");
}]);

angular.module("profile-product/profile-product-page.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("profile-product/profile-product-page.tpl.html",
    "<div class=\"product-page\">\n" +
    "   <div class=\"wrapper\">\n" +
    "      <div class=\"return-to-profile\">\n" +
    "         <a href=\"/{{ userSlug }}\" ng-show=\"profileAbout.about\">\n" +
    "            <i class=\"icon-chevron-left\"></i>\n" +
    "            Return to {{ profileAbout.about.given_name }}\n" +
    "            {{ profileAbout.about.surname }}'s profile\n" +
    "         </a>\n" +
    "      </div>\n" +
    "      <div class=\"product\">\n" +
    "         <div class=\"working\" ng-show=\"loading.is()\">\n" +
    "            <i class=\"icon-refresh icon-spin\"></i>\n" +
    "            <span class=\"text\">Loading product...</span>\n" +
    "         </div>\n" +
    "\n" +
    "\n" +
    "         <div class=\"biblio\" ng-include=\"'product/biblio.tpl.html'\"></div>\n" +
    "         <div class=\"metric-details\" ng-include=\"'product/metrics-table.tpl.html'\"></div>\n" +
    "      </div>\n" +
    "\n" +
    "   </div>\n" +
    "</div>");
}]);

angular.module("profile/profile.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("profile/profile.tpl.html",
    "<div class=\"profile-header\" ng-show=\"userExists\">\n" +
    "   <div class=\"wrapper\">\n" +
    "      <div class=\"loading\" ng-show=\"!user.about.id\">\n" +
    "         <div class=\"working\"><i class=\"icon-refresh icon-spin\"></i><span class=\"text\">Loading profile info...</span></div>\n" +
    "      </div>\n" +
    "      <div class=\"my-picture\" ng-show=\"user.about.id\">\n" +
    "         <a href=\"http://www.gravatar.com\" >\n" +
    "            <img class=\"gravatar\" ng-src=\"http://www.gravatar.com/avatar/{{ user.about.email_hash }}?s=110&d=mm\" data-toggle=\"tooltip\" class=\"gravatar\" rel=\"tooltip\" title=\"Modify your icon at Gravatar.com\" />\n" +
    "         </a>\n" +
    "      </div>\n" +
    "      <div class=\"my-vitals\">\n" +
    "         <h2 class='page-title editable-name'>\n" +
    "            <span class=\"given-name editable\" data-name=\"given_name\">{{ user.about.given_name }}</span>\n" +
    "            <span class=\"surname editable\" data-name=\"surname\">{{ user.about.surname }}</span>\n" +
    "         </h2>\n" +
    "      </div>\n" +
    "      <div class=\"my-metrics\"></div> <!-- profile-level stats go here -->\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"product-controls\" ng-show=\"products.length\">\n" +
    "   <div class=\"wrapper\">\n" +
    "      <div class=\"edit-controls btn-group\">\n" +
    "         <div class=\"num-items\">\n" +
    "            <span class=\"val-plus-text\"><span class=\"value\">{{ filterProducts(products).length }}</span> research products</span>\n" +
    "            <a ng-click=\"showProductsWithoutMetrics = !showProductsWithoutMetrics\" ng-show=\"showProductsWithoutMetrics\">\n" +
    "               (hide <span class=\"value\">{{ filterProducts(products, \"withoutMetrics\").length }}</span> without metrics)\n" +
    "            </a>\n" +
    "         </div>\n" +
    "         <a><i class=\"icon-edit\"></i>Edit</a>\n" +
    "      </div>\n" +
    "      <div class=\"view-controls\">\n" +
    "         <!--<a><i class=\"icon-refresh\"></i>Refresh metrics</a>-->\n" +
    "         <span class=\"dropdown download\">\n" +
    "            <a id=\"adminmenu\" role=\"button\" class=\"dropdown-toggle\"><i class=\"icon-download\"></i>Download</a>\n" +
    "            <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"adminmenu\">\n" +
    "               <li><a tabindex=\"-1\" href=\"http://impactstory.org/user/{{ user.about.id }}/products.csv\"><i class=\"icon-table\"></i>csv</a></li>\n" +
    "               <li><a tabindex=\"-1\" href=\"http://impactstory.org/user/{{ user.about.id }}/products\"><i class=\"json\">{&hellip;}</i>json</a></li>\n" +
    "            </ul>\n" +
    "         </span>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"products\" ng-show=\"userExists\">\n" +
    "   <div class=\"wrapper\">\n" +
    "      <div class=\"loading\" ng-show=\"!products.length\">\n" +
    "         <div class=\"working\"><i class=\"icon-refresh icon-spin\"></i><span class=\"text\">Loading products...</span></div>\n" +
    "      </div>\n" +
    "\n" +
    "      <ul class=\"products-list\">\n" +
    "         <li class=\"product\"\n" +
    "             ng-repeat=\"product in products | orderBy:[getGenre, 'isHeading', getBadgeCount]\"\n" +
    "             ng-controller=\"productCtrl\"\n" +
    "             ng-show=\"hasMetrics() || showProductsWithoutMetrics || product.isHeading\"\n" +
    "             id=\"{{ product._id }}\">\n" +
    "\n" +
    "            <h2 class=\"product-heading {{ product.headingDimension }} {{ product.headingValue }}\"\n" +
    "                ng-show=\"product.isHeading\">\n" +
    "               <i class=\"icon-save software\"></i>\n" +
    "               <i class=\"icon-file-text-alt article\"></i>\n" +
    "               <i class=\"icon-table dataset\"></i>\n" +
    "               {{ product.headingValue }}\n" +
    "            </h2>\n" +
    "            <div class=\"real-product\" ng-show=\"!product.isHeading\">\n" +
    "               <div class=\"biblio\" ng-include=\"'product/biblio.tpl.html'\"></div>\n" +
    "               <div class=\"badges\" ng-include=\"'product/badges.tpl.html'\"></div>\n" +
    "            </div>\n" +
    "         </li>\n" +
    "      </ul>\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"products-without-metrics wrapper\" ng-show=\"products.length && !showProductsWithoutMetrics\">\n" +
    "      <div class=\"well\">\n" +
    "         Another <span class=\"value\">{{ filterProducts(products, \"withoutMetrics\").length }}</span> products aren't shown, because we couldn't find any impact data for them.\n" +
    "         <a ng-click=\"showProductsWithoutMetrics = !showProductsWithoutMetrics\">Show these, too.</a>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"user-does-not-exist no-page\" ng-show=\"!userExists\">\n" +
    "   <h2>Whoops!</h2>\n" +
    "   <p>We don't have a user account for <span class=\"slug\">'{{ slug }}.'</span><br> Would you like to <a href=\"/signup\">make one?</a></p>\n" +
    "\n" +
    "</div>");
}]);

angular.module("settings/custom-url-settings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings/custom-url-settings.tpl.html",
    "<div class=\"settings-header\">\n" +
    "   <h1>Custom URL</h1>\n" +
    "   <p>Customize the URL people use to reach your profile</p>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<form novalidate name=\"userUrlForm\" class=\"form-horizontal custom-url\" ng-submit=\"onSave()\" ng-controller=\"urlSettingsCtrl\">\n" +
    "   <div class=\"form-group custom-url\"\n" +
    "        ng-model=\"user.url_slug\"\n" +
    "        ng-class=\"{ 'has-error':  userUrlForm.url_slug.$invalid && userUrlForm.url_slug.$dirty && !loading.is(),\n" +
    "                    'has-success': userUrlForm.url_slug.$valid && userUrlForm.url_slug.$dirty && !loading.is()\">\n" +
    "\n" +
    "      <div class=\"controls input-group col-lg-7\">\n" +
    "         <span class=\"input-group-addon\">http://impactstory.org/</span>\n" +
    "         <input ng-model=\"user.url_slug\"\n" +
    "                name=\"url_slug\"\n" +
    "                class=\"form-control\"\n" +
    "                required\n" +
    "                data-require-unique\n" +
    "                ng-pattern=\"/^\\w+$/\"\n" +
    "                 />\n" +
    "\n" +
    "      </div>\n" +
    "\n" +
    "      <spinner msg=\"Checking\"></spinner>\n" +
    "\n" +
    "      <div class=\"help-block error\"\n" +
    "            ng-show=\"userUrlForm.url_slug.$error.pattern\n" +
    "            && userUrlForm.url_slug.$dirty\n" +
    "            && !loading.is()\">\n" +
    "         This URL has invalid characters.\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"help-block error\"\n" +
    "            ng-show=\"userUrlForm.url_slug.$error.requireUnique\n" +
    "            && userUrlForm.url_slug.$dirty\n" +
    "            && !loading.is()\">\n" +
    "         Someone else is using that URL.\n" +
    "      </div>\n" +
    "      <div class=\"help-block success\"\n" +
    "            ng-show=\"userUrlForm.url_slug.$valid\n" +
    "            && userUrlForm.url_slug.$dirty\n" +
    "            && !loading.is()\">\n" +
    "         Looks good!\n" +
    "      </div>\n" +
    "      <div class=\"help-block\"\n" +
    "            ng-show=\"userUrlForm.url_slug.$pristine\n" +
    "            && !loading.is()\">\n" +
    "         This is your current URL.\n" +
    "      </div>\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"form-group submit\">\n" +
    "      <div class=\" col-lg-10\">\n" +
    "         <save-buttons valid=\"userUrlForm.$valid\"></save-buttons>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "</form>\n" +
    "");
}]);

angular.module("settings/email-settings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings/email-settings.tpl.html",
    "<div class=\"settings-header\">\n" +
    "  <h1>Email</h1>\n" +
    "  <p>Change email address used for login and contact</p>\n" +
    "</div>\n" +
    "\n" +
    "<form novalidate name=\"userEmailForm\" class=\"form-horizontal custom-url\" ng-submit=\"onSave()\" ng-controller=\"emailSettingsCtrl\">\n" +
    "  <div class=\"form-group change-email\"\n" +
    "  ng-model=\"user.email\"\n" +
    "  ng-class=\"{ 'has-error':  userEmailForm.email.$invalid && userEmailForm.email.$dirty && !loading.is(),\n" +
    "                    'has-success': userEmailForm.email.$valid && userEmailForm.email.$dirty && !loading.is()}\">\n" +
    "\n" +
    "    <div class=\"controls input-group col-lg-7\">\n" +
    "      <span class=\"input-group-addon\"><i class=\"icon-envelope-alt\"></i></span>\n" +
    "      <input ng-modesave-bul=\"user.email\"\n" +
    "      name=\"email\"\n" +
    "      class=\"form-control\"\n" +
    "      required\n" +
    "      data-require-unique\n" +
    "      />\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <spinner msg=\"Checking\"></spinner>\n" +
    "\n" +
    "    <div class=\"help-block error\"\n" +
    "    ng-show=\"userEmailForm.email.$error.requireUnique\n" +
    "            && userEmailForm.email.$dirty\n" +
    "            && !loading.is()\">\n" +
    "    That email address is already in use.\n" +
    "    </div>\n" +
    "    <div class=\"help-block success\"\n" +
    "    ng-show=\"userEmailForm.email.$valid\n" +
    "            && userEmailForm.email.$dirty\n" +
    "            && !loading.is()\">\n" +
    "    Looks good!\n" +
    "    </div>\n" +
    "    <div class=\"help-block\"\n" +
    "    ng-show=\"userEmailForm.email.$pristine\n" +
    "            && !loading.is()\">\n" +
    "    This is your currently registered email.\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"form-group submit\">\n" +
    "  <div class=\" col-lg-10\">\n" +
    "    <save-buttons valid=\"userEmailForm.$valid\"></save-buttons>\n" +
    "  </div>\n" +
    "  </div>\n" +
    "\n" +
    "</form>\n" +
    "");
}]);

angular.module("settings/password-settings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings/password-settings.tpl.html",
    "<div class=\"settings-header\">\n" +
    "   <h1>Password</h1>\n" +
    "   <p>Change your account password.</p>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<form novalidate\n" +
    "      name=\"userPasswordForm\"\n" +
    "      class=\"form-horizontal change-password\"\n" +
    "      ng-submit=\"onSave()\"\n" +
    "      ng-controller=\"passwordSettingsCtrl\"\n" +
    "      >\n" +
    "\n" +
    "   <div class=\"form-group current-password\" ng-class=\"{'has-error': wrongPassword}\">\n" +
    "      <label class=\"control-label col-lg-3\">Current password</label>\n" +
    "      <div class=\"controls col-lg-4\">\n" +
    "         <input ng-model=\"user.currentPassword\" name=\"currentPassword\" type=\"password\" class=\"form-control\" required ng-show=\"!showPassword\">\n" +
    "         <input ng-model=\"user.currentPassword\" name=\"currentPassword\" type=\"text\" class=\"form-control\" required ng-show=\"showPassword\">\n" +
    "      </div>\n" +
    "      <div class=\"controls col-lg-4 show-password\">\n" +
    "         <pretty-checkbox value=\"showPassword\" text=\"Show\"></pretty-checkbox>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"form-group new-password\">\n" +
    "      <label class=\"control-label col-lg-3\">New password</label>\n" +
    "      <div class=\"controls col-lg-4\">\n" +
    "         <input ng-model=\"user.newPassword\"\n" +
    "                name=\"newPassword\"\n" +
    "                type=\"password\"\n" +
    "                ng-show=\"!showPassword\"\n" +
    "                class=\"form-control\"\n" +
    "                required>\n" +
    "\n" +
    "         <input ng-model=\"user.newPassword\"\n" +
    "                name=\"newPassword\"\n" +
    "                type=\"text\"\n" +
    "                ng-show=\"showPassword\"\n" +
    "                class=\"form-control\"\n" +
    "                required>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "   <div class=\"form-group submit\">\n" +
    "      <div class=\" col-lg-offset-4 col-lg-4\">\n" +
    "         <save-buttons></save-buttons>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "</form>\n" +
    "");
}]);

angular.module("settings/profile-settings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings/profile-settings.tpl.html",
    "<div class=\"settings-header\">\n" +
    "   <h1>Profile</h1>\n" +
    "   <p>Modify what's displayed in your profile.</p>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "<form novalidate name=\"userProfileForm\" class=\"form-horizontal\" ng-submit=\"onSave()\" ng-controller=\"profileSettingsCtrl\">\n" +
    "\n" +
    "   <div class=\"form-group photo\">\n" +
    "      <label class=\"control-label col-lg-3\">Photo</label>\n" +
    "      <div class=\"controls col-lg-5\">\n" +
    "         <div class=\"my-picture\">\n" +
    "            <a href=\"http://www.gravatar.com\" >\n" +
    "               <img class=\"gravatar\" ng-src=\"http://www.gravatar.com/avatar/{{ currentUser.email_hash }}?s=110&d=mm\" data-toggle=\"tooltip\" class=\"gravatar\" rel=\"tooltip\" title=\"Modify your icon at Gravatar.com\" />\n" +
    "            </a>\n" +
    "            <p>You can change your profile image at <a href=\"http://www.gravatar.com\">Gravatar.com</a></p>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"form-group\">\n" +
    "      <label class=\"control-label col-lg-3\">First name</label>\n" +
    "      <div class=\"controls col-lg-5\">\n" +
    "         <input ng-model=\"user.given_name\" name=\"givenname\" class=\"form-control\">\n" +
    "      </div>\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"form-group\">\n" +
    "      <label class=\"control-label col-lg-3\">Surname</label>\n" +
    "      <div class=\"controls col-lg-5\">\n" +
    "         <input ng-model=\"user.surname\" name=\"surname\" class=\"form-control\">\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"form-group submit\">\n" +
    "      <div class=\" col-lg-offset-3 col-lg-9\">\n" +
    "         <save-buttons valid=\"userProfileForm.$valid\"></save-buttons>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "</form>\n" +
    "");
}]);

angular.module("settings/settings.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("settings/settings.tpl.html",
    "<div class=\"wrapper settings\">\n" +
    "   <div class=\"settings-nav \">\n" +
    "      <ul nav-list nav>\n" +
    "         <li ng-repeat=\"pageDescr in pageDescriptions\">\n" +
    "            <a ng-class=\"{selected: isCurrentPath(pageDescr.urlPath)}\"\n" +
    "               href=\"{{ pageDescr.urlPath }}\">\n" +
    "               {{ pageDescr.displayName }}\n" +
    "               <i class=\"icon-chevron-right\"></i>\n" +
    "            </a>\n" +
    "         </li>\n" +
    "      </ul>\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"settings-input\" ng-include='include'></div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("signup/signup-creating.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("signup/signup-creating.tpl.html",
    "<div class=\"signup-input creating\" ng-controller=\"signupCreatingCtrl\">\n" +
    "   <div class=\"intro\"><br>We're creating your profile now! Right now, we're scouring the web, finding the ways your products have made an impact...</div>\n" +
    "\n" +
    "   <div class=\"update-progress\" ng-show=\"numNotDone\">\n" +
    "      <div class=\"products not-done\">\n" +
    "         <span class=\"count still-working\">{{ numNotDone }}</span>\n" +
    "         <span class=\"descr\">now updating</span>\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"products done\">\n" +
    "         <span class=\"count finished\">{{ numDone}}</span>\n" +
    "         <span class=\"descr\">done updating</span>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("signup/signup-name.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("signup/signup-name.tpl.html",
    "<div class=\"signup-input url\">\n" +
    "   <div class=\"intro\">Let's get started making your account! It'll take less than five minutes. And don't worry; you can always edit or change anything in your account later. First things first: what's your name?</div>\n" +
    "\n" +
    "   <div class=\"form-group\">\n" +
    "      <input required class=\"form-control\" type=\"text\" ng-model=\"profileAbout.givenName\" placeholder=\"First name\">\n" +
    "   </div>\n" +
    "   <div class=\"form-group\">\n" +
    "      <input required class=\"input-large form-control\" type=\"text\" ng-model=\"profileAbout.surname\" placeholder=\"Last name\">\n" +
    "   </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("signup/signup-password.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("signup/signup-password.tpl.html",
    "<div class=\"signup-input email-and-password\">\n" +
    "   <div class=\"intro\"><br>Last step! Enter your email (which we never share) and pick a password:</div>\n" +
    "\n" +
    "   <div class=\"form-group email\"\n" +
    "        ng-class=\"{ 'has-error':  signupForm.email.$invalid && signupForm.email.$dirty && !loading.is(),\n" +
    "                 'has-success': signupForm.email.$valid && signupForm.email.$dirty && !loading.is()}\">\n" +
    "\n" +
    "      <div class=\"controls input-group\">\n" +
    "         <span class=\"input-group-addon\"><i class=\"icon-envelope\"></i></span>\n" +
    "         <input ng-model=\"profileAbout.email\"\n" +
    "                placeholder=\"email\"\n" +
    "                name=\"email\"\n" +
    "                class=\"form-control\"\n" +
    "                required\n" +
    "                data-require-unique\n" +
    "                 />\n" +
    "\n" +
    "      </div>\n" +
    "      <div class=\"help-info\">\n" +
    "\n" +
    "         <spinner msg=\"Checking\"></spinner>\n" +
    "\n" +
    "         <div class=\"help-block error tall\"\n" +
    "              ng-show=\"signupForm.email.$error.requireUnique\n" +
    "            && signupForm.email.$dirty\n" +
    "            && !loading.is()\">\n" +
    "            That email address is already in use.\n" +
    "         </div>\n" +
    "         <div class=\"help-block success\"\n" +
    "              ng-show=\"signupForm.email.$valid\n" +
    "            && signupForm.email.$dirty\n" +
    "            && !loading.is()\">\n" +
    "            Looks good!\n" +
    "         </div>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "\n" +
    "   <div class=\"form-group password\"\n" +
    "         ng-class=\"{'has-success': signupForm.password.$valid && !loading.is()}\">\n" +
    "\n" +
    "\n" +
    "\n" +
    "      <div class=\"controls input-group\">\n" +
    "         <span class=\"input-group-addon\"><i class=\"icon-key\"></i></span>\n" +
    "\n" +
    "         <input ng-model=\"profileAbout.password\"\n" +
    "                name=\"password\"\n" +
    "                type=\"password\"\n" +
    "                placeholder=\"password\"\n" +
    "                ng-show=\"!showPassword\"\n" +
    "                class=\"form-control\"\n" +
    "                required>\n" +
    "\n" +
    "         <input ng-model=\"profileAbout.password\"\n" +
    "                name=\"password\"\n" +
    "                type=\"text\"\n" +
    "                placeholder=\"password\"\n" +
    "                ng-show=\"showPassword\"\n" +
    "                class=\"form-control\"\n" +
    "                required>\n" +
    "      </div>\n" +
    "      <pretty-checkbox value=\"showPassword\" text=\"Show\"></pretty-checkbox>\n" +
    "\n" +
    "   </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("signup/signup-products.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("signup/signup-products.tpl.html",
    "<div class=\"signup-input importers\" ng-controller=\"signupProductsCtrl\">\n" +
    "\n" +
    "   <div class=\"importer\"\n" +
    "        ng-repeat=\"importer in importers\"\n" +
    "        ng-controller=\"importerCtrl\"\n" +
    "        ng-include=\"'importers/importer.tpl.html'\"\n" +
    "        >\n" +
    "   </div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "</div>");
}]);

angular.module("signup/signup-url.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("signup/signup-url.tpl.html",
    "<div class=\"signup-input url\" ng-controller=\"signupUrlCtrl\">\n" +
    "   <div class=\"intro\"><br>Okay, {{ profileAbout.givenName }}, your next step is to pick your profile's custom URL. (Don't worry, you can change this later, too):</div>\n" +
    "   \n" +
    "   <div class=\"form-group custom-url\"\n" +
    "        ng-model=\"profileAbout.url_slug\"\n" +
    "        ng-class=\"{ 'has-error':  signupForm.url_slug.$invalid && signupForm.url_slug.$dirty && !loading.is(),\n" +
    "                    'has-success': signupForm.url_slug.$valid && !loading.is()}\">\n" +
    "\n" +
    "      <div class=\"controls input-group\">\n" +
    "         <span class=\"input-group-addon\">http://impactstory.org/</span>\n" +
    "         <input ng-model=\"profileAbout.url_slug\"\n" +
    "                name=\"url_slug\"\n" +
    "                class=\"form-control\"\n" +
    "                required\n" +
    "                data-require-unique\n" +
    "                data-check-initial-value=\"true\"\n" +
    "                ng-pattern=\"/^\\w+$/\"\n" +
    "                 />\n" +
    "\n" +
    "      </div>\n" +
    "      <div class=\"help-info\">\n" +
    "         <spinner msg=\"Checking\"></spinner>\n" +
    "\n" +
    "         <div class=\"help-block error\"\n" +
    "              ng-show=\"signupForm.url_slug.$error.pattern\n" +
    "               && signupForm.url_slug.$dirty\n" +
    "               && !loading.is()\">\n" +
    "            Sorry, this URL has invalid characters.<br> You can only use numbers or Latin letters (without diacritics).\n" +
    "         </div>\n" +
    "\n" +
    "         <div class=\"help-block error\"\n" +
    "              ng-show=\"signupForm.url_slug.$error.requireUnique\n" +
    "               && signupForm.url_slug.$dirty\n" +
    "               && !loading.is()\">\n" +
    "            Sorry, someone else is using that URL.<br>Try changing it to make it more unique.\n" +
    "         </div>\n" +
    "         <div class=\"help-block success\"\n" +
    "              ng-show=\"signupForm.url_slug.$valid\n" +
    "               && signupForm.url_slug.$dirty\n" +
    "               && !loading.is()\">\n" +
    "            This URL looks good!\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "\n" +
    "   </div>\n" +
    "</div>");
}]);

angular.module("signup/signup.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("signup/signup.tpl.html",
    "<div class=\"signup-header\">\n" +
    "   <h1><a class=\"brand\" href=\"/\"><img src=\"/static/img/impactstory-logo-white.png\" alt=\"ImpactStory\" /></a>\n" +
    "      <span class=\"text\">signup</span>\n" +
    "   </h1>\n" +
    "   <ol class=\"signup-steps\">\n" +
    "      <li ng-repeat=\"stepName in signupSteps\"\n" +
    "          class=\"{{ stepName }}\"\n" +
    "          ng-class=\"{current: isStepCurrent(stepName), completed: isStepCompleted(stepName)}\">\n" +
    "         {{ stepName }}\n" +
    "      </li>\n" +
    "   </ol>\n" +
    "</div>\n" +
    "\n" +
    "<form class=\"signup name form-horizontal\" name=\"signupForm\">\n" +
    "\n" +
    "   <div ng-include=\"include\"></div>\n" +
    "\n" +
    "   <button type=\"submit\"\n" +
    "           class=\"next-button\"\n" +
    "           ng-click=\"goToNextStep()\"\n" +
    "           ng-class=\"{'next-button': true, enabled: signupForm.$valid}\"\n" +
    "           ng-disabled=\"signupForm.$invalid\">\n" +
    "      <span class=\"text\">Next</span>\n" +
    "      <i class=\"icon-arrow-right\"></i>\n" +
    "   </button>\n" +
    "\n" +
    "</form>");
}]);

angular.module("update/update-progress.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("update/update-progress.tpl.html",
    "<div class=\"modal-header\">\n" +
    "   <h3>Finding impact data</h3>\n" +
    "</div>\n" +
    "<div class=\"modal-body update\">\n" +
    "   <div class=\"intro\"><br>We're scouring the web to discover the impacts of all your research products...</div>\n" +
    "\n" +
    "   <div class=\"update-progress\">\n" +
    "      <div class=\"products not-done\">\n" +
    "         <div class=\"content\" ng-show=\"updateStatus.numNotDone\"></div>\n" +
    "            <span class=\"count still-working\">{{ updateStatus.numNotDone }}</span>\n" +
    "            <span class=\"descr\">products updating</span>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <progress percent=\"updateStatus.percentComplete\" class=\"progress-striped active\"></progress>\n" +
    "\n" +
    "      <div class=\"products done\">\n" +
    "         <div class=\"content\" ng-show=\"updateStatus.numNotDone\"></div>\n" +
    "            <span class=\"count finished\">{{ updateStatus.numDone}}</span>\n" +
    "            <span class=\"descr\">products <br>done</span>\n" +
    "         </div>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "</div>\n" +
    "\n" +
    "<!--  57@e.com -->");
}]);

angular.module('templates.common', ['forms/save-buttons.tpl.html', 'security/login/form.tpl.html', 'security/login/toolbar.tpl.html']);

angular.module("forms/save-buttons.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("forms/save-buttons.tpl.html",
    "<div class=\"buttons-group save\">\n" +
    "   <div class=\"buttons\" ng-show=\"!loading.is()\">\n" +
    "      <button\n" +
    "              class=\"btn btn-primary\"\n" +
    "              ng-disabled=\"!isValid()\"\n" +
    "              type=\"submit\">\n" +
    "         {{ action }}\n" +
    "      </button>\n" +
    "      <a\n" +
    "              class=\"btn btn-default\"\n" +
    "              ng-click=\"onCancel()\">\n" +
    "         Cancel\n" +
    "      </a>\n" +
    "   </div>\n" +
    "   <div class=\"working\" ng-show=\"loading.is()\">\n" +
    "      <i class=\"icon-refresh icon-spin\"></i>\n" +
    "      <span class=\"text\">{{ action }}ing...</span>\n" +
    "   </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("security/login/form.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("security/login/form.tpl.html",
    "<form name=\"form\" novalidate class=\"login-form\">\n" +
    "    <div class=\"modal-header\">\n" +
    "        <h4>Sign in</h4>\n" +
    "    </div>\n" +
    "    <div class=\"modal-body\">\n" +
    "        <div class=\"alert alert-warning\" ng-show=\"authReason\">\n" +
    "            {{authReason}}\n" +
    "        </div>\n" +
    "        <div class=\"alert alert-error\" ng-show=\"authError\">\n" +
    "            {{authError}}\n" +
    "        </div>\n" +
    "        <div class=\"alert alert-info\">Please enter your login details</div>\n" +
    "        <label>E-mail</label>\n" +
    "        <input name=\"login\" type=\"email\" ng-model=\"user.email\" required autofocus>\n" +
    "        <label>Password</label>\n" +
    "        <input name=\"pass\" type=\"password\" ng-model=\"user.password\" required>\n" +
    "    </div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "        <button class=\"btn btn-primary login\" ng-click=\"login()\" ng-disabled='form.$invalid'>Sign in</button>\n" +
    "        <button class=\"btn cancel\" ng-click=\"cancel()\">Cancel</button>\n" +
    "    </div>\n" +
    "</form>\n" +
    "");
}]);

angular.module("security/login/toolbar.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("security/login/toolbar.tpl.html",
    "<ul class=\"nav pull-right\">\n" +
    "   <li ng-show=\"isAuthenticated()\" class=\"logged-in-user\">\n" +
    "      <span class=\"context\">Welcome back, </span>\n" +
    "      <a class=\"current-user\" href=\"/{{ currentUser.url_slug }}\">{{currentUser.given_name}}</a>\n" +
    "   </li>\n" +
    "   <li ng-show=\"isAuthenticated()\" class=\"divider-vertical\"></li>\n" +
    "   <li ng-show=\"isAuthenticated()\" class=\"logged-in preferences dropdown\">\n" +
    "      <a href=\"#\" class=\"preferences dropdown-toggle\" data-toggle=\"dropdown\" title=\"Change URL and other preferences\">\n" +
    "         <i class=\"icon-cog\"></i>\n" +
    "      </a>\n" +
    "      <ul class='preferences-actions dropdown-menu'>\n" +
    "         <li><a href=\"/settings/profile\" class=\"profile\"><i class=\"icon-cogs\"></i>Preferences</a></li>\n" +
    "         <li><a href=\"/api-docs\" class=\"profile\"><i class=\"icon-suitcase\"></i>Embed</a></li>\n" +
    "         <li class=\"divider\"></li>\n" +
    "         <li><a href=\"#\" class=\"logout\" ng-click=\"logout()\"><i class=\"icon-off\"></i>Log out</a></li>\n" +
    "      </ul>\n" +
    "   </li>\n" +
    "\n" +
    "   <li ng-hide=\"isAuthenticated()\" class=\"login\">\n" +
    "      <form class=\"navbar-form\">\n" +
    "         <span class=\"context\">Already have a profile?</span>\n" +
    "         <a class=\"login\" ng-click=\"login()\">Log in<i class=\"icon-signin\"></i></a>\n" +
    "      </form>\n" +
    "   </li>\n" +
    "</ul>");
}]);