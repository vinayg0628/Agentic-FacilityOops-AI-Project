import pandas as pd
import numpy as np
from xgboost import XGBRegressor

class CostForecaster:
    def __init__(self):
        self.model = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
        
    def fit(self, df: pd.DataFrame):
        """
        Expects a DataFrame with 'amount' and time features
        """
        if len(df) < 30:
            return
        
        # Prepare basic time features
        df['dayofweek'] = df['timestamp'].dt.dayofweek
        df['day'] = df['timestamp'].dt.day
        df['month'] = df['timestamp'].dt.month
        
        X = df[['dayofweek', 'day', 'month']]
        y = df['amount']
        
        self.model.fit(X, y)
        
    def predict(self, future_df: pd.DataFrame):
        if len(future_df) == 0:
            return np.array([])
            
        future_df['dayofweek'] = future_df['timestamp'].dt.dayofweek
        future_df['day'] = future_df['timestamp'].dt.day
        future_df['month'] = future_df['timestamp'].dt.month
        
        X = future_df[['dayofweek', 'day', 'month']]
        return self.model.predict(X)
