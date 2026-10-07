from ultralytics import YOLO

model = YOLO("runs/detect/train-5/weights/best.pt")

results = model(
    r"../datasets/roboflow_dataset/roboflow_dataset/test/images/img-3_jpg.rf.120e258c22a7af2e2731ef49f69cfe02.jpg"
)

for r in results:
    print("Classes:", r.boxes.cls)
    print("Confidence:", r.boxes.conf)