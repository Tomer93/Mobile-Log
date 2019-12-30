$(document).ready(function(){
  $('#manualLogsBtn').click(function(){$('#manualLogsOverlay').css('display','block')});
  $('#exitLogs').click(function(){$('#manualLogsOverlay').css('display','none')})
  //$("#allLogs").unbind();
//On load trigger
  //tableCallbackAndCreation  ()

//<--------------------------------------------------------------------------------INPUT--------------------------------------------------------------------------->

var filterType=[],logTime,logData,logType,counter=1;
function tableCallbackAndCreation  () {
  var reqBody = `{"filters":{"type":${filterType ? JSON.stringify(filterType) : JSON.stringify([])},"level":[]}}`;
  //  var reqBody = '{"filters":{"type":["Recommendation","Smart Variable"],"level":[]}}';
  console.log('reqBody'+reqBody);
  $.ajax({
    url: 'http://localhost/getLogs',
    type: 'POST',
    contentType: 'application/json',
    data: reqBody
  }).done(function(response){
    console.log('success');
    TableCreation(response);
  }).fail(function(jqXHR, textStatus, errorThrown){
    console.log('FAILED! ERROR: ' + errorThrown);
  });

}
  $('#logsSubmit').click(function (){
    $('#manualLogsOverlay').css('display','none')
    var logsval = $("#allLogs").val();
    logsval.replace("\n","$")
    console.log("LOG LEVEL"+logsval);
        $.ajax({
          url: 'http://localhost/logsCreation',
          type: 'POST',
          contentType: 'text/plain',
          data: {logsval}
        }).done(function(response){
          console.log('success'+JSON.stringify(response));
          TableCreation(response);
        }).fail(function(jqXHR, textStatus, errorThrown){
          console.log('FAILED! ERROR: ' + errorThrown);
        });
  }

  );


//<--------------------------------------------------------------------------------This function creats the table according to the log file input--------------------------------------------------------------------------->

function TableCreation(logsJson){
  console.log('table creation');
  document.querySelector('#logsbody').innerHTML="";
  logsJson.forEach(element => {
        logType= element.type;
        logTime= element.logTime;
        logData= element.data;
        $('#logsbody').append("<tr id="+counter+"><td>"+logTime+"</td><td>"+logType+"</td><td>"+logData+"</td></tr>");
        switch (logType){
            case 'Recommendation':
                $("#"+counter+"> td:nth-child(2)").addClass("rec");
                break;
            case 'Evaluator':
                $("#"+counter+"> td:nth-child(2)").addClass("logError");
                break;
            case 'Smart Variable':
                 $("#"+counter+"> td:nth-child(2)").addClass("logvar");
                break;
            case 'Smart Variable':
                 $("#"+counter+"> td:nth-child(2)").addClass("event");
                break;
            

        }
        counter++;
    });
}

//<--------------------------------------------------------------------------------This function searches the value in the table--------------------------------------------------------------------------->

function searchTable(x){
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[x];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
    



}

//<--------------------------------------------------------------------------------Filters Drop Down--------------------------------------------------------------------------->
//"use strict";
var pluginName = "selectionator";
var defaults = {
  propertyName: "selectionator",
  src: null,
  orgElement: null,
  checkedItems: [],
  // custom callback events
  onError: function(error) {}
};
function Plugin(element, options) {
  this.element = element;
  this.selector = null;
  this.options = $.extend({}, defaults, options);
  this._defaults = defaults;
  this._name = pluginName;
  this.init();
}
Plugin.prototype = {
  init: function() {
    console.log("options: ", this.options);
    var that = this;
    var self = $(that.element);
    that.options.src = that.element.getAttribute("data-src");
    that.selector = that.createFromJson(that.options.data);
    that.options.orgElement = that.element.parentNode.replaceChild(
      that.selector,
      that.element
    );
    $(that.selector).addClass(that._name);
  },
  createFromJson: function(options) {
    var that = this;
    var select = document.createElement("select");
    var popup = document.createElement("div");
    var header = document.createElement("div");
    var search = document.createElement("span");
    var overlay = document.createElement("span");
     overlay.className = "overlay";
    var shadow = document.createElement("span");
    shadow.className = "shadow";
    var placeholder = document.createTextNode("Choose Log filters");
    search.className = "search";
    // search.appendChild(shadow);
    // search.appendChild(overlay);
    //search.appendChild(placeholder);
    //popup.appendChild(search);
    var menu = document.createElement("ul");
    select.style.display = "none";
    menu.className = "list";
    var box = document.createElement("div");
    box.className = "";
    box.appendChild(menu);
    popup.appendChild(box);
    console.log("optgroup", options.optgroups);
    options.optgroups.forEach(function(optgroup, index) {
      var menuItem = document.createElement("li");
      //menuItem.className('header');
      var header = document.createElement("span");
      header.className = "header";
      var caption = document.createTextNode(optgroup.label);
      header.appendChild(caption);
      menuItem.appendChild(header);
      var menuItems = document.createElement("ul");
      menuItems.className = "optgroup";
      menuItem.appendChild(menuItems);
      menu.appendChild(menuItem);

      optgroup.options.forEach(function(option, index) {
        var opt = new Option(
          option.text,
          option.value,
          option.defaultSelected,
          option.selected
        );
        select.options.add(opt);
        var item = document.createElement("li");
        var label = document.createElement("label");
        label.setAttribute("for", option.value);
        var checkbox = document.createElement("input");
        $(checkbox).data(option);
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "Filters");
        checkbox.addEventListener("change", function(event) {
          var checkbox = event.target;
          var $el = $(event.srcElement);
          if (checkbox.checked) {
            that.options.checkedItems.push(event.srcElement);
            placeholder.nodeValue =
              "Filters: " +
              that.options.checkedItems.length +
              " out of " +
              $(that.selector).find('input[type="checkbox"]').length;
          } else {
            that.options.checkedItems.pop();
            that.options.checkedItems = that.options.checkedItems.filter(
              function(items, index) {
                return items.value != $el.data().value;
              }
            );
            placeholder.nodeValue =
              "Filters: " +
              that.options.checkedItems.length +
              " out of " +
              $(that.selector).find('input[type="checkbox"]').length;
          }
          filterType=[];
          $('input[name="Filters"]').each(function () {
            if (this.checked ? filterType.push(this.id):null);
          });
          tableCallbackAndCreation();
          console.log("data: ", that.options.checkedItems);
        });
        checkbox.id = option.value;
        var caption = document.createTextNode(option.text);
        label.appendChild(caption);
        item.appendChild(checkbox);
        item.appendChild(label);
        menuItems.appendChild(item);
      });
    });
    return popup;
  },
  onAddFriend: function(data) {
    var that = this;
    return that.options.onAddFriend(that, data);
  },
  onRemoveFriend: function(data) {
    var that = this;
    var self = $(that.element);
    return that.options.onRemoveFriend(data);
  },
  destroy: function() {
    var that = this;
    $(that.element).unbind("destroyed", that.teardown);
    that.teardown();
  },
  teardown: function() {
    var that = this;
    $(that.element).removeClass(that._name);
    $(that.selector).replaceWith(that.options.orgElement);
    $(that.element).removeData(that._name);
    that.unbind();
    that.element = null;
  },
  bind: function() {},
  unbind: function() {}
};
$.fn[pluginName] = function(options) {
  return this.each(function() {
    if (!$.data(this, pluginName)) {
      $.data(this, pluginName, new Plugin(this, options));
    }
  });
};

//Attach plugin to all matching element

$("#select").selectionator({
  data: {
    optgroups: [
      {
        label: "Select Logs Type:",
        options: [
          {
            value: "Recommendation",
            text: "Recommendation",
            defaultSelected: false,
            selected: false
          },
          {
            value: "Smart Variable",
            text: "Smart Variable",
            defaultSelected: false,
            selected: false
          },
          {
            value: "Evaluator",
            text: "Evaluator",
            defaultSelected: false,
            selected: false
          },
          {
            value: "Event",
            text: "Event",
            defaultSelected: false,
            selected: false
          },
        ]
      },
    ]
  }
});

// This funsction gets the data from the Iframe after returning data from submitting a file
var iFrame = document.getElementById("uploader_iframe");
iFrame.onload = function () {
  /** do smth with your iframe data */
  console.log("data is: "+ iFrame.contentDocument.body.innerText);
  TableCreation(JSON.parse(iFrame.contentDocument.body.innerText));

};

});

//Exposing the text box for manual logs insertion

  