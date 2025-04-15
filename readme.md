# J-Tracker - Your Job Tracking Assistant

[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
[![GitHub license](https://img.shields.io/github/license/ncsu-csc-510/Project2)](https://github.com/Group21-SWE/Project2/blob/main/LICENSE)
[![DOI](https://zenodo.org/badge/945674652.svg)](https://doi.org/10.5281/zenodo.15211854)
[![codecov](https://codecov.io/gh/Group21-SWE/Project2/graph/badge.svg?token=QR4R64FM4M)](https://codecov.io/gh/Group21-SWE/Project2)
[![GitHub issues](https://img.shields.io/github/issues/ncsu-csc-510/Project2)](https://github.com/Group21-SWE/Project2/issues)
[![Github closed issues](https://img.shields.io/github/issues-closed-raw/ncsu-csc-510/Project2)](https://github.com/Group21-SWE/Project2/issues?q=is%3Aissue%20state%3Aclosed)
![GitHub top language](https://img.shields.io/github/languages/top/ncsu-csc-510/Project2)
[![GitHub Tag](https://img.shields.io/github/v/tag/ncsu-csc-510/Project2?style=plastic)](https://github.com/Group21-SWE/Project2/releases)
[![GitHub forks](https://img.shields.io/github/forks/ncsu-csc-510/Project2)](https://github.com/Group21-SWE/Project2/forks)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/ncsu-csc-510/Project2)](https://github.com/Group21-SWE/Project2/graphs/commit-activity)
[![Collaborators](https://img.shields.io/badge/Collaborators-3-orange.svg?style=flat)](https://github.com/Group21-SWE/Project2/graphs/contributors)

<!-- <p align="center"><img width="700" src="https://github.com/ncsu-csc-510/Project2/blob/main/media/video.gif"></p> -->

The internship application and job application process is no picnic. Job application management is time-consuming. With the referrals and deadlines, the whole process can get daunting. Our app enables you to track and organize your job application process, and manage it, without the inconvenience of clunky Excel spreadsheets.

Our software maintains a record of the work you have wish-listed. It records those companies that you have applied for and records any rejections. Instead of making the user visit each company's website for prospects, our software enables the applicant to look for them directly using simple keywords. Any possible offer of work may then be wish-listed by the applicant.

## New Features in Project2

🎥[Project2 Demo Video](https://drive.google.com/file/d/1dzq3PYMK-vSxBg1yp8uFzMbsFr2sq76F/view?usp=drive_link) 

## ⭐ Highlight of Project2 ⭐
### Dockerization 🗃️
Containerizing the application with docker has helped us achieve 2 significant things
1. Dramatically boosting the speed at which one would be able to configure the project in their machines.
2. Automation of the entire run of the application including running the tests!

### ⭐ New AI Features and Updates!
1. Improved scalability and maintainability with optimized querying and restructured user entity fields.
2. AI-driven job matching system leveraging user profiles and resumes for better recommendations.
3. Enhanced profile updates and better resume parsing for accurate job-fit analysis.
4. AI integration for personalized career path suggestions and top opportunity highlights.

#### Bug fixes
1. OAuth Restoration
2. Docker Restoration Repair
3. Authentication into the application randomly not working.
3. Resolved profile update errors and improved system stability and efficiency


---
## Table of contents

- [Basic Design](#basic-design)
- [Samples](#samples)
- [New Features In Phase 3](#new-features-in-phase-3)
- [Future Scope](#future-scope)
- [Explanation](#explanation)
- [Technologies Used](#technologies-used)
- [Hosting the Database](#hosting-the-database)
  - [Local MongoDB](#local-mongodb)
  - [Hosted database with MongoDB Atlas](#hosted-database-with-mongodb-atlas)
- [License](#license)
- [How to Contribute](#how-to-contribute)
- [Team Members](#team-members)

## Basic Design:

![Basic Design](https://github.com/ncsu-csc-510/Project2/blob/main/resources/Overall%20Design.PNG)

## Samples:

### Login Page / Signup Page

The introductory visual interface displayed from which a user is able to register and log into the application. User can also login or sign up through Google Authorization.

<p align="center"><img width="700" src="./resources/login_page.png"></p>
The Google Authorization Login:

<p align="center"><img width="700" src="./resources/googleauth.png"></p>

### HomeScreen - Profile Page

After Logging In, the Profile page of the user is displayed where the user details such as Name, Institution, email, phone number, address, skills, and more are shown.
Users can add or update information to their profile, such as their personal information, skills, preferred job locations, and their experience level.

<p align="center"><img width="700" src="./resources/profilepage.png"></p>

### JobSearchPage 

1. A past analyses column has been added to the dashboard. Here the users will get a summarized version of the comparison between their resume and the job they would like to apply to. 

2. Another feature has been added for ease of use by mentioning a summary of the applications made by each user. The dashboard now shows a count of all the applications as well as the category- Applied, Rejected, Wish List and Waiting for Referral.

3. In the earlier versions of the software the skills were not saved for when the user logs in again. We have solved this bug. Now the users can see their previous preferences after logging in again. They can then update these without any hassle. We have made sure that our database and our code takes care of managing this

4. We have incorporated an AI model to recommend jobs to the user. Instead of just fetching jobs from google, our code will now based off the preferences of the user, their skills, their experience will curate job opportunities for the user. In this way, the user is only recommended jobs that fit their application requirements and they don’t have to waste time reading the job description thoroughly



<p align="center"><img width="700" src="https://github.com/ncsu-csc-510/Project2/blob/main/media/media1.png"></p> 
<p align="center"><img width="700" src="https://github.com/ncsu-csc-510/Project2/blob/main/media/media2.png"></p>
<p align="center"><img width="700" src="https://github.com/ncsu-csc-510/Project2/blob/main/media/media3.png"></p>
<p align="center"><img width="700" src="https://github.com/ncsu-csc-510/Project2/blob/main/media/media4.png"></p>
<p align="center"><img width="700" src="https://github.com/ncsu-csc-510/Project2/blob/main/media/media6.png"></p>



### ApplicationPage

The user is able to see different saved applications - Waitlisted applications, Waiting for Refereals, Applied Jobs, Application Status. The user is also able to add more jobs to track using this screen.

<p align="center"><img width="700" src="./resources/AddApplicationpage.png"></p>

### MatchesPage

Here, user is able to see different jobs which would be recommended to them according to their profile and also their interest. User can apply for that job from this page as well.

<p align="center"><img width="700" src="./resources/Recommendjobspage.png"></p>

### FinalViewOfDashboard

<p align="center"><img width="700" src="https://github.com/ncsu-csc-510/Project2/blob/main/media/media5.png"></p>


## Future Scope:

- AI Job Matching: Advanced AI predicts best-fit jobs and offers real-time market insights based on user skills.
- Automated Tracking: AI tracks application statuses via parsing and updates progress from job portals.
- Interview Prep: AI-driven mock interviews with real-time feedback and role-specific questions.
- Multi-Platform Sync: Syncs with LinkedIn, job boards, and ATS; mobile app for real-time updates.

## Technologies Used:

- Python
- Node.Js
- Flask
- MongoDB
- React
- Docker

## Hosting the Database:

### Local MongoDB:

1. Download [MongoDB Community Server](https://docs.mongodb.com/manual/administration/install-community/)
    - Recommended Homebrew installation
2. Follow the [Installion Guide](https://docs.mongodb.com/guides/server/install/)
3. In app.py set 'host' string to 'localhost'
    ```
    app.config["MONGODB_SETTINGS"] = {
        "db": "appTracker",
        "host": 'localhost',
    }
    ```
4. Run the local database:

mongodb

- Recommended: Use a GUI such as [Studio 3T](https://studio3t.com/download/) to more easily interact with the database

### Hosted database with MongoDB Atlas: 

1. [Create account](https://account.mongodb.com/account/register) for MongoDB

    - **If current MongoDB Atlas owner adds your username/password to the cluster, skip to step 4** \*

2. Follow MongoDB Atlas [Setup Guide](https://docs.atlas.mongodb.com/getting-started/) to create a database collection for hosting applications
3. Create application.yml in the backend folder with the following contents:
   ```
   GOOGLE_CLIENT_ID : <Oauth Google ID>
   GOOGLE_CLIENT_SECRET : <Oauth Google Secret>
   CONF_URL : https://accounts.google.com/.well-known/openid-configuration
   SECRET_KEY : <Any Secret You Want>
   USERNAME : <MongoDB Atlas Username>
   PASSWORD : <MongoDB Atlas Password>
   CLUSTER_URL : <MongoDB Cluster URL>
   ```
    <details>
    <summary>Claude 3.7 Sonnet Assistance: How to obtain application.yml fields</summary>
    <br>
    <h3>Obtaining Values for application.yml Fields</h3>
    <p>Here's how to obtain each field required in your application.yml file:</p>

    <h4>SECRET_KEY</h4>
    <ul>
    <li>Generate a secure random string (can be any string of your choice)</li>
    <li>You can use Python to generate one: <code>python -c "import secrets; print(secrets.token_hex(16))"</code></li>
    </ul>

    <h4>CONNECTION_STRING</h4>
    <ul>
    <li>This appears to be set by default to "cluster0.jmi6a.mongodb.net"</li>
    <li>If using a different MongoDB Atlas cluster, you'll find this in your connection string</li>
    </ul>

    <h4>GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET</h4>
    <ol>
    <li>Go to the <a href="https://console.cloud.google.com/">Google Cloud Console</a></li>
    <li>Create a new project (or select an existing one)</li>
    <li>Navigate to "APIs & Services" > "Credentials"</li>
    <li>Click "Create Credentials" > "OAuth client ID"</li>
    <li>Configure the OAuth consent screen</li>
    <li>Select "Web application" as the application type</li>
    <li>Add authorized redirect URIs (e.g., http://localhost:3000/oauth/callback)</li>
    <li>Click "Create"</li>
    <li>You'll receive your Client ID and Client Secret</li>
    </ol>

    <h4>CONF_URL</h4>
    <ul>
    <li>This is already correctly set to the standard Google OpenID configuration URL</li>
    </ul>

    <h4>MongoDB Atlas Credentials (USERNAME, PASSWORD, CLUSTER_URL)</h4>
    <ol>
    <li>Sign up or log in to <a href="https://www.mongodb.com/cloud/atlas">MongoDB Atlas</a></li>
    <li>Create a new cluster or use an existing one</li>
    <li>Click "Connect" on your cluster</li>
    <li>Choose "Connect your application"</li>
    <li>The connection string will look like: <code>mongodb+srv://&lt;username&gt;:&lt;password&gt;@&lt;cluster-url&gt;/test?retryWrites=true&w=majority</code></li>
    <li>From this string:
        <ul>
        <li>USERNAME is your MongoDB Atlas user</li>
        <li>PASSWORD is your MongoDB Atlas user password</li>
        <li>CLUSTER_URL is the domain after the @ symbol (before the slash)</li>
        </ul>
    </li>
    </ol>

    <p><strong>Note:</strong> For local development with MongoDB running on your machine, you can set:</p>
    <ul>
    <li>USERNAME and PASSWORD to your local MongoDB credentials</li>
    <li>CLUSTER_URL can be empty or "localhost"</li>
    </ul>
    <br>
    </details>

    **Note that application.yml should remain private on your local machine.**
4. In app.py set 'host' string to your MongoDB Atlas connection string. Replace the username and password with {username} and {password} respectively
6. For testing through CI to function as expected, repository secrets will need to be added through the settings. Create individual secrets with the following keys/values:

    MONGO_USER: <MongoDB Atlas cluster username>
    MONGO_PASS: <MongoDB Atlas cluster password>

## License

The project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.

## How to Contribute?

Please see our CONTRIBUTING.md for instructions on how to contribute to the repository and assist us in improving the project.

## Team Members

- Abhinav Sharma
- Haven Brown
- Trent Wiens
