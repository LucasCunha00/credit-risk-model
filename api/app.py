from fastapi import FastAPI
import joblib
import pandas as pd
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))
from data_processing import load_data, preprocess_data

app = FastAPI(title="Credit Risk Prediction API")

model = joblib.load("model.pkl")

df = load_data("data/accepted_2007_to_2018Q4.csv")
X, y = preprocess_data(df)
feature_columns = X.columns


@app.get("/")
def home():
    return {"message": "Credit Risk Prediction API is running"}


@app.post("/predict")
def predict(sample: dict):
    input_df = pd.DataFrame([sample])

    for col in input_df.select_dtypes(include="object").columns:
        input_df[col] = input_df[col].fillna("unknown")

    input_df = pd.get_dummies(input_df, drop_first=True)
    input_df = input_df.reindex(columns=feature_columns, fill_value=0)

    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]

    return {
        "prediction": int(prediction),
        "default_probability": float(probability)
    }