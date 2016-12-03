module.exports = function queueStatus() {
  let httpRequest;
  const canvas = document.getElementById('cozmoStream');

  function makeRequest(url) {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      return false;
    }
    httpRequest.onreadystatechange = updateContent;
    httpRequest.open('GET', url);
    httpRequest.send();
  }

  function updateContent() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {

        if (!httpRequest.response) {
          return;
        }
        var response = JSON.parse(httpRequest.response);

        var text = '';
        if (response.minutesLeftInQueue === false) {
          text = 'up!';
        } else {
          text = 'in the queue. Approximately ' + response.minutesLeftInQueue + ' minutes left.';
        }

        document.getElementById('queueStatus').innerHTML = "You're " + text;
      }
    }
  }

  window.setInterval(() => { makeRequest('/queue/minutesleft') }, 3000);
};