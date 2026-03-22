import os
import sys
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoanInput(BaseModel):
    loan_amnt: float = Field(..., gt=0, le=1_000_000, description="Valor do empréstimo")
    int_rate: float = Field(..., gt=0, le=100, description="Taxa de juros (%)")
    annual_inc: float = Field(..., gt=0, le=10_000_000, description="Renda anual")
    dti: float = Field(..., ge=0, le=100, description="Debt-to-income ratio")
    delinq_2yrs: int = Field(..., ge=0, le=100, description="Inadimplências nos últimos 2 anos")
    fico_range_low: float = Field(..., ge=300, le=850, description="Score FICO mínimo")
    open_acc: int = Field(..., ge=0, le=200, description="Contas abertas")
    pub_rec: int = Field(..., ge=0, le=100, description="Registros públicos negativos")
    revol_bal: float = Field(..., ge=0, description="Saldo rotativo")
    revol_util: float = Field(..., ge=0, le=150, description="Utilização do crédito rotativo (%)")
    total_acc: int = Field(..., ge=0, le=500, description="Total de contas")
    mort_acc: int = Field(..., ge=0, le=100, description="Contas de hipoteca")
    pub_rec_bankruptcies: int = Field(..., ge=0, le=20, description="Falências registradas")

    @field_validator("revol_util")
    @classmethod
    def revol_util_warning(cls, v):
        if v > 150:
            raise ValueError("revol_util não pode ultrapassar 150%")
        return v

    @field_validator("dti")
    @classmethod
    def dti_reasonable(cls, v):
        if v > 100:
            raise ValueError("dti acima de 100 é incomum — verifique o valor informado")
        return v


@app.get("/", tags=["Health"])
def home():
    return {"status": "ok", "message": "Credit Risk Prediction API is running"}


@app.get("/health", tags=["Health"])
def health():
    try:
        return {
            "status": "ok",
            "model": {
                "type": type(model).__name__,
                "n_estimators": getattr(model, "n_estimators", "N/A"),
                "max_depth": getattr(model, "max_depth", "N/A"),
                "n_features": len(feature_columns),
            },
            "api_version": app.version,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar saúde da API: {str(e)}")


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


@app.post("/explain", tags=["Prediction"])
def explain(data: LoanInput):
    try:
        import shap

        input_df = pd.DataFrame([data.model_dump()])
        input_df = pd.get_dummies(input_df, drop_first=True)
        input_df = input_df.reindex(columns=feature_columns, fill_value=0)

        explainer = shap.TreeExplainer(model)
        shap_output = explainer(input_df)

        # nova API do SHAP: shap_output.values tem shape (n_samples, n_features, n_classes)
        vals = shap_output.values[0, :, 1]  # sample 0, todas features, classe 1 (inadimplente)

        feature_imp = sorted(
            zip(feature_columns, vals),
            key=lambda x: abs(x[1]),
            reverse=True
        )[:5]

        return {
            "top_features": [
                {
                    "feature": name,
                    "importance": round(float(shap_val), 4),
                    "value": round(float(input_df[name].values[0]), 2),
                    "direction": "aumenta" if shap_val > 0 else "reduz"
                }
                for name, shap_val in feature_imp
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na explicação: {str(e)}")