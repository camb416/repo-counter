const request = require('request');
const ObjectsToCsv = require('objects-to-csv');
let configs = require('./config-local.json');


let repoList = [];
let recentRepoList = [];

getRepos(1);

function apiLink(){
    return "https://" + configs["username"] + ":" + configs["personal-access-token"] + "@api.github.com/";
}
function contribsLink(_repoName){
    return apiLink() +  "repos/"+ configs.organization + "/" + _repoName + "/stats/contributors"
}
function reposLink(_page){
    return apiLink() + "orgs/"+configs.organization + "/repos?page=" + _page;
}

function finishUp() {
    console.log(recentRepoList.length);
    recentRepoList.forEach((elem) => {
        getStats(elem);
    });
    (async () => {
        let csv = new ObjectsToCsv(repoList);

        // Save to file:
        await csv.toDisk('./repos.csv');

        // Return the CSV file as string:
        console.log(await csv.toString());
    })();

}

function getStats(_repo) {
    console.log(_repo.html_url);
    var statsLink = contribsLink(_repo.name);
    console.log(statsLink);

    request(statsLink, {
        json: true,

        headers: {
            'User-Agent': configs.username,
            'Time-Zone': configs.timezone
        }
    }, (err, res, body) => {
        if (err) return console.log(err);
        let commitCount = 0;
        body.forEach((c) => {
            commitCount += c.weeks[0].c;
        });
        console.log(statsLink + ", " + commitCount);

    });
}


function getRepos(_page) {
    let url =  reposLink(_page);

    request(url, {
        json: true,

        headers: {
            'User-Agent': configs.username,
            'Time-Zone': configs.timezone
        }

    }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }

        body.forEach(function (elem) {
            let usefulInfo = {
                updated_at: elem.updated_at,
                html_url: elem.html_url,
                name: elem.name,
                isPublic: !elem.private,
                isFork: elem.fork
            };
            repoList.push(usefulInfo);
            var elemDate = new Date(elem.updated_at);
            var currentDate = new Date();
            var aWeekAgo = new Date();


            aWeekAgo.setDate(currentDate.getDate() - 7);
            let aWeekAgo_str = aWeekAgo.toUTCString();
            if (elemDate > aWeekAgo) {
                console.log("RECENT: " + elem.updated_at);
                recentRepoList.push(elem);
            }

            // console.log(usefulInfo);
        });
        if (body.length != 0) {
            getRepos(_page + 1);
        } else {
            finishUp();
        }
        console.log("done with page " + _page);
    });


}

