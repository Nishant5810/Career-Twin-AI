import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import Ridge
import xgboost as xgb

# Define path for caching ML models
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Pre-defined roles
ROLES = [
    "ML Engineer",
    "Data Scientist",
    "Software Engineer",
    "Data Analyst",
    "Cloud Engineer",
    "Product Manager",
    "DevOps Engineer"
]

# Benchmark skills for each role
ROLE_SKILLS = {
    "ML Engineer": ["python", "pytorch", "tensorflow", "scikit-learn", "machine learning", "deep learning", "mlops", "docker", "git", "sql", "kubernetes", "aws"],
    "Data Scientist": ["python", "r", "sql", "pandas", "numpy", "scikit-learn", "machine learning", "statistics", "data visualization", "tableau", "nlp"],
    "Software Engineer": ["java", "python", "javascript", "typescript", "react", "nodejs", "sql", "git", "algorithms", "data structures", "system design", "html", "css"],
    "Data Analyst": ["sql", "excel", "python", "pandas", "tableau", "power bi", "statistics", "data cleaning", "data visualization"],
    "Cloud Engineer": ["aws", "azure", "gcp", "terraform", "linux", "networking", "cloud architecture", "docker", "kubernetes", "devops"],
    "Product Manager": ["agile", "product strategy", "roadmap", "user research", "sql", "scrum", "data analysis", "communication", "market analysis"],
    "DevOps Engineer": ["linux", "git", "jenkins", "docker", "kubernetes", "terraform", "aws", "ci/cd", "monitoring", "ansible"]
}

# Skill Lexicon for extraction
SKILL_LEXICON = {
    "Technical Skills": [
        "python", "java", "c++", "javascript", "typescript", "react", "angular", "nodejs", "express", "go", "rust", "ruby", 
        "sql", "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp", "terraform", 
        "ansible", "jenkins", "ci/cd", "git", "linux", "html", "css", "django", "flask", "fastapi"
    ],
    "ML Skills": [
        "machine learning", "deep learning", "nlp", "computer vision", "pytorch", "tensorflow", "keras", "scikit-learn", 
        "xgboost", "lightgbm", "pandas", "numpy", "mlops", "llms", "langchain", "hugging face", "transformers", 
        "data engineering", "feature engineering", "computer vision", "reinforcement learning"
    ],
    "Soft Skills": [
        "communication", "leadership", "teamwork", "problem solving", "critical thinking", "time management", 
        "adaptability", "collaboration", "presentation", "negotiation", "creativity", "mentoring"
    ],
    "Domain Skills": [
        "system design", "agile", "scrum", "product management", "system architecture", "business intelligence", 
        "cloud architecture", "cyber security", "data warehouse", "etl", "data analytics"
    ]
}

class MLService:
    def __init__(self):
        self.vectorizer_path = os.path.join(MODELS_DIR, "vectorizer.joblib")
        self.career_model_path = os.path.join(MODELS_DIR, "career_model.joblib")
        self.salary_model_path = os.path.join(MODELS_DIR, "salary_model.joblib")
        
        # Load or initialize models
        self.load_or_train_models()

    def load_or_train_models(self):
        """Load trained models from disk, or train synthetic ones if missing."""
        if (os.path.exists(self.vectorizer_path) and 
            os.path.exists(self.career_model_path) and 
            os.path.exists(self.salary_model_path)):
            try:
                self.vectorizer = joblib.load(self.vectorizer_path)
                self.career_model = joblib.load(self.career_model_path)
                self.salary_model = joblib.load(self.salary_model_path)
                return
            except Exception:
                # If loading fails, retrain
                pass
        
        self.train_synthetic_models()

    def train_synthetic_models(self):
        """Generate synthetic dataset and train Scikit-learn + XGBoost models."""
        print("Training synthetic ML models for career & salary forecasting...")
        
        # 1. Prepare synthetic resume texts based on roles
        data = []
        labels = []
        salaries = [] # target current salary
        
        for idx, role in enumerate(ROLES):
            skills = ROLE_SKILLS[role]
            # Create synthetic resumes for this role
            for i in range(150):
                # Randomly sample skills with some noise
                sampled_skills = list(np.random.choice(skills, size=int(len(skills) * 0.75) + 1, replace=False))
                # Add some random skills from other profiles to simulate cross-functional backgrounds
                other_roles = [r for r in ROLES if r != role]
                random_role = np.random.choice(other_roles)
                extra_skills = list(np.random.choice(ROLE_SKILLS[random_role], size=2, replace=False))
                
                resume_text = " ".join(sampled_skills + extra_skills + [role.lower()])
                data.append(resume_text)
                labels.append(idx)
                
                # Base salary with variance
                base_sal = 4.5 + idx * 2.0 + np.random.normal(0, 1.2)
                salaries.append(max(3.0, round(base_sal, 2)))

        # Vectorize text
        self.vectorizer = TfidfVectorizer(max_features=200)
        X_tfidf = self.vectorizer.fit_transform(data).toarray()
        
        # Train Career Classification model (XGBoost)
        self.career_model = xgb.XGBClassifier(
            n_estimators=50,
            max_depth=4,
            learning_rate=0.1,
            objective='multi:softprob',
            num_class=len(ROLES),
            random_state=42
        )
        self.career_model.fit(X_tfidf, np.array(labels))
        
        # Train Salary Regression model (Ridge)
        self.salary_model = Ridge(alpha=1.0)
        # We also pass the class labels and tfidf features to predict salary
        X_sal = np.column_stack([X_tfidf, np.array(labels)])
        self.salary_model.fit(X_sal, np.array(salaries))
        
        # Save models to disk
        joblib.dump(self.vectorizer, self.vectorizer_path)
        joblib.dump(self.career_model, self.career_model_path)
        joblib.dump(self.salary_model, self.salary_model_path)
        print("Model training complete. Serialized files saved in:", MODELS_DIR)

    def extract_skills_from_text(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Scan text for lexicon keywords and group them with maturity scores.
        """
        text_lower = text.lower()
        extracted = {}
        
        for category, skills in SKILL_LEXICON.items():
            matched = []
            for skill in skills:
                # Use simple word boundary check or occurrence
                if skill in text_lower:
                    # Determine simulated maturity score based on frequency or position
                    count = text_lower.count(skill)
                    maturity = min(100, 40 + count * 15)
                    
                    if maturity >= 80:
                        level = "Advanced"
                    elif maturity >= 60:
                        level = "Intermediate"
                    else:
                        level = "Beginner"
                        
                    matched.append({
                        "name": skill.title() if len(skill) > 3 else skill.upper(),
                        "proficiency_level": level,
                        "maturity_score": maturity
                    })
            extracted[category] = matched
            
        return extracted

    def predict_career_probabilities(self, skills_list: List[str]) -> List[Dict[str, Any]]:
        """
        Predict career suitability percentages using the XGBoost classification model.
        """
        text = " ".join([s.lower() for s in skills_list])
        x_features = self.vectorizer.transform([text]).toarray()
        
        probabilities = self.career_model.predict_proba(x_features)[0]
        
        predictions = []
        for idx, role in enumerate(ROLES):
            prob = float(probabilities[idx])
            predictions.append({
                "role": role,
                "probability": round(prob * 100, 2)
            })
            
        # Sort by probability descending
        predictions.sort(key=lambda x: x["probability"], reverse=True)
        return predictions

    def predict_salary_growth(self, skills_list: List[str], role: str) -> Dict[str, float]:
        """
        Predict salary curve: Current, 1-Year, 3-Year, 5-Year based on current skills and target role.
        """
        role_idx = ROLES.index(role) if role in ROLES else 0
        text = " ".join([s.lower() for s in skills_list])
        x_tfidf = self.vectorizer.transform([text]).toarray()
        x_input = np.column_stack([x_tfidf, np.array([role_idx])])
        
        # Predict current baseline salary (in LPA)
        predicted_current = float(self.salary_model.predict(x_input)[0])
        predicted_current = max(3.5, round(predicted_current, 2))
        
        # Calculate simulated growths
        # Growth is higher for engineering and ML roles, lower for analyst/devops
        multiplier = 1.15
        if "ML" in role or "Data Scientist" in role:
            multiplier = 1.25
        elif "Software" in role or "Cloud" in role:
            multiplier = 1.20
            
        y1 = round(predicted_current * multiplier, 2)
        y3 = round(y1 * (multiplier ** 1.8), 2)
        y5 = round(y3 * (multiplier ** 1.5), 2)
        
        return {
            "current_salary": predicted_current,
            "year_1_salary": y1,
            "year_3_salary": y3,
            "year_5_salary": y5
        }

    def analyze_skill_gaps(self, current_skills: List[str], target_role: str) -> List[Dict[str, Any]]:
        """
        Compare user's current skills against benchmark skills for the target role.
        Returns a list of missing skills with Importance and Priority.
        """
        benchmark = ROLE_SKILLS.get(target_role, ROLE_SKILLS["ML Engineer"])
        current_lower = [s.lower() for s in current_skills]
        
        gaps = []
        for b_skill in benchmark:
            if b_skill not in current_lower:
                # Assign static priority and importance based on benchmark sequence
                idx = benchmark.index(b_skill)
                importance = 90 - idx * 5
                importance = max(30, importance)
                
                if importance >= 75:
                    priority = "High Priority"
                elif importance >= 55:
                    priority = "Medium Priority"
                else:
                    priority = "Low Priority"
                    
                gaps.append({
                    "skill": b_skill.title() if len(b_skill) > 3 else b_skill.upper(),
                    "importance": importance,
                    "priority": priority
                })
        
        # Sort gaps by importance descending
        gaps.sort(key=lambda x: x["importance"], reverse=True)
        return gaps

    def run_digital_twin_simulation(
        self, 
        current_skills: List[str], 
        target_role: str,
        aws_learned: bool, 
        ml_projects_count: int, 
        azure_certified: bool
    ) -> Dict[str, Any]:
        """
        Flags simulated:
        - aws_learned -> Learn AWS (adds Cloud Engineer / ML Engineer affinity)
        - ml_projects_count -> Number of completed ML projects (adds ML Engineer affinity, boosts salary)
        - azure_certified -> Azure Certification (adds Cloud Engineer affinity, boosts salary)
        """
        simulated_skills = list(current_skills)
        
        if aws_learned:
            simulated_skills.extend(["aws", "cloud architecture"])
        if ml_projects_count > 0:
            simulated_skills.extend(["machine learning", "pytorch", "deep learning"])
        if azure_certified:
            simulated_skills.extend(["azure", "cloud architecture"])

        # Predict original salary & probabilities
        orig_probs = self.predict_career_probabilities(current_skills)
        orig_salaries = self.predict_salary_growth(current_skills, target_role)
        
        # Predict simulated salary & probabilities
        sim_probs = self.predict_career_probabilities(simulated_skills)
        sim_salaries = self.predict_salary_growth(simulated_skills, target_role)
        
        # Find original & simulated prob for target role
        orig_prob = next((p["probability"] for p in orig_probs if p["role"] == target_role), 50.0)
        sim_prob = next((p["probability"] for p in sim_probs if p["role"] == target_role), 50.0)
        
        # Make sure simulated probability is equal or higher
        boost = 0.0
        if aws_learned: boost += 10.0
        if ml_projects_count > 0: boost += min(18.0, ml_projects_count * 5.0)
        if azure_certified: boost += 8.0
        
        sim_prob = min(98.0, max(sim_prob, orig_prob + boost))
        
        # Calculate simulated 3-year salary
        orig_3y = orig_salaries["year_3_salary"]
        sal_boost = 1.0
        if aws_learned: sal_boost += 0.12
        if ml_projects_count > 0: sal_boost += min(0.20, ml_projects_count * 0.05)
        if azure_certified: sal_boost += 0.10
        
        sim_3y = round(orig_3y * sal_boost, 2)
        
        prob_increase = round(sim_prob - orig_prob, 2)
        
        return {
            "original_salary_3y": orig_3y,
            "simulated_salary_3y": sim_3y,
            "original_probability": orig_prob,
            "simulated_probability": sim_prob,
            "probability_increase": max(0.0, prob_increase),
            "career_growth": "High" if sal_boost >= 1.15 else "Normal",
            "timeline": [
                {"period": "Now", "original": orig_salaries["current_salary"], "simulated": round(orig_salaries["current_salary"] * (sal_boost ** 0.3), 2)},
                {"period": "1 Year", "original": orig_salaries["year_1_salary"], "simulated": round(orig_salaries["year_1_salary"] * (sal_boost ** 0.6), 2)},
                {"period": "3 Years", "original": orig_3y, "simulated": sim_3y},
                {"period": "5 Years", "original": orig_salaries["year_5_salary"], "simulated": round(orig_salaries["year_5_salary"] * sal_boost, 2)}
            ]
        }

# Instantiate singleton ML service
ml_service = MLService()
