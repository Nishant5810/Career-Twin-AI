import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Rich Knowledge Base for Career RAG
KNOWLEDGE_BASE = [
    {
        "category": "resume",
        "topic": "Resume ATS optimization and layout structure",
        "text": "For ATS compatibility, use clear single-column layouts, standard fonts (Inter, Arial, Calibri), and standard headings (Experience, Education, Skills). Avoid tables, sidebars, charts, or images, as ATS parsers often scramble this content. Make sure to tailor your skills to match the job description directly."
    },
    {
        "category": "resume",
        "topic": "Resume action verbs and achievements",
        "text": "Always write bullet points using the STAR method (Situation, Task, Action, Result). Start with strong action verbs like 'Engineered', 'Optimized', 'Architected', or 'Spearheaded'. Quantify your impact wherever possible (e.g., 'Optimized query latency by 45%', 'Reduced AWS operational costs by $12k/year')."
    },
    {
        "category": "interview",
        "topic": "System Design interview preparation",
        "text": "System Design interviews evaluate scalable architecture. Key items to master include: Horizontal vs Vertical scaling, Load Balancing (Nginx, HAProxy), Caching (Redis, Memcached), Database sharding & replication, Message Queues (Kafka, RabbitMQ), and microservice coordination (gRPC, REST)."
    },
    {
        "category": "interview",
        "topic": "Python / Coding interview preparation",
        "text": "In coding interviews, focus on time and space complexity (Big O notation). For Python, master standard collections (deque, Counter, defaultdict, heapq), sorting algorithms, recursion, dynamic programming, and typical tree/graph traversal techniques (DFS, BFS)."
    },
    {
        "category": "career",
        "topic": "Transitioning from Software Engineer to ML Engineer",
        "text": "To transition into Machine Learning Engineering, focus on bridging software engineering fundamentals with ML operations. Master MLOps practices (dvc, MLflow, Docker), model optimization/inference scaling, pipelines (Kubernetes, Kubeflow, Airflow), and data versioning alongside foundational ML theory."
    },
    {
        "category": "career",
        "topic": "Data Scientist vs Machine Learning Engineer",
        "text": "Data Scientists typically focus on statistical analysis, data insights, predictive modeling, and business intelligence (using Jupyter, Pandas, Tableau). ML Engineers focus on scaling, deploying, and optimizing ML models in production environments (using PyTorch, FastAPI, MLOps, CI/CD, AWS)."
    },
    {
        "category": "learning",
        "topic": "Learning Cloud and AWS services",
        "text": "For modern cloud scaling, AWS is the industry leader. Recommended learning path includes: AWS Certified Cloud Practitioner (foundations), AWS Certified Solutions Architect Associate (architectural patterns), and AWS Certified DevOps Engineer (deployment pipelines, CloudFormation, IAM security)."
    },
    {
        "category": "learning",
        "topic": "Learning MLOps and Model Deployment",
        "text": "To master ML deployment, learn to package models using FastAPI, containerize them with Docker, and orchestrate using Kubernetes. Track model experiments using MLflow or Weights & Biases, and manage data versioning using DVC."
    }
]

class MentorService:
    def __init__(self):
        self.corpus = [item["text"] for item in KNOWLEDGE_BASE]
        self.vectorizer = TfidfVectorizer()
        if self.corpus:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)

    def answer_query(self, query: str, user_profile: Dict[str, Any]) -> str:
        """
        RAG architecture:
        1. Find most relevant knowledge base snippets based on TF-IDF similarity.
        2. Format response using context and the user's profile details.
        """
        if not self.corpus:
            return "I am setting up my knowledge index. How can I help you today?"

        # Compute cosine similarities between user query and knowledge base
        query_tfidf = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_tfidf, self.tfidf_matrix)[0]
        
        # Get the top-matching document index
        best_idx = int(similarities.argmax())
        best_score = similarities[best_idx]
        
        # Retrieve context
        matched_doc = KNOWLEDGE_BASE[best_idx]
        context = matched_doc["text"]
        category = matched_doc["category"]

        # Parse user details
        name = user_profile.get("full_name", "Karthik")
        skills = user_profile.get("skills", [])
        resume_score = user_profile.get("resume_score", 87)
        interview_score = user_profile.get("interview_score", 74)
        target_role = user_profile.get("target_role", "ML Engineer")

        # Generate responsive response based on context & profile
        response = ""
        
        # Keyword detection for personalization
        query_lower = query.lower()
        
        if "resume" in query_lower or "cv" in query_lower:
            response = (
                f"Hey {name}, reviewing your profile, your resume score is currently **{resume_score}/100**. "
                f"To optimize it further: {context}\n\n"
                f"I recommend adding some of your missing domain skills and ensuring your projects "
                f"for **{target_role}** highlight quantifiable metrics like latency reduction or cost efficiency."
            )
        elif "interview" in query_lower or "prep" in query_lower or "system design" in query_lower:
            response = (
                f"For your upcoming interviews, your current technical readiness is evaluated at **{interview_score}%**. "
                f"Here is some core guidance to master: {context}\n\n"
                f"Focus on coding challenges around your primary skills ({', '.join(skills[:4])}) and practice system designs on scalable distributed architectures."
            )
        elif "roadmap" in query_lower or "learn" in query_lower or "aws" in query_lower or "study" in query_lower:
            response = (
                f"Based on your goal to become a **{target_role}**, here is an learning roadmap tip: {context}\n\n"
                f"Given your current experience, I suggest structuring a weekly timeline starting with basic core requirements "
                f"before jumping directly into advanced cloud deployments."
            )
        else:
            # General fallback using similarity matching
            if best_score > 0.15:
                response = (
                    f"Hi {name}! Regarding your query about career progress as a **{target_role}**:\n\n"
                    f"{context}\n\n"
                    f"Let me know if you want me to expand on these points or review specific skills!"
                )
            else:
                response = (
                    f"Hello {name}! I am your AI Career Mentor. I can help review your resume, "
                    f"suggest learning paths, prepare for System Design / Python interviews, or simulate career moves "
                    f"via your Career Digital Twin.\n\n"
                    f"What would you like to discuss? Try asking: 'How do I optimize my resume for ATS?' or 'What should I study for a System Design interview?'"
                )
                
        return response

# Instantiate chatbot service
mentor_service = MentorService()
