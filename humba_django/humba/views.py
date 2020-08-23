from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("I'm humba!")

def team_table(request):
    response = "This is team table."
    return HttpResponse("Hi there! %s" % response)

def player_goal_table(request):
    response = "This is player goal table."
    return HttpResponse("Hi there! %s" % response)

def player_assist_table(request):
    response = "This is player assist table."
    return HttpResponse("Hi there! %s" % response)

def schedule_table(request, round_idx):
    response = "This is %s round schedule table."
    return HttpResponse("Hi there! %s" % response % round_idx)