from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect

from crawlspace.core.forms import SignUpForm
from crawlspace.core.models import Crawls

@login_required
def home(request):
    crawls = Crawls.objects.filter(user=request.user)
    if (crawls.exists()):
        status = 'You have: ' + str(len(crawls)) + ' crawls'
        return render(request, 'home.html', {'crawls' : crawls, 'status' : status})
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
