import torch.nn as nn
import torch.optim as optim
import torch
import torchvision.transforms.functional as TF

import numpy as np
from PIL import Image
import base64
import io

import onnx

from pathlib import Path


def preprocess(x, width, height) -> torch.Tensor:
    
    x = x.reshape(1, height, width, 4)

    x = x[:, :, :, :3]
    x = x.float() / 255.0

    # NHWC -> NCHW [1, 3, H, W]
    x = x.permute(0, 3, 1, 2)
    
    x = 0.299 * x[:, 0:1] + 0.587 * x[:, 1:2] + 0.114 * x[:, 2:3]
    x = x.repeat(1, 3, 1, 1)
    
    mean = torch.tensor([0.5, 0.5, 0.5]).view(1, 3, 1, 1)
    std = torch.tensor([0.5, 0.5, 0.5]).view(1, 3, 1, 1)
    x = (x - mean) / std

    x = TF.resize(x, [28, 28])
    
    return x

def get_device():
    
    return torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def prepare(name, in_path, out_path, width, height):
    
    device = get_device()
    
    model = SimpleModel.load(in_path + name + '.pt', device)
    model.eval()
    
    preModel = PreprocessModel(model, width, height)
    preModel.eval()
    
    dummy_inp = torch.randint(0, 255, (1, width, height, 4), dtype=torch.float32)   
    
    torch.onnx.export(
        preModel,
        dummy_inp,
        out_path + name + '.onnx',
        input_names=['input'],
        output_names=['output']
    )
    
    model = onnx.load(out_path + name + '.onnx')
    onnx.save(model, out_path + name + '_single' + ".onnx", save_as_external_data=False)


def get_model(name='number_model', in_path='./ml/files/', ):
    
    device = get_device()
    
    model = SimpleModel.load(in_path + name + '.pt', device)
    model.eval()
    
    preModel = PreprocessModel(model)
    preModel.eval()
    
    return preModel


class SimpleModel(nn.Module):
    def __init__(self, device):
        super().__init__()
        self.device = device
        
        self.flatten = nn.Flatten()
        self.seq1 = nn.Sequential(
            nn.Conv2d(3, 30, 5),
            nn.ReLU(),
            nn.MaxPool2d(2, 2)
        )
        self.seq2 = nn.Sequential(
            nn.Conv2d(30, 60, 5),
            nn.ReLU(),
            nn.MaxPool2d(2, 2)
        )
        
        self.seq3 = nn.Sequential(
            nn.Linear(4*4*60, 120),
            nn.ReLU(),
            nn.Linear(120, 200),
            nn.ReLU(),
            nn.Linear(200, 10),
            nn.Softmax(dim=1)
        )
        
        self.optim = optim.SGD(self.parameters(), lr=0.01)
        
    def forward(self, inp):
        x = self.seq1(inp)
        x = self.seq2(x)
        x = torch.flatten(x, 1)
        x = self.seq3(x)
        
        return x
    
    def predict(self, loader):
        
        preds = []
        y = []
        
        self.eval()
        
        with torch.no_grad():
            for i, (X_batch, y_batch) in enumerate(loader, 0):
                X_batch = X_batch.to(self.device)
                y_batch = y_batch.to(self.device)
                
                preds.extend(torch.max(self.forward(X_batch), dim=1)[1].tolist())
                y.extend(y_batch.tolist())
                
        self.train()
        
        preds = torch.tensor(preds).to(self.device)
        y = torch.tensor(y).to(self.device)
        
        return preds, y
    
    def loss(self, pred, y):
        self.loss_func = nn.CrossEntropyLoss()
        
        return self.loss_func(pred, y)
        
    def _generate_batches(self, X, y, batch_size=32):
        
        for i in range(0, X.shape[0], batch_size):
            X_batch, y_batch = X[i:i+batch_size], y[i:i+batch_size]
            
            yield X_batch, y_batch
        
    def step(self, X, y):
        
        self.optim.zero_grad()
        
        pred = self.forward(X)
        
        loss = self.loss(pred, y)
        loss.backward()
        
        self.optim.step()
        
        return loss
        
    def fit(self, train_loader, test_loader=None, epochs=5, eval=False, eval_every=1):
        
        for e in range(epochs):
            
            running_tot = 0.0
            for i, (X_batch, y_batch) in enumerate(train_loader, 0):  
                X_batch = X_batch.to(self.device)
                y_batch = y_batch.to(self.device)          
                
                loss = self.step(X_batch, y_batch)
                running_tot += loss.item()
                
            if eval:
                preds, y = self.predict(test_loader)
                print(f'{e}:{running_tot}:{SimpleModel.compute_accuracy(preds, y)}')
            
    def save(self, path):
        torch.save(self.state_dict(), path)
        
    def load(path, device):
        model = SimpleModel(device).to(device)
        
        model.load_state_dict(torch.load(path, weights_only=True))
        
        return model
    
    def compute_accuracy(preds, y):
        correct = (preds == y).sum().item()
        
        return correct / y.size(0)
    
    
class PreprocessModel(nn.Module):
    
    def __init__(self, model, width, height):
        
        super().__init__()
        
        self.model = model
        self.width = width
        self.height = height
    
    def __init__(self, model):
        
        super().__init__()
        
        self.model = model
    
    def forward(self, inp, width=None, height=None):
        
        if width is None:
            width = self.width
        if height is None:
            height = self.height
        
        x = preprocess(inp, width, height).to(self.model.device)
        
        pred = self.model(x)
        
        pred = torch.max(pred, dim=1)[1]
        
        return pred