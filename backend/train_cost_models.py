import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import xgboost as xgb
from datetime import datetime

def train_cost_models():
    os.makedirs("app/ml_models/cost", exist_ok=True)
    
    # 1. Train Anomaly Detection (Isolation Forest)
    # Generate some dummy training data
    # Monthly cost features: energy, maintenance, security, water, vendor
    np.random.seed(42)
    normal_data = np.random.normal(loc=[840000, 420000, 310000, 120000, 480000], scale=[20000, 10000, 5000, 2000, 10000], size=(100, 5))
    anomalous_data = np.random.normal(loc=[1000000, 800000, 400000, 150000, 600000], scale=[30000, 30000, 20000, 10000, 30000], size=(5, 5))
    
    X_train = np.vstack([normal_data, anomalous_data])
    
    iso_forest = IsolationForest(contamination=0.05, random_state=42)
    iso_forest.fit(X_train)
    
    joblib.dump(iso_forest, "app/ml_models/cost/cost_anomaly_model.joblib")
    
    # 2. Train Forecasting Model (XGBoost)
    # Target is next month's total cost based on previous 3 months total cost (time series approximation)
    X_fore = np.random.normal(loc=2000000, scale=100000, size=(100, 3))
    y_fore = X_fore[:, -1] * 1.02 + np.random.normal(loc=0, scale=10000, size=100) # slight upward trend
    
    xgb_model = xgb.XGBRegressor(n_estimators=50, random_state=42)
    xgb_model.fit(X_fore, y_fore)
    
    joblib.dump(xgb_model, "app/ml_models/cost/cost_forecast_model.joblib")
    print("Cost models trained and saved to app/ml_models/cost/")

if __name__ == "__main__":
    train_cost_models()
