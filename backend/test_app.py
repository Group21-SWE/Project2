"""
Test module for the backend
"""
import hashlib
from io import BytesIO

import pytest
import json
import datetime
from flask_mongoengine import MongoEngine
from unittest.mock import patch, MagicMock
import yaml
from app import create_app, Users


# Pytest fixtures are useful tools for calling resources
# over and over, without having to manually recreate them,
# eliminating the possibility of carry-over from previous tests,
# unless defined as such.
# This fixture receives the client returned from create_app
# in app.py
@pytest.fixture
def client():
    """
    Creates a client fixture for tests to use

    :return: client fixture
    """
    app = create_app()
    with open("application.yml") as f:
        info = yaml.load(f, Loader=yaml.FullLoader)
        username = info["username"]
        password = info["password"]
        app.config["MONGODB_SETTINGS"] = {
            "db": "appTracker",
            "host": f"mongodb+srv://{username}:{password}@applicationtracker.287am.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        }
    db = MongoEngine()
    db.disconnect()
    db.init_app(app)
    client = app.test_client()
    yield client
    db.disconnect()


@pytest.fixture
def user(client):
    """
    Creates a user with test data

    :param client: the mongodb client
    :return: the user object and auth token
    """
    # print(request.data)
    data = {"username": "testUser", "password": "test", "fullName": "fullName"}

    user = Users.objects(username=data["username"])
    user.first()["applications"] = []
    user.first().save()
    rv = client.post("/users/login", json=data)
    jdata = json.loads(rv.data.decode("utf-8"))
    header = {"Authorization": "Bearer " + jdata["token"]}
    yield user.first(), header
    user.first()["applications"] = []
    user.first().save()


# 1. testing if the flask app is running properly
def test_alive(client):
    """
    Tests that the application is running properly

    :param client: mongodb client
    """
    rv = client.get("/")
    assert rv.data.decode("utf-8") == '{"message":"Server up and running"}\n'


# 2. testing if the search function running properly
def test_search(client):
    """
    Tests that the search is running properly

    :param client: mongodb client
    """
    rv = client.get("/search")
    jdata = json.loads(rv.data.decode("utf-8"))["label"]
    assert jdata == "successful test search"


# 3. testing if the application is getting data from database properly
def test_get_data(client, user):
    """
    Tests that using the application GET endpoint returns data

    :param client: mongodb client
    :param user: the test user object
    """
    user, header = user
    user["applications"] = []
    user.save()
    # without an application
    rv = client.get("/applications", headers=header)
    print(rv.data)
    assert rv.status_code == 200
    assert json.loads(rv.data) == []

    # with data
    application = {
        "jobTitle": "fakeJob12345",
        "companyName": "fakeCompany",
        "date": str(datetime.date(2021, 9, 23)),
        "status": "1",
    }
    user["applications"] = [application]
    user.save()
    rv = client.get("/applications", headers=header)
    print(rv.data)
    assert rv.status_code == 200
    assert json.loads(rv.data) == [application]


# 4. testing if the application is saving data in database properly
def test_add_application(client, mocker, user):
    """
    Tests that using the application POST endpoint saves data

    :param client: mongodb client
    :param user: the test user object
    """
    mocker.patch(
        # Dataset is in slow.py, but imported to main.py
        "app.get_new_user_id",
        return_value=-1,
    )
    user, header = user
    user["applications"] = []
    user.save()
    # mocker.patch(
    #     # Dataset is in slow.py, but imported to main.py
    #     'app.Users.save'
    # )
    rv = client.post(
        "/applications",
        headers=header,
        json={
            "application": {
                "jobTitle": "fakeJob12345",
                "companyName": "fakeCompany",
                "date": str(datetime.date(2021, 9, 23)),
                "status": "1",
            }
        },
    )
    assert rv.status_code == 200
    jdata = json.loads(rv.data.decode("utf-8"))["jobTitle"]
    assert jdata == "fakeJob12345"


# 5. testing if the application is updating data in database properly
def test_update_application(client, user):
    """
    Tests that using the application PUT endpoint functions

    :param client: mongodb client
    :param user: the test user object
    """
    user, auth = user
    application = {
        "id": 3,
        "jobTitle": "test_edit",
        "companyName": "test_edit",
        "date": str(datetime.date(2021, 9, 23)),
        "status": "1",
    }
    user["applications"] = [application]
    user.save()
    new_application = {
        "id": 3,
        "jobTitle": "fakeJob12345",
        "companyName": "fakeCompany",
        "date": str(datetime.date(2021, 9, 22)),
    }

    rv = client.put(
        "/applications/3", json={"application": new_application}, headers=auth
    )
    assert rv.status_code == 200
    jdata = json.loads(rv.data.decode("utf-8"))["jobTitle"]
    assert jdata == "fakeJob12345"


# 6. testing if the application is deleting data in database properly
def test_delete_application(client, user):
    """
    Tests that using the application DELETE endpoint deletes data

    :param client: mongodb client
    :param user: the test user object
    """
    user, auth = user

    application = {
        "id": 3,
        "jobTitle": "fakeJob12345",
        "companyName": "fakeCompany",
        "date": str(datetime.date(2021, 9, 23)),
        "status": "1",
    }
    user["applications"] = [application]
    user.save()

    rv = client.delete("/applications/3", headers=auth)
    jdata = json.loads(rv.data.decode("utf-8"))["jobTitle"]
    assert jdata == "fakeJob12345"


# 8. testing if the flask app is running properly with status code
def test_alive_status_code(client):
    """
    Tests that / returns 200

    :param client: mongodb client
    """
    rv = client.get("/")
    assert rv.status_code == 200


# Testing logging out does not return error
def test_logout(client, user):
    """
    Tests that using the logout function does not return an error

    :param client: mongodb client
    :param user: the test user object
    """
    user, auth = user
    rv = client.post("/users/logout", headers=auth)
    # assert no error occured
    assert rv.status_code == 200


def test_resume(client, mocker, user):
    """
    Tests that using the resume endpoint returns data

    :param client: mongodb client
    :param mocker: pytest mocker
    :param user: the test user object
    """
    mocker.patch(
        # Dataset is in slow.py, but imported to main.py
        "app.get_new_user_id",
        return_value=-1,
    )
    user, header = user
    user["applications"] = []
    user.save()
    data = dict(
        file=(BytesIO(b"testing resume"), "resume.txt"),
    )
    rv = client.post(
        "/resume", headers=header, content_type="multipart/form-data", data=data
    )
    assert rv.status_code == 200
    rv = client.get("/resume", headers=header)
    assert rv.status_code == 200

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_success(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "resume text"
    mock_reader.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader

    # Mock OpenAI API response
    with patch('requests.post') as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'choices': [{'message': {'content': '{"skill-building paths": ["path1"], "certifications": ["cert1"], "real-time job market trends": ["trend1"]}'}}]
        }

        response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
        assert response.status_code == 200
        assert json.loads(response.data) == {
            "skill-building paths": ["path1"],
            "certifications": ["cert1"],
            "real-time job market trends": ["trend1"]
        }

@patch('app.Users.objects')
def test_get_career_roadmap_no_resume(mock_user_objects, client):
    # Mock user with no resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b""
    mock_user_objects.first.return_value = mock_user

    response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 400
    assert json.loads(response.data) == {"message": "Please upload a resume"}

@patch('app.Users.objects')
def test_get_career_roadmap_user_not_found(mock_user_objects, client):
    # Mock user not found
    mock_user_objects.first.return_value = None

    response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 401

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_pdf_parsing_error(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader to raise an error
    mock_pdf_reader.side_effect = Exception("PDF parsing error")

    response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 500

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_openai_error(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "resume text"
    mock_reader.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader

    # Mock OpenAI API to return an error
    with patch('requests.post') as mock_post:
        mock_post.return_value.status_code = 500

        response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
        assert response.status_code == 500

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_invalid_json_response(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "resume text"
    mock_reader.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader

    # Mock OpenAI API to return invalid JSON
    with patch('requests.post') as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'choices': [{'message': {'content': 'invalid json'}}]
        }

        response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
        assert response.status_code == 500

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_missing_fields_in_response(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "resume text"
    mock_reader.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader

    # Mock OpenAI API to return JSON with missing fields
    with patch('requests.post') as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'choices': [{'message': {'content': '{"skill-building paths": ["path1"]}'}}]
        }

        response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
        assert response.status_code == 500

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_empty_response(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "resume text"
    mock_reader.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader

    # Mock OpenAI API to return empty response
    with patch('requests.post') as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'choices': [{'message': {'content': '{}'}}]
        }

        response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
        assert response.status_code == 500

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_invalid_response_format(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "resume text"
    mock_reader.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader

    # Mock OpenAI API to return invalid format
    with patch('requests.post') as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'choices': [{'message': {'content': 'not a json'}}]
        }

        response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
        assert response.status_code == 500

@patch('app.Users.objects')
@patch('app.PdfReader')
def test_get_career_roadmap_unexpected_error(mock_pdf_reader, mock_user_objects, client):
    # Mock user and resume
    mock_user = MagicMock()
    mock_user.resume.read.return_value = b"resume content"
    mock_user_objects.first.return_value = mock_user

    # Mock PDF reader
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "resume text"
    mock_reader.pages = [mock_page]
    mock_pdf_reader.return_value = mock_reader

    # Mock OpenAI API to raise an unexpected error
    with patch('requests.post') as mock_post:
        mock_post.side_effect = Exception("Unexpected error")

        response = client.get('/career_roadmap', headers={'Authorization': 'Bearer token'})
        assert response.status_code == 500

@patch('app.Users.objects')
def test_upload_profile_photo_success(mock_user_objects, client):
    # Mock user
    mock_user = MagicMock()
    mock_user.profilePhoto.read.return_value = b""
    mock_user_objects.first.return_value = mock_user

    # Mock file upload
    response = client.post('/profilePhoto', headers={'Authorization': 'Bearer token'}, data={'profilePhoto': (MagicMock(), 'test.jpg')})
    assert response.status_code == 200
    assert json.loads(response.data) == {"message": "Profile photo successfully uploaded"}

@patch('app.Users.objects')
def test_upload_profile_photo_replace_existing(mock_user_objects, client):
    # Mock user with existing photo
    mock_user = MagicMock()
    mock_user.profilePhoto.read.return_value = b"existing photo"
    mock_user_objects.first.return_value = mock_user

    # Mock file upload
    response = client.post('/profilePhoto', headers={'Authorization': 'Bearer token'}, data={'profilePhoto': (MagicMock(), 'test.jpg')})
    assert response.status_code == 200
    assert json.loads(response.data) == {"message": "Profile photo successfully replaced"}

@patch('app.Users.objects')
def test_upload_profile_photo_no_file(mock_user_objects, client):
    # Mock user
    mock_user = MagicMock()
    mock_user_objects.first.return_value = mock_user

    # No file uploaded
    response = client.post('/profilePhoto', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 400
    assert json.loads(response.data) == {"error": "No profile photo file found in the input"}

@patch('app.Users.objects')
def test_upload_profile_photo_user_not_found(mock_user_objects, client):
    # Mock user not found
    mock_user_objects.first.return_value = None

    response = client.post('/profilePhoto', headers={'Authorization': 'Bearer token'}, data={'profilePhoto': (MagicMock(), 'test.jpg')})
    assert response.status_code == 401

@patch('app.Users.objects')
def test_get_profile_photo_url_success(mock_user_objects, client):
    # Mock user with profile photo
    mock_user = MagicMock()
    mock_user.profilePhoto.read.return_value = b"photo content"
    mock_user.profilePhoto.filename = "test.jpg"
    mock_user.profilePhoto.content_type = "image/jpeg"
    mock_user_objects.first.return_value = mock_user

    response = client.get('/profilePhoto', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 200
    assert 'filename' in json.loads(response.data)
    assert 'contentType' in json.loads(response.data)
    assert 'image' in json.loads(response.data)

@patch('app.Users.objects')
def test_get_profile_photo_url_no_photo(mock_user_objects, client):
    # Mock user with no profile photo
    mock_user = MagicMock()
    mock_user.profilePhoto.read.return_value = b""
    mock_user_objects.first.return_value = mock_user

    response = client.get('/profilePhoto', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 404
    assert json.loads(response.data) == {"error": "No profile photo found"}

@patch('app.Users.objects')
def test_get_profile_photo_url_user_not_found(mock_user_objects, client):
    # Mock user not found
    mock_user_objects.first.return_value = None

    response = client.get('/profilePhoto', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 401

@patch('app.Users.objects')
def test_serve_profile_photo_success(mock_user_objects, client):
    # Mock user with profile photo
    mock_user = MagicMock()
    mock_user.profilePhoto.read.return_value = b"photo content"
    mock_user.profilePhoto.filename = "test.jpg"
    mock_user.profilePhoto.content_type = "image/jpeg"
    mock_user_objects.first.return_value = mock_user

    response = client.get('/profilePhoto/file', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 200
    assert response.headers['x-filename'] == "test.jpg"

@patch('app.Users.objects')
def test_serve_profile_photo_no_photo(mock_user_objects, client):
    # Mock user with no profile photo
    mock_user = MagicMock()
    mock_user.profilePhoto.read.return_value = b""
    mock_user_objects.first.return_value = mock_user

    response = client.get('/profilePhoto/file', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 404
    assert json.loads(response.data) == {"error": "No profile photo found"}

@patch('app.Users.objects')
def test_serve_profile_photo_user_not_found(mock_user_objects, client):
    # Mock user not found
    mock_user_objects.first.return_value = None

    response = client.get('/profilePhoto/file', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 401
