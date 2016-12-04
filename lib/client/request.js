module.exports = function request(u, f) {

  const url = u;
  const func = f;

  let httpRequest;    

  makeRequest(url, func);

  
  function makeRequest(url, func) {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      return false;
    }
    httpRequest.onreadystatechange = _.partial(func, httpRequest);
    httpRequest.open('GET', url);
    httpRequest.send();
  }

}