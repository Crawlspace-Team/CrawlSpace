# Django imports
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignUpForm(UserCreationForm):
    """
     Sign up form that uses the default Django user with an additional email field

     Attributes
     -------
     email
        Email address of the user
     """
    email = forms.EmailField(max_length=254, help_text='Required. Input a valid email address.')

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2',)


class NewCrawlForm(forms.Form):
    """
     New crawl form that is used to create a new crawl within the new_crawl view

     Attributes
     -------
     name
        Name of the crawl
     crawl_start_date
        Date that the crawl will start on
     """
    name = forms.CharField(max_length=50, help_text='Required. Input a valid Crawl Name')
    crawl_start_date = forms.DateTimeField(help_text='Required. Input a valid start date and time')


class EditCrawlForm(forms.Form):
    """
     Edit crawl form that is used to edit crawl within the edit_crawl view

     Attributes
     -------
     crawl_id
        ID of the crawl
     name
        Name of the crawl
     crawl_start_date
        Date that the crawl will start on
     """
    crawl_id = forms.CharField(max_length=50)
    name = forms.CharField(max_length=50, help_text='Required. Input a valid Crawl Name')
    crawl_start_date = forms.DateTimeField(help_text='Required. Input a valid start date and time')


class AddPubForm(forms.Form):
    """
     Add pub form that is used to add a pub to a crawl within the add_pub view

     Attributes
     -------
     pub_name
        Name of the pub
     place_id
         Google places ID of the pub
     """
    pub_name = forms.CharField(max_length=255)
    place_id = forms.CharField(max_length=100)


class DeletePubForm(forms.Form):
    """
     Delete pub form that is used to delete a pub from a crawl within the delete_pub view

     Attributes
     -------
     pub_position
         Integer representing the position of the pub within the crawl
     """
    pub_position = forms.IntegerField()


class ReorderPubForm(forms.Form):
    """
     Reorder pub form that is used to reorder pubs in a crawl within the reorder_pub view

     Attributes
     -------
     pub_position
         Integer representing the position of the pub within the crawl
     new_position
         Integer representing the new position of the pub within the crawl
     """
    pub_position = forms.IntegerField()
    new_position = forms.IntegerField()
