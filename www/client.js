reloadWecker();

var weckers = [];

function reloadWecker() {

    $.ajax({
        url: 'wecker/',
        type: 'GET',
        success: function (data) {
            weckers = JSON.parse(data);
            $('#weckerList').empty();
            weckers.forEach(function (element) {
                $('#weckerList').append(
                        '<tr>' +
                        '<td>' + element.name + '</td>' +
                        '<td>' + element.action + '</td>' +
                        '<td>' + element.hour + '</td>' +
                        '<td>' + element.minute + '</td>' +
                        '<td>' + element.dayOfWeek + '</td>' +

                        '<td><button onclick="deleteWecker(\'' + element.name + '\')">Löschen</button></td>' +
                        '<td><button onclick="changeWecker(\'' + element.name + '\')">Ändern</button></td>' +

                        '</tr>'
                )
            })
        },
        error: function (err) {
            alert(err);
        }
    });
}

function changeWecker(name) {
    var theOne;
    weckers.forEach(function (wecker) {
        if (wecker.name === name)
            theOne = wecker;
    });

    $('#weckerName').val(theOne.name);
    $('#weckerCmd').val(theOne.action);
    $('#weckerH').val(theOne.hour);
    $('#weckerM').val(theOne.minute);

    $('input').prop('checked', false);

    theOne.dayOfWeek.forEach(function (day) {
       $('input[value="'+day+'"]').prop('checked', true);
    });

    //  dayOfWeek: daysOfWeek
}

function createWecker() {

    var daysOfWeek = [];

    $('#NW input:checked').each(function (index, element) {
        daysOfWeek.push(element.value);
    });

    var wecker = {
        name: $('#weckerName').val(),
        action: $('#weckerCmd').val(),
        recurring: true,
        hour: $('#weckerH').val(),
        minute: $('#weckerM').val(),
        dayOfWeek: daysOfWeek
    };

    $.ajax({
        url: 'wecker/' + wecker.name,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json', //response
        data: JSON.stringify(wecker),
        success: function (data) {
            reloadWecker();
        },
        error: function (err) {
            alert(err);
        }
    });
}


function deleteWecker(name) {

    $.ajax({
        url: 'wecker/' + name,
        type: 'DELETE',
        contentType: 'application/json',
        success: function (data) {
            reloadWecker();
        },
        error: function () {

        }
    });
}

function sendIR() {

    $.ajax({
        url: 'infra/' + $('#IR input').val()
    })
}