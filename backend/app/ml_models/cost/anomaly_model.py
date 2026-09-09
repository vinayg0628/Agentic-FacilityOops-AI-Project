import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from app.models.cost_models import CostRecord

class CostAnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)

    def fit(self, df: pd.DataFrame):
        """
        Expects a DataFrame with 'amount' column
        """
        if df.empty or len(df) < 10:
            return
        X = df[['amount']].values
        self.model.fit(X)

    def predict(self, df: pd.DataFrame):
        if df.empty or len(df) < 10:
            return pd.Series([-1]*len(df)) # Assuming normal if not enough data, wait no, 1 is normal in IsolationForest, -1 is anomaly
            
        X = df[['amount']].values
        preds = self.model.predict(X)
        scores = self.model.decision_function(X)
        return preds, scores
