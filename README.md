# CrawlSpace
Prototype app for the Crawlspace project.

Built with Django for backend functionality, JavaScript for frontend functionality, SCSS complied to CSS for the frontend styling.

## Setting up the project on your local machine
1. Using the GitHub Desktop App or equivalent git application
2. Within the git application open the File menu then click Clone Repository
3. Select CrawlSpace repository and click clone to download the app to your system
4. Install Python latest version 3.6.4 from https://www.python.org/downloads/, while installing ensure add python to path is selected
5. Run 'pip install Django==2.0.2' in the Command Prompt
6. Run 'pip install requests' in the Command Prompt
7. Run runserver.cmd in the CrawlSpace Folder (User\Name\Documents\GitHub\CrawlSpace)


## Tests created and run with helium via the .bat files within the Tests folder
### Test .bat files should be run in the order specified below
1. 1_signupChrome
2. 2_loginChrome
3. 3_createCrawl
4. 4_editCrawl
5. 5_AddPubKeywordSearch
6. 6_addPubGeolocationSearch
7. 7_reorderPubs
8. 8_deletePub
9. 9_viewMap
