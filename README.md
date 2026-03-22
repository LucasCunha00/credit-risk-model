# 💳 Credit Risk Prediction System

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.x-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Pytest](https://img.shields.io/badge/Pytest-15%20passed-brightgreen?style=flat&logo=pytest)](https://pytest.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sistema de Machine Learning para **predição de risco de inadimplência** com base em dados reais de crédito (Lending Club, 2007–2018). O projeto cobre todo o pipeline — da ingestão e pré-processamento dos dados até uma API REST e um dashboard interativo com explicabilidade via SHAP.

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Resultados do Modelo](#-resultados-do-modelo)
- [Como Executar](#-como-executar)
- [Usando a API](#-usando-a-api)
- [Dashboard](#-dashboard)
- [Testes](#-testes)
- [Melhorias Futuras](#-melhorias-futuras)

---

## 🎯 Visão Geral

O objetivo deste projeto é prever a **probabilidade de inadimplência** de um cliente a partir de seu perfil financeiro e histórico de crédito. O modelo é treinado sobre dados reais, exposto via API REST e visualizado em um dashboard React com explicabilidade por predição via SHAP.

**Fluxo do projeto:**

```
Dados brutos → Pré-processamento → Treinamento → Avaliação → API REST → Dashboard
```

---

## 🏗 Arquitetura

```
credit-risk-model/
│
├── api/
│   └── app.py                  # API FastAPI (predict, explain, health)
│
├── src/
│   ├── data_processing.py      # Limpeza, filtragem e feature engineering
│   ├── train_model.py          # Treinamento e avaliação do modelo
│   └── predict.py              # Lógica de predição isolada
│
├── tests/
│   └── test_api.py             # Testes automatizados com pytest
│
├── dashboard/                  # Frontend React + Vite
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── PredictionForm.jsx
│           ├── ResultCard.jsx  # Inclui explicabilidade SHAP
│           ├── HistoryTable.jsx
│           └── ModelMetrics.jsx
│
├── data/                       # Datasets (não versionados — ver .gitignore)
│   ├── accepted_2007_to_2018Q4.csv
│   └── rejected_2007_to_2018Q4.csv
│
├── model.pkl                   # Modelo serializado após o treinamento
├── requirements.txt
├── .gitignore
└── README.md
```

---

## 🛠 Tecnologias

| Categoria        | Biblioteca                      |
|------------------|---------------------------------|
| Linguagem        | Python 3.10+                    |
| Manipulação      | Pandas, NumPy                   |
| Machine Learning | Scikit-learn                    |
| Explicabilidade  | SHAP                            |
| API              | FastAPI, Uvicorn                |
| Serialização     | Joblib                          |
| Frontend         | React, Vite, Tailwind CSS       |
| Gráficos         | Recharts                        |
| HTTP Client      | Axios                           |
| Testes           | Pytest, HTTPX                   |

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

### 7. Suba o dashboard

```bash
cd dashboard
npm install
npm run dev
```

Acesse em: http://localhost:5173

---

## 🔌 Usando a API

### Endpoints disponíveis

| Método | Endpoint    | Descrição                                       |
|--------|-------------|-------------------------------------------------|
| GET    | `/`         | Status básico da API                            |
| GET    | `/health`   | Status detalhado + informações do modelo        |
| POST   | `/predict`  | Realiza a predição de risco de crédito          |
| POST   | `/explain`  | Retorna explicabilidade SHAP por predição       |

---

### `GET /health`

```json
{
  "status": "ok",
  "model": {
    "type": "RandomForestClassifier",
    "n_estimators": 200,
    "max_depth": 10,
    "n_features": 253
  },
  "api_version": "1.0.0"
}
```

---

### `POST /predict`

#### Validações dos campos

| Campo                  | Tipo  | Restrições          |
|------------------------|-------|---------------------|
| `loan_amnt`            | float | > 0, ≤ 1.000.000   |
| `int_rate`             | float | > 0, ≤ 100         |
| `annual_inc`           | float | > 0, ≤ 10.000.000  |
| `dti`                  | float | ≥ 0, ≤ 100         |
| `delinq_2yrs`          | int   | ≥ 0, ≤ 100         |
| `fico_range_low`       | float | ≥ 300, ≤ 850       |
| `open_acc`             | int   | ≥ 0, ≤ 200         |
| `pub_rec`              | int   | ≥ 0, ≤ 100         |
| `revol_bal`            | float | ≥ 0                |
| `revol_util`           | float | ≥ 0, ≤ 150         |
| `total_acc`            | int   | ≥ 0, ≤ 500         |
| `mort_acc`             | int   | ≥ 0, ≤ 100         |
| `pub_rec_bankruptcies` | int   | ≥ 0, ≤ 20          |

#### Exemplo de resposta

```json
{
  "prediction": 1,
  "default_probability": 0.8223,
  "label": "Inadimplente"
}
```

---

### `POST /explain`

Retorna as **5 features que mais influenciaram aquela predição específica** via SHAP, com direção do impacto.

#### Exemplo de resposta

```json
{
  "top_features": [
    {
      "feature": "last_fico_range_low",
      "importance": 0.0535,
      "value": 0.0,
      "direction": "aumenta"
    },
    {
      "feature": "total_rec_prncp",
      "importance": -0.0421,
      "value": 0.0,
      "direction": "reduz"
    }
  ]
}
```

| Campo         | Descrição                                              |
|---------------|--------------------------------------------------------|
| `feature`     | Nome da feature                                        |
| `importance`  | Valor SHAP (contribuição para a predição)              |
| `value`       | Valor da feature naquela predição                      |
| `direction`   | `"aumenta"` ou `"reduz"` a probabilidade de inadimplência |

---

## 📊 Dashboard

Interface React com três seções:

**Predição** — formulário com os 13 campos do cliente, resultado com probabilidade, zona de risco e explicabilidade SHAP mostrando as 5 features mais influentes com direção (↑ aumenta / ↓ reduz risco).

**Histórico** — tabela com todas as predições da sessão, incluindo horário, resultado, probabilidade, FICO, valor do empréstimo, renda, DTI e taxa.

**Modelo** — informações do modelo carregado, métricas de treino, distribuição de adimplentes/inadimplentes da sessão e stats gerais.

---

## 🧪 Testes

Testes automatizados com pytest que rodam **sem precisar do `model.pkl`** (usa mock).

```bash
pip install pytest httpx
pytest tests/test_api.py -v
```

| Categoria           | Cobertura                                                      |
|---------------------|----------------------------------------------------------------|
| Health endpoints    | `/` e `/health`                                                |
| Predição            | Inadimplente, Adimplente, label correto                        |
| Validação de inputs | 9 cenários de input inválido + payload válido                  |

```
15 passed in 1.37s ✅
```

---

## 🚀 Melhorias Futuras

- Balanceamento de classes (SMOTE / class_weight)
- Teste com XGBoost e LightGBM
- Deploy em nuvem (Railway, Render ou AWS)
- Pipeline de treino com MLflow para rastreamento de experimentos

---

## 👤 Autor

**Lucas Cunha**  
[![GitHub](https://img.shields.io/badge/GitHub-LucasCunha00-181717?style=flat&logo=github)](https://github.com/LucasCunha00)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lucas%20Cunha-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucascunha2102)

---

> Projeto desenvolvido para fins de aprendizado e portfólio em Ciência de Dados e Engenharia de ML.