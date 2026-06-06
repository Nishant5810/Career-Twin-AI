import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ml_service import ml_service

client = TestClient(app)

def test_health_check():
    """Verify that the API health check endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "Career Twin AI Backend"}

def test_ml_service_predictions():
    """Verify that the ML service makes reasonable career predictions."""
    skills = ["python", "machine learning", "pytorch", "sql"]
    predictions = ml_service.predict_career_probabilities(skills)
    assert len(predictions) > 0
    # The sum of predictions should approximate 100%
    probs_sum = sum(p["probability"] for p in predictions)
    assert 95 <= probs_sum <= 105

def test_ml_service_salary_growth():
    """Verify that the ML service salary growth is calculated correctly."""
    skills = ["python", "machine learning", "pytorch", "sql"]
    growth = ml_service.predict_salary_growth(skills, "ML Engineer")
    assert "current_salary" in growth
    assert "year_1_salary" in growth
    assert "year_3_salary" in growth
    assert "year_5_salary" in growth
    assert growth["current_salary"] < growth["year_5_salary"]

def test_ml_service_skill_gaps():
    """Verify that the skill gaps engine returns relevant missing skills."""
    current_skills = ["python", "pytorch"]
    gaps = ml_service.analyze_skill_gaps(current_skills, "ML Engineer")
    assert len(gaps) > 0
    # 'tensorflow' or 'mlops' should be missing from target ML Engineer benchmark
    assert any(g["skill"].lower() in ["tensorflow", "mlops", "aws", "docker"] for g in gaps)

def test_digital_twin_simulation():
    """Verify that the Career Digital Twin correctly simulates aws credential upgrade."""
    current_skills = ["python", "pytorch", "machine learning"]
    outcome = ml_service.run_digital_twin_simulation(
        current_skills,
        "ML Engineer",
        aws_learned=True,
        ml_projects_count=2,
        azure_certified=False
      )
    assert outcome["simulated_salary_3y"] > outcome["original_salary_3y"]
    assert outcome["simulated_probability"] >= outcome["original_probability"]
    assert len(outcome["timeline"]) == 4
