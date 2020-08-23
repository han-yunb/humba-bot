from django.db import models

DEFAULT_TEAM_ID = 0

class TeamTable(models.Model):
    team_name = models.CharField(max_length=200)
    kr_team_name = models.CharField(max_length=200)
    stadium = models.CharField(max_length=200)
    played = models.IntegerField(default=0)
    win = models.IntegerField(default=0)
    draw = models.IntegerField(default=0)
    loss = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    rank = models.IntegerField(default=10)
    def __str__(self):
        return self.team_name

class PlayerTable(models.Model):
    player_name = models.CharField(max_length=200)
    player_nickname = models.CharField(max_length=200)
    birthday = models.CharField(max_length=200)
    team = models.ForeignKey(TeamTable, on_delete=models.PROTECT, default=DEFAULT_TEAM_ID)
    played = models.IntegerField(default=0)
    goal = models.IntegerField(default=0)
    assist = models.IntegerField(default=0)
    def __str__(self):
        return self.player_name

class ScheduleTable(models.Model):
    round_idx = models.IntegerField(default=1)
    home = models.ForeignKey(TeamTable, on_delete=models.PROTECT, default=DEFAULT_TEAM_ID)
    away = models.CharField(max_length=200)
    time = models.DateTimeField('date published')
    results = models.CharField(max_length=200)
    def __str__(self):
        return '{}R) {} vs {}'.format(self.round_idx, self.home, self.away)