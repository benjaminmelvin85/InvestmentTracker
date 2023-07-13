public class CustomController {
    public String parameter { get; set; }
    public List<stockStories> results { get; set; }

    public class stockStories {
        public String url { get; set; }
        public String title { get; set; }
        public String description { get; set; }
        // public String getHyperlink() {
        //     return '<a href="' + url + '" target="_blank">' + title + '</a>';
        // }
    }

    public CustomController() {
        results = new List<stockStories>();
    }

    public void loadWebsite() {
        String apiKey;
        HttpRequest request = new HttpRequest();
        request.setEndPoint('https://api.marketaux.com/v1/news/all?symbols='+ parameter +'&filter_entities=true&language=en&api_token=' + apiKey);
        request.setMethod('GET');
        request.setHeader('Authorization', apiKey);
        Http h = new Http();
        HttpResponse response = h.send(request);
        Map<String, Object> deserialized = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        List<Object> dataList = (List<Object>) deserialized.get('data');
        if (dataList != null && dataList.size() >= 3) {
            Map<String, Object> List1 = (Map<String, Object>) dataList[0];
            Map<String, Object> List2 = (Map<String, Object>) dataList[1];
            Map<String, Object> List3 = (Map<String, Object>) dataList[2];

            results = new List<stockStories>();
            results.add(createStockStory(List1));
            results.add(createStockStory(List2));
            results.add(createStockStory(List3));
        }
        system.debug(results);
    }

    private stockStories createStockStory(Map<String, Object> listMap) {
        stockStories story = new stockStories();
        if (listMap != null) {
            story.url = (String) listMap.get('url');
            story.title = (String) listMap.get('title');
            story.description = (String) listMap.get('description');
        }
        system.debug(listMap.get('url'));
        system.debug(story);
        return story;
    }
}