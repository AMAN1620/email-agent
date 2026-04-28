import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from config import GOOGLE_CREDENTIALS_PATH, GOOGLE_TOKEN_PATH, GMAIL_SCOPES


def get_gmail_service():
    from googleapiclient.discovery import build

    creds = None
    if os.path.exists(GOOGLE_TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(GOOGLE_TOKEN_PATH, GMAIL_SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                GOOGLE_CREDENTIALS_PATH, GMAIL_SCOPES
            )
            creds = flow.run_local_server(port=0)
        with open(GOOGLE_TOKEN_PATH, "w") as token_file:
            token_file.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)
