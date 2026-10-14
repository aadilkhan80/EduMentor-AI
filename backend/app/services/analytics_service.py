from typing import List, Dict, Any

class AnalyticsService:
    @staticmethod
    def identify_weak_topics(subjects: List[Dict[str, Any]], threshold: float = 60.0) -> List[Dict[str, Any]]:
        weak_topics = []
        for subject in subjects:
            for topic in subject.get("topics", []):
                score = topic.get("score", 0)
                if score < threshold:
                    weak_topics.append({
                        "subjectName": subject.get("name"),
                        "subjectCode": subject.get("code"),
                        "topicId": topic.get("id"),
                        "topicName": topic.get("name"),
                        "score": score,
                        "difficulty": topic.get("difficulty", "Medium"),
                        "severity": "Critical" if score < 45 else "Moderate",
                    })
        return sorted(weak_topics, key=lambda x: x["score"])

analytics_service = AnalyticsService()
