from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Crawl
from django.forms import ModelForm




class SignUpForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Input a valid email address.')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', )

class NewCrawlForm(ModelForm):
    name = forms.CharField(max_length=50, help_text='Required. Input a valid Crawl Name')
    crawlstartdate = forms.DateTimeField(help_text='Required. Input a valid start date and time')
    class Meta:
        model = Crawl
        fields = ('name', 'crawlstartdate')
