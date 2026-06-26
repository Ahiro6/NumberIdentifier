from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np

from ml.model import get_model


app = Flask(__name__)
CORS(app)

number_model = get_model()

@app.route('/predict', methods=['POST'])
def predict():
    
    data = request.get_json()
    
    if not data: return
        
    pixels = torch.tensor(np.array(data['pixels'], dtype=np.float32))
    width = data['width']
    height = data['height']
    
    with torch.no_grad():
        out = number_model(pixels, width, height).int().item()
        
    print(out)
        
    return jsonify({'digit': out})

if __name__ == '__main__': app.run(debug=True)