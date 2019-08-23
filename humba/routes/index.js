const express = require('express');
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const db = require('../public/javascripts/lib/db');
const kp = require('../public/javascripts/lib/koreanPatch');

var textTeams = fs.readFileSync("./public/data/teams.txt", 'utf-8');
var eplTeams = textTeams.split("\n");

var textPlayers = fs.readFileSync("./public/data/players.txt", 'utf-8');
var eplPlayers = textPlayers.split("\n");

var eplTeamColors = ["\x1b[36m", "\x1b[31m", "\x1b[37m", "\x1b[34m", "\x1b[31m", "\x1b[31m",
  "\x1b[34m", "\x1b[34m", "\x1b[36m", "\x1b[40m", "\x1b[33m", "\x1b[31m", "\x1b[33m", "\x1b[40m",
  "\x1b[46m", "\x1b[44m", "\x1b[46m", "\x1b[31m", "\x1b[33m", "\x1b[41m",
];

// REST API
router.get('/', function(req, res, next) {
  var msg = 'on development!';
  res.render('index', {
    msg: msg,
  });
});

/* GET data crawling. */
router.get('/database', function(req, res, next) {
  var query = parseInt(req.query.team);
  const promises = [];
  var playerCount = query * 100;

  // Parsing from transfermarktz.com
  promises.push(new Promise(function(resolve, reject) {
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

        $trList.each(function(i, elem) {
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

        promises.push(new Promise(function(resolve, reject) {
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
              $trListStat.each(function(j, elem) {
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
                    promises.push(new Promise(function(resolve, reject) {
                      var insertQuery = 'insert into humba.players values(' +
                        `${playerCount},${query},"${cp.name}","${cp.position}","${cp.number}","${cp.birth}",` +
                        `"${cp.nation}","${cp.height}","${cp.foot}","${cp.value}","${cp.appearances}","${cp.goals}",` +
                        `"${cp.assists}","${cp.yellows}","${cp.double_yellows}","${cp.reds}","${cp.minutes}"` +
                        ')';
                      // console.log(insertQuery);
                      db.query(insertQuery, function(err, results) {
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

        setTimeout(function() {
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

  Promise.all(promises).then(function(values) {
    res.json(values);
  });
});

// Update Team Information
router.get('/team', function(req, res, next) {
  var rankPage = "https://www.transfermarkt.co.uk/premier-league/tabelle/wettbewerb/GB1/saison_id/2019";
  const promises = [];

  promises.push(new Promise(function(resolve, reject) {
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

        $trList.each(function(i, elem) {
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

            promises.push(new Promise(function(resolve, reject) {
              var updateTeamQuery = 'update humba.teams ' +
                `set team=\"${teamList[i].team}\", played=${teamList[i].played}, won=${teamList[i].won}, draw=${teamList[i].draw}, ` +
                `loss=${teamList[i].loss}, GF=${teamList[i].GF}, GA=${teamList[i].GA}, GD=${teamList[i].GD}, points=${teamList[i].points} ` +
                `where id=${i};`;
              db.query(updateTeamQuery, function(err, results) {
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

  Promise.all(promises).then(function(values) {
    var msg = 'complete team rank update!';
    res.render('index', {
      msg: msg,
    });
  });
});

// Update Player Information
router.get('/player', function(req, res, next) {
  var query = parseInt(req.query.team);
  const promises = [];

  // Parsing from transfermarktz.com
  promises.push(new Promise(function(resolve, reject) {
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
        const
          $trListStat = $('div.responsive-table').find('tr.odd, tr.even');
        $trListStat.each(function(j, elem) {
          var
          name = $(this).find('a.spielprofil_tooltip').eq(0).text();
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

          promises.push(new Promise(function(resolve, reject) {
            var updatePlayerQuery = 'update humba.players ' +
              `set appearances="${appearances}", goals="${goals}", assists="${assists}", yellows="${yellows}",` +
              `double_yellows="${double_yellows}", reds="${reds}", minutes="${minutes}" ` +
              `where name="${name}";`;
            db.query(updatePlayerQuery, function(err, results) {
              if (err) {
                console.log(err);
              } else {}
            });
          }));
        });
        resolve(true);
      });
  }));

  Promise.all(promises).then(function(values) {
    var msg = 'complete player rank update!';
    res.render('index', {
      msg: msg,
    });
  });
});

// Get Team Ranking API
router.post('/team_rank', function(req, res, next) {
  var teamRankQuery = 'select * from humba.teams order by points desc, GD desc, GF desc, team;';
  db.query(teamRankQuery, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      var big6 = '';
      var middle = '';
      var bottom = '';
      var relegation = '';
      for (var i = 0; i < results.length; i++) {
        if (i < 6) {
          big6 += ((i + 1) + '위 : ' + results[i].team + ' ,승점 : ' + results[i].points + '\n');
        } else if (i < 12) {
          middle += ((i + 1) + '위 : ' + results[i].team + ' ,승점 : ' + results[i].points + '\n');
        } else if (i < 17) {
          bottom += ((i + 1) + '위 : ' + results[i].team + ' ,승점 : ' + results[i].points + '\n');
        } else {
          relegation += ((i + 1) + '위 : ' + results[i].team + ' ,승점 : ' + results[i].points + '\n');
        }
      }
      // const responseBody = {
      //     version: "2.0",
      //     template: {
      //         outputs: [{
      //             simpleText: {
      //                 text: text,
      //             }
      //         }]
      //     }
      // };
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
router.get('/player_rank', function(req, res, next) {
  var type = req.query.type;
  var playerRankQuery = ''
  if (type == 'goal') {
    playerRankQuery = 'select * from humba.players order by goals desc, team limit 20;';
  } else if (type == 'assist') {
    playerRankQuery = 'select * from humba.players order by assists desc, team limit 20;';
  }
  db.query(playerRankQuery, function(err, results) {
    if (err) {
      console.log(err);
    } else {
      res.json(results);
    }
  });
});

// Get Schedule API
router.get('/schedule', function(req, res, next) {

});

// Get Formation API
router.get('/formation', function(req, res, next) {

});

// Get TOTW API
router.get('/totw', function(req, res, next) {

});

// Get MOTM API
router.get('/motm', function(req, res, next) {

});

module.exports = router;
