const express = require('express');
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const db = require('../public/javascripts/lib/db');

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
    var msg = 'on development!';
    res.render('index', {
        msg: msg,
    });
});

/* GET data crawling. */
router.get('/database', function (req, res, next) {
    var query = parseInt(req.query.team);
    const promises = [];
    var playerCount = query * 100;

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
                        name: '',
                        position: '',
                        number: -1,
                        birth: '',
                        nation: '',
                        height: '',
                        foot: '',
                        value: '',
                        appearances: 0,
                        goals: 0,
                        assists: 0,
                        yellows: 0,
                        double_yellows: 0,
                        reds: 0,
                        minutes: '',
                    };
                    playerList[i].name = $(this).find('a.spielprofil_tooltip').eq(0).text();
                    playerList[i].position = $(this).find('td.posrela').eq(0).find('tr').eq(1).children('td').text();
                    playerList[i].number = $(this).find('div.rn_nummer').text();
                    playerList[i].birth = $(this).children('td.zentriert').eq(1).html();
                    playerList[i].nation = $(this).find('td.zentriert').eq(2).children('img').attr('title');
                    playerList[i].height = $(this).find('td.zentriert').eq(3).text();
                    playerList[i].foot = $(this).find('td.zentriert').eq(4).text();
                    playerList[i].value = ($(this).find('td.hauptlink').text()).split('£')[1];
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
                                        const ps = $trListStat.eq(j);
                                        playerList[k].appearances = ps.find('td.zentriert').eq(4).text();
                                        playerList[k].goals = ps.find('td.zentriert').eq(5).text();
                                        playerList[k].assists = ps.find('td.zentriert').eq(6).text();
                                        playerList[k].yellows = ps.find('td.zentriert').eq(7).text();
                                        playerList[k].double_yellows = ps.find('td.zentriert').eq(8).text();
                                        playerList[k].reds = ps.find('td.zentriert').eq(9).text();
                                        playerList[k].minutes = ps.find('td.rechts').eq(0).text();

                                        var cp = playerList[k];
                                        promises.push(new Promise(function (resolve, reject) {
                                            var insertQuery = 'insert into humba.players values(' +
                                                `${playerCount},${query},"${cp.name}","${cp.position}","${cp.number}","${cp.birth}",` +
                                                `"${cp.nation}","${cp.height}","${cp.foot}","${cp.value}","${cp.appearances}","${cp.goals}",` +
                                                `"${cp.assists}","${cp.yellows}","${cp.double_yellows}","${cp.reds}","${cp.minutes}"` +
                                                ')';
                                            // console.log(insertQuery);
                                            db.query(insertQuery, function (err, results) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    // console.log(results);
                                                }
                                            });
                                        }));
                                        break;
                                    }
                                }
                                playerCount++;
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

// Update Team Information
router.get('/team', function (req, res, next) {
    var rankPage = "https://www.transfermarkt.co.uk/premier-league/tabelle/wettbewerb/GB1/saison_id/2019";
    const promises = [];

    promises.push(new Promise(function (resolve, reject) {
        let teamList = [];
        const getHtml = async () => {
            try {
                return await axios.get(rankPage);
            } catch (error) {
                console.error(error);
            }
        };

        getHtml()
            .then(html => {
                const $ = cheerio.load(html.data);
                const $trList = $('div.responsive-table').find('tr');

                $trList.each(function (i, elem) {
                    if (i != 0) {
                        teamList[i] = {
                            team: $(this).find('td.no-border-links').children('a').text(),
                            played: $(this).find('td.zentriert').eq(1).text(),
                            won: $(this).find('td.zentriert').eq(2).text(),
                            draw: $(this).find('td.zentriert').eq(3).text(),
                            loss: $(this).find('td.zentriert').eq(4).text(),
                            GF: ($(this).find('td.zentriert').eq(5).text()).split(':')[0],
                            GA: ($(this).find('td.zentriert').eq(5).text()).split(':')[1],
                            GD: $(this).find('td.zentriert').eq(6).text(),
                            points: $(this).find('td.zentriert').eq(7).text(),
                        };

                        promises.push(new Promise(function (resolve, reject) {
                            var updateTeamQuery = 'update humba.teams ' +
                                `set team=\"${teamList[i].team}\", played=${teamList[i].played}, won=${teamList[i].won}, draw=${teamList[i].draw}, ` +
                                `loss=${teamList[i].loss}, GF=${teamList[i].GF}, GA=${teamList[i].GA}, GD=${teamList[i].GD}, points=${teamList[i].points} ` +
                                `where id=${i};`;
                            db.query(updateTeamQuery, function (err, results) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    // console.log(results);
                                }
                            });
                        }));
                    }
                });
                var data = new Object();
                data.teams = teamList;
                resolve(data);
            });
    }));

    Promise.all(promises).then(function (values) {
        var msg = 'complete team rank update!';
        res.render('index', {
            msg: msg,
        });
    });
});

// Update Player Information
router.get('/player', function (req, res, next) {
    var query = parseInt(req.query.team);
    const promises = [];

    // Parsing from transfermarktz.com
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
                var $ = cheerio.load(html.data);const
                $trListStat = $('div.responsive-table').find('tr.odd, tr.even');
                $trListStat.each(function (j, elem) {
                    var name = $(this).find('a.spielprofil_tooltip').eq(0).text();
                    console.log(name + " data updating...");
                    const ps = $trListStat.eq(j);
                    var appearances = ps.find('td.zentriert').eq(4).text();
                    var goals = ps.find('td.zentriert').eq(5).text();
                    var assists = ps.find('td.zentriert').eq(6).text();
                    var yellows = ps.find('td.zentriert').eq(7).text();
                    var double_yellows = ps.find('td.zentriert').eq(8).text();
                    var reds = ps.find('td.zentriert').eq(9).text();
                    var minutes = ps.find('td.rechts').eq(0).text();

                    promises.push(new Promise(function (resolve, reject) {
                        var updatePlayerQuery = 'update humba.players ' +
                            `set appearances="${appearances}", goals="${goals}", assists="${assists}", yellows="${yellows}",` +
                            `double_yellows="${double_yellows}", reds="${reds}", minutes="${minutes}" ` +
                            `where name="${name}";`;
                        db.query(updatePlayerQuery, function (err, results) {
                            if (err) {
                                console.log(err);
                            } else {
                            }
                        });
                    }));
                });
                resolve(true);
            });
    }));

    Promise.all(promises).then(function (values) {
        var msg = 'complete player rank update!';
        res.render('index', {
            msg: msg,
        });
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

// Get TOTW API
router.get('/totw', function (req, res, next) {

});

// Get MOTM API
router.get('/motm', function (req, res, next) {

});

module.exports = router;