var express = require('express');
var router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

var eplTeams = ["https://www.transfermarkt.co.uk/manchester-city/kader/verein/281/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/liverpool-fc/kader/verein/31/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/tottenham-hotspur/kader/verein/148/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/chelsea-fc/kader/verein/631/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/manchester-united/kader/verein/985/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/arsenal-fc/kader/verein/11/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/everton-fc/kader/verein/29/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/leicester-city/kader/verein/1003/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/west-ham-united/kader/verein/379/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/afc-bournemouth/kader/verein/989/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/wolverhampton-wanderers/kader/verein/543/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/fc-southampton/kader/verein/180/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/fc-watford/kader/verein/1010/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/newcastle-united/kader/verein/762/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/crystal-palace/kader/verein/873/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/brighton-amp-hove-albion/kader/verein/1237/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/fc-burnley/kader/verein/1132/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/aston-villa/kader/verein/405/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/norwich-city/kader/verein/1123/saison_id/2019/plus/1",
    "https://www.transfermarkt.co.uk/sheffield-united/kader/verein/350/saison_id/2019/plus/1",
];

var eplPlayers = ["https://www.transfermarkt.co.uk/manchester-city/leistungsdaten/verein/281/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/liverpool-fc/leistungsdaten/verein/31/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/tottenham-hotspur/leistungsdaten/verein/148/plus/1?reldata=GB1%262019",
    "https://www.transfermarkt.co.uk/chelsea-fc/leistungsdaten/verein/631/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/manchester-united/leistungsdaten/verein/985/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/arsenal-fc/leistungsdaten/verein/11/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/everton-fc/leistungsdaten/verein/29/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/leicester-city/leistungsdaten/verein/1003/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/west-ham-united/leistungsdaten/verein/379/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/afc-bournemouth/leistungsdaten/verein/989/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/wolverhampton-wanderers/leistungsdaten/verein/543/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/fc-southampton/leistungsdaten/verein/180/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/fc-watford/leistungsdaten/verein/1010/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/newcastle-united/leistungsdaten/verein/762/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/crystal-palace/leistungsdaten/verein/873/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/brighton-amp-hove-albion/leistungsdaten/verein/1237/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/fc-burnley/leistungsdaten/verein/1132/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/aston-villa/leistungsdaten/verein/405/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/norwich-city/leistungsdaten/verein/1123/reldata/GB1%262019/plus/1",
    "https://www.transfermarkt.co.uk/sheffield-united/leistungsdaten/verein/350/reldata/GB1%262019/plus/1",
];

var eplTeamColors = ["\x1b[36m",
    "\x1b[31m",
    "\x1b[37m",
    "\x1b[34m",
    "\x1b[31m",
    "\x1b[31m",
    "\x1b[34m",
    "\x1b[34m",
    "\x1b[36m",
    "\x1b[40m",
    "\x1b[33m",
    "\x1b[31m",
    "\x1b[33m",
    "\x1b[40m",
    "\x1b[46m",
    "\x1b[44m",
    "\x1b[46m",
    "\x1b[31m",
    "\x1b[33m",
    "\x1b[41m",
];

// REST API
router.get('/', function (req, res, next) {

});

/* GET data crawling. */
router.get('/database', function (req, res, next) {
    var query = parseInt(req.query.team);
    const promises = [];

    // Parsing from transfermarktz.com
    promises.push(new Promise(function (resolve, reject) {
        let playerList = [];
        const getHtml = async () => {
            try {
                return await axios.get(eplTeams[query]);
            } catch (error) {
                console.error(error);
            }
        };

        getHtml()
            .then(html => {
                const $ = cheerio.load(html.data);
                const teamName = $('div.dataMain').eq(0).find('div.dataName').find('span').text();
                console.log(eplTeamColors[query], teamName + " parsing...");
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
                            return await axios.get(eplPlayers[query]);
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
                                console.log(eplTeamColors[query], playerName + ' parsing...');
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
                    console.log(eplTeamColors[query], teamName + " parsing complete!");
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