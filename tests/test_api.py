"""
Testes da Credit Risk Prediction API.
Usa mock do modelo — NÃO é necessário treinar nem ter o model.pkl.

Como rodar:
    pip install pytest httpx
    pytest tests/test_api.py -v
"""

import sys
import os
import pytest
import numpy as np
from unittest.mock import MagicMock, patch

# Garante que o projeto está no path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


# Fixture: mock do artifact (model.pkl) carregado no startup da app

MOCK_FEATURE_COLUMNS = [
    "loan_amnt", "int_rate", "annual_inc", "dti", "delinq_2yrs",
    "fico_range_low", "open_acc", "pub_rec", "revol_bal", "revol_util",
    "total_acc", "mort_acc", "pub_rec_bankruptcies"
]

def make_mock_model(prediction: int = 1, probability: float = 0.82):
    mock = MagicMock()
    mock.predict.return_value = np.array([prediction])
    mock.predict_proba.return_value = np.array([[1 - probability, probability]])
    mock.n_estimators = 200
    mock.max_depth = 10
    return mock


@pytest.fixture
def client():
    """Cria o TestClient com o modelo mockado — sem carregar model.pkl."""
    mock_model = make_mock_model()
    mock_artifact = {
        "model": mock_model,
        "feature_columns": MOCK_FEATURE_COLUMNS,
    }

    with patch("joblib.load", return_value=mock_artifact):
        from fastapi.testclient import TestClient
        # Reimporta o app após o patch
        import importlib
        import api.app as app_module
        importlib.reload(app_module)
        yield TestClient(app_module.app)


VALID_PAYLOAD = {
    "loan_amnt": 15000,
    "int_rate": 13.5,
    "annual_inc": 65000,
    "dti": 18.4,
    "delinq_2yrs": 0,
    "fico_range_low": 680,
    "open_acc": 10,
    "pub_rec": 0,
    "revol_bal": 12000,
    "revol_util": 45.0,
    "total_acc": 22,
    "mort_acc": 1,
    "pub_rec_bankruptcies": 0,
}



# Testes de saúde


class TestHealthEndpoints:
    def test_root_returns_ok(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_health_returns_model_info(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "model" in data
        assert data["model"]["n_features"] == len(MOCK_FEATURE_COLUMNS)
        assert data["model"]["type"] == "MagicMock"



# Testes do endpoint /predict


class TestPredictEndpoint:
    def test_predict_inadimplente(self, client):
        response = client.post("/predict", json=VALID_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        assert "prediction" in data
        assert "default_probability" in data
        assert "label" in data
        assert data["prediction"] in (0, 1)
        assert 0.0 <= data["default_probability"] <= 1.0

    def test_label_inadimplente(self, client):
        response = client.post("/predict", json=VALID_PAYLOAD)
        data = response.json()
        if data["prediction"] == 1:
            assert data["label"] == "Inadimplente"
        else:
            assert data["label"] == "Adimplente"

    def test_predict_adimplente(self, client):
        """Testa com mock retornando predição 0 (adimplente)."""
        mock_model = make_mock_model(prediction=0, probability=0.12)
        mock_artifact = {"model": mock_model, "feature_columns": MOCK_FEATURE_COLUMNS}

        with patch("joblib.load", return_value=mock_artifact):
            import importlib
            import api.app as app_module
            importlib.reload(app_module)
            from fastapi.testclient import TestClient
            local_client = TestClient(app_module.app)

        response = local_client.post("/predict", json=VALID_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        assert data["prediction"] == 0
        assert data["label"] == "Adimplente"
        assert data["default_probability"] == 0.12



# Testes de validação de inputs


class TestInputValidation:
    def _bad_payload(self, **overrides):
        return {**VALID_PAYLOAD, **overrides}

    def test_negative_loan_amnt(self, client):
        response = client.post("/predict", json=self._bad_payload(loan_amnt=-1))
        assert response.status_code == 422

    def test_zero_loan_amnt(self, client):
        response = client.post("/predict", json=self._bad_payload(loan_amnt=0))
        assert response.status_code == 422

    def test_int_rate_above_100(self, client):
        response = client.post("/predict", json=self._bad_payload(int_rate=150))
        assert response.status_code == 422

    def test_fico_below_300(self, client):
        response = client.post("/predict", json=self._bad_payload(fico_range_low=100))
        assert response.status_code == 422

    def test_fico_above_850(self, client):
        response = client.post("/predict", json=self._bad_payload(fico_range_low=900))
        assert response.status_code == 422

    def test_revol_util_above_150(self, client):
        response = client.post("/predict", json=self._bad_payload(revol_util=200))
        assert response.status_code == 422

    def test_dti_above_100(self, client):
        response = client.post("/predict", json=self._bad_payload(dti=150))
        assert response.status_code == 422

    def test_negative_delinq(self, client):
        response = client.post("/predict", json=self._bad_payload(delinq_2yrs=-1))
        assert response.status_code == 422

    def test_missing_field(self, client):
        payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "loan_amnt"}
        response = client.post("/predict", json=payload)
        assert response.status_code == 422

    def test_valid_payload_accepted(self, client):
        response = client.post("/predict", json=VALID_PAYLOAD)
        assert response.status_code == 200