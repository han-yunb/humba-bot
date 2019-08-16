var express = require('express');
var router = express.Router();
var request = require('request');
const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;

var eplTeams = ["https://www.transfermarkt.co.uk/manchester-city/startseite/verein/281/saison_id/2019",
    "https://www.transfermarkt.co.uk/fc-liverpool/startseite/verein/31/saison_id/2019",
    "https://www.transfermarkt.co.uk/tottenham-hotspur/startseite/verein/148/saison_id/2019",
    "https://www.transfermarkt.co.uk/fc-chelsea/startseite/verein/631/saison_id/2019",
    "https://www.transfermarkt.co.uk/manchester-united/startseite/verein/985/saison_id/2019",
    "https://www.transfermarkt.co.uk/fc-arsenal/startseite/verein/11/saison_id/2019",
    "https://www.transfermarkt.co.uk/fc-everton/startseite/verein/29/saison_id/2019",
    "https://www.transfermarkt.co.uk/leicester-city/startseite/verein/1003/saison_id/2019",
    "https://www.transfermarkt.co.uk/west-ham-united/startseite/verein/379/saison_id/2019",
    "https://www.transfermarkt.co.uk/afc-bournemouth/startseite/verein/989/saison_id/2019",
    "https://www.transfermarkt.co.uk/wolverhampton-wanderers/startseite/verein/543/saison_id/2019",
    "https://www.transfermarkt.co.uk/fc-southampton/startseite/verein/180/saison_id/2019",
    "https://www.transfermarkt.co.uk/fc-watford/startseite/verein/1010/saison_id/2019",
    "https://www.transfermarkt.co.uk/newcastle-united/startseite/verein/762/saison_id/2019",
    "https://www.transfermarkt.co.uk/crystal-palace/startseite/verein/873/saison_id/2019",
    "https://www.transfermarkt.co.uk/brighton-amp-hove-albion/startseite/verein/1237/saison_id/2019",
    "https://www.transfermarkt.co.uk/fc-burnley/startseite/verein/1132/saison_id/2019",
    "https://www.transfermarkt.co.uk/aston-villa/startseite/verein/405/saison_id/2019",
    "https://www.transfermarkt.co.uk/norwich-city/startseite/verein/1123/saison_id/2019",
    "https://www.transfermarkt.co.uk/sheffield-united/startseite/verein/350/saison_id/2019"
];

// REST API
/* GET home page. */
router.get('/', function (req, res, next) {
    const promises = [];
    const subPromises = [];

    var size = eplTeams.length;
    // Parsing from transfermarktz.com
    // for (var i = 0; i < size; i++) {
    promises.push(new Promise(function (resolve, reject) {
        let playerList = [];
        var page = eplTeams[0];
        const getHtml = async () => {
            try {
                return await axios.get(page);
            } catch (error) {
                console.error(error);
            }
        };

        getHtml()
            .then(html => {
                const $ = cheerio.load(html.data);
                const teamName = $('div.dataMain').eq(0).find('div.dataName').find('span').text();
                console.log("\x1b[36m", teamName + " parsing...");
                var baseUrl = "https://www.transfermarkt.co.uk";
                const $trList = $('div.responsive-table').find('tr.odd, tr.even');

                $trList.each(function (i, elem) {
                    // console.log(elem);
                    playerList[i] = {
                        name: $(this).find('a.spielprofil_tooltip').attr('title'),
                        url: baseUrl + $(this).find('a.spielprofil_tooltip').eq(0).attr('href'),
                        number: $(this).find('td.zentriert').children('div.rn_nummer').text(),
                        birth: $(this).children('td.zentriert').eq(1).html(),
                        nation: $(this).find('td.zentriert').eq(2).children('img').attr('title'),
                        position: $(this).find('td.posrela').eq(0).find('tr').eq(1).children('td').text(),
                        value: ($(this).find('td.hauptlink').text()).split('£')[1],
                        height: '',
                        foot: '',
                    };

                    subPromises.push(new Promise(function (resolve, reject) {
                        const getHtml = async () => {
                            try {
                                return await axios.get(playerList[i].url);
                            } catch (error) {
                                console.error(error);
                            }
                        };
                        getHtml()
                            .then(html => {
                                var d = new Date();
                                console.log('[' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ']' + playerList[i].name + ' parsing...');
                                const $ = cheerio.load(html.data);
                                const tr = $('div.spielerdaten').children('table.auflistung').find('tr');
                                var height = '';
                                var foot = '';
                                if (tr.eq(4).children('th').text() == 'Height:') {
                                    height = tr.eq(4).children('td').text();
                                    if (tr.eq(7).children('th').text() == 'Foot:') {
                                        foot = tr.eq(7).children('td').text();
                                    }
                                } else {
                                    height = tr.eq(3).children('td').text();
                                    if (tr.eq(6).children('th').text() == 'Foot:') {
                                        foot = tr.eq(6).children('td').text();
                                    }
                                }
                                // console.log("height" + height + ", foot: " + foot);
                                playerList[i].height = height;
                                playerList[i].foot = foot;
                                // return data;
                            });
                    }));
                });

                setTimeout(function () {
                    var data = new Object();
                    data.team = teamName;
                    data.player = playerList;
                    // const data = playerList.filter(n => n.name);
                    console.log(teamName + " parsing complete!");
                    resolve(data);
                }, 20000);
            });
    }));
    // }

    Promise.all(promises).then(function (values) {
        res.json(values);
    });

});

router.get('/specific', function (req, res, next) {
    var playerList = [];
    for (var i = 0; i < playerList.length; i++) {
        var page = playerList[i].url;
        const getHtml = async () => {
            try {
                return await axios.get(page);
            } catch (error) {
                console.error(error);
            }
        };

        getHtml()
            .then(html => {
                console.log(playerList[i].name + ' specific parsing...');
                const $ = cheerio.load(html.data);
                const tr = $('div.spielerdaten').children('table.auflistung').find('tr');
                var height = '';
                var foot = '';
                if (tr.eq(4).children('th').text() == 'Height:') {
                    height = tr.eq(4).children('td').text();
                    foot = tr.eq(7).children('td').text();
                } else {
                    height = tr.eq(3).children('td').text();
                    foot = tr.eq(6).children('td').text();
                }
                // console.log("height" + height + ", foot: " + foot);
                playerList[i].height = height;
                playerList[i].foot = foot;
                // return data;
            })
            .then(res => res_index.json(res));
    }
});

// Get Team Ranking API
router.get('/team_rank', function (req, res, next) {

});

// Get Player Ranking API
router.get('/player_rank', function (req, res, next) {

});

// Get Schedule API
router.get('/schedule', function (req, res, next) {

});

// Get Formation API
router.get('/formation', function (req, res, next) {

});

// Get Team Information API
router.get('/team', function (req, res, next) {

});

// Get Player Information API
router.get('/player', function (req, res, next) {

});

// Get TOTW API
router.get('/totw', function (req, res, next) {

});

// Get MOTM API
router.get('/motm', function (req, res, next) {

});

module.exports = router;