from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import json
import os
from typing import Dict, Any

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CV data
try:
    with open('cv.json', 'r') as f:
        cv_data = json.load(f)
except FileNotFoundError:
    cv_data = {}

# Load OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

class JobDescription(BaseModel):
    description: str

class GeneratePrompt(BaseModel):
    prompt: str

@app.post("/analyze-job")
async def analyze_job(job: JobDescription) -> Dict[str, Any]:
    try:
        # Create prompt for OpenAI
        prompt = f"""
        Given this job description: {job.description}
        
        And this CV data: {json.dumps(cv_data)}
        
        Analyze the job requirements and match them with the candidate's experience.
        Return a JSON with:
        1. Match percentage
        2. Key matching skills
        3. Areas where experience aligns
        4. Suggested focus points for cover letter
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        return json.loads(response.choices[0].message.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-response")
async def generate_response(prompt: GeneratePrompt) -> Dict[str, Any]:
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt.prompt}]
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=5000)
