# companies-contributed-cla-assistant

Developed an API in `node js`  for getting  all the companies who contributed to `CLA assistant` open-source project including  number of contributors for each company. This node Application will run on a `express server` which will in turn call the external APIs of the GitHub using `request-promise` which is a simplified HTTP request' with promise support.  By default HTTP response codes other than 2XX will cause the promise to be rejected.  

The first external API call to https://api.github.com/repos/cla-assistant/cla-assistant/contributors which is a GitHub public API,  is for  fetching  all the contributors from  the CLA assistant. Since the Github rest API to return multiple items will be paginated to 30 items per page  by default, Hence I have used `octokit.paginate` from `octokit` module  to get the response from all the pages, not only from  the first page and the response  which will be a list of all the contributors. 

After fetching  all the users profile  endpoints from the response of  first API call,   there is  subsequent API calls to all the user profile endpoints  to get   the company information  for each contributor by grouping it by  promises using `Promise.map`  provided by the `bluebird` module .  Promise.map helps in achieving `concurrency`, Hence all the  GET requests  to fetch  the company information  from  each user profile endpoint is concurrent . and finally, if all the API calls succeeded then the promise will resolve and even if one API  call is failed then the promise won't be resolved and rejected. 

After getting the company details for each contributor, the response (output ) will be a list in `JSON format`  with company name and number of contributors for that respective company. This list also includes an entry for the case where the contributor has not entered any company information as `"Unknown"` and is sorted in such a way that company with most contributors is at the top...

The output in JSON format is as follows: 

```

[
{
"company": "Unknown",
"contributors": 14
},
{
"company": "@SAP",
"contributors": 2
},
{
"company": "Microsoft",
"contributors": 2
},
{
"company": "SAP",
"contributors": 2
},
{
"company": "Iconomi",
"contributors": 1
},
{
"company": "@heremaps",
"contributors": 1
},
{
"company": "@indexdata and @folio-org (and sometimes @cherryhill)",
"contributors": 1
},
{
"company": "@Microsoft",
"contributors": 1
},
{
"company": "UBC",
"contributors": 1
},
{
"company": "@Semmle ",
"contributors": 1
},
{
"company": "@dependabot ",
"contributors": 1
},
{
"company": "SendGrid, Inc.",
"contributors": 1
},
{
"company": "Oath",
"contributors": 1
},
{
"company": "SolvoLabs",
"contributors": 1
},
{
"company": "@JetBrains",
"contributors": 1
},
{
"company": "The Truth Is Out There",
"contributors": 1
},
{
"company": "ThoughtWorks, Inc.",
"contributors": 1
},
{
"company": "@nodejs @cdnjs @maintainers @gratipay",
"contributors": 1
},
{
"company": "Graylog Inc.",
"contributors": 1
},
{
"company": "@bloomberg",
"contributors": 1
},
{
"company": "SAP SE",
"contributors": 1
}
]
```
