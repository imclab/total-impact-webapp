(function(){function n(){e=window.jQuery.noConflict(!0);r()}function r(){function t(e){var t="1999-01-01T00:00:00.000000";for(ts in e)ts>t&&(t=ts);return t}function n(e,t){return typeof e.value!="number"?1:typeof t.value!="number"?-1:e.value<t.value?1:e.value>t.value?-1:0}function r(e){e.metricsArr=[];for(metricName in e.metrics){thisMetric=e.metrics[metricName];thisMetric.name=metricName;var r=t(e.metrics[metricName].values);if(r){var i=e.metrics[metricName].values[r];thisMetric.ts=r;thisMetric.value=i}thisMetric.value&&e.metricsArr.push(thisMetric)}e.metricsArr=e.metricsArr.filter(function(e){good_to_print=typeof e["value"]=="number";typeof e["value"]=="string"&&(good_to_print=!0);return good_to_print});e.metricsArr.sort(n);typeof ich.itemtemplate=="undefined"&&ich.addTemplate("itemtemplate",'<div class="item" id="{{ id }}">\r\n  <div class="biblio"></div>\r\n  <ul class="metrics">{{#metricsArr}}\r\n    <li>\r\n      <a href="{{provenance_url}}">\r\n        <span class="last-update">{{ ts }}</span>\r\n        <span class="metric-value">{{ value }}</span>\r\n        <span class="metric-name-img">\r\n          <img src="{{ static_meta.icon }}" width="16" height="16" border="0">\r\n          <span class="metric-name">{{ static_meta.provider }} {{ static_meta.display_name }}</span>\r\n        </span>\r\n      </a>\r\n    </li>\r\n    {{/metricsArr}}\r\n  </ul>\r\n</div>');return ich.itemtemplate(e)}function i(t){e("div#ti-data").empty().append(r(t))}function s(t,n,r){e.ajax({url:"http://api.impactstory.org/v1/item/"+t+"/"+n+"?key=EXAMPLE",type:"GET",dataType:"json",contentType:"application/json; charset=utf-8",statusCode:{210:function(e){console.log("still updating");i(e);setTimeout(function(){s(t,n,r)},r)},200:function(e){console.log("done with updating");i(e);return!1}}})}function o(e){var t=[];if(e.indexOf(":")>0){t[0]=e.split(":")[0];t[1]=e.substr(t[0].length+1);if(t[0]=="http"){t[0]="url";t[1]=e}}return t}function u(e){var t=document.createElement("link");t.rel="stylesheet";t.type="text/css";t.href=e;t.media="all";document.lastChild.firstChild.appendChild(t)}function a(e){var t=document.createElement("script");t.src=e;document.getElementsByTagName("head")[0].appendChild(t)}window.console||(console={log:function(){}});e.ajaxSetup({cache:!1});var f='<img id="ti-loading" src="http://impactstory.org/static/img/ajax-loader.gif" alt="loading..." />';e(document).ready(function(e){u("http://total-impact.org/static/css/embed.css");a("http://total-impact.org/static/js/icanhaz.min.js");e("span#ti-id").hide();e("div#ti-data").html(f+" Loading...");var t=o(e("span#ti-id").html()),n=t[0],r=t[1];e.ajax({url:"http://api.impactstory.org/v1/item/"+n+"/"+r+"?key=EXAMPLE",type:"POST",dataType:"json",contentType:"application/json; charset=utf-8",data:JSON.stringify(t),success:function(e){console.log("item created. ");s(n,r,1e3)}})})}var e;if(window.jQuery===undefined||window.jQuery.fn.jquery!=="1.4.2"){var t=document.createElement("script");t.setAttribute("type","text/javascript");t.setAttribute("src","https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js");t.readyState?t.onreadystatechange=function(){(this.readyState=="complete"||this.readyState=="loaded")&&n()}:t.onload=n;(document.getElementsByTagName("head")[0]||document.documentElement).appendChild(t)}else{e=window.jQuery;r()}})();
