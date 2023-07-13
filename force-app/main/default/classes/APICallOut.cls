public class APICallOut {

    @future(callout = true)
    public static void makeApiRequest() { // we will want to add a String Parameter to make dynamic
    String apiKey = '2';
    String paramater = 'AAPL';

    HttpRequest request = new HttpRequest();
    request.setEndPoint('https://realstonks.p.rapidapi.com/' + paramater);
    request.setMethod('GET');
    request.setHeader('X-RapidAPI-key', apiKey);
    Http h = new Http();
    HttpResponse response = h.send(request);
    system.debug(response);
        system.debug(response.getStatusCode());
        system.debug(response.getStatus());
        system.debug(response.getBody());
        system.debug(response);
        Map<String, Object> deserialized = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
        
        system.debug(deserialized.get('price'));
    // We will want to take the price field and map it too our investment holding // when bought that price will be commited to database
    // When stock is sold we will need to call api again to get the current price
    }
}