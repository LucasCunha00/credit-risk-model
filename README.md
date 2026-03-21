# Credit Risk Prediction System

Projeto de Machine Learning para predição de risco de inadimplência com base em dados reais de crédito. O sistema realiza pré-processamento, treinamento de modelo, avaliação de métricas e disponibiliza uma API para previsão em tempo real.

## Objetivo
Prever a probabilidade de inadimplência de um cliente a partir de informações de crédito e perfil financeiro.

## Tecnologias utilizadas
- Python
- Pandas
- NumPy
- Scikit-learn
- FastAPI
- Uvicorn
- Joblib

## Estrutura do projeto
```bash
credit-risk-model/
│
├── data/
│   ├── accepted_2007_to_2018Q4.csv
│   └── rejected_2007_to_2018Q4.csv
│
├── notebooks/
├── src/
│   ├── data_processing.py
│   ├── train_model.py
│   └── predict.py
│
├── api/
│   └── app.py
│
├── model.pkl
├── requirements.txt
└── README.md
```
## Etapas do projeto
1. Carregamento do dataset
2. Filtragem dos status relevantes de crédito
3. Criação da variável target
4. Tratamento de variáveis categóricas
5. Treinamento do modelo Random Forest
6. Avaliação com métricas de classificação
7. Salvamento do modelo treinado
8. Criação de API para inferência

## Resultado do modelo

Exemplo de desempenho obtido:

- Accuracy: 0.97
- Precision alta para ambas as classes
- Recall de 0.86 para casos de inadimplência


## Como executar o projeto
1. Criar e ativar ambiente virtual

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

2. Instalar dependências
```bash
pip install -r requirements.txt
```
3. Treinar o modelo
```bash
python src/train_model.py
```
4. Rodar a API
```bash
python -m uvicorn api.app:app --reload
```
5. Acessar documentação
Abra no navegador:
```bash
http://127.0.0.1:8000/docs
```
## Exemplo de predição

Exemplo de resposta da API:
{
  "prediction": 1,
  "default_probability": 0.86
}

## Possíveis melhorias futuras
- Balanceamento de classes
- Teste com XGBoost e LightGBM
- Deploy em nuvem
- Interface web para input de clientes
- Pipeline de treino mais robusto
