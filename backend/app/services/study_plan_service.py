from typing import List, Dict, Any

class StudyPlanService:
    @staticmethod
    def generate_plan(weak_topics: List[Dict[str, Any]], target_goal: str = "College Semester Exams") -> List[Dict[str, Any]]:
        top_weak = weak_topics[0]["topicName"] if weak_topics else "Core Concept Review"
        second_weak = weak_topics[1]["topicName"] if len(weak_topics) > 1 else "Advanced Problem Solving"

        return [
            {
                "day": 1,
                "title": f"{top_weak} Diagnostic & Fundamentals",
                "topic": top_weak,
                "subject": weak_topics[0].get("subjectName", "Core") if weak_topics else "General",
                "duration": "45 mins",
                "completed": False,
                "notes": "Cover fundamental definitions, theorems, and edge cases."
            },
            {
                "day": 2,
                "title": f"{top_weak} Solved Examples & Decomposition",
                "topic": top_weak,
                "subject": weak_topics[0].get("subjectName", "Core") if weak_topics else "General",
                "duration": "50 mins",
                "completed": False,
                "notes": "Trace through 3 textbook examples step-by-step."
            },
            {
                "day": 3,
                "title": f"{second_weak} Theory & Rules",
                "topic": second_weak,
                "subject": weak_topics[1].get("subjectName", "Core") if len(weak_topics) > 1 else "General",
                "duration": "55 mins",
                "completed": False,
                "notes": "Compare and contrast core rules and algorithms."
            },
            {
                "day": 4,
                "title": "Targeted Problem Sets & Tracing Drills",
                "topic": "Applied Practice",
                "subject": "Core",
                "duration": "60 mins",
                "completed": False,
                "notes": "Solve 5 practice problems independently without looking at solutions."
            },
            {
                "day": 5,
                "title": "Interactive AI Mentor Doubt Clearance",
                "topic": "Doubt Resolution",
                "subject": "All",
                "duration": "40 mins",
                "completed": False,
                "notes": "Ask EduMentor AI on any steps that felt ambiguous or confusing."
            },
            {
                "day": 6,
                "title": "Timed Adaptive AI Quiz Simulation",
                "topic": "Mock Exam",
                "subject": "Weak Areas",
                "duration": "45 mins",
                "completed": False,
                "notes": "Take a 10-question practice test under timed conditions."
            },
            {
                "day": 7,
                "title": "Final Milestone Mastery Assessment",
                "topic": "Comprehensive Evaluation",
                "subject": "Curriculum",
                "duration": "60 mins",
                "completed": False,
                "notes": "Re-evaluate topic scores to verify overcoming weak threshold."
            }
        ]

study_plan_service = StudyPlanService()
