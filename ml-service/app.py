# ml-service/app.py

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import io
from ultralytics import YOLO
import os
import json
import requests
from PIL import Image

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
model_path = os.path.join("models", "yolov8n.pt")
model = YOLO(model_path)

# Configure AI service for comments generation
AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "https://api.openai.com/v1/chat/completions")
AI_SERVICE_KEY = os.environ.get("AI_SERVICE_KEY", "")

@app.get("/")
def read_root():
    return {"message": "Oral Care ML Service"}

def generate_ai_comments(image_analysis):
    """Generate AI comments based on the oral image analysis."""
    try:
        prompt = f"""
        Based on the oral hygiene image analysis with a score of {image_analysis['score']}/100, 
        write approximately 150 words describing the oral health condition, key observations, 
        and care recommendations for a long-term care patient. 
        Focus on practical advice for caregivers.
        """
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AI_SERVICE_KEY}"
        }
        
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant specialized in oral healthcare for elderly and disabled patients."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 250,
            "temperature": 0.7
        }
        
        response = requests.post(AI_SERVICE_URL, headers=headers, json=payload)
        response_data = response.json()
        
        # Extract the comments from the response
        if "choices" in response_data and len(response_data["choices"]) > 0:
            comments = response_data["choices"][0]["message"]["content"].strip()
            return comments
        
        return "Unable to generate AI comments at this time."
    
    except Exception as e:
        print(f"Error generating AI comments: {str(e)}")
        return "Error generating AI comments. Please check the oral hygiene score and recommendations from the caregiver."

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    # Read the image
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Resize image to reduce processing time if it's large
    h, w = img.shape[:2]
    max_dim = 800
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
    
    # Process with YOLOv8
    results = model(img)
    
    # Process results and draw on image
    result_image = results[0].plot()
    
    # Calculate a single oral hygiene score (0-100)
    # This is a placeholder - implement your actual scoring logic
    # based on the detection results
    
    # Extract relevant metrics from detection results
    detections = results[0].boxes
    num_detections = len(detections)
    
    # Simplified scoring logic (example)
    # In a real implementation, you would use a more sophisticated algorithm
    # based on the specific oral health issues detected
    
    # For now, we'll use a placeholder scoring method
    base_score = 80  # Start with a baseline score
    deductions = min(60, num_detections * 5)  # Each detection reduces score
    
    oral_hygiene_score = max(0, base_score - deductions)
    
    # Prepare image analysis for AI comments
    image_analysis = {
        "score": oral_hygiene_score,
        "num_detections": num_detections
    }
    
    # Generate AI comments
    ai_comments = generate_ai_comments(image_analysis)
    
    # Compress the output image
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]  # 85% quality
    is_success, buffer = cv2.imencode(".jpg", result_image, encode_param)
    io_buf = io.BytesIO(buffer)
    
    # Return image with metrics in headers and caching
    response = Response(content=io_buf.getvalue(), media_type="image/jpeg")
    response.headers["X-Oral-Hygiene-Score"] = str(oral_hygiene_score)
    response.headers["X-AI-Comments"] = ai_comments
    response.headers["Cache-Control"] = "public, max-age=86400"  # 24 hours
    
    return response