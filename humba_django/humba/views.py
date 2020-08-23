from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
#import requests
import json

def index(request):
    return HttpResponse("I'm humba!")

@csrf_exempt
def navigate(request):
    requestBody = json.loads(request.body.decode('utf-8'))
    #print(requestBody)

    originParam = requestBody['action']['params']['sys_humba_football']
    if(requestBody['action']['params']['sys_humba_rank'] == 'null'):
        systemParam = requestBody['action']['detailParams']['sys_humba_rank']['value']
    else:
        systemParam = requestBody['action']['params']['sys_humba_rank']

    print(originParam, systemParam)

    responseBody = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                    "text": "%s %s에 대해 알려줄게 :)" % (originParam, systemParam)
                    }
                }
            ]
        }
    }
    return JsonResponse(responseBody, safe=False)

def team_table(request):
    response = "This is team table."
    return HttpResponse("Hi there! %s" % response)

def player_goal_table(request):
    response = "This is player goal table."
    return HttpResponse("Hi there! %s" % response)

def player_assist_table(request):
    response = "This is player assist table."
    return HttpResponse("Hi there! %s" % response)

def schedule_table(request):
    response = "This is schedule table."
    return HttpResponse("Hi there! %s" % response)

def schedule_table_round(request, round_idx):
    response = "This is %s round schedule table."
    return HttpResponse("Hi there! %s" % response % round_idx)