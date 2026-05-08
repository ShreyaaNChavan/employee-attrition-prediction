from flask import Flask, render_template, request
import joblib
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Model path
model_dir = r'C:\Users\admin\Desktop\Attrition\models'

# Load artifacts
model = joblib.load(os.path.join(model_dir, 'logistic_model.pkl'))
scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
columns = joblib.load(os.path.join(model_dir, 'model_columns.pkl'))


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])

# def predict():

#     # Collect form data
#     input_data = {
#         'Age': float(request.form['Age']),
#         'MonthlyIncome': float(request.form['MonthlyIncome']),
#         'DistanceFromHome': float(request.form['DistanceFromHome']),
#         'JobSatisfaction': float(request.form['JobSatisfaction']),
#         'WorkLifeBalance': float(request.form['WorkLifeBalance']),
#         'EnvironmentSatisfaction': float(request.form['EnvironmentSatisfaction']),
#         'YearsAtCompany': float(request.form['YearsAtCompany']),
#         'OverTime_Yes': 1 if request.form['OverTime'] == 'Yes' else 0,
#         'Gender_Male': 1 if request.form['Gender'] == 'Male' else 0
#     }

#     # DataFrame
#     input_df = pd.DataFrame([input_data])

#     # Align columns
#     input_df = input_df.reindex(columns=columns, fill_value=0)

#     # Scale
#     input_scaled = scaler.transform(input_df)

#     # Prediction
#     prediction = model.predict(input_scaled)[0]

#     # Probability
#     prob = model.predict_proba(input_scaled)[0]
#     stay_prob = prob[0] * 100
#     leave_prob = prob[1] * 100

#     # Recommendation logic
#     if prediction == 1:
#         result = f"""
# ⚠ Employee Likely to Leave

# Probability of Leaving: {leave_prob:.2f}%
# Probability of Staying: {stay_prob:.2f}%

# 💡 Recommendations:
# - Improve job and environment satisfaction through recognition programs and better workplace conditions.
# - Review salary and benefits to ensure competitiveness and reward loyalty.
# - Evaluate workload distribution and introduce flexible scheduling.
# - Conduct exit interviews to identify improvement areas.
# """
#     else:
#         result = f"""
# ✅ Employee Likely to Stay

# Probability of Staying: {stay_prob:.2f}%
# Probability of Leaving: {leave_prob:.2f}%

# 💡 Recommendation:
# - Maintain current engagement strategies and continue monitoring satisfaction levels.
# """

#     return render_template('index.html', prediction_text=result)

@app.route('/predict', methods=['POST'])
def predict():

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

    input_df = pd.DataFrame([input_data])
    input_df = input_df.reindex(columns=columns, fill_value=0)
    input_scaled = scaler.transform(input_df)

    prediction = model.predict(input_scaled)[0]
    prob = model.predict_proba(input_scaled)[0]

    leave_prob = float(prob[1])
    stay_prob = float(prob[0])

    # recommendations
    recs = []

    if leave_prob > 0.6:
        recs = [
            "Improve Job Satisfaction via recognition programs",
            "Re-evaluate workload distribution",
            "Conduct retention interviews",
            "Increase compensation competitiveness"
        ]
    else:
        recs = [
            "Maintain engagement programs",
            "Continue flexible work policies",
            "Monitor satisfaction trends"
        ]

    return {
        "prediction": int(prediction),
        "leave_prob": leave_prob,
        "stay_prob": stay_prob,
        "recommendations": recs
    }

if __name__ == "__main__":
    app.run(debug=True)