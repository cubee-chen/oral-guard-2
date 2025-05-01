# ml-service/app.py - Optimize image processing

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import io
from ultralytics import YOLO
import os
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

@app.get("/")
def read_root():
    return {"message": "Dental ML Service"}

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
    
    # Calculate metrics (this is a placeholder - you'd implement your actual logic)
    plaque_coverage = 30  # Example value between 0-1
    gingival_inflammation = 50  # Example value between 0-1
    tartar = 70  # Example value between 0-1
    
    # Compress the output image
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]  # 85% quality
    is_success, buffer = cv2.imencode(".jpg", result_image, encode_param)
    io_buf = io.BytesIO(buffer)
    
    # Return image with metrics in headers and caching
    response = Response(content=io_buf.getvalue(), media_type="image/jpeg")
    response.headers["X-Plaque-Coverage"] = str(plaque_coverage)
    response.headers["X-Gingival-Inflammation"] = str(gingival_inflammation)
    response.headers["X-Tartar"] = str(tartar)
    response.headers["Cache-Control"] = "public, max-age=86400"  # 24 hours
    
    return response