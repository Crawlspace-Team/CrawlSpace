from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect

from crawlspace.core.forms import SignUpForm
from crawlspace.core.forms import NewCrawlForm
from crawlspace.core.models import Crawl

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
def deleteCrawl(request, pk):
    crawl = Crawl.objects.get(id=pk)
    if (crawl.user == request.user):
        crawl.delete()
    return redirect('/')
