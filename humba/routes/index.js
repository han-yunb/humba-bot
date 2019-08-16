var express = require('express');
var router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;

// REST API
/* GET home page. */
router.get('/', function (req, res_index, next) {
    // Parsing from transfermarktz.com
    var teamPage = ["https://www.transfermarkt.co.uk/manchester-city/startseite/verein/281/saison_id/2019"];
    let playerList = [];

    for (var i = 0; i < teamPage.length; i++) {
        var page = teamPage[i];
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
                var baseUrl = "https://www.transfermarkt.co.uk";
                const $trList = $('div.responsive-table').find('tr.odd, tr.even');
                // const $evenList = $('div.responsive-table').find('tr.even');
                var count = $trList.length;

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
                    };
                });

                const data = new Object();
                data.team = teamName;
                data.player = playerList;
                // const data = playerList.filter(n => n.name);
                return data
            })
            .then(res=>res_index.json(res));
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