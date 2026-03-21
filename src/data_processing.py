import pandas as pd


def load_data(path):
    df = pd.read_csv(path, nrows=10000, low_memory=False)
    return df


def preprocess_data(df):
    # mantém apenas classes relevantes
    df = df[df["loan_status"].isin(["Fully Paid", "Charged Off"])].copy()

    # cria target
    df["target"] = (df["loan_status"] == "Charged Off").astype(int)

    # remove colunas desnecessárias
    drop_cols = ["id", "member_id", "url", "title", "loan_status"]
    df = df.drop(columns=[col for col in drop_cols if col in df.columns], errors="ignore")

    # separa features e target
    X = df.drop("target", axis=1)
    y = df["target"]

    # trata categóricas
    for col in X.select_dtypes(include="object").columns:
        X[col] = X[col].fillna("unknown")

    # one-hot encoding
    X = pd.get_dummies(X, drop_first=True)

    return X, y