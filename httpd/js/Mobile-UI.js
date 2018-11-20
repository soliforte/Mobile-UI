//alert("It loaded")
//Time thing
Date.prototype.timeNow = function(){ return ((this.getHours() < 10)?"0":"") + ((this.getHours()>12)?(this.getHours()-12):this.getHours()) +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds() + ((this.getHours()>12)?('PM'):'AM'); };

////////////////////////////////////////
///////////// Globals //////////////////
////////////////////////////////////////
var asTimer;
var setTimer;
////////////////////////////////////////

$(function(){
  $('.opt').on("click", function(event){
    openoptpane(event);
  })
})

$(window).ready( function() {
 setInterval(populateMain, 1000);
});

$(window).ready( function() {
  setInterval(getDevices, 1000);
 });

$(window).ready( function() {
 setInterval(getPlugins, 1000);
});

$(window).ready( function() {
 setInterval(getAvailableSources, 2000);
});

$(window).ready( function() {
  setTimer = setInterval(setChannels, 1000);
  asTimer = setInterval(getActiveSources, 2000);
});

$(window).ready( function() {
  setInterval(getAlerts, 2000)
})

/////////////////////////////////////////////////
/////////////// Main Screen Stuff ///////////////
/////////////////////////////////////////////////

$(document).ready(function(){
  var map = L.map('map',{zoomControl: false,}).setView([0, 0], 14);

  mapLink = '<a href="http://mapbox.com">MapBox</a>';

  L.tileLayer('https://api.mapbox.com/styles/v1/soliforte/cjf5ust0g14gc2ro26e3n055d/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic29saWZvcnRlIiwiYSI6ImNqZjV1czRyczFvY3ozM3Bkdm5kNHc0NjMifQ.eB3mOmCKf91Af0bhP4vH5A', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 18,
  }).addTo(map);
})

function openoptpane(e){
  elid = e.target.id+"win"
  if ( $('#'+elid).hasClass('optwin-open') ){
    $('#'+elid).removeClass('optwin-open')
    $('#'+elid+"-content").removeClass('optwin-content-open')
  } else {
    $('#'+elid).addClass('optwin-open')
    $('#'+elid+"-content").addClass('optwin-content-open')
  }
}

function populateMain(){
  $.getJSON('/system/status.json').done(function(res){
    var battperc = res['kismet.system.battery.percentage']	//100
    var battchrg = res['kismet.system.battery.charging']	//"discharging"
    var battac = res['kismet.system.battery.ac']	//0
    //var battrem = res['kismet.system.battery.remaining']	//26424000
    //var timestamp = res['kismet.system.timestamp.sec']	//1532636658
    //var timestart = res['kismet.system.timestamp.start_sec']	//1532621564
    //var memrss = res['kismet.system.memory.rss']	//343488
    var devcount = res['kismet.system.devices.count']	//8434
    var now = new Date()
    var battcss = battperc.toString()+"%"

    //Set time vals
    /**var startdate = new Date(timestart * 1000)
    var diff = timestamp - timestart
    var min = Math.round(diff / 60)
    var hours = Math.round(min / 60)
    var uptime = hours+":"+min
    var curtime = new Date(timestamp * 1000)**/
    $('#currtime').text(now.getHours()+":"+now.getMinutes()+":"+now.getSeconds())

    // Set battery vals
    if (battac == 0){
      var battcolor = ""
    } else {
      var battcolor = ""
    }

    if (battchrg == "charging"){
      var batticon = '<i class="fas fa-bolt"></i>'
    } else {
      var batticon = '<i class="far fa-thumbs-up"></i>'
    }
    $("#battperc").text(battperc+"%")
    $("#battcharging").html(batticon)
    $('#battInd').css({"width": battcss})

    //Set devstats vals
    $('#devcount').text("Devices: "+devcount)
    //$('#memuse').text("Memory usage: "+memrss)
  }).fail(function(){
    var battperc = "error"
    var battchrg = "error"
    var battac = "error"
    var battrem = "error"
    var timestamp = "error"
    var timestart = "error"
    var memrss = "error"
    var devcount = "error"
  }).always(function(){

  })
}

function getPlugins(){
  $.getJSON('/plugins/all_plugins.json').done(function(res){
    for (var x in res){
      var pluginname = res[x]['kismet.plugin.name']
      var plugindesc = res[x]['kismet.plugin.description']
      var pluginauthor = res[x]['kismet.plugin.author']
      var pluginversion = res[x]['kismet.plugin.version']
      var pluginobj = res[x]['kismet.plugin.shared_object']
      var plugindir = res[x]['kismet.plugin.dirname']
      var pluginpath = res[x]['kismet.plugin.path']
      var pluginmod = res[x]['kismet.plugin.jsmodule']
      var divid = '#'+pluginname
      var domel = '<fieldset id="'+pluginname+'" class="pluginel"><legend>'+pluginname+'</legend><div class="pluginfo">'+plugindesc+'</div><div class="pluginfo">'+pluginauthor+'</div><div class="pluginfo">'+pluginversion+'</div><div class="pluginfo">'+pluginobj+'</div><div class="pluginfo">'+plugindir+'</div><div class="pluginfo">'+pluginpath+'</div><div class="pluginfo">'+pluginmod+'</div></fieldset>'
      if ($(divid).length == 0){
        $('#opt3win-content').append(domel)
      } else {
        $(divid).html(domel)
      }
    }
  })
}

/////////////////////////////////////////////////////////
///////////////////// Devices Panel Stuff  //////////////
/////////////////////////////////////////////////////////

function getDevices(){
  $.getJSON('/devices/last-time/-30/devices.json').done(function(devs){
    for (var x in devs){
      var devKey = devs[x]['kismet.device.base.key']
      var devType = devs[x]['kismet.device.base.type']
      var devSSID = devs[x]['kismet.device.base.name']
      var devMAC = devs[x]['kismet.device.base.macaddr']
      var devCrypt = devs[x]['kismet.device.base.crypt']
      var devSignal = devs[x]['kismet.device.base.signal']['kismet.common.signal.last_signal']
      var devChannel = devs[x]['kismet.device.base.channel']
      var devClientMap = devs[x]['dot11.device']['dot11.device.associated_client_map']
      if (devType == "Wi-Fi AP"){
        var el = '<div id="'+devKey+'" class="devMain devAP"><div class="devInfo">'+devSSID+'</div><div class="devInfo">'+devMAC+'</div><div class="devInfo">'+devChannel+'</div><div class="devInfo">'+devSignal+'</div><div class="devInfo">'+devCrypt+'</div><div class="devInfo">'+devType+'</div></div>'
      } else if (devType == "Wi-Fi Client"){
        var el = '<div id="'+devKey+'" class="devMain devCli"><div class="devInfo">'+devSSID+'</div><div class="devInfo">'+devMAC+'</div><div class="devInfo">'+devChannel+'</div><div class="devInfo">'+devSignal+'</div><div class="devInfo">'+devCrypt+'</div><div class="devInfo">'+devType+'</div></div>'
      } else {
        var el = '<div id="'+devKey+'" class="devMain"><div class="devInfo">'+devSSID+'</div><div class="devInfo">'+devMAC+'</div><div class="devInfo">'+devChannel+'</div><div class="devInfo">'+devSignal+'</div><div class="devInfo">'+devCrypt+'</div><div class="devInfo">'+devType+'</div></div>'
      }
      if ( $('#'+devKey).length == 0){
        $('#opt1win-content').append(el)
        /**$('#'+devKey).on("click", function(){
          var key = $(this).attr('id')
          getClientDetails(key)
        })**/
      } else {
        $('#'+devKey).replaceWith(el)
        /**$('#'+devKey).on("click", function(){
          var key = $(this).attr('id')
          getClientDetails(key)
        })**/
      }
    }
  }).always(function(){

  }).fail(function(){

  })
}

function getClientDetails(key){
  $.getJSON('/devices/by-key/'+key+'/devices.json').done(function(devs){
    for (var dev in devs){
      var devKey = devs[dev]['kismet.device.base.key']
      var devType = devs[dev]['kismet.device.base.type']
      var devMAC = devs[dev]['kismet.device.base.macaddr']
      var devSignal = devs[dev]['kismet.device.base.signal']['kismet.common.signal.last_signal']
      var devChannel = devs[dev]['kismet.device.base.channel']
      var devManuf = devs[dev]['kismet.device.base.manuf']
      
      
    }
  })
}

////////////////////////////////////////////////////////
////////////// Alerts stuff ////////////////////////////
////////////////////////////////////////////////////////

function getAlerts(){
  var alerts = []
  $.getJSON('/alerts/all_alerts.json').done(function(alerts){
    for (var x in alerts){
      var timestamp = alerts[x]['kismet.alert.timestamp']	//float
      var devkey = alerts[x]['kismet.alert.device_key']	//string
      var header = alerts[x]['kismet.alert.header']	//string
      var phyid = alerts[x]['kismet.alert.phy_id']	//integer
      var txmac = alerts[x]['kismet.alert.transmitter_mac']	//string
      var srcmac = alerts[x]['kismet.alert.source_mac']	//string
      var dstmac = alerts[x]['kismet.alert.dest_mac']	//string
      var othmac = alerts[x]['kismet.alert.other_mac']	//string
      var channel = alerts[x]['kismet.alert.channel']	//string
      var freq = alerts[x]['kismet.alert.frequency']	//integer
      var alert = alerts[x]['kismet.alert.text']	//string
      //////////////////////////////////////////////////////////////
      var alertloc = alerts[x]['kismet.alert.location'] //dictionary
      var alertloclat = alertloc['kismet.common.location.lat']	//integer
      var alertloclon = alertloc['kismet.common.location.lon']	//integer
      var alertlocalt = alertloc['kismet.common.location.alt']	//integer
      var alertlocspeed = alertloc['kismet.common.location.speed']	//integer
      var alertlocheading = alertloc['kismet.common.location.heading']	//integer
      var alertlocfix = alertloc['kismet.common.location.fix']	//integer
      var alertlocvalid = alertloc['kismet.common.location.valid']	//integer
      var alertloctime = alertloc['kismet.common.location.time_sec']	//integer
      var alertloctimeus = alertloc['kismet.common.location.time_usec']	//integer
      ts = new Date(timestamp)
      convtime = ts.getHours()+":"+ts.getMinutes()+":"+ts.getSeconds()
      var alert = '<fieldset class="alert"><legend>'+header+'</legend><div class="alertinfo">'+convtime+'</div><div class="alertinfo">'+srcmac+'</div><div class="alertinfo">'+txmac+'</div><div class="alertinfo">'+channel+'</div></fieldset>'
      alerts.push(alert)
    }
    alertstring = alerts.join()
    if (alerts.length > 0){
        $('.alerts').replaceWith(alertstring)
    }
  })
}


////////////////////////////////////////////////////////
////////////// Data Sources stuff //////////////////////
////////////////////////////////////////////////////////
function getAvailableSources() {
  var availablesources = []

  $.getJSON("/datasource/list_interfaces.json").done(function(intf){
    for (var x in intf){
      var intfDriver = intf[x]['kismet.datasource.type_driver']
      var intfDriverType = intfDriver['kismet.datasource.driver.type']
      var intfDriverDesc = intfDriver['kismet.datasource.driver.description']
      var intfDriverProbeCap = intfDriver['kismet.datasource.driver.probe_capable']
      var intfDriverProbeIPC = intfDriver['kismet.datasource.driver.probe_ipc']
      var intfDriverListCap = intfDriver['kismet.datasource.driver.list_capable']
      var intfDriverListIPC = intfDriver['kismet.datasource.driver.list_ipc']
      var intfDriverLocalCap = intfDriver['kismet.datasource.driver.local_capable']
      var intfDriverLocalIPC = intfDriver['kismet.datasource.driver.local_ipc']
      var intfDriverRemoteCap = intfDriver['kismet.datasource.driver.remote_capable']
      var intfDriverPassiveCap = intfDriver['kismet.datasource.driver.passive_capable']
      var intfDriverTunCap = intfDriver['kismet.datasource.driver.tuning_capable']
      var intfName = intf[x]['kismet.datasource.probed.interface']
      var intfOptions = intf[x]['kismet.datasource.probed.options_vec']
      var intfUUID = intf[x]['kismet.datasource.probed.in_use_uuid']
      var intfHW = intf[x]['kismet.datasource.probed.hardware']
      source = {"Name": intfName, "Type": intfDriverType, "Description": intfDriverDesc, "Options": intfOptions, "UUID": intfUUID, "Hardware": intfHW}
      if (intfUUID == "00000000-0000-0000-0000-000000000000"){
        availablesources.push(source)
      }
    }
  }).fail(function(res){
    console.log("It failed!")
  }).always(function(res){
    //Parse available sources and add to UI:
    for (var x in availablesources){
      if (availablesources[x]['Type'] == "linuxwifi"){
        var icon = '<i class="fas fa-wifi"></i>'
      } else if (availablesources[x]['Type'] == "linuxbluetooth"){
          var icon = '<i class="fab fa-bluetooth"></i>'
      }

      var domel = '<fieldset id="'+availablesources[x]['Name']+'" class="datasource" active="False"><legend>'+icon+" "+availablesources[x]['Name']+'</legend><div id="startintf'+availablesources[x]['Name']+'" intfname="'+availablesources[x]['Name']+'" intftype="'+availablesources[x]['Type']+'" class="controlbutton"><i class="fas fa-play"></i></div><div class="dsinfo"><ul><li>'+availablesources[x]['Hardware']+'</li><li>'+availablesources[x]['Description']+'</li><li>'+availablesources[x]['UUID']+'</li></ul></div></fieldset>'
      if ( $('#'+availablesources[x]['Name']).length == 0 ){
        $('#opt2win-content').append(domel)
        $('#startintf'+availablesources[x]['Name']).on("click", function(event){
          startSource(event)
        })

        $('#pauseintf'+availablesources[x]['Name']).on("click", function(event){
          pauseSource(event)
        })

        $('#stopintf'+availablesources[x]['Name']).on("click", function(event){
          stopSource(event)
        })
      } else {
        $('#'+availablesources[x]['Name']).replaceWith(domel)
        $('#startintf'+availablesources[x]['Name']).on("click", function(event){
          startSource(event)
        })

        $('#pauseintf'+availablesources[x]['Name']).on("click", function(event){
          pauseSource(event)
        })

        $('#stopintf'+availablesources[x]['Name']).on("click", function(event){
          stopSource(event)
        })

      }
    }
  })
}

function getActiveSources(){
  var activesources = []
  $.getJSON('/datasource/all_sources.json').done(function(sources){
    for (var x in sources){
      var intfDriver = sources[x]['kismet.datasource.type_driver']
      var intfDriverType = intfDriver['kismet.datasource.driver.type']
      var intfDriverDesc = intfDriver['kismet.datasource.driver.description']
      var intfDriverProbeCap = intfDriver['kismet.datasource.driver.probe_capable']
      var intfDriverProbeIPC = intfDriver['kismet.datasource.driver.probe_ipc']
      var intfDriverListCap = intfDriver['kismet.datasource.driver.list_capable']
      var intfDriverListIPC = intfDriver['kismet.datasource.driver.list_ipc']
      var intfDriverLocalCap = intfDriver['kismet.datasource.driver.local_capable']
      var intfDriverLocalIPC = intfDriver['kismet.datasource.driver.local_ipc']
      var intfDriverRemoteCap = intfDriver['kismet.datasource.driver.remote_capable']
      var intfDriverPassiveCap = intfDriver['kismet.datasource.driver.passive_capable']
      var intfDriverTunCap = intfDriver['kismet.datasource.driver.tuning_capable']
      ///////////////////////////////////////////////////////////////////////////////
      var activeSrcnumber = sources[x]['kismet.datasource.source_number']
      var activeSrckey = sources[x]['kismet.datasource.source_key']
      var activeSrcpaused = sources[x]['kismet.datasource.paused']
      var activeSrcIPCbin = sources[x]['kismet.datasource.ipc_binary']
      var activeSrcIPCpid = sources[x]['kismet.datasource.ipc_pid']
      var activeSrcRunning = sources[x]['kismet.datasource.running']
      var activeSrcremote = sources[x]['kismet.datasource.remote']
      var activeSrcpassive = sources[x]['kismet.datasource.passive']
      var activeSrcname = sources[x]['kismet.datasource.name']
      var activeSrcuuid = sources[x]['kismet.datasource.uuid']
      var activeSrcdef = sources[x]['kismet.datasource.definition']
      var activeSrcintf = sources[x]['kismet.datasource.interface']
      var activeSrccapintf = sources[x]['kismet.datasource.capture_interface']
      var activeSrchw = sources[x]['kismet.datasource.hardware']
      var activeSrcdlt = sources[x]['kismet.datasource.dlt']
      var activeSrcwarning = sources[x]['kismet.datasource.warning']
      var activeSrcchannels = sources[x]['kismet.datasource.channels'] //array
      var activeSrchopping = sources[x]['kismet.datasource.hopping']
      var activeSrcchannel = sources[x]['kismet.datasource.channel']
      var activeSrchoprate = sources[x]['kismet.datasource.hop_rate']
      var activeSrchopchan = sources[x]['kismet.datasource.hop_channels'] //array
      var activeSrchopsplit = sources[x]['kismet.datasource.hop_split']
      var activeSrchopoffset = sources[x]['kismet.datasource.hop_offset']
      var activeSrchopshuff = sources[x]['kismet.datasource.hop_shuffle']
      var activeSrchopshuffskip = sources[x]['kismet.datasource.hop_shuffle_skip']
      var activeSrcerror = sources[x]['kismet.datasource.error']
      var activeSrcerrreason = sources[x]['kismet.datasource.error_reason']
      var activeSrcpkts = sources[x]['kismet.datasource.num_packets']
      var activeSrcpktserror = sources[x]['kismet.datasource.num_error_packets']
      var activeSrcpktsrrd = sources[x]['kismet.datasource.packets_rrd'] //array
      var activeSrcretry = sources[x]['kismet.datasource.retry']
      var activeSrcretryatt = sources[x]['kismet.datasource.retry_attempts']
      var activeSrctotalretry = sources[x]['kismet.datasource.total_retry_attempts']
      var activeSrcanttype = sources[x]['kismet.datasource.info.antenna_type']
      var activeSrcantgain = sources[x]['kismet.datasource.info.antenna_gain']
      var activeSrcantorientation = sources[x]['kismet.datasource.info.antenna_orientation']
      var activeSrcantwidth = sources[x]['kismet.datasource.info.antenna_beamwidth']
      var activeSrcamptype = sources[x]['kismet.datasource.info.amp_type']
      var activeSrcampgain = sources[x]['kismet.datasource.info.amp_gain']
      source = {"Name": activeSrcname, "Type": intfDriverType, "Description": intfDriverDesc, "UUID": activeSrcuuid, "Hardware": activeSrchw, "Channels": activeSrcchannels, "Hop Pattern": activeSrchopchan, "Paused": activeSrcpaused, "Error": activeSrcerror, "Reason": activeSrcerrreason}
      activesources.push(source)
    }
  }).always(function(res){
    //Parse the active sources and add them to the UI:
    for ( var y in activesources ){
      var name = activesources[y]['Name']
      var type = activesources[y]['Type']
      var description = activesources[y]['Description']
      var uuid = activesources[y]['UUID']
      var hardware = activesources[y]['Hardware']
      var channels = activesources[y]['Channels']
      var hopset = activesources[y]['Hop Pattern']
      var paused = activesources[y]['Paused']
      var error = activesources[y]['Error']
      var reason = activesources[y]['Reason']

      if (paused == 0){
        var pbutton = '<i class="fas fa-pause"></i>'
      } else {
        var pbutton = '<i class="fas fa-pause"></i>'
      }

      if (type == "linuxwifi"){
        var icon = '<i class="fas fa-wifi"></i>'
        var domel = '<fieldset id="'+name+'" class="datasource" active="True"><legend>'+icon+" "+name+'</legend><div id="pauseintf'+name+'" intfuuid="'+uuid+'" intfname="'+name+'" intftype="'+type+'" class="controlbutton">'+pbutton+'</div><div id="intferror'+name+'" class="intferror"><i class="fas fa-exclamation-triangle" style=></i></div><fieldset id="quickopts'+name+'"><legend>Quick Options</legend><div id="quickall'+uuid+'" class="quickopts" uuid="'+uuid+'">All</div><div id="quick2400'+uuid+'" class="quickopts" uuid="'+uuid+'">2.4GHz</div><div id="quick5000'+uuid+'" class="quickopts" uuid="'+uuid+'">5GHz</div></fieldset><div id="'+uuid+'channels" class="channels"></div></fieldset>'
      } else if (type == "linuxbluetooth"){
        var icon = '<i class="fab fa-bluetooth"></i>'
        var domel = '<fieldset id="'+name+'" class="datasource" active="True"><legend>'+icon+" "+name+'</legend><div id="pauseintf'+name+'" intfuuid="'+uuid+'" intfname="'+name+'" intftype="'+type+'" class="controlbutton">'+pbutton+'</div><div id="intferror'+name+'" class="intferror"><i class="fas fa-exclamation-triangle" style=></i></div></fieldset>'
      }


      if ( $('#'+name).length == 0 ){
        $('#opt2win-content').append(domel)
        var userchans = ""
        formatChannels(channels, hopset, uuid);
        $('#startintf'+name).on("click", function(event){
          startSource(event)
        })

        $('#pauseintf'+name).on("click", function(event){
          pauseSource(event)
        })

        $('#stopintf'+name).on("click", function(event){
          stopSource(event)
        })

        $('#quickall'+uuid).on("click", function(event){
          quickall(event)
        })

        $('#quick2400'+uuid).on("click", function(event){
          quick2400(event)
        })

        $('#quick5000'+uuid).on("click", function(event){
          quick5000(event)
        })

      } else if ($('#'+name).attr('active') == "False"){
        $('#'+name).replaceWith(domel)
        formatChannels(channels, hopset, uuid);
        $('#startintf'+name).on("click", function(event){
          startSource(event)
        })

        $('#pauseintf'+name).on("click", function(event){
          pauseSource(event)
        })

        $('#stopintf'+name).on("click", function(event){
          stopSource(event)
        })

        $('#quickall'+uuid).on("click", function(event){
          quickall(event)
        })

        $('#quick2400'+uuid).on("click", function(event){
          quick2400(event)
        })

        $('#quick5000'+uuid).on("click", function(event){
          quick5000(event)
        })

      } else {

        updateHops(uuid, hopset)

        if (error != "0"){
          $('#intferror'+name).css({'color': 'red'})
        } else {
          $('#intferror'+name).css({'color': 'black'})
        }
      }
    }
  })
}

function quickall(event){
  var chans = []
  var uuid = event.target.id.split('quickall')[1]
  $('#'+event.target.id).addClass('quickopts-clicked')
  console.log("All for uuid: "+uuid+" was clicked.")
  $('.chan').each(function(){
    if ( $(this).attr('uuid')== uuid){
      chans.push($(this).text())
    }
  })

  var jscmd = {
    "cmd": "hop",
    "channels": chans,
    "uuid": uuid
  };

  var postdata = "json=" + encodeURIComponent(JSON.stringify(jscmd));
  $.post("/datasource/by-uuid/"+uuid+"/set_channel.cmd", postdata, "json").always(function(){
    console.log("Channel set: succeed")
    $('#'+event.target.id).removeClass('quickopts-clicked')
  }).fail(function(){
    console.log("Channel set: fail")
    $('#'+event.target.id).removeClass('quickopts-clicked')
  })
}

function quick2400(event){
  var allchans = []
  var chans = []
  var uuid = event.target.id.split('quick2400')[1]
  $('#'+event.target.id).addClass('quickopts-clicked')
  $('.chan').each(function(){
    if ( $(this).attr('uuid') == uuid ){
      allchans.push({"CHAN": $(this).text(),"BAND": $(this).attr('band')})
    }
  })

  for (var x in allchans){
    if (allchans[x]['BAND'] == "24"){
      chans.push(allchans[x]['CHAN'])
    }
  }

  var jscmd = {
    "cmd": "hop",
    "channels": chans,
    "uuid": uuid
  };

  var postdata = "json=" + encodeURIComponent(JSON.stringify(jscmd));
  $.post("/datasource/by-uuid/"+uuid+"/set_channel.cmd", postdata, "json").always(function(){
    console.log("Channel set: succeed")
    $('#'+event.target.id).removeClass('quickopts-clicked')
  }).fail(function(){
    console.log("Channel set: fail")
    $('#'+event.target.id).removeClass('quickopts-clicked')
  })

}

function quick5000(event){
  var allchans = []
  var chans = []
  var uuid = event.target.id.split('quick5000')[1]
  $('#'+event.target.id).addClass('quickopts-clicked')
  $('.chan').each(function(){
    if ( $(this).attr('uuid') == uuid ){
      allchans.push({"CHAN": $(this).text(),"BAND": $(this).attr('band')})
    }
  })

  for (var x in allchans){
    if (allchans[x]['BAND'] == "5"){
      chans.push(allchans[x]['CHAN'])
    }
  }

  var jscmd = {
    "cmd": "hop",
    "channels": chans,
    "uuid": uuid
  };

  var postdata = "json=" + encodeURIComponent(JSON.stringify(jscmd));
  $.post("/datasource/by-uuid/"+uuid+"/set_channel.cmd", postdata, "json").always(function(){
    console.log("Channel set: succeed")
    $('#'+event.target.id).removeClass('quickopts-clicked')
  }).fail(function(){
    console.log("Channel set: fail")
    $('#'+event.target.id).removeClass('quickopts-clicked')
  })
}

function startSource(event){
  var intfname = $(event.target).attr('intfname')
  var intftype= $(event.target).attr('intftype')
  $(event.target).addClass("controlbutton-clicked")

  var jscmd = {
    "definition": intfname + ':type=' + intftype
    };

  var postdata = "json=" + encodeURIComponent(JSON.stringify(jscmd));
    $.post("/datasource/add_source.cmd", postdata, "json")
      .always(function() {
      });
}

function pauseSource(event){
  var uuid = $(event.target).attr('intfuuid')
  if ( $(event.target).hasClass('controlbutton-clicked')){
    console.log("attempting to resume "+uuid)
    $.get("/datasource/by-uuid/"+uuid+"/resume_source.cmd")
      .done(function(){
        console.log("Interface "+uuid+" should have resumed...")
        $(event.target).removeClass("controlbutton-clicked")
      })
      .fail(function(){

      })
      .always(function(){

      })
  } else {
    console.log("attempting to pause "+uuid)
    $.get("/datasource/by-uuid/"+uuid+"/pause_source.cmd")
    .done(function(){
      console.log("interface "+uuid+" should be paused...")
      $(event.target).addClass("controlbutton-clicked")
  }).fail(function(){
    console.log("Post failed for some reason")
  })
    .always(function(){

  })
  }
  
}

function formatChannels(channels, hopset, uuid){
  var chandiv = '#'+uuid+"channels"

  $(chandiv).append('<fieldset id="2400'+uuid+'"><legend>2.4GHz</legend></fieldset>')
  $(chandiv).append('<fieldset id="5000'+uuid+'"><legend>5GHz</legend></fieldset>')
  for (var x in channels){
    var chanwide = ""
    var channarrow = ""
    var chan = channels[x]
    if (chan.split('H').length > 1){
      chanwide = chan
    } else {
      channorm = chan
    }

    if (chanwide != ""){
      if (chanwide.split('V').length > 1){
        var chanwidenum = chanwide.split('V')[0]
      } else {
        var chanwidenum = chanwide.split('H')[0]
      }
      if (chanwidenum <= 14){
        $('#2400'+uuid).append('<div id="'+uuid+'divchan'+chanwide.replace("+","P")+'" class="chan " band="24" uuid="'+uuid+'">'+chanwide+'</div>')
        $('#'+uuid+'divchan'+chanwide.replace("+","P")).on("click", function(event){
          chanClick(event)
        })
      } else if (chanwidenum > 14){
        $('#5000'+uuid).append('<div id="'+uuid+'divchan'+chanwide.replace("+","P")+'" class="chan " band="5" uuid="'+uuid+'">'+chanwide+'</div>')
        $('#'+uuid+'divchan'+chanwide.replace("+","P")).on("click", function(event){
          chanClick(event)
        })
      }
    } else if (channorm != ""){
      if (channorm <= 14){
        $('#2400'+uuid).append('<div id="'+uuid+'divchan'+channorm+'" class="chan " band="24" uuid="'+uuid+'">'+channorm+'</div>')
        $('#'+uuid+'divchan'+channorm).on("click", function(event){
          chanClick(event)
        })
      } else if (channorm > 14){
        $('#5000'+uuid).append('<div id="'+uuid+'divchan'+channorm+'" class="chan " band="5" uuid="'+uuid+'">'+channorm+'</div>')
        $('#'+uuid+'divchan'+channorm).on("click", function(event){
          chanClick(event)
        })
      }
    }
  }
}

function updateHops(uuid, hopset){
  $('.chan').each(function(){
    if ( $(this).attr('uuid') == uuid){
      $(this).removeClass('syschan-active')
    }
  })

  for (var x in hopset){
    var channum = hopset[x].replace("+", "P")
    $('.chan').each(function(){
      if ( $(this).attr('id') == uuid+'divchan'+channum){
        $(this).addClass('syschan-active')
      }
    })
  }

}

function chanClick(event){
  clearTimeout(asTimer)
  clearTimeout(setTimer)
  var uuid = event.target.id.split('chandiv')[0]
  var elid = event.target.id
  console.log(elid+" was clicked")
  if ($('#'+elid).hasClass('userchan-active')){
    $('#'+elid).removeClass('userchan-active');
  } else {
    $('#'+elid).addClass('userchan-active')
  }
  setTimer = setInterval(setChannels, 1000)
  asTimer = setInterval(getActiveSources, 2000)

}

function setChannels(){
  var chans = []
  var uuid = ""
  $('.chan').each(function(){
    if ( $(this).hasClass('userchan-active') ){
      uuid = $(this).attr('uuid')
      var chan = $(this).attr('id').split('divchan')[1].replace('P', '+')
      chans.push(chan)
      $(this).removeClass('userchan-active')
    }
  })

  if (chans.length > 0){
    console.log("New channels to add!")
    var jscmd = {
      "cmd": "hop",
      "channels": chans,
      "uuid": uuid
    };

    var postdata = "json=" + encodeURIComponent(JSON.stringify(jscmd));
    $.post("/datasource/by-uuid/"+uuid+"/set_channel.cmd", postdata, "json").always(function(){
      console.log("Channel set: succeed")
    }).fail(function(){
      console.log("Channel set: fail")
    })

  } else {
    console.log("No change to channels")
  }
}