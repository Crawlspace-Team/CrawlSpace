from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect

from crawlspace.core.forms import *
from crawlspace.core.models import *
import requests
import json

@login_required
def home(request):
    crawls = Crawl.objects.filter(user=request.user)
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls' : crawls, 'status' : ''})
    else:
        return render(request, 'home.html', {'crawls' : [], 'status' : 'No crawls'})

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})

@login_required
def newCrawl(request):
    if request.method == 'POST':
        form = NewCrawlForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.create(user=request.user,Crawl_Name=form.cleaned_data.get('name'),startdate=form.cleaned_data.get('crawlstartdate'))
            crawl.save()
    return redirect('/')

@login_required
def editCrawl(request):
    if request.method == 'POST':
        form = EditCrawlForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=form.cleaned_data.get('crawlid'))
            if (crawl.user == request.user):
                crawl.Crawl_Name = form.cleaned_data.get('name')
                crawl.startdate = form.cleaned_data.get('crawlstartdate')
                crawl.save()
    return redirect('/')

@login_required
def deleteCrawl(request, pk):
    crawl = Crawl.objects.get(id=pk)
    if (crawl.user == request.user):
        crawl.delete()
    return redirect('/')

@login_required
def viewCrawl(request, pk):
    crawl = Crawl.objects.get(id=pk)
    if (crawl.user == request.user):
        pubs = Pub_On_Crawl.objects.filter(crawl=crawl)
        for pub in pubs:
            rawPubData = requests.get("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + pub.pub.Places_ID + "&key=AIzaSyDw2YcCGEW97S5zIoTwv13fEjIzc118CjY")
            pubData = rawPubData.content
            pubData = json.loads(pubData)
            pubData = pubData['result']
            pub.phoneNumber = pubData['formatted_phone_number']
            #pubData = json.loads(rawPubData)
            #pub.open = pubData['internation_phone_number']
        if (pubs.exists()):
            return render(request, 'crawl.html', {'status' : '', 'crawl_name' : crawl.Crawl_Name, 'crawl_id': crawl.id, 'pubs': pubs})
        else:
            return render(request, 'crawl.html', {'status' : 'No Pubs in crawl', 'crawl_name' : crawl.Crawl_Name, 'crawl_id': crawl.id, 'pubs': []})

@login_required
def addPub(request, pk):
    if request.method == 'POST':
        form = AddPubForm(request.POST)
        if form.is_valid():
            crawl = Crawl.objects.get(id=pk)
            if (crawl.user == request.user):
                pubs = Pub_On_Crawl.objects.filter(crawl=crawl)
                numOfPubs = len(pubs)+1
                pub = Pub.objects.create(Pub_Name=form.cleaned_data.get('pubname'),Places_ID=form.cleaned_data.get('placeid'))
                pub.save()
                pubOnCrawl = Pub_On_Crawl.objects.create(pub=pub,crawl=crawl,position=numOfPubs)
                pubOnCrawl.save()
    return redirect('/crawl/' + pk + "/")

@login_required
def orderStartDate(request):
    crawls = Crawl.objects.filter(user=request.user)
    orderedCrawls = crawls.order_by('startdate')
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls' : orderedCrawls, 'status' : ''})
    else:
        return render(request, 'home.html', {'crawls' : [], 'status' : 'No crawls'})

@login_required
def orderCrawlName(request):
    crawls = Crawl.objects.filter(user=request.user)
    orderedCrawls = crawls.order_by('Crawl_Name')
    if (crawls.exists()):
        return render(request, 'home.html', {'crawls' : orderedCrawls, 'status' : ''})
    else:
        return render(request, 'home.html', {'crawls' : [], 'status' : 'No crawls'})
