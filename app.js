/*jshint esversion: 6 */
const express = require('express');
const _ = require('lodash');
const request = require("request-promise");
var promise = require("bluebird");
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

const companyNames = [];
const userUrls = [];

/*Initial API call for this  App server*/
app.get("/", (req, res) => {
  var options = {
    url: "https://api.github.com/repos/cla-assistant/cla-assistant/contributors",
    method: 'GET',
    headers: {
      'Authorization': 'token 46f35655b88258afe7ecc6ea6feef807e031717b',
      'user-agent': 'AkshayApp'
    }
  };

  /* first external API call from this App server for getting all the contributors details */
  request(options).then(function(response) {
    const responseArr = JSON.parse(response);
  /*for getting all the users  profile urls from the response and storing them in an array (userUrls) with header information*/
    getUsersUrl(responseArr);
  }).catch(function(err) {
    console.log("The API call to get all the contributors failed ", err);
  }).then(function() {
    promise.map(userUrls, function(options) {
      return request(options).then(function(response) { // external API Calls using promise for fetching company names of all the contributors
        const responseObj = JSON.parse(response);
  /*for getting  all the company names from response  and storing them  in an Array (companyNames) */
        getCompanyNames(responseObj);
      });
    }).catch(function(err) {
      console.log("The API call  to get the company name of the contributor  failed ", err);
    }).then(function() {
  /*for counting the number of contributors in each company and sorting based on most contributors at the top*/
      const sortedCompanyInfo = getSortedCompanyList(companyNames);

  /* the final response (output) which is a list with company names  and number of contributors and sorted  with most number  of contributors
   on the top  will be displayed in the JSON format */
      res.send(JSON.stringify(sortedCompanyInfo));
    });

  });


});

function getUsersUrl(responseArr) {
  responseArr.forEach((item, index, array) => {
    const urlObj = {
      url: item.url,
      method: 'GET',
      headers: {
        'Authorization': 'token 46f35655b88258afe7ecc6ea6feef807e031717b',
        'user-agent': 'AkshayApp'
      }
    };
    userUrls.push(urlObj);
  });

  return userUrls;
}

function getCompanyNames(responseObj) {
  if (responseObj.company === null) {
    responseObj.company = "Unknown";
  }
  companyNames.push(responseObj);
}

function getSortedCompanyList(companyNames) {
  /*for counting the frequency / occurrences of  companyNames array elements and returns a single
   object with  company names(keys)  and their  respective number of occurrences(values)*/
  var companyInfo = _.countBy(companyNames, 'company');
  /* for  sorting the result of _.countBy (companyInfo) in descending order and storing in an array (sortedCompanyInfo)*/
  var sortedCompanyInfo = _.chain(companyInfo). //
  map(function(currentValue, index) {
      return {
        company: index,
        contributors: currentValue
      }
    }).sortBy('contributors')
    .reverse()
    .value();
  return sortedCompanyInfo;

}
