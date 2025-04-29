from fastapi import FastAPI, UploadFile, File
from fastapi.responses import Response
import cv2
import numpy as np
import io
from ultralytics import YOLO
import os

app = FastAPI()

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
    
    # Process with YOLOv8
    results = model(img)
    
    # Process results and draw on image
    result_image = results[0].plot()
    
    # Calculate metrics (this is a placeholder - you'd implement your actual logic)
    # In a real app, you'd extract dental-specific metrics from the detection results
    plaque_coverage = 30  # Example value between 0-1
    gingival_inflammation = 50  # Example value between 0-1
    tartar = 70  # Example value between 0-1
    
    # Convert processed image to bytes
    is_success, buffer = cv2.imencode(".jpg", result_image)
    io_buf = io.BytesIO(buffer)
    
    # Return image with metrics in headers
    response = Response(content=io_buf.getvalue(), media_type="image/jpeg")
    response.headers["X-Plaque-Coverage"] = str(plaque_coverage)
    response.headers["X-Gingival-Inflammation"] = str(gingival_inflammation)
    response.headers["X-Tartar"] = str(tartar)
    print('test')
    return response