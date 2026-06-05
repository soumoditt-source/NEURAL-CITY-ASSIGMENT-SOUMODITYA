# Neural City Dashboard - Official Submission
**Candidate:** Soumoditya Das

### 1. Prototype Link
[https://neural-city-aqi-dashboard.vercel.app](https://neural-city-aqi-dashboard.vercel.app) *(Note: To be deployed via GitHub Actions)*
GitHub Repository: [https://github.com/soumoditt-source/neural-city-aqi-dashboard](https://github.com/soumoditt-source/neural-city-aqi-dashboard)

### 2. Public Dataset Used
CPCB (Central Pollution Control Board) Air Quality Data & Open-Meteo Historical Weather API.

### 3. 50 Words Note
I selected AQI and meteorological data because air pollution is a critical, invisible hazard. Integrating it into Neural City enables context-aware "Bio-Routing," empowering citizens to avoid hazardous zones and helping municipal officers identify highly polluted wards for targeted intervention. It transforms a standard dashboard into a life-saving tool.

### 4. Data Cleaning, Transformation, and Structuring
- **Collection:** Fetched raw historical telemetry (Temperature, Humidity, Wind Speed, AQI) and handled missing values using median imputation.
- **Transformation:** Applied standard scaling (`StandardScaler`) to normalize features for machine learning. 
- **Structuring:** Trained a highly optimized Scikit-Learn Random Forest model on the data. The model was then serialized and exported into the ONNX format (`aqi_forecast_model.onnx`). This allows the Next.js application to run deterministic, client-side inference utilizing the GPU natively (via WebGL), ensuring zero latency without relying on generic AI wrappers. Finally, the predicted and real-time structured data was mapped to GeoJSON coordinates for rendering massive 3D data pillars via Deck.gl.
