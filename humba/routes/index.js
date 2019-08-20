var express = require('express');
var router = express.Router();
var request = require('request');
const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;

var eplTeams = ["https://www.transfermarkt.co.uk/manchester-city/kader/verein/281/saison_id/2019/plus/1", ];

var eplPlayers = ["https://www.transfermarkt.co.uk/manchester-city/leistungsdaten/verein/281/reldata/GB1%262019/plus/1", ];

var eplTeamColors = ["\x1b[36m", ];

// REST API
/* GET home page. */
router.get('/', function (req, res, next) {
    const promises = [];
    const subPromises = [];

    // Parsing from transfermarktz.com
    promises.push(new Promise(function (resolve, reject) {
        let playerList = [];
        const getHtml = async () => {
            try {
                return await axios.get(eplTeams[0]);
            } catch (error) {
                console.error(error);
            }
        };

        getHtml()
            .then(html => {
                const $ = cheerio.load(html.data);
                const teamName = $('div.dataMain').eq(0).find('div.dataName').find('span').text();
                console.log(eplTeamColors[0], teamName + " parsing...");
                const $trList = $('div.responsive-table').find('tr.odd, tr.even');

                $trList.each(function (i, elem) {
                    // console.log(elem);
                    playerList[i] = {
                        name: $(this).find('a.spielprofil_tooltip').eq(0).text(),
                        position: $(this).find('td.posrela').eq(0).find('tr').eq(1).children('td').text(),
                        number: $(this).find('div.rn_nummer').text(),
                        birth: $(this).children('td.zentriert').eq(1).html(),
                        nation: $(this).find('td.zentriert').eq(2).children('img').attr('title'),
                        height: $(this).find('td.zentriert').eq(3).text(),
                        foot: $(this).find('td.zentriert').eq(4).text(),
                        value: ($(this).find('td.hauptlink').text()).split('£')[1],
                        appearances: '',
                        goals: '',
                        assists: '',
                        yellows: '',
                        double_yellows: '',
                        reds: '',
                        minutes: '',
                    };
                });

                promises.push(new Promise(function (resolve, reject) {
                    const getHtml = async () => {
                        try {
                            return await axios.get(eplPlayers[0]);
                        } catch (error) {
                            console.error(error);
                        }
                    };
                    getHtml()
                        .then(html => {
                            var $ = cheerio.load(html.data);
                            const $trListStat = $('div.responsive-table').find('tr.odd, tr.even');
                            $trListStat.each(function (j, elem) {
                                var playerName = $(this).find('a.spielprofil_tooltip').eq(0).text();
                                console.log(playerName + ' parsing...');
                                for (var k = 0; k < playerList.length; k++) {
                                    if (playerList[k].name == playerName) {
                                        const playerStat = $trListStat.eq(j);
                                        playerList[k].appearances = playerStat.find('td.zentriert').eq(4).text();
                                        playerList[k].goals = playerStat.find('td.zentriert').eq(5).text();
                                        playerList[k].assists = playerStat.find('td.zentriert').eq(6).text();
                                        playerList[k].yellows = playerStat.find('td.zentriert').eq(7).text();
                                        playerList[k].double_yellows = playerStat.find('td.zentriert').eq(8).text();
                                        playerList[k].reds = playerStat.find('td.zentriert').eq(9).text();
                                        playerList[k].minutes = playerStat.find('td.rechts').eq(0).text();
                                        break;
                                    }
                                }
                            });
                        });
                }));

                setTimeout(function () {
                    var data = new Object();
                    data.team = teamName;
                    data.player = playerList;
                    // const data = playerList.filter(n => n.name);
                    console.log(teamName + " parsing complete!");
                    resolve(data);
                }, 15000);
            });
    }));
    // }

    Promise.all(promises).then(function (values) {
        res.json(values);
    });
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