from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# -------------------------------
# Dynamic model paths (deployment-safe)
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "models", "logistic_model.pkl")
scaler_path = os.path.join(BASE_DIR, "models", "scaler.pkl")
columns_path = os.path.join(BASE_DIR, "models", "model_columns.pkl")

# -------------------------------
# Load model artifacts
# -------------------------------
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)
columns = joblib.load(columns_path)


# -------------------------------
# Home Route
# -------------------------------
@app.route('/')
def home():
    return render_template('index.html')


# -------------------------------
# Prediction Route
# -------------------------------
@app.route('/predict', methods=['POST'])
def predict():

    try:
        # Collect form data
        input_data = {
            'Age': float(request.form['Age']),
            'MonthlyIncome': float(request.form['MonthlyIncome']),
            'DistanceFromHome': float(request.form['DistanceFromHome']),
            'JobSatisfaction': float(request.form['JobSatisfaction']),
            'WorkLifeBalance': float(request.form['WorkLifeBalance']),
            'EnvironmentSatisfaction': float(request.form['EnvironmentSatisfaction']),
            'YearsAtCompany': float(request.form['YearsAtCompany']),
            'OverTime_Yes': 1 if request.form['OverTime'] == 'Yes' else 0,
            'Gender_Male': 1 if request.form['Gender'] == 'Male' else 0
        }

        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])

        # Align columns with training data
        input_df = input_df.reindex(columns=columns, fill_value=0)

        # Scale input
        input_scaled = scaler.transform(input_df)

        # Prediction
        prediction = model.predict(input_scaled)[0]

        # Probabilities
        prob = model.predict_proba(input_scaled)[0]

        leave_prob = round(float(prob[1]) * 100, 2)
        stay_prob = round(float(prob[0]) * 100, 2)

        # Recommendations
        if leave_prob > 60:
            result_text = "Employee Likely to Leave"

            recommendations = [
                "Improve Job Satisfaction through recognition programs",
                "Review workload distribution and reduce burnout",
                "Conduct retention interviews with employees",
                "Improve compensation and employee benefits",
                "Provide career growth opportunities"
            ]

        else:
            result_text = "Employee Likely to Stay"

            recommendations = [
                "Maintain current engagement strategies",
                "Continue employee appreciation initiatives",
                "Monitor employee satisfaction regularly",
                "Support flexible work-life balance policies"
            ]

        # Return JSON response
        return jsonify({
            "prediction": int(prediction),
            "result": result_text,
            "leave_probability": leave_prob,
            "stay_probability": stay_prob,
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })


# -------------------------------
# Main
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)