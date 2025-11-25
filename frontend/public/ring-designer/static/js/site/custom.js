var toolNames = {
    stylering    : "stylering",
    textring     : "textring",
    stylependant : "stylependant",
    textpendant  : "textpendant",
    embossedring : "embossedring"
};

// Here goes bootstrap activations
head.ready(function () {
    // For fancy tooltiping
    $('.shortcut-tooltip').tooltip();
	//Custom select
	$('select:not(.no-bs-select)').selectpicker();
    //$('.overlay-help').modal();
    $('.explanation-modal').modal({ show : false });

});

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //
//             This is window.poubelleLand                     //
//   Put here everything that do not belong anywhere special   //
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! //

window.resolveZipCode = function() {
    // check if it's not already resolved
    var zipcode = window.readCookie('zipcode');
    if( zipcode != null && zipcode != "" ) {
        return;
    }

    var extract_zipcode = function(data) {
        for(var i=0; i<data.results.length; i++) {
            var addr = data.results[i];

            for(var j=0; j<addr.address_components.length; j++) {
                addr_comp = addr.address_components[j];

                for(var k=0; k<addr_comp.types.length; k++) {
                    if( "postal_code" == addr_comp.types[k] ) {
                        return addr_comp.short_name;
                    }
                }
            }
        }
        return "";
    }

    $.ajax({
        type : 'GET',
        dataType: "json",
        crossDomain: true,
        url: "https://maps.googleapis.com/maps/api/geocode/json?sensor=true&latlng="+window.geo.citylatlong,
        success: function(data) {
            if( !data.results ) {
                console.log("geo failed");
                return;
            }
            zipcode = extract_zipcode(data);
            window.createCookie('zipcode',zipcode,2);
        },
    })
};

window.createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
};

window.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

window.eraseCookie = function(name) {
    createCookie(name, "", -1);
};

window.formatTextSize = function (size, tooltype) {
    switch (tooltype) {
        case toolNames.embossedring:
        case toolNames.stylering:
        case toolNames.textring:
            return window.gettext('taille : ') + size.toFixed(0) + "mm";
            break;
        case toolNames.stylependant:
            return ""; //gettext('échelle : ') + ' ' + size.toFixed(1);
        case toolNames.textpendant:
                return "";
            break;
        default:
            return "";
    }
};

$('.file-thumb').one("load", function() {
    window.imageManager.loadNormalThumb(this);
}).each( function() {
    if(this.complete) $(this).load();
});
