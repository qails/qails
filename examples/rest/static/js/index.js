/* eslint-disable */
function fetch(url, type, data) {
  $.ajax({
    url: url,
    data: data,
    type: type,
    success: function(data, textStatus, jqXHR) {
      $('.header textarea').empty().text(jqXHR.getAllResponseHeaders());
      $('.body textarea').empty().text(JSON.stringify(data));
    }
  })
}

function fixUrl(url) {
  return url.replace(location.protocol + '//' + location.host, '');
}

$(document).ready(function() {
  $('#leftSide').on('click', 'a', function(event) {
    event.preventDefault();
    var url = this.href;
    var type = $(this).data('type') || 'GET';
    var data = $(this).data('data');
    fetch(url, type, data);

    // reset form
    $('#url').val(fixUrl(url));
    $('#verb').val(type);
    $('#data').val(JSON.stringify(data));
  });

  $('#send').click(function() {
    var url = $('#url').val();
    var type = $('#verb').val();
    var data = $('#data').val();
    fetch(url, type, data);
  });
});
