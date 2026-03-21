import pandas as pd


EXPECTED_COLUMNS = [
    "loan_amnt", "int_rate", "annual_inc", "dti",
    "delinq_2yrs", "fico_range_low", "open_acc", "pub_rec",
    "revol_bal", "revol_util", "total_acc", "mort_acc",
    "pub_rec_bankruptcies", "loan_status"
]

DROP_COLS = ["id", "member_id", "url", "title", "loan_status"]


def load_data(path: str, nrows: int = None) -> pd.DataFrame:
    """Carrega o dataset CSV. Use nrows para limitar linhas em desenvolvimento."""
    df = pd.read_csv(path, nrows=nrows, low_memory=False)

    missing = [col for col in EXPECTED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(f"Colunas ausentes no dataset: {missing}")

    return df


def preprocess_data(df: pd.DataFrame, max_cardinality: int = 30) -> tuple[pd.DataFrame, pd.Series]:
    """
    Realiza o pré-processamento completo:
    - Filtra status relevantes
    - Cria variável target
    - Remove colunas desnecessárias
    - Trata valores nulos (numéricos e categóricos)
    - Aplica one-hot encoding
    """
    # filtra apenas status relevantes
    df = df[df["loan_status"].isin(["Fully Paid", "Charged Off"])].copy()

    # cria target binário
    df["target"] = (df["loan_status"] == "Charged Off").astype(int)

    # remove colunas desnecessárias
    df = df.drop(columns=[col for col in DROP_COLS if col in df.columns])

    # separa features e target
    X = df.drop("target", axis=1)
    y = df["target"]

    # remove categóricas com alta cardinalidade (ex: descrições livres, CEPs)
    categorical_cols = X.select_dtypes(include="object").columns
    high_cardinality = [col for col in categorical_cols if X[col].nunique() > max_cardinality]
    if high_cardinality:
        print(f"Removendo {len(high_cardinality)} colunas com alta cardinalidade: {high_cardinality}")
    X = X.drop(columns=high_cardinality)

    # trata nulos numéricos com mediana
    numeric_cols = X.select_dtypes(include=["number"]).columns
    for col in numeric_cols:
        if X[col].isnull().any():
            X[col] = X[col].fillna(X[col].median())

    # trata nulos categóricos restantes
    categorical_cols = X.select_dtypes(include="object").columns
    for col in categorical_cols:
        X[col] = X[col].fillna("unknown")

    # one-hot encoding
    X = pd.get_dummies(X, drop_first=True)

    return X, y