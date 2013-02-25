
function Genre(name) {
    this.name = name
    this.items = []

    this.sortItems = function(items) {
        return _.sortBy(items, function(item){
            var badgesSortFactor = _.reduce(item.dict.awards, function(memo, award){
                return memo + ((award.isHighly) ? 10 : 1)
            }, 0)
            return badgesSortFactor
        }).reverse()
    }

    this.render = function(){
        this.items = this.sortItems(this.items)

        var genre$ = $(ich.genreTemplate({name:this.name}, true))

        var renderedItems = []
        var itemsWithoutActivity = []
        for (var i=0;i<this.items.length;i++){
            var thisItem = this.items[i]
            if (thisItem.dict.awards.length) {
                renderedItems.push(thisItem.render())
            }
            else {
                itemsWithoutActivity.push(thisItem.render())
            }
        }
        genre$.find("ul.items.active").append(renderedItems)
        genre$.find("ul.items.inactive").append(itemsWithoutActivity)
        if (itemsWithoutActivity.length) {
            genre$.find("h4.plus-more")
                .toggle(
                    function(){
                        $(this).addClass("showing").siblings("ul.items.inactive").slideDown()
                        $(this).find("span.show-hide").html("(hide)")
                    },
                    function() {
                        $(this).removeClass("showing").siblings("ul.items.inactive").slideUp()
                        $(this).find("span.show-hide").html("(show)")
                    }
                )
                .find("span.value")
                .html(itemsWithoutActivity.length)
        }
        else {
            genre$.find("h4.plus-more").hide()
        }

        return genre$
    }
    return true
}

function GenreList(items) {
    var itemGroupsByGenre = _.groupBy(items, function(item) {
        return item.dict.biblio.genre
    })
    this.genres = _.map(itemGroupsByGenre, function(items, genreName){
        var genre = new Genre(genreName)
        genre.items = items
        return genre
    })

    this.render = function(){

        var renderedGenres = _.chain(this.genres)
            .sortBy("name")
            .map(function(genre){
                return genre.render()
            })
            .value()

        $("div.genre").remove()
        $("div.tooltip").remove() // otherwise tooltips from removed badges stick around
        $("#metrics div.wrapper").append(renderedGenres)
    }
}

function Coll(collViews, user){
    this.views = collViews;
    this.user = user
    this.id = null
    this.items = {}

    this.addItemsFromDicts = function(newItemDicts, alias_tiids) {
        for (var i=0; i<newItemDicts.length; i++) {
            var tiid = newItemDicts[i]["_id"]
            this.items[tiid] = new Item(newItemDicts[i], new ItemView($), $)
        }
    }

    this.create = function(aliases, title) {
        /*
        *   Make a new collection. On success, add it to the user's list of colls,
        *   and redirect to the webapp's /collection/<cid> report page.
         */

        var that = this
        var requestObj = {
            aliases: aliases,
            title:title
        }

        console.log("making the collection now.")
        $.ajax({
                   url: api_root+'/collection',
                   type: "POST",
                   dataType: "json",
                   contentType: "application/json; charset=utf-8",
                   data:  JSON.stringify(requestObj),
                   success: function(data){
                       console.log("finished making the collection!")
                       var cid=data.collection._id

                       // you could pass this in, but you pretty much only want it to redirect:
                       var redirect = function(){location.href = "/collection/" + cid}

                       // add the id of the newly-created coll to the user's coll list
                       that.user.addColl(cid, data.key)
                       that.user.syncWithServer("push", {on200: redirect, onNoUserId: redirect})
                   }
               })
    }


    this.read = function(interval, tries) {
        console.log("read")
        if (tries === undefined) {
            var tries = 0
        }

        var thisThing = this
        this.views.startUpdating()

        var url = api_root+'/v1/collection/'+thisThing.id+'?key='+api_key
        console.log("GET collection from", url)

        $.get(url, function(data){console.log("$.get() success:", data)})


        $.ajax({
           url:api_root+'/v1/collection/'+thisThing.id+'?key='+api_key,
           type: "GET",
           dataType: "json",
           contentType: "application/json; charset=utf-8",
           success: function(data){console.log("success!", data)}
       })

        $.ajax({
            url: api_root+'/v1/collection/'+thisThing.id+'?key='+api_key,
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            statusCode: {
               210: function(data){
                   console.log("still updating")
                   thisThing.title = data.title
                   thisThing.alias_tiids = data.alias_tiids
                   thisThing.addItemsFromDicts(data.items)

                   thisThing.render.call(thisThing)

                   if (tries > 120) { // give up after 1 minute...
                       console.log("failed to finish update; giving up after 1min.")
                   }
                   else {
                       setTimeout(function(){
                           thisThing.read(interval, tries+1)
                       }, 500)
                   }
               },
               200: function(data) {
                   console.log("done with updating")
                   thisThing.alias_tiids = data.alias_tiids
                   thisThing.title = data.title
                   thisThing.addItemsFromDicts(data.items)

                   thisThing.render.call(thisThing)
                   thisThing.views.finishUpdating(thisThing.items)


                   return false;
               }
            }
            });
    }


    this.updateTitle = function(newTitle){
        // implement later.
    }

    this.deleteItem = function(tiidToDelete, callbacks) {
        if (!this.userCanEdit(callbacks)) return false
        callbacks.start()
        this.update({"tiids": [tiidToDelete]},"DELETE", callbacks.success)
        return false
    }

    this.addItems = function(itemsToAdd, callbacks) {
        if (!this.userCanEdit(callbacks)) return false
        this.update({aliases: itemsToAdd}, "PUT", callbacks.onSuccess)
    }

    this.update = function(payload, httpType, onSuccess){

        var url = api_root+'/v1/collection/'+this.id+'/items?'
            + "http_method="+httpType
            + '&key='+api_key
            + '&edit_key='+this.user.getKeyForColl(this.id)

        $.ajax({
                   url: url,
                   type: "POST",
                   dataType: "json",
                   contentType: "application/json; charset=utf-8",
                   data:  JSON.stringify(payload),
                   success: function(data){
                       console.log("finished updating the collection!")
                       onSuccess(data)
                   }
               })
    }

    this.refreshItemData = function() {
        var thisThing = this
        this.views.startUpdating()
        $.ajax({
            url: api_root+'/v1/collection/'+this.id+'?key='+api_key,
            type: "POST",
            success: function(data){
               console.log("updating.")
               thisThing.read(1000);
            }});
        }

    this.userCanEdit = function(callbacks){
        if (!this.user.hasCreds()) {
            callbacks.onNotLoggedIn()
            return false
        }
        if (!this.user.getKeyForColl(this.id)) {
            callbacks.onNotOwner()
            return false
        }
        return true
    }



    this.render = function(){
        this.views.renderItems(this.items)
//        this.views.renderTitle(this.title)

    }
}

function CollViews() {
    this.startUpdating = function(){
        $("img.loading").remove()

        $("h2").before(ajaxLoadImg)
    }

    this.badgesWeight = function(dict) {
        return _.reduce(dict.awards, function(memo, metric){
            return memo + (metric.isHighly) ? 10 : 1
        }, 0)
    }

    this.finishUpdating = function(items){
        // setup page header
        $("#page-header img").remove()
        console.log("num items:", _.size(items))
        $("#num-items span.value").text(_.size(items))

        // setup item-level zooming
        $("ul.active li.item div.item-header").addClass("zoomable")
        $("a.item-expand-button")
            .show()
            .css({color: tiLinkColor})
            .fadeOut(1500, function(){
                $(this).removeAttr("style")
            })
    }

    this.renderItems = function(itemObjsDict) {
        var itemObjs = _.values(itemObjsDict)
        var genreList = new GenreList(itemObjs)
        genreList.render()

    }

    this.renderIsEditable = function(isEditable) {
        if (isEditable){
            $("div#report").addClass("editable")
        }
    }

    this.onEditNotOwner = function(){
        $("#edit-not-owner").modal("show")
    }

    this.onEditNotLoggedIn = function() {
        $("#edit-not-logged-in").modal("show")
    }
}


function CollController(coll, collViews) {
    this.coll = coll
    this.collViews = collViews

    this.collReportPageInit = function() {
        this.coll.id = reportId // global loaded by the server
        this.coll.render()
        this.coll.read(1000)
        var that = this


        // refresh all the items
        $("#update-report-button").click(function(){
            coll.refreshItemData();
            return false;
        })


        // show/hide all zoom divs
        $("div#num-items a").toggle(
            function(){
                $(this).html("(collapse all)")
                $("li.item").addClass("zoomed").find("div.zoom").show()
            },
            function(){
                $(this).html("(expand all)")
                $("li.item").removeClass("zoomed").find("div.zoom").hide()
            }
        )

        // show the import-products dialog when you ask for it
        $("#import-products-button").click(function(){
            var callbacks = {
                onNotLoggedIn: that.collViews.onEditNotLoggedIn,
                onNotOwner: that.collViews.onEditNotOwner
            }

            if (!that.coll.userCanEdit(callbacks)) return false
            $("#import-products-modal").modal("show")
            return false
        })


        // delete items
        $("a.item-delete-button").live("click", function(){
            var item$ = $(this).parents("li.item")

            var callbacks = {
                start: function() {item$.slideUp();},
                success: function(data){
                    console.log("deleted, done. blam.", data)
                    $("#num-items span.value").text(_.size(data.alias_tiids))
                },
                onNotLoggedIn: that.collViews.onEditNotLoggedIn,
                onNotOwner: that.collViews.onEditNotOwner
            }

            that.coll.deleteItem( item$.attr("id"), callbacks)
            return false;
        })
    }

}
