from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Crawl

class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Input a valid email address.')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', )

class NewCrawlForm(forms.Form):
    name = forms.CharField(max_length=50, help_text='Required. Input a valid Crawl Name')
    crawlstartdate = forms.DateTimeField(help_text='Required. Input a valid start date and time')

class EditCrawlForm(forms.Form):
    crawlid = forms.CharField(max_length=50)
    name = forms.CharField(max_length=50, help_text='Required. Input a valid Crawl Name')
    crawlstartdate = forms.DateTimeField(help_text='Required. Input a valid start date and time')

class AddPubForm(forms.Form):
    pubname = forms.CharField(max_length=255)
    placeid = forms.CharField(max_length=100)
