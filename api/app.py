import os
import sys

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

artifact = joblib.load(MODEL_PATH)
model = artifact["model"]
feature_columns = artifact["feature_columns"]

app = FastAPI(
    title="Credit Risk Prediction API",
    description="Prediz a probabilidade de inadimplência de um cliente.",
    version="1.0.0"
)


class LoanInput(BaseModel):
    loan_amnt: float = Field(..., gt=0, description="Valor do empréstimo")
    int_rate: float = Field(..., gt=0, description="Taxa de juros (%)")
    annual_inc: float = Field(..., gt=0, description="Renda anual")
    dti: float = Field(..., ge=0, description="Debt-to-income ratio")
    delinq_2yrs: int = Field(..., ge=0, description="Inadimplências nos últimos 2 anos")
    fico_range_low: float = Field(..., description="Score FICO mínimo")
    open_acc: int = Field(..., ge=0, description="Contas abertas")
    pub_rec: int = Field(..., ge=0, description="Registros públicos negativos")
    revol_bal: float = Field(..., ge=0, description="Saldo rotativo")
    revol_util: float = Field(..., ge=0, description="Utilização do crédito rotativo (%)")
    total_acc: int = Field(..., ge=0, description="Total de contas")
    mort_acc: int = Field(..., ge=0, description="Contas de hipoteca")
    pub_rec_bankruptcies: int = Field(..., ge=0, description="Falências registradas")


@app.get("/", tags=["Health"])
def home():
    return {"status": "ok", "message": "Credit Risk Prediction API is running"}


@app.post("/predict", tags=["Prediction"])
def predict(data: LoanInput):
    try:
        input_df = pd.DataFrame([data.model_dump()])
        input_df = pd.get_dummies(input_df, drop_first=True)
        input_df = input_df.reindex(columns=feature_columns, fill_value=0)

        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]

        return {
            "prediction": int(prediction),
            "default_probability": round(float(probability), 4),
            "label": "Inadimplente" if prediction == 1 else "Adimplente"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na predição: {str(e)}")
