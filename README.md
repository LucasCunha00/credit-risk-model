# 💳 Credit Risk Prediction System

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.x-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Pytest](https://img.shields.io/badge/Pytest-15%20passed-brightgreen?style=flat&logo=pytest)](https://pytest.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sistema de Machine Learning para **predição de risco de inadimplência** com base em dados reais de crédito (Lending Club, 2007–2018). O projeto cobre todo o pipeline — da ingestão e pré-processamento dos dados até a disponibilização de uma API REST para inferência em tempo real.

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Resultados do Modelo](#-resultados-do-modelo)
- [Como Executar](#-como-executar)
- [Usando a API](#-usando-a-api)
- [Testes](#-testes)
- [Melhorias Futuras](#-melhorias-futuras)

---

## 🎯 Visão Geral

O objetivo deste projeto é prever a **probabilidade de inadimplência** de um cliente a partir de seu perfil financeiro e histórico de crédito. O modelo é treinado sobre dados reais e exposto via API, permitindo integrações com sistemas externos.

**Fluxo do projeto:**

```
Dados brutos → Pré-processamento → Treinamento → Avaliação → API REST
```

---

## 🏗 Arquitetura

```
credit-risk-model/
│
├── api/
│   └── app.py              # API FastAPI para inferência em tempo real
│
├── src/
│   ├── data_processing.py  # Limpeza, filtragem e feature engineering
│   ├── train_model.py      # Treinamento e avaliação do modelo
│   └── predict.py          # Lógica de predição isolada
│
├── tests/
│   └── test_api.py         # Testes automatizados com pytest
│
├── data/                   # Datasets (não versionados — ver .gitignore)
│   ├── accepted_2007_to_2018Q4.csv
│   └── rejected_2007_to_2018Q4.csv
│
├── model.pkl               # Modelo serializado após o treinamento
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🛠 Tecnologias

| Categoria       | Biblioteca              |
|-----------------|-------------------------|
| Linguagem       | Python 3.10+            |
| Manipulação     | Pandas, NumPy           |
| Machine Learning| Scikit-learn            |
| API             | FastAPI, Uvicorn        |
| Serialização    | Joblib                  |
| Testes          | Pytest, HTTPX           |

---

## 📊 Resultados do Modelo

O modelo treinado é um **Random Forest Classifier** com os seguintes resultados no conjunto de teste:

| Métrica                  | Valor                    |
|--------------------------|--------------------------|
| Accuracy                 | 0.97                     |
| Precision                | Alta (ambas as classes)  |
| Recall (inadimplência)   | 0.86                     |

> Os dados utilizados são do dataset público do Lending Club, cobrindo operações de crédito de 2007 a 2018.

---

## ▶️ Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/LucasCunha00/credit-risk-model.git
cd credit-risk-model
```

### 2. Crie e ative o ambiente virtual

```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python -m venv .venv
source .venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Adicione os dados

Baixe os arquivos do [Lending Club Dataset](https://www.kaggle.com/wordsforthewise/lending-club) e coloque-os na pasta `data/`:

```
data/
├── accepted_2007_to_2018Q4.csv
└── rejected_2007_to_2018Q4.csv
```

### 5. Treine o modelo

```bash
python src/train_model.py
```

Isso irá gerar o arquivo `model.pkl` na raiz do projeto.

### 6. Suba a API

```bash
python -m uvicorn api.app:app --reload
```

Acesse a documentação interativa em: http://127.0.0.1:8000/docs

---

## 🔌 Usando a API

### Endpoints disponíveis

| Método | Endpoint   | Descrição                                  |
|--------|------------|--------------------------------------------|
| GET    | `/`        | Status básico da API                       |
| GET    | `/health`  | Status detalhado + informações do modelo   |
| POST   | `/predict` | Realiza a predição de risco de crédito     |

---

### `GET /health`

Retorna o status da API e informações sobre o modelo carregado.

#### Exemplo de resposta

```json
{
  "status": "ok",
  "model": {
    "type": "RandomForestClassifier",
    "n_estimators": 200,
    "max_depth": 10,
    "n_features": 13
  },
  "api_version": "1.0.0"
}
```

---

### `POST /predict`

Recebe o perfil financeiro do cliente e retorna a predição de inadimplência.

#### Validações dos campos

| Campo                 | Tipo  | Restrições                          |
|-----------------------|-------|-------------------------------------|
| `loan_amnt`           | float | > 0, ≤ 1.000.000                   |
| `int_rate`            | float | > 0, ≤ 100                         |
| `annual_inc`          | float | > 0, ≤ 10.000.000                  |
| `dti`                 | float | ≥ 0, ≤ 100                         |
| `delinq_2yrs`         | int   | ≥ 0, ≤ 100                         |
| `fico_range_low`      | float | ≥ 300, ≤ 850                       |
| `open_acc`            | int   | ≥ 0, ≤ 200                         |
| `pub_rec`             | int   | ≥ 0, ≤ 100                         |
| `revol_bal`           | float | ≥ 0                                |
| `revol_util`          | float | ≥ 0, ≤ 150                         |
| `total_acc`           | int   | ≥ 0, ≤ 500                         |
| `mort_acc`            | int   | ≥ 0, ≤ 100                         |
| `pub_rec_bankruptcies`| int   | ≥ 0, ≤ 20                          |

#### Exemplo de requisição

```json
{
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
  "pub_rec_bankruptcies": 0
}
```

#### Exemplo de resposta

```json
{
  "prediction": 1,
  "default_probability": 0.8223,
  "label": "Inadimplente"
}
```

| Campo                | Descrição                                          |
|----------------------|----------------------------------------------------|
| `prediction`         | `0` = Adimplente / `1` = Inadimplente              |
| `default_probability`| Probabilidade estimada de inadimplência (0 a 1)    |
| `label`              | Classificação textual: `Adimplente` ou `Inadimplente` |

---

## 🧪 Testes

O projeto inclui testes automatizados com **pytest** que rodam sem precisar do `model.pkl` (usando mock do modelo).

### Instalar dependências de teste

```bash
pip install pytest httpx
```

### Rodar os testes

```bash
pytest tests/test_api.py -v
```

### Cobertura dos testes (15 testes)

| Categoria             | Testes                                                        |
|-----------------------|---------------------------------------------------------------|
| Health endpoints      | `/` retorna ok, `/health` retorna info do modelo              |
| Predição              | Inadimplente, Adimplente, label correto                       |
| Validação de inputs   | loan_amnt negativo/zero, int_rate > 100, fico fora do range, revol_util > 150, dti > 100, delinq negativo, campo faltando, payload válido |

```
15 passed in 1.37s ✅
```

---

## 🚀 Melhorias Futuras

- Balanceamento de classes (SMOTE / class_weight)
- Teste com XGBoost e LightGBM
- Deploy em nuvem (Railway, Render ou AWS)
- Interface web para input de clientes
- Pipeline de treino com MLflow para rastreamento de experimentos

---

## 👤 Autor

**Lucas Cunha**  
[![GitHub](https://img.shields.io/badge/GitHub-LucasCunha00-181717?style=flat&logo=github)](https://github.com/LucasCunha00)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lucas%20Cunha-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucascunha2102)

---

> Projeto desenvolvido para fins de aprendizado e portfólio em Ciência de Dados e Engenharia de ML.
