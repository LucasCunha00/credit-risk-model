import os
import sys
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
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


class LoanInput(BaseModel):
    loan_amnt: float = Field(..., gt=0, le=1_000_000, description="Valor do empréstimo")
    int_rate: float = Field(..., gt=0, le=100, description="Taxa de juros (%)")
    annual_inc: float = Field(..., gt=0, le=10_000_000, description="Renda anual")
    dti: float = Field(..., ge=0, le=999, description="Debt-to-income ratio")
    delinq_2yrs: int = Field(..., ge=0, le=100, description="Inadimplências nos últimos 2 anos")
    fico_range_low: float = Field(..., ge=300, le=850, description="Score FICO mínimo")
    open_acc: int = Field(..., ge=0, le=200, description="Contas abertas")
    pub_rec: int = Field(..., ge=0, le=100, description="Registros públicos negativos")
    revol_bal: float = Field(..., ge=0, description="Saldo rotativo")
    revol_util: float = Field(..., ge=0, le=200, description="Utilização do crédito rotativo (%)")
    total_acc: int = Field(..., ge=0, le=500, description="Total de contas")
    mort_acc: int = Field(..., ge=0, le=100, description="Contas de hipoteca")
    pub_rec_bankruptcies: int = Field(..., ge=0, le=20, description="Falências registradas")

    @field_validator("revol_util")
    @classmethod
    def revol_util_warning(cls, v):
        # Valores acima de 100% são incomuns mas possíveis no dataset 
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
    """Retorna o status detalhado da API e informações sobre o modelo carregado."""
    try:
        model_type = type(model).__name__
        n_features = len(feature_columns)
        n_estimators = getattr(model, "n_estimators", "N/A")
        max_depth = getattr(model, "max_depth", "N/A")

        return {
            "status": "ok",
            "model": {
                "type": model_type,
                "n_estimators": n_estimators,
                "max_depth": max_depth,
                "n_features": n_features,
            },
            "api_version": app.version,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar saúde da API: {str(e)}")


@app.post("/predict", tags=["Prediction"])
def predict(data: LoanInput):
    """
    Recebe os dados do solicitante e retorna:
    - **prediction**: 0 = Adimplente, 1 = Inadimplente
    - **default_probability**: probabilidade estimada de inadimplência (0 a 1)
    - **label**: classificação textual
    """
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