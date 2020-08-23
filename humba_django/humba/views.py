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

    originParam = requestBody['action']['detailParams']['sys_humba_football']['origin']
    systemParam = requestBody['action']['params']['sys_humba_football']

    textBody = ""
    if(systemParam == '득점'):
        textBody = originParam
    elif(systemParam == '도움'):
        textBody = originParam
    elif(systemParam == '팀'):
        textBody = originParam

    responseBody = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                    "text": "%s 순위에 대해 알려줄게 :)" % textBody
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