from data_processing import load_data, preprocess_data
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

df = load_data("data/accepted_2007_to_2018Q4.csv")

print("Colunas:")
print(df.columns)

X, y = preprocess_data(df)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("\nResultado do modelo:")
print(classification_report(y_test, y_pred))

joblib.dump(model, "model.pkl")
print("\nModelo salvo com sucesso como model.pkl")