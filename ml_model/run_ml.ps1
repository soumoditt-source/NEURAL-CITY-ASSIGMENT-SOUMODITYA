python -m venv venv
.\venv\Scripts\activate
pip install pandas scikit-learn skl2onnx numpy onnx
python train_aqi_model.py
