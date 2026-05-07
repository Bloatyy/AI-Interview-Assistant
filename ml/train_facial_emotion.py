import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os

# Training script for Facial Emotion Recognition using FER2013
# Dataset expected at ml/data/fer2013

def train_emotion_model(data_dir, epochs=10, batch_size=64):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Data transformation
    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((48, 48)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    # Load dataset (assumes ImageFolder structure)
    train_dataset = datasets.ImageFolder(os.path.join(data_dir, 'train'), transform=transform)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    # Model architecture (Transfer learning with MobileNetV2 for efficiency)
    model = models.mobilenet_v2(pretrained=True)
    model.classifier[1] = nn.Linear(model.last_channel, 7) # 7 classes in FER2013
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Training loop
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
        
        print(f"Epoch {epoch+1}/{epochs}, Loss: {running_loss/len(train_loader)}")

    # Save model
    torch.save(model.state_dict(), "ml/models/emotion_model.pth")
    print("Model saved to ml/models/emotion_model.pth")

if __name__ == "__main__":
    # Ensure data directory exists
    dataset_path = r"C:\Users\USER\.cache\kagglehub\datasets\msambare\fer2013\versions\1"
    if os.path.exists(dataset_path):
        train_emotion_model(dataset_path)
    else:
        print(f"Dataset not found at {dataset_path}. Please check the path.")
