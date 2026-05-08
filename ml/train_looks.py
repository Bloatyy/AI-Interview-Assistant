import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import os

# Configuration
BASE_DATA_DIR = "data/looks"
MODEL_SAVE_DIR = "models"
BATCH_SIZE = 32
EPOCHS = 5 # Reduced for speed, can be increased
LEARNING_RATE = 0.001

# Dataset Specific Paths
DATA_PATHS = {
    "attire": {
        "train": os.path.join(BASE_DATA_DIR, "attire/data/train"),
        "val": os.path.join(BASE_DATA_DIR, "attire/data/valid")
    },
    "grooming": {
        "train": os.path.join(BASE_DATA_DIR, "grooming/Beard or No Beared/Train"),
        "val": os.path.join(BASE_DATA_DIR, "grooming/Beard or No Beared/Validate")
    }
}

def train_model(model_name, num_classes=2):
    print(f"\n--- Training {model_name.upper()} model ---")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Data Augmentation & Normalization
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # Load Datasets
    paths = DATA_PATHS.get(model_name)
    if not paths or not os.path.exists(paths['train']):
        print(f"Error: Data paths for {model_name} not found.")
        return

    image_datasets = {x: datasets.ImageFolder(paths[x], data_transforms[x])
                      for x in ['train', 'val']}
    
    print(f"Classes found: {image_datasets['train'].classes}")
    
    dataloaders = {x: DataLoader(image_datasets[x], batch_size=BATCH_SIZE, shuffle=True, num_workers=2)
                   for x in ['train', 'val']}
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
    
    # Model Setup (MobileNetV2)
    model = models.mobilenet_v2(pretrained=True)
    # Freeze backbone for initial training
    for param in model.parameters():
        param.requires_grad = False
    
    # Replace classifier
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier[1].parameters(), lr=LEARNING_RATE)

    # Training Loop
    best_acc = 0.0
    for epoch in range(EPOCHS):
        print(f'Epoch {epoch}/{EPOCHS - 1}')
        
        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                os.makedirs(MODEL_SAVE_DIR, exist_ok=True)
                save_path = os.path.join(MODEL_SAVE_DIR, f"{model_name}.pth")
                torch.save(model.state_dict(), save_path)
                print(f"Saved best model to {save_path}")

    print(f'Training complete. Best val Acc: {best_acc:4f}')

if __name__ == "__main__":
    # Train both models
    train_model("attire")
    train_model("grooming")
