const express = require('express');
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const db = require('../public/javascripts/lib/db');
const kp = require('../public/javascripts/lib/koreanPatch');
const sp = require('../public/javascripts/lib/stadiaPatch');

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

var eplTeamColors = ["\x1b[36m", "\x1b[31m", "\x1b[37m", "\x1b[34m", "\x1b[31m", "\x1b[31m", "\x1b[34m",
    "\x1b[34m", "\x1b[36m", "\x1b[40m", "\x1b[33m", "\x1b[31m", "\x1b[33m", "\x1b[40m",
    "\x1b[46m", "\x1b[44m", "\x1b[46m", "\x1b[31m", "\x1b[33m", "\x1b[41m",
];

var week = ['일', '월', '화', '수', '목', '금', '토'];
var big6 = ['Liverpool', 'Man City', 'Man Utd', 'Spurs', 'Chelsea', 'Arsenal'];

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
                                var playername = $(this).find('a.spielprofil_tooltip').eq(0).text();
                                console.log(eplTeamColors[query], playerName + ' parsing...');
                                for (var k = 0; k < playerList.length; k++) {
                                    if (playerList[k].return = playerName) {
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
                        var teamName = $(this).find('td.no-border-links').children('a').text();
                        var krTeamName = kp.changeTeamNameToKorean(teamName);
                        teamList[i] = {
                            team: krTeamName,
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
    // var query = parseInt(req.query.team);
    const promises = [];

    for (var i = 0; i < 20; i++) {
        // console.log(i + " updating..");
        // Parsing from transfermarktz.com
        promises.push(new Promise(function (resolve, reject) {
            const getHtml = async () => {
                try {
                    return await axios.get(eplPlayers[i]);
                } catch (error) {
                    console.error(error);
                }
            };

            getHtml()
                .then(html => {
                    var $ = cheerio.load(html.data);
                    const $trListStat = $('div.responsive-table').find('tr.odd, tr.even');
                    $trListStat.each(function (j, elem) {
                        var name = $(this).find('a.spielprofil_tooltip').eq(0).text();
                        // name = kp.changePlayerNameToKorean(name);
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
                                } else {}
                            });
                        }));
                    });
                    resolve(true);
                });
        }));
    }


    Promise.all(promises).then(function (values) {
        var msg = 'complete player rank update!';
        res.render('index', {
            msg: msg,
        });
        res.json(values);
    });
});

// Get Team Ranking API
router.post('/team_rank', function (req, res, next) {
    var teamRankQuery = 'select * from humba.teams order by points desc, played, GD desc, team;';
    db.query(teamRankQuery, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            var big6 = '';
            var middle = '';
            var bottom = '';
            var relegation = '';
            for (var i = 0; i < results.length; i++) {
                var str = ((i + 1) + ' : ' + results[i].team + ' , ' + results[i].played + '경기 ' + results[i].points + '점\n');
                if (i < 6) {
                    big6 += str;
                } else if (i < 12) {
                    middle += str;
                } else if (i < 17) {
                    bottom += str;
                } else {
                    relegation += str;
                }
            }
            const responseBody = {
                "version": "2.0",
                "template": {
                    "outputs": [{
                        "carousel": {
                            "type": "basicCard",
                            "items": [{
                                    "title": "BIG 6",
                                    "description": big6,
                                },
                                {
                                    "title": "중위권",
                                    "description": middle,
                                },
                                {
                                    "title": "하위권",
                                    "description": bottom,
                                },
                                {
                                    "title": "강등권",
                                    "description": relegation,
                                }
                            ]
                        }
                    }]
                }
            };
            res.status(200).send(responseBody);
        }
    });
});

// Get Player Ranking API
router.post('/player_rank', function (req, res, next) {
    var type = req.query.type;
    var playerRankQuery = ''
    if (type == 'goal') {
        playerRankQuery = 'select * from humba.players order by goals desc, team limit 20;';
    } else if (type == 'assist') {
        playerRankQuery = 'select * from humba.players order by assists desc, team limit 20;';
    }
    db.query(playerRankQuery, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            var batch1 = '';
            var batch2 = '';
            var batch3 = '';
            var batch4 = '';
            for (var i = 0; i < results.length; i++) {
                // var str = ((i + 1) + '위 : ' + results[i].name + ' : ' + results[i].appearances + '경기 ' + results[i].goals + '골\n');
                var name = results[i].korean_name;
                // if(results[i].nickname != ''){
                //   name = results[i].nickname;
                // }
                if (type == 'goal') {
                    var str = (name + ' : ' + results[i].appearances + '경기 ' + results[i].goals + '골\n');
                } else if (type == 'assist') {
                    var str = (name + ' : ' + results[i].appearances + '경기 ' + results[i].assists + '도움\n');
                }
                if (i < 5) {
                    batch1 += str;
                } else if (i < 10) {
                    batch2 += str;
                } else if (i < 15) {
                    batch3 += str;
                } else {
                    batch4 += str;
                }
            }
            const responseBody = {
                "version": "2.0",
                "template": {
                    "outputs": [{
                        "carousel": {
                            "type": "basicCard",
                            "items": [{
                                    "title": "월드클래스",
                                    "description": batch1,
                                },
                                {
                                    "title": "인터내셔널 클래스",
                                    "description": batch2,
                                },
                                {
                                    "title": "리그 클래스",
                                    "description": batch3,
                                },
                                {
                                    "title": "클럽 클래스",
                                    "description": batch4,
                                }
                            ]
                        }
                    }]
                }
            };
            res.status(200).send(responseBody);
        }
    });
});

// Get Schedule API
router.get('/schedule', function (req, res, next) {
    var clearTableQuery = 'delete from humba.schedule where stadia=\'\'';
    db.query(clearTableQuery, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            var schedulePage = "https://www.transfermarkt.com/premier-league/gesamtspielplan/wettbewerb/GB1/saison_id/2019";
            const promises = [];

            promises.push(new Promise(function (resolve, reject) {
                const getHtml = async () => {
                    try {
                        return await axios.get(schedulePage);
                    } catch (error) {
                        console.error(error);
                    }
                };
                var match = new Array();
                getHtml()
                    .then(html => {
                        const $ = cheerio.load(html.data);
                        const $columnList = $(".large-6.columns");

                        $columnList.each(function (i, elem) {
                            if (i == 0 || i > 38) return true;
                            let matchList = [];
                            // console.log(i + 'Round Parsing...');
                            const $trList = $(this).children('div.box').children('table').find('tr');
                            var count = 0;
                            $trList.each(function (j, elem) {
                                if (j == 0) return true;
                                if (!$(this).hasClass('bg_blau_20')) {
                                    var time = $(this).find('td.zentriert').eq(0).text();
                                    time = time.replace(/\t/gi, '');
                                    time = time.replace(/\n/gi, '');
                                    var date = $(this).find('td.hide-for-small').eq(0).children('a').text();

                                    matchList[count] = {
                                        date: date,
                                        time: time,
                                        home: $(this).find('td.hauptlink').eq(0).children('a').text(),
                                        score: $(this).find('td.zentriert').eq(2).children('a').text(),
                                        away: $(this).find('td.hauptlink').eq(2).children('a').text(),
                                    };
                                    promises.push(new Promise(function (resolve, reject) {
                                        var insertScheduleQuery = 'insert into humba.schedule ' +
                                            `values(${i}, '${matchList[count].date}', '${matchList[count].time}', '',` +
                                            `'${matchList[count].home}','${matchList[count].away}','${matchList[count].score}');`;
                                        db.query(insertScheduleQuery, function (err, results) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                // console.log(results);
                                            }
                                        });
                                    }));
                                    count++;
                                }
                            });
                            match.push(matchList);
                        });
                        resolve(match);
                    });
            }));
            Promise.all(promises).then(function (values) {
                var msg = 'complete team schedule update!';
                res.render('index', {
                    msg: msg,
                });
                // res.json(values);
            });
        }
    })

});

// Update schedule data
router.post('/schedule', function (req, res) {
    var scheduleQuery = '';
    var round = req.query.round;
    scheduleQuery = `select * from humba.schedule where round=${round} limit 10;`;
    // var time = req.query.time;
    // if(time == 'week'){
    //     scheduleQuery = `select * from humba.schedule where time=${}`;
    // }else if(time == 'today'){
    //     scheduleQuery = ``;
    // }else if(time == 'tomorrow'){
    //     scheduleQuery = ``;
    // }
    db.query(scheduleQuery, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            var matchday1 = '';
            var matchday2 = '';
            var matchday3 = '';
            var matchday4 = '';
            var items = new Array();
            for (var i = 0; i < results.length; i++) {
                var singleItem = new Object();
                if (results[i].score != '-:-') {
                    singleItem.title = `${kp.changeTeamNameToKorean(results[i].home)} vs ${kp.changeTeamNameToKorean(results[i].away)} \n${results[i].score}`;
                } else {
                    singleItem.title = `${kp.changeTeamNameToKorean(results[i].home)} vs ${kp.changeTeamNameToKorean(results[i].away)}`;
                }
                var j = i;
                var date = results[i].date;
                while (results[j].date == '') {
                    date = results[j - 1].date;
                    j--;
                }
                j = i;
                var time = results[i].time;
                while (results[j].time == '') {
                    time = results[j - 1].time;
                    j--;
                }
                var nDate = new Date(date + " " + time);
                var dayOfWeek = week[nDate.getDay()];
                nDate.setHours(nDate.getHours() + 7);
                date = nDate.getFullYear().toString().substr(-2) + '년 ' + (nDate.getMonth() + 1) + '월 ' + nDate.getDate() + '일';
                time = nDate.getHours() + '시 ' + ("00" + nDate.getMinutes()).slice(-2) + '분';

                var stadia = sp.locateStadia(results[i].home);
                singleItem.description = `${date} ${time}(${dayOfWeek}) \n${stadia}`;
                var thumbnail = new Object();
                thumbnail.imageUrl = sp.eplTeamImage(results[i].home);
                singleItem.thumbnail = thumbnail;
                items.push(singleItem);
            }
            const responseBody = {
                "version": "2.0",
                "template": {
                    "outputs": [{
                        "carousel": {
                            "type": "basicCard",
                            items,
                        }
                    }]
                }
            };
            res.status(200).send(responseBody);
        }
    });
});

// 빅매치
router.post('/big_match', function (req, res) {
    var query = 'select * from humba.schedule where score = \"-:-\"';
    db.query(query, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            var count = 0;
            var items = new Array();
            for (var i = 0; i < results.length; i++) {
                var singleItem = new Object();
                var j = i;
                var date = results[i].date;
                while (results[j].date == '') {
                    date = results[j - 1].date;
                    j--;
                }
                j = i;
                var time = results[i].time;
                while (results[j].time == '') {
                    time = results[j - 1].time;
                    j--;
                }

                if (big6.includes(results[i].home) && big6.includes(results[i].away) && count < 10) {
                    singleItem.title = `${kp.changeTeamNameToKorean(results[i].home)} vs ${kp.changeTeamNameToKorean(results[i].away)}`;
                    var nDate = new Date(date + " " + time);
                    var dayOfWeek = week[nDate.getDay()];
                    nDate.setHours(nDate.getHours() + 7);
                    date = nDate.getFullYear().toString().substr(-2) + '년 ' + (nDate.getMonth() + 1) + '월 ' + nDate.getDate() + '일';
                    time = nDate.getHours() + '시 ' + ("00" + nDate.getMinutes()).slice(-2) + '분';

                    var stadia = sp.locateStadia(results[i].home);
                    singleItem.description = `${date} ${time}(${dayOfWeek}) \n${stadia}`;
                    var thumbnail = new Object();
                    thumbnail.imageUrl = sp.eplTeamImage(results[i].home);
                    singleItem.thumbnail = thumbnail;
                    items.push(singleItem);
                    count++;
                }
            }
            // res.json(items);
            const responseBody = {
                "version": "2.0",
                "template": {
                    "outputs": [{
                        "carousel": {
                            "type": "basicCard",
                            items,
                        }
                    }]
                }
            };
            res.status(200).send(responseBody);
        }
    });
});

// 팀별 스케쥴
router.post('/team_schedule', function (req, res) {
    var team = req.query.team;
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