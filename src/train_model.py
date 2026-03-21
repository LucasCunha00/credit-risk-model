import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

from data_processing import load_data, preprocess_data


def train(data_path: str, model_output: str = "model.pkl", nrows: int = None) -> None:
    """
    Pipeline completo de treino:
    1. Carrega e pré-processa os dados
    2. Divide em treino/teste
    3. Treina o Random Forest
    4. Avalia e exibe métricas
    5. Salva o modelo e as colunas de treino juntos
    """
    print("Carregando dados...")
    df = load_data(data_path, nrows=nrows)

    print("Pré-processando...")
    X, y = preprocess_data(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Treino: {len(X_train)} amostras | Teste: {len(X_test)} amostras")
    print(f"Taxa de inadimplência: {y.mean():.2%}\n")

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        class_weight="balanced",   
        random_state=42,
        n_jobs=-1
    )

    print("Treinando modelo...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\nResultados do modelo:")
    print(classification_report(y_test, y_pred, target_names=["Adimplente", "Inadimplente"]))


    artifact = {
        "model": model,
        "feature_columns": list(X_train.columns)
    }
    joblib.dump(artifact, model_output)
    print(f"Modelo salvo em: {model_output}")


if __name__ == "__main__":
    train(
        data_path="data/accepted_2007_to_2018Q4.csv",
        model_output="model.pkl",
        nrows=None   # use ex: nrows=50000 para testes rápidos
    )
