from google import genai
from google.genai.types import Tool, GoogleSearch, GenerateContentConfig, UploadFileConfig
from fastapi import FastAPI, Cookie, Response
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from uuid import uuid4
import mimetypes
import os

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

app = FastAPI()
client = genai.Client(api_key=GEMINI_API_KEY)
google_search_tool = Tool(
    google_search = GoogleSearch()
)

SYSTEM_PROMPT = """
You are Kai Wei's helpful assistant that answers questions about Kai.

Kai is looking for a job. You are given Kai's resume, his LinkedIn profile (https://www.linkedin.com/in/kaiwei/) and some other files that describe what Kai is like as a person and as a software engineer. Base your answers on these provided documents, but advocate for you as much as you without being untruthful.

Use the information provided in the files to answer questions about Kai. Where necessary, search the web to augment the information you find in the files.

When given a question, first decide whether it's relevant to Kai or not. If it is not relevant to Kai, decline to answer politely.

If the user asks for information that may change over time (such as today's date, current events, or recent news), use the web search tool to find the most up-to-date answer.

In your responses, do NOT say "based on the provided documents".

In your responses, do NOT cite text from the files literally. Instead, rephrase them.

If you don't know the answer to a question, just say so politely and don't make up stuff.

Format your responses nicely. Use bullet points where appropriate.
"""

# Serve React static files
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/")
def serve_react_index():
    return FileResponse("dist/index.html")

# Store chat sessions in memory
sessions = {}

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(chat_request: ChatRequest, response: Response, session_id: str = Cookie(None)):
    if not session_id or session_id not in sessions:
        session_id = str(uuid4())
        print(f"Creating new session: {session_id}")
        # Get all Gemini file objects to pass to the chat instance
        gemini_files = list(client.files.list())
        print(f"Gemini files: {len(gemini_files)}")
        sessions[session_id] = chat = client.chats.create(
            model="gemini-2.5-flash-preview-04-17",
            config=GenerateContentConfig(
                tools=[google_search_tool],
            ),
        )
        response.set_cookie(key="session_id", value=session_id, httponly=True, samesite="lax", path="/")
        response_obj = chat.send_message([SYSTEM_PROMPT] + gemini_files + [chat_request.message])
        return {"response": response_obj.text}
    
    chat = sessions[session_id]
    response_obj = chat.send_message(message=chat_request.message)
    return {"response": response_obj.text}

# Upload files to Gemini if necessary
def setup():
    # for f in client.files.list():
    #     print(f"Deleting file: {f.display_name}")
    #     client.files.delete(name=f.name)
    kb_dir = "knowledge_base"
    if not os.path.exists(kb_dir):
        print(f"Knowledge base directory '{kb_dir}' does not exist.")
        return
    local_files = [os.path.join(kb_dir, f) for f in os.listdir(kb_dir) if os.path.isfile(os.path.join(kb_dir, f))]
    gemini_files = {f.display_name for f in client.files.list()}
    for file_path in local_files:
        file_name = os.path.basename(file_path)
        if file_name not in gemini_files:
            print(f"Uploading {file_name} to Gemini...")
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = "application/pdf"
            with open(file_path, "rb") as f:
                client.files.upload(file=f, config=UploadFileConfig(display_name=file_name, mime_type=mime_type))
        else:
            print(f"{file_name} already uploaded to Gemini.")

setup()

